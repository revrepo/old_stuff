package com.rev.rmptcp.timestampapp;

import java.io.Serializable;
import java.math.BigDecimal;

public class DataBean implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private int count;
	private int pcount;
	private String domain;
	private String type;
	private byte[] content;
	private String status;
	private String[] protocol;
	private String[] url;
	private long[][] downloadTime;
		
	public DataBean(int pcount, int count) {
		this.count = count;
		this.pcount = pcount;
		this.protocol = new String[pcount];
		this.url = new String[pcount];
		this.downloadTime = new long[pcount][count];
	}

	public int getCount() {
		return count;
	}
	
	public int getProtocolCount() {
		return pcount;
	}
	
	public String getDomain() {
		return domain;
	}
	
	public void setDomain(String domain) {
		this.domain = domain;
	}

	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}

	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
	public byte[] getContent() {
		return content;
	}
	
	public void setContent(byte[] content) {
		this.content = content;
	}

	public String getContentSize() {
		float x = this.content.length;
		
		if (x < 1024) {
			return x + "Bytes";
		} else if (x < 1048576) {
			return round(x/1024, 2) + "KB";
		}
		
		return round(x/1048576, 2) + "MB";
	}
	
	public String getProtocol(int index) {
		if (index < this.protocol.length){
			return this.protocol[index];
		}
		
		return "";
	}
	
	public void setProtocol(int index, String protocol) {
		if (index < this.protocol.length){
			this.protocol[index] = protocol;
		}
	}
	
	public String getUrl(int index) {
		if (index < this.url.length){
			return this.url[index];
		}
		
		return "";
	}
	
	public void setUrl(int index, String url) {
		if (index < this.url.length){
			this.url[index] = url;
		}
	}
	
	public long getDownloadTime(int protocol, int index) {
		if (protocol < this.downloadTime.length) {
			if (index < this.downloadTime[protocol].length) {
				return this.downloadTime[protocol][index];
			}
		}
		
		return 0;
	}
	
	public void setDownloadTime(int protocol, int index, long downloadTime) {
		if (protocol < this.downloadTime.length) {
			if (index < this.downloadTime[protocol].length) {
				this.downloadTime[protocol][index] = downloadTime;				
			}
		}
	}

	private static float round(float d, int decimalPlace) {
        BigDecimal bd = new BigDecimal(Float.toString(d));
        bd = bd.setScale(decimalPlace, BigDecimal.ROUND_HALF_UP);
        return bd.floatValue();
    }
}
