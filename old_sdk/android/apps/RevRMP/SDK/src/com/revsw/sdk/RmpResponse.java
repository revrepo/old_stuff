package com.revsw.sdk;

import java.io.ByteArrayOutputStream;
import java.util.LinkedHashMap;

/**
 * This class represents the response received from server
 */
public class RmpResponse {

	private ByteArrayOutputStream content = null;
	private boolean chunked = false;
	private LinkedHashMap<String, String> headers;
	private String status;
	private String protocolVersion;
	private int responseCode;
	private boolean lastChunk = false;
	// private boolean responseIsContent = false;
	private String contentType = "";
	private String contentLength; // length here is header value
	private int length; // length here is calculated in RmpProvider
	private String data;
	private String contentEncoding;
	private String responseMessage;
	private String lastModified;
	private String expiration;
	private String ifModifiedSince;
	private long firstChunkTime;
	private long totalTime;

	public long getFirstChunkTime() {
		return firstChunkTime;
	}

	public void setFirstChunkTime(long firstChunkTime) {
		this.firstChunkTime = firstChunkTime;
	}

	public long getTotalTime() {
		return totalTime;
	}

	public void setTotalTime(long totalTime) {
		this.totalTime = totalTime;
	}

	public String getIfModifiedSince() {
		return ifModifiedSince;
	}

	public void setIfModifiedSince(String ifModifiedSince) {
		this.ifModifiedSince = ifModifiedSince;
	}

	public String getExpiration() {
		return expiration;
	}

	public void setExpiration(String expiration) {
		this.expiration = expiration;
	}

	public String getLastModified() {
		return lastModified;
	}

	public void setLastModified(String lastModified) {
		this.lastModified = lastModified;
	}

	public String getResponseMessage() {
		return responseMessage;
	}

	public void setResponseMessage(String responseMessage) {
		this.responseMessage = responseMessage;
	}

	public String getContentEncoding() {
		return contentEncoding;
	}

	public void setContentEncoding(String contentEncoding) {
		this.contentEncoding = contentEncoding;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	public String getContentLength() {
		return contentLength;
	}

	public void setContentLength(String contentLength) {
		this.contentLength = contentLength;
	}

	public int getLength() {
		return length;
	}

	public void setLength(int length) {
		this.length = length;
	}

	/**
	 * This method returns the content in response received from server
	 * 
	 * @return Returns content of the response.
	 */
	public byte[] getContent() {
		return content.toByteArray();
	}

	public void setContent(ByteArrayOutputStream content) {
//		content.to
		this.content = content;
	}

	/**
	 * This method tells whether the response from server is been received in
	 * chunks
	 * 
	 * @return true if chunked, false if not chunked
	 */
	public boolean ischunked() {
		return chunked;
	}

	public void setchunked(boolean chunked) {
		this.chunked = chunked;
	}

	/**
	 * This method returns the header parameters and values of response. The
	 * details will be in the form of HashMap (name, value)
	 * 
	 * @return Returns the headers of the response
	 */
	public LinkedHashMap<String, String> getHeaders() {
		return headers;
	}

	public void setHeaders(LinkedHashMap<String, String> headers) {
		this.headers = headers;
	}

	/**
	 * This method returns the response status from the server. eg: OK
	 * 
	 * @return Returns the response status.
	 */
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	/**
	 * This method returns the protocol version of the communication eg:
	 * HTTP/1.1
	 * 
	 * @return Returns the protocol version
	 */
	public String getProtocolVersion() {
		return protocolVersion;
	}

	public void setProtocolVersion(String protocolVersion) {
		this.protocolVersion = protocolVersion;
	}

	/**
	 * This method returns the response code received from the server eg: 404,
	 * 200
	 * 
	 * @return Returns the response code
	 */
	public int getResponseCode() {
		return responseCode;
	}

	public void setResponseCode(int responseCode) {
		//System.out.println("RmpResponse Code being set to " + responseCode + "\n");
		this.responseCode = responseCode;
	}

	/**
	 * This method tells whether the chunk received is the last one.
	 * 
	 * @return Returns true if the chunk is last one, false if the chunk is not
	 *         last one.
	 */
	public boolean isLastChunk() {
		return lastChunk;
	}

	public void setLastChunk(boolean lastChunk) {
		this.lastChunk = lastChunk;
	}

	/**
	 * This method tells whether the RmpResponse object has content.
	 * 
	 * @return Returns true if RmpResponse has contents, false if RmpResponse
	 *         has headers
	 */
	// public boolean isResponseIsContent() {
	// return responseIsContent;
	// }
	//
	// public void setResponseIsContent(boolean responseIsContent) {
	// this.responseIsContent = responseIsContent;
	// }

	/**
	 * This method returns the value of content-type header parameter in
	 * response. eg: text/html
	 * 
	 * @return Returns the type of the content
	 */
	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}
}
