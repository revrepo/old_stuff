package com.revsw.sdk;

import io.netty.bootstrap.Bootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelOption;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.channel.udt.nio.NioUdtByteConnectorChannel;
import io.netty.channel.udt.nio.NioUdtProvider;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.codec.http.LastHttpContent;
import io.netty.handler.codec.http.multipart.DefaultHttpDataFactory;
import io.netty.handler.codec.http.multipart.DiskAttribute;
import io.netty.handler.codec.http.multipart.DiskFileUpload;
import io.netty.handler.codec.http.multipart.HttpDataFactory;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import io.netty.util.concurrent.DefaultThreadFactory;

import java.net.URI;
import java.util.concurrent.ThreadFactory;

public class RmpClient {

	static boolean flag;
	public RmpClient() {
		flag = true;
	}

	public void main(String BASE_URL, RmpRequest rmpRequest, boolean useTcp) throws Exception {
		URI uriSimple = new URI(BASE_URL);
		String scheme = uriSimple.getScheme() == null ? "http" : uriSimple.getScheme();
		String host = uriSimple.getHost() == null ? "127.0.0.1" : uriSimple.getHost();
		int port = 9999;
		//int port = 80;
		//int port=60902;
	
		if(useTcp){
			port=uriSimple.getPort();
			if (port == -1) {
				if ("http".equalsIgnoreCase(scheme)) {
					port = 80;
				} else if ("https".equalsIgnoreCase(scheme)) {
					port = 443;
				}
			}
		}
		

		/*
		 * if (!"http".equalsIgnoreCase(scheme) &&
		 * !"https".equalsIgnoreCase(scheme)) {
		 * System.err.println("Only HTTP(S) is supported."); return; }
		 */
		final boolean ssl = "https".equalsIgnoreCase(scheme);
		final SslContext sslCtx;
		if (ssl) {
			//SelfSignedCertificate ssc = new SelfSignedCertificate();
//			sslCtx = SslContext.newServerContext(ssc.certificate(),
//					ssc.privateKey());
			sslCtx=SslContext.newClientContext(InsecureTrustManagerFactory.INSTANCE);
		} else {
			sslCtx = null;
		}
		final NioEventLoopGroup group;
		final ThreadFactory connectFactory = new DefaultThreadFactory("connect");
		if (useTcp) {
			group = new NioEventLoopGroup();			
		} else {
			group = new NioEventLoopGroup(1, connectFactory,
					NioUdtProvider.BYTE_PROVIDER);
		}

		HttpDataFactory factory = new DefaultHttpDataFactory(
				DefaultHttpDataFactory.MINSIZE);

		DiskFileUpload.deleteOnExitTemporaryFile = true;
		DiskFileUpload.baseDirectory = null;
		DiskAttribute.deleteOnExitTemporaryFile = true;
		DiskAttribute.baseDirectory = null;

		try {
			Bootstrap b = new Bootstrap();
			b.group(group);
			if (useTcp) {
				b.channel(NioSocketChannel.class);
				b.option(ChannelOption.CONNECT_TIMEOUT_MILLIS,
						rmpRequest.getConnectTimeout()).handler(
						new RmpTcpClientInitializer(sslCtx) {
							@Override
							public HttpObject rmpRead0(HttpObject httpObject) {
								if (httpObject instanceof HttpContent) {
									HttpContent chunk = (HttpContent) httpObject;

									if (chunk instanceof LastHttpContent) {
										flag = false;
									}
								}
								return rmpRead1(httpObject);
							}
						});
			} else {
				b.channel(NioUdtByteConnectorChannel.class);
				b.option(ChannelOption.CONNECT_TIMEOUT_MILLIS,
						rmpRequest.getConnectTimeout()).handler(
						new RmpUdtClientInitializer(sslCtx) {
							@Override
							public HttpObject rmpRead0(HttpObject httpObject) {
								if (httpObject instanceof HttpContent) {
									HttpContent chunk = (HttpContent) httpObject;

									if (chunk instanceof LastHttpContent) {
										flag = false;
									}
								}
								return rmpRead1(httpObject);
							}
						});
			}
			formget(b, host, port, rmpRequest, uriSimple);

		} finally {
			group.shutdownGracefully();
			factory.cleanAllHttpData();
		}
		//System.out.println("main ended");
	}

	private static void formget(Bootstrap bootstrap, String host, int port,
			RmpRequest rmpRequest, URI uriSimple) throws Exception {
		//System.out.println("host : " + host);
		Channel channel = bootstrap.connect(host, port).sync().channel();

		HttpRequest request1 = rmpRequest.getRequest();

		//System.out.println("REQUESTING : " + request1.toString());

		channel.writeAndFlush(request1);
		channel.closeFuture();
		//long ctime = System.currentTimeMillis();

		while (flag) {

		}

		channel.close();
	}

	public HttpObject rmpRead1(HttpObject httpResponse) {
		return httpResponse;
	}
}
