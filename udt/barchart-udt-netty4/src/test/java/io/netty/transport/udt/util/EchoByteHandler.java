/*
 * Copyright 2012 The Netty Project
 *
 * The Netty Project licenses this file to you under the Apache License,
 * version 2.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

package io.netty.transport.udt.util;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundByteHandlerAdapter;
import io.netty.channel.ChannelOption;
import io.netty.transport.udt.nio.NioUdtProvider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.yammer.metrics.core.Meter;

/**
 * Handler implementation for the echo client. It initiates the ping-pong
 * traffic between the echo client and server by sending the first message to
 * the server on activation.
 */
public class EchoByteHandler extends ChannelInboundByteHandlerAdapter {

    private static final Logger log = LoggerFactory
            .getLogger(EchoByteHandler.class.getName());

    private final ByteBuf message;

    private final Meter meter;

    public Meter meter() {
        return meter;
    }

    public EchoByteHandler(final Meter meter, final int messageSize) {

        this.meter = meter;

        message = Unpooled.buffer(messageSize);

        for (int i = 0; i < message.capacity(); i++) {
            message.writeByte((byte) i);
        }

    }

    @Override
    public void channelActive(final ChannelHandlerContext ctx) throws Exception {

        log.info("ECHO active {}", NioUdtProvider.socketUDT(ctx.channel())
                .toStringOptions());

        ctx.write(message);

        ctx.flush();

    }

    @Override
    public void inboundBufferUpdated(final ChannelHandlerContext ctx,
            final ByteBuf in) {

        if (meter != null) {
            meter.mark(in.readableBytes());
        }

        final ByteBuf out = ctx.nextOutboundByteBuffer();

        out.discardReadBytes(); // FIXME

        out.writeBytes(in);

        ctx.flush();

    }

    @Override
    public void exceptionCaught(final ChannelHandlerContext ctx,
            final Throwable e) {

        log.error("exception : {}", e.getMessage());

        ctx.close();

    }

    @Override
    public ByteBuf newInboundBuffer(final ChannelHandlerContext ctx)
            throws Exception {

        return ctx.alloc().directBuffer(
                ctx.channel().config().getOption(ChannelOption.SO_RCVBUF));

    }

}
