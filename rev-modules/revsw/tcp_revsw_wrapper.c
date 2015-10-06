/*
 *   tcp_revsw.c
 *
 *   RevSw TCP Congestion Control Algorithm Wrapper
 *
 * RevSw has two congestion control algorithms that can be used
 * depending on various paramters: who initiated the connection,
 * what TCP parameters are supported on the connection, etc.  This
 * module provides a means to automatically determine which CCA
 * should be used and provides the mechanism to call the appropriate
 * CCA specific APIs when necessary.
 *
 * Copyright 2014 - RevSw
 *
 */
#include <linux/mm.h>
#include <linux/module.h>
#include <linux/skbuff.h>
#include <linux/inet_diag.h>
#include <linux/hashtable.h>
#include <linux/spinlock.h>
#include <net/tcp.h>
#include "tcp_revsw_wrapper.h"
#include "tcp_revsw_session_db.h"
#include "tcp_revsw_version.h"

#define TCP_REVSW_LOCALHOST 0x100007f

static struct ctl_table_header *revsw_ctl_table_hdr;

struct tcp_revsw_cca_entry *tcp_revsw_cca_info[TCP_REVSW_CCA_MAX] =
{
	[TCP_REVSW_CCA_UNKNOWN] = &tcp_revsw_dummy_cca,
	[TCP_REVSW_CCA_STANDARD] = &tcp_revsw_std_cca,
	[TCP_REVSW_CCA_RBE] = &tcp_revsw_rbe_cca,
};

/*
 * @tcp_revsw_get_cca_type
 */
static struct tcp_congestion_ops *
tcp_revsw_get_cca_ops(const struct sock *sk)
{
	struct tcp_revsw_cca_data *ca = inet_csk_ca(sk);
	u8 cca_type = TCP_REVSW_CCA_UNKNOWN;

	if (ca)
		cca_type = ca->tcp_revsw_cca;

	if (cca_type < TCP_REVSW_CCA_MAX)
		return tcp_revsw_cca_info[cca_type]->cca_ops;
	else
		return tcp_revsw_cca_info[TCP_REVSW_CCA_UNKNOWN]->cca_ops;
}

/*
 * @tcp_revsw_init
 */
static void tcp_revsw_init(struct sock *sk)
{
	struct tcp_revsw_cca_data *ca = inet_csk_ca(sk);
	struct tcp_congestion_ops *cca_ops;
	int cca = TCP_REVSW_CCA_STANDARD;
	u8 initiated = TCP_SESSION_SERVER_INITIATED;

	if (sk->sk_state == TCP_SYN_RECV)
		initiated = TCP_SESSION_CLIENT_INITIATED;

	/*
	 * Currently there are two CCAs, STD and RBE. Check whether or
	 * not this connection has the proper settings to use RBE.  If
	 * no then use the STD CCA. 
	 */
	if (tcp_revsw_cca_info[TCP_REVSW_CCA_RBE]->cca_validate_use(sk, initiated))
		cca = TCP_REVSW_CCA_RBE;

	ca->tcp_revsw_cca = cca;
	cca_ops = tcp_revsw_cca_info[cca]->cca_ops;

	if (cca_ops->init)
		cca_ops->init(sk);

	tcp_session_update_initiator(sk, initiated);
}

/*
 * @tcp_revsw_release
 */
static void tcp_revsw_release(struct sock *sk)
{
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	if (cca_ops->release)
		cca_ops->release(sk);
}

/*
 * @tcp_revsw_ssthresh
 */
static u32 tcp_revsw_ssthresh(struct sock *sk)
{
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	return cca_ops->ssthresh(sk);
}

/*
 * @tcp_revsw_cong_avoid
 */
static void tcp_revsw_cong_avoid(struct sock *sk, u32 ack, u32 acked, u32 in_flight)
{
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	cca_ops->cong_avoid(sk, ack, acked, in_flight);
}

/*
 * @tcp_revsw_min_cwnd
 */
static u32 tcp_revsw_min_cwnd(const struct sock *sk)
{
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	if (cca_ops->min_cwnd)
		return cca_ops->min_cwnd(sk);

	return 0;
}

/*
 * @tcp_revsw_state
 */
static void tcp_revsw_state(struct sock *sk, u8 new_state)
{
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	if (cca_ops->set_state)
		cca_ops->set_state(sk, new_state);
}

/*
 * @tcp_revsw_event
 */
static void tcp_revsw_event(struct sock *sk, enum tcp_ca_event event)
{
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	if (cca_ops->cwnd_event)
		cca_ops->cwnd_event(sk, event);
}

/*
 * @tcp_revsw_info
 */
static void tcp_revsw_info(struct sock *sk, u32 ext, struct sk_buff *skb)
{
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	if (cca_ops->get_info)
		cca_ops->get_info(sk, ext, skb);
}

/*
 * @revsw_pkts_acked
 */
static void tcp_revsw_pkts_acked(struct sock *sk, u32 cnt, s32 rtt)
{
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	if (cca_ops->pkts_acked)
		cca_ops->pkts_acked(sk, cnt, rtt);
}

/*
 * @tcp_revsw_initial_rwn
 */
static void tcp_revsw_initial_rwn(struct sock *sk, u8 bko_level, u32 rwin)
{
	struct tcp_sock *tp = tcp_sk(sk);

	if (bko_level == TCP_REVSW_BKO_OK)
		tp->snd_wnd *= tcp_revsw_sysctls.rcv_wnd_multiplier[rwin];
}

/*
 * @tcp_revsw_initial_cwn
 */
static void tcp_revsw_initial_cwn(struct sock *sk, u8 bko_level, u32 rwin)
{
	const struct inet_sock *inet = inet_sk(sk);
	int act_cnt = tcp_session_get_act_cnt(sk);
	struct tcp_sock *tp = tcp_sk(sk);
	u32 cwn;

	if (tcp_revsw_sysctls.cong_wnd[rwin] == 0)
		cwn = tp->snd_wnd / tcp_revsw_sysctls.packet_size;
	else
		cwn = tcp_revsw_sysctls.cong_wnd[rwin];

	/*
	 * Ensure that the initial congestion window is not larger
	 * than the configured maximum.
	 */
	if (cwn > tcp_revsw_sysctls.max_init_cwnd[rwin])
		cwn = tcp_revsw_sysctls.max_init_cwnd[rwin];

	/*
	 * Make sure to not include this session in the active count
	 */
	if (act_cnt)
		act_cnt--;

	/*
	 * If there are existing active connections to the same IP
	 * address then reduce the initial congestion window by the
	 * configured percentage.  Applies to all ip addresses except
	 * the TCP_REVSW_LOCALHOST address.
	 */
	if (act_cnt && (inet->inet_daddr != TCP_REVSW_LOCALHOST) &&
	    tcp_revsw_sysctls.active_scale[rwin])
		cwn = (cwn * tcp_revsw_sysctls.active_scale[rwin]) / 100;

	if (bko_level)
		cwn /= bko_level;

	/*
	 * Make sure we have an initial congestion window no less than
	 * standard TCP.
	 */
	if (cwn < TCP_INIT_CWND)
		cwn = TCP_INIT_CWND;

	tp->snd_cwnd = cwn;
}

/*
 * @tcp_revsw_generic_syn_post_config
 */
void tcp_revsw_generic_syn_post_config(struct sock *sk)
{
	u8 cca_bko = tcp_session_get_backoff_level(sk);
	u32 rwin = tcp_session_get_rwin(sk);
	struct tcp_sock *tp = tcp_sk(sk);
	int sndmem; 

	tcp_revsw_initial_rwn(sk, cca_bko, rwin);
	tcp_revsw_initial_cwn(sk, cca_bko, rwin);

	sndmem = SKB_TRUESIZE(tp->rx_opt.mss_clamp + MAX_TCP_HEADER);
	sndmem *= tp->snd_cwnd;
	if (sk->sk_sndbuf < sndmem)
		sk->sk_sndbuf = min(sndmem, sysctl_tcp_wmem[2]);
}

/*
 * @tcp_revsw_syn_post_config
 */
static void tcp_revsw_syn_post_config(struct sock *sk)
{
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	/*
	 * If the CCA has its own SYN post config then use that
	 * instead of the generic one.
	 */
	if (cca_ops->syn_post_config)
		cca_ops->syn_post_config(sk);
}

/*
 * @tcp_revsw_generic_handle_nagle_test
 */
bool tcp_revsw_generic_handle_nagle_test(struct sock *sk,
					 struct sk_buff *skb,
					 unsigned int mss_now,
					 int nonagle)
{
	struct tcp_sock *tp = tcp_sk(sk);
	unsigned int mss = mss_now;
	bool minscheck;

	/* Don't use the nagle rule for urgent data (or for the final FIN). */
	if ((tp->snd_una != tp->snd_up) ||
	    (TCP_SKB_CB(skb)->tcp_flags & TCPHDR_FIN))
		return true;

	minscheck = after(tp->snd_sml, tp->snd_una) &&
	!after(tp->snd_sml, tp->snd_nxt);

	if (tcp_revsw_sysctls.disable_nagle_mss)
		mss = tcp_revsw_sysctls.packet_size;

	if (!((skb->len < mss) && ((nonagle & TCP_NAGLE_CORK) ||
	    (!nonagle && tp->packets_out && minscheck))))
		return true;

	return false;
}

/*
 * @tcp_revsw_handle_nagle_test
 */
static bool
tcp_revsw_handle_nagle_test(struct sock *sk, struct sk_buff *skb,
			    unsigned int mss_now, int nonagle)
{
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	/*
	 * If the CCA has its own Nagle test then use that instead of the
	 * generic one.
	 */
	if (cca_ops->handle_nagle_test)
		return cca_ops->handle_nagle_test(sk, skb, mss_now, nonagle);

	return false;
}

/*
 * @tcp_revsw_set_nwin_size
 */
static void tcp_revsw_set_nwin_size(struct sock *sk, u32 nwin)
{
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	if (cca_ops->set_nwin_size)
		cca_ops->set_nwin_size(sk, nwin);
	else
		tcp_sk(sk)->snd_wnd = nwin;
}

/*
 * @tcp_revsw_get_cwnd_quota
 */
static int tcp_revsw_get_cwnd_quota(struct sock *sk, const struct sk_buff *skb)
{
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	if (cca_ops->get_cwnd_quota)
		return cca_ops->get_cwnd_quota(sk, skb);

	return 0;
}

/*
 * @tcp_revsw_snd_wnd_test_generic
 */
static int tcp_revsw_snd_wnd_test_generic(const struct tcp_sock *tp, const struct sk_buff *skb,
					  unsigned int cur_mss)
{
	u32 end_seq = TCP_SKB_CB(skb)->end_seq;

	if (skb->len > cur_mss)
		end_seq = TCP_SKB_CB(skb)->seq + cur_mss;

	return !after(end_seq, tcp_wnd_end(tp));
}

/*
 * @tcp_revsw_snd_wnd_test
 */
static bool tcp_revsw_snd_wnd_test(const struct tcp_sock *tp,
				   const struct sk_buff *skb,
				   unsigned int cur_mss)
{
	const struct sock *sk = (const struct sock *)tp;
	struct tcp_congestion_ops *cca_ops = tcp_revsw_get_cca_ops(sk);

	if (cca_ops->snd_wnd_test)
		return cca_ops->snd_wnd_test(tp, skb, cur_mss);

	return tcp_revsw_snd_wnd_test_generic(tp, skb, cur_mss);
}

static struct tcp_congestion_ops tcp_revsw __read_mostly = {
	.flags		= TCP_CONG_RTT_STAMP,
	.init		= tcp_revsw_init,
	.release	= tcp_revsw_release,
	.ssthresh	= tcp_revsw_ssthresh,
	.cong_avoid	= tcp_revsw_cong_avoid,
	.min_cwnd	= tcp_revsw_min_cwnd,
	.set_state	= tcp_revsw_state,
	.cwnd_event	= tcp_revsw_event,
	.get_info	= tcp_revsw_info,
	.pkts_acked	= tcp_revsw_pkts_acked,
	.syn_post_config = tcp_revsw_syn_post_config,
	.set_nwin_size = tcp_revsw_set_nwin_size,
	.handle_nagle_test = tcp_revsw_handle_nagle_test,
	.get_session_info = tcp_session_get_info,
	.get_cwnd_quota = tcp_revsw_get_cwnd_quota,
	.snd_wnd_test = tcp_revsw_snd_wnd_test,

	.owner		= THIS_MODULE,
	.name		= "revsw"
};

/*
 * @tcp_revsw_register
 */
static int __init tcp_revsw_register(void)
{
	int i = 0;

	revsw_ctl_table_hdr = register_sysctl("revsw", revsw_ctl_table);
	if (!revsw_ctl_table_hdr)
		return -EFAULT;

	tcp_revsw_session_db_init();

	for (i = 0; i < TCP_REVSW_CCA_MAX; i++) {
		if (tcp_revsw_cca_info[i] != NULL) {
			if (tcp_revsw_cca_info[i]->cca_init)
				tcp_revsw_cca_info[i]->cca_init();
		}
	}

	return tcp_register_congestion_control(&tcp_revsw);
}

/*
 * @tcp_revsw_unregister
 */
static void __exit tcp_revsw_unregister(void)
{
	tcp_unregister_congestion_control(&tcp_revsw);

	tcp_revsw_session_db_remove();

	unregister_sysctl_table(revsw_ctl_table_hdr);
}

module_init(tcp_revsw_register);
module_exit(tcp_revsw_unregister);

MODULE_AUTHOR("Tom Kavanagh");
MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("TCP RevSw");
MODULE_VERSION(__stringify(TCP_REVSW_MAJOR) "."
               __stringify(TCP_REVSW_MINOR) "."
               __stringify(TCP_REVSW_SUBLEVEL));
