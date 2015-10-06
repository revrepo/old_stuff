package com.revsw.sdk;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.HttpObject;

public class RmpClientHandler extends SimpleChannelInboundHandler<HttpObject> {

	@Override
	public void channelRead0(ChannelHandlerContext ctx, HttpObject msg) {
		rmpRead1(msg);
	}


	@Override
	public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
		cause.printStackTrace();
		ctx.channel().close();
	}

	public HttpObject rmpRead1(HttpObject httpObject) {
		return httpObject;
	}
}