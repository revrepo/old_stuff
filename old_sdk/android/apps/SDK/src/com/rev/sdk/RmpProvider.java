package com.rev.sdk;

import io.netty.buffer.ByteBuf;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.HttpResponse;
import io.netty.handler.codec.http.LastHttpContent;

import java.awt.List;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;

/**
 * Provides functionalities to read RmpResponse from the server and write
 * RmpRequest to the server. This communication uses RMP at transport layer.
 */
public class RmpProvider {

	/* Loading udt support libraries */
	static {
		System.loadLibrary("stlport_shared");
		System.loadLibrary("barchart-udt-core-2.3.0-SNAPSHOT");
	}
	private boolean flag = true;
	private RmpClient httpUploadClient = null;
	private static RmpResponse rmpResponse;
	private static String content;
	private static long totalTime;
	private static long firstTime;
	private static long firstByteTimeStamp;
	private ByteArrayOutputStream baos;
	
	public RmpProvider() {
		flag = true;
		content = "";
		totalTime = 0;
		firstTime = 0;
		rmpResponse = new RmpResponse();
		baos = new ByteArrayOutputStream();
	}

	/**
	 * Writes the RMP request to the given server url.
	 * 
	 * @param BASE_URL
	 *            The url to which request has to be sent.
	 * @param rmpRequest
	 *            Represents the constructed RmpRequest object.
	 */
	public RmpResponse rmpWrite(String BASE_URL, RmpRequest rmpRequest,boolean ifudt) {

		System.out.println("requesting..");
		firstTime = System.currentTimeMillis();
		httpUploadClient = new RmpClient() {
			@Override
			public HttpObject rmpRead1(HttpObject httpResponse) {
				System.out.println("read1");
				return rmpRead2(httpResponse);
			}
		};

		try {
			System.out.println("Calling main");
			flag = false;
			httpUploadClient.main(BASE_URL, rmpRequest,ifudt);
			System.out.println("Called main");
		} catch (Exception e) {
			e.printStackTrace();
		}

		System.out.println(" waiting at rmpWrites: " + flag);
	
		//TODO Synchronization / Count down Latch
		
		while (flag) {

		}
		//System.out.println("\nread : " + rmpResponse.getContent());
		return rmpResponse;
	}

	private HttpObject rmpRead2(HttpObject httpObject) {
		long currentTime = System.currentTimeMillis();
		firstByteTimeStamp = currentTime;
		if (totalTime == 0) {
			rmpResponse.setFirstChunkTime(currentTime - firstTime);
		}
		totalTime++;
		// totalTime += currentTime;
		if (httpObject instanceof HttpResponse) {
			HttpResponse response = (HttpResponse) httpObject;
			rmpResponse.setResponseCode(response.status().code());
			rmpResponse.setStatus(response.status().toString());
			rmpResponse.setProtocolVersion(response.protocolVersion()
					.toString());
			rmpResponse.setContentType(response.headers().get(
					HttpHeaders.Names.CONTENT_TYPE));
			rmpResponse.setContentLength(response.headers().get(
					HttpHeaders.Names.CONTENT_LENGTH));
			rmpResponse
					.setData((response.headers().get(HttpHeaders.Names.DATE)));
			rmpResponse.setContentEncoding(response.headers().get(
					HttpHeaders.Names.CONTENT_ENCODING));
			rmpResponse.setResponseMessage(response.status().reasonPhrase());
			rmpResponse.setLastModified(response.headers().get(
					HttpHeaders.Names.LAST_MODIFIED));
			rmpResponse.setExpiration(response.headers().get(
					HttpHeaders.Names.EXPIRES));
			rmpResponse.setIfModifiedSince(response.headers().get(
					"If-Modified-Since"));
			
			LinkedHashMap<String, String> headers = new LinkedHashMap<String, String>();
			if (!response.headers().isEmpty()) {
				for (String name : response.headers().names()) {
					for (String value : response.headers().getAll(name)) {
						headers.put(name, value);
					}
				}
				rmpResponse.setHeaders(headers);
			} else {
				rmpResponse.setHeaders(null);
			}

			if (response.status().code() == 200
					&& HttpHeaders.isTransferEncodingChunked(response)) {
				rmpResponse.setchunked(true);
			}
		}
		if (httpObject instanceof HttpContent) {
			HttpContent chunk = (HttpContent) httpObject;
			ByteBuf buff = chunk.content();
			try {
				buff.getBytes(0,baos,buff.capacity());
			/*	ArrayList total = new ArrayList<Byte>();
				buff.
				total.add(buff.getByte(1));
				total.*/
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
//			if (!chunk.content().getBytes(0,new byte[0])//toString(CharsetUtil.UTF_8).trim().isEmpty()) {
//				content += chunk.content().toString(CharsetUtil.UTF_8);
				//System.out.println("CONTENT : " + content);
//			}
			if (chunk instanceof LastHttpContent) {
				rmpResponse 
						.setTotalTime(System.currentTimeMillis() - firstByteTimeStamp);
				//.setTotalTime(System.currentTimeMillis() - firstTime);
				rmpResponse.setLastChunk(true);
				rmpResponse.setContent(baos);
				rmpResponse.setLength(baos.size());
				rmpResponse.setchunked(false);
				// rmpRead();
				flag = false;
				try {
					baos.close();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		}
//		System.out.println(" httpResponse : " + httpObject.toString());
		return httpObject;
	}

	/*
	 * public RmpResponse rmpGetRead() { System.out.println("getting");
	 * System.out.println(" waiting at : " + flag); while (flag) {
	 * 
	 * } System.out.println("\nread : " + rmpResponse.getContent()); return
	 * rmpResponse; }
	 */
}