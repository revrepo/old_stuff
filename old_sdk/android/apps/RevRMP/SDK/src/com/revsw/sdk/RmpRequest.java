package com.revsw.sdk;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.handler.codec.http.DefaultFullHttpRequest;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.codec.http.HttpMethod;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.codec.http.HttpVersion;

import java.util.Date;
import java.util.Locale;

/**
 * This class represents the request that is sent to the server.
 */
public class RmpRequest {

	private FullHttpRequest httpRequest = null;
	private HttpHeaders headers = null;
	static String URI;

	private int connectTimeout = 10000;// Default Connection TimeOut 10000 milliseconds

	public RmpRequest() {
	}

	/**
	 * This constructor is to initialize the type and uri of the request.
	 * 
	 * @param type
	 *            Represents the type of request eg: GET,POST etc
	 * @param uri
	 *            Represents the uri of the request.
	 */
	public RmpRequest(String uri) {
		URI = uri;

		httpRequest = new DefaultFullHttpRequest(HttpVersion.HTTP_1_1,
				HttpMethod.POST, uri);

		headers = httpRequest.headers();
	}

	/**
	 * This method adds header parameters to the request
	 * 
	 * @param headerName
	 *            Represents the name of the header
	 * @param headerValue
	 *            Represents the value of the header
	 */
	public void addHeaders(String headerName, String headerValue) {
		headers.add(headerName, headerValue);
	}

	/**
	 * This methods returns the http request header value of the given key
	 * 
	 * @param key
	 *            /header name
	 * @return Returns the string value of the given key from http request
	 *         header.
	 */
	public String getRequestProperty(String key) {
		return headers.get(key);
	}

	/**
	 * This method adds header parameters to the request
	 * 
	 * @param headerName
	 *            Represents the name of the header
	 * @param headerValue
	 *            Represents the value of the header
	 */
	public void setHeaders(String headerName, String headerValue) {
		headers.set(headerName, headerValue);
	}

	/**
	 * This method returns the Http method used in the http request as a String.
	 * @return {@link String} object.
	 */
	public String getMethod() {
		return httpRequest.method().name();
	}

	/**
	 * This method will set the Http method of the Http request as a String
	 * @param {@link String} object
	 */
	public void setMethod(String method) {
		
		String httpMethod = method.toUpperCase(new Locale("en"));
		switch (httpMethod) {
		case "GET":
			httpRequest.setMethod(HttpMethod.GET);
			break;
		case "POST":
			httpRequest.setMethod(HttpMethod.POST);
			break;
		case "CONNECT":
			httpRequest.setMethod(HttpMethod.CONNECT);
			break;
		case "DELETE":
			httpRequest.setMethod(HttpMethod.DELETE);
			break;
		case "HEAD":
			httpRequest.setMethod(HttpMethod.HEAD);
			break;
		case "OPTIONS":
			httpRequest.setMethod(HttpMethod.OPTIONS);
			break;
		case "PATCH":
			httpRequest.setMethod(HttpMethod.PATCH);
			break;
		case "PUT":
			httpRequest.setMethod(HttpMethod.PUT);
			break;
		case "TRACE":
			httpRequest.setMethod(HttpMethod.TRACE);
			break;
		}
	}

	/**
	 * This method returns the netty's HttpRequest object of the RmpRequest object
	 * @return {@link HttpRequest} oject
	 */
	protected HttpRequest getRequest() {
		return httpRequest;
	}

	protected void getContent() {

	}

	/**
	 * This method is to set the content into Http request in case of POST request
	 * @param Content in the form of byte[]
	 */
	public void setContent(byte[] bytes) {
		final ByteBuf content = Unpooled.copiedBuffer(bytes);
		httpRequest.content().clear().writeBytes(content);
	}

	public void setIfModifiedSince(long ifmodifiedsince) {
		headers.set("If-Modified-Since", String.valueOf(ifmodifiedsince));
	}

	public void setConnectTimeout(int timeout) {
		connectTimeout = timeout;
	}

	public int getConnectTimeout() {
		return connectTimeout;
	}

	/**TODO
	 * 
	 * @param name
	 * @param Default
	 * @return
	 */
	public long getHeaderFieldDate(String name, long Default) {
		// TODO Auto-generated method stub
		// return headers.getHeaderFieldDate(name, Default);
		return HttpHeaders.getDateHeader(null, name, new Date(Default))
				.getTime();
	}

	/**TODO
	 * 
	 * @param name
	 * @param Default
	 * @return
	 */
	public int getHeaderFieldInt(String name, int Default) {
		// TODO Auto-generated method stub
		// return headers.getIntHeader(name, Default);
		return HttpHeaders.getIntHeader(null, name, Default);

	}
	public void setHost(String host){
		httpRequest.headers().set(HttpHeaders.Names.HOST,host);
	}
}
