package com.revsw.sdk;

import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.udt.UdtChannel;
import io.netty.handler.codec.http.HttpClientCodec;
import io.netty.handler.codec.http.HttpContentDecompressor;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.stream.ChunkedWriteHandler;

public class RmpClientInitializer extends ChannelInitializer<UdtChannel> {

	private final SslContext sslCtx;

	public RmpClientInitializer(SslContext sslCtx) {
		this.sslCtx = sslCtx;
	}

	@Override
	public void initChannel(UdtChannel ch) {	
		ChannelPipeline pipeline = ch.pipeline();

		if (sslCtx != null) {
			pipeline.addLast("ssl", sslCtx.newHandler(ch.alloc()));
		}
		pipeline.addLast("codec", new HttpClientCodec());

		// Remove the following line if you don't want automatic content
		// decompression.
		pipeline.addLast("inflater", new HttpContentDecompressor());

		// to be used since huge file transfer
		pipeline.addLast("chunkedWriter", new ChunkedWriteHandler());

		pipeline.addLast("handler", new RmpClientHandler() {
			@Override
			public HttpObject rmpRead1(HttpObject httpObject) {
				return rmpRead0(httpObject);
			}
		});
	}

	public HttpObject rmpRead0(HttpObject httpObject) {
		return httpObject;
	}
}
