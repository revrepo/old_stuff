package com.netty;

import io.netty.bootstrap.Bootstrap;
import io.netty.channel.Channel;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.http.ClientCookieEncoder;
import io.netty.handler.codec.http.DefaultCookie;
import io.netty.handler.codec.http.DefaultFullHttpRequest;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.codec.http.HttpMethod;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.codec.http.HttpVersion;

import java.net.URI;

import android.preference.PreferenceActivity.Header;

/**
 * A simple HTTP client that prints out the content of the HTTP response to
 * {@link System#out} to test {@link HttpSnoopServer}.
 */
public final class HttpSnoopClient {

   // static final String URL = System.getProperty("url", "http://127.0.0.1:8080/");
	public static  String URL=null;
    public  void main1(String[] args) throws Exception {
    	 URL=args[0]; 
        URI uri = new URI(URL);
        System.out.println("uri"+uri);
//        String scheme = uri.getScheme() == null? "http" : uri.getScheme();
       String host = uri.getHost() == null? "127.0.0.1" : uri.getHost();
       //host+="/80kb.jpg";
       System.out.println("host"+host);
        int port = uri.getPort();
//        if (port == -1) {
//            if ("http".equalsIgnoreCase(scheme)) {
//                port = 80;
//            } else if ("https".equalsIgnoreCase(scheme)) {
//                port = 443;
//            }
//        }
//
//        if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
//            System.err.println("Only HTTP(S) is supported.");
//            return;
//        }

        // Configure SSL context if necessary.
//        final boolean ssl = "https".equalsIgnoreCase(scheme);
//        final SslContext sslCtx;
//        if (ssl) {
//            sslCtx = SslContext.newClientContext(InsecureTrustManagerFactory.INSTANCE);
//        } else {
//            sslCtx = null;
//        }

        // Configure the client.
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
             .channel(NioSocketChannel.class)
             .handler(new HttpSnoopClientInitializer());

            // Make the connection attempt.
           
            Channel ch = b.connect(host,80).sync().channel();
            System.out.println("after connect");
            // Prepare the HTTP request.
            HttpRequest request = new DefaultFullHttpRequest(
                    HttpVersion.HTTP_1_1, HttpMethod.GET, uri.getRawPath());
            System.out.println("uri.getRawPath()"+uri.getRawPath());
            request.headers().set(HttpHeaders.Names.HOST,host);
          //  request.headers().set(HttpHeaderNames.HOST, host);
          //  request.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.CLOSE);
            //request.headers().set(HttpHeaderNames.ACCEPT_ENCODING, HttpHeaderValues.GZIP);

            // Set some example cookies.
//            request.headers().set(
//                    HttpHeaderNames.COOKIE,
//                    ClientCookieEncoder.encode(
//                            new DefaultCookie("my-cookie", "foo"),
//                            new DefaultCookie("another-cookie", "bar")));

            // Send the HTTP request.
            System.out.println("request"+request);
            ch.writeAndFlush(request);

            // Wait for the server to close the connection.
            ch.closeFuture().sync();
        } finally {
            // Shut down executor threads to exit.
            group.shutdownGracefully();
        }
    }
}
