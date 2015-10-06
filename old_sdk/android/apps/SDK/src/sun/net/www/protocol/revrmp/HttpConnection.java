package sun.net.www.protocol.revrmp;

import io.netty.handler.codec.http.HttpHeaders;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.ProtocolException;
import java.net.URISyntaxException;
import java.net.URL;
import java.security.Permission;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.rev.sdk.RmpProvider;
import com.rev.sdk.RmpRequest;
import com.rev.sdk.RmpResponse;

public class HttpConnection extends HttpURLConnection {

	private RmpProvider rmpProvider;
	private RmpRequest rmpRequest;
	private RmpResponse rmpResponse;
	private URL url;
	private static boolean flag;
	// private String httpMethod;
	private OutputStream ostream_content = new ByteArrayOutputStream();
	private boolean doinput = false;
	private boolean dooutput = false;
	LinkedHashMap<String, String> headers = new LinkedHashMap<String, String>();

	public HttpConnection(URL u) {
		super(u);
		flag = true;
		url = u;
		try {
			System.out
					.println("HttpURLConnection  : " + u.toURI().getRawPath());
			rmpProvider = new RmpProvider();

			rmpRequest = new RmpRequest(u.toURI().getRawPath());

			rmpRequest.addHeaders(HttpHeaders.Names.HOST, u.getHost());
			rmpRequest
					.addHeaders(HttpHeaders.Names.ACCEPT,
							"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
			rmpRequest.addHeaders(HttpHeaders.Names.USER_AGENT,
					"rev rmp sdk 1.0");
			rmpRequest.addHeaders(HttpHeaders.Names.CONNECTION, "keep-alive");
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}

	@Override
	public void addRequestProperty(String key, String value) {
		rmpRequest.addHeaders(key, value);
		super.addRequestProperty(key, value);
	}

	@Override
	public String getContentType() {
		sendRmpRequest();
		return rmpResponse.getContentType();
	}

	@Override
	public Object getContent() throws IOException {
		sendRmpRequest();
		return rmpResponse.getContent();
	}

	@Override
	public int getResponseCode() throws IOException {
		sendRmpRequest();
		return rmpResponse.getResponseCode();
	}

	@Override
	public int getContentLength() {
		sendRmpRequest();
		int len = -1;
		try {
			len = Integer.parseInt(rmpResponse.getContentLength());
		} catch (NumberFormatException e) {
			e.printStackTrace();
			return -1;
		}
		return len;
	}

	@Override
	public InputStream getInputStream() throws IOException {
		sendRmpRequest();
		InputStream is = new ByteArrayInputStream(rmpResponse.getContent());
		return is;
	}

	@Override
	public long getDate() {
		sendRmpRequest();
		long milliseconds = 0;
		try {
			// "Tue, 13 Jan 2015 10:50:14 GMT"
			SimpleDateFormat f = new SimpleDateFormat(
					"EEE, dd MMM yyyy HH:mm:ss z");
			Date d = f.parse(rmpResponse.getData());
			milliseconds = d.getTime();
		} catch (ParseException e) {
			e.printStackTrace();
		} catch (NullPointerException e) {
			e.printStackTrace();
		}

		return milliseconds;
	}

	@Override
	public long getLastModified() {
		sendRmpRequest();
		long milliseconds = 0;
		try {
			// "Tue, 13 Jan 2015 10:50:14 GMT"
			SimpleDateFormat f = new SimpleDateFormat(
					"EEE, dd MMM yyyy HH:mm:ss z");
			Date d = f.parse(rmpResponse.getLastModified());
			milliseconds = d.getTime();
		} catch (ParseException e) {
			e.printStackTrace();
		} catch (NullPointerException e) {
			e.printStackTrace();
		}

		return milliseconds;
	}

	@Override
	public String getContentEncoding() {
		sendRmpRequest();
		return rmpResponse.getContentEncoding();
	}

	@Override
	public long getExpiration() {
		sendRmpRequest();
		long milliseconds = 0;
		try {
			// "Tue, 13 Jan 2015 10:50:14 GMT"
			SimpleDateFormat f = new SimpleDateFormat(
					"EEE, dd MMM yyyy HH:mm:ss z");
			Date d = f.parse(rmpResponse.getExpiration());
			milliseconds = d.getTime();
		} catch (ParseException e) {
			e.printStackTrace();
		} catch (NullPointerException e) {
			e.printStackTrace();
		}

		return milliseconds;
	}

	@Override
	public long getIfModifiedSince() {
		 sendRmpRequest();
		return rmpResponse.getTotalTime();
		/*
		 * sendRmpRequest(); long milliseconds = 0; try { //
		 * "Tue, 13 Jan 2015 10:50:14 GMT" SimpleDateFormat f = new
		 * SimpleDateFormat( "EEE, dd MMM yyyy HH:mm:ss z"); Date d =
		 * f.parse(rmpResponse.getIfModifiedSince()); milliseconds =
		 * d.getTime(); } catch (ParseException e) { e.printStackTrace(); }
		 * catch (NullPointerException e) { e.printStackTrace(); }
		 * 
		 * return milliseconds;
		 */
	}

	@Override
	public URL getURL() {
		return url;
	}

	@Override
	public String getResponseMessage() throws IOException {
		sendRmpRequest();
		return rmpResponse.getResponseMessage();
	}

	@Override
	public OutputStream getOutputStream() throws IOException {
		return ostream_content;
	}

	@Override
	public boolean getDoInput() {
		sendRmpRequest();
		return doinput;
	}

	@Override
	public boolean getDoOutput() {
		sendRmpRequest();
		return doOutput;
	}

	@Override
	public void setDoInput(boolean doinput) {
		this.doinput = doinput;
	}

	@Override
	public void setDoOutput(boolean dooutput) {
		this.dooutput = dooutput;
	}

	@Override
	public String getRequestMethod() {
		// return rmpRequest.getMethod();
		System.out.println("555555555 " + rmpResponse.getFirstChunkTime());
		return rmpResponse.getFirstChunkTime() + "";
	}

	@Override
	public String getHeaderField(int pos) {
		sendRmpRequest();
		return (new ArrayList<String>(headers.values())).get(pos);
	}

	@Override
	public String getHeaderField(String key) {
		sendRmpRequest();
		return headers.get(key);
	}

	/**
	 * Unused by Android
	 */
	@Override
	public boolean getAllowUserInteraction() {
		return super.getAllowUserInteraction();
	}

	@Override
	public String getHeaderFieldKey(int n) {
		sendRmpRequest();
		return (new ArrayList<String>(headers.keySet())).get(n);
	}

	@Override
	public String getRequestProperty(String key) {
		return rmpRequest.getRequestProperty(key);
	}

	@Override
	public void setRequestMethod(String method) throws ProtocolException {
		rmpRequest.setMethod(method);
	}

	@Override
	public void setRequestProperty(String key, String value) {
		rmpRequest.setHeaders(key, value);
	}

	@Override
	public void setIfModifiedSince(long ifmodifiedsince) {
		rmpRequest.setIfModifiedSince(ifmodifiedsince);
	}

	@Override
	public void setConnectTimeout(int timeout) {
		rmpRequest.setConnectTimeout(timeout);
	}

	@Override
	public int getConnectTimeout() {
		sendRmpRequest();
		return rmpRequest.getConnectTimeout();
	}

	@Override
	public void disconnect() {
		// TODO Auto-generated method stub
	}

	@Override
	public boolean usingProxy() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public void connect() throws IOException {
		// TODO Auto-generated method stub
	}

	@Override
	public Object getContent(Class[] classes) throws IOException {
		// TODO Auto-generated method stub
		return super.getContent(classes);
	}

	@Override
	public boolean getDefaultUseCaches() {
		// TODO Auto-generated method stub
		return super.getDefaultUseCaches();
	}

	@Override
	public InputStream getErrorStream() {
		// TODO Auto-generated method stub
		return super.getErrorStream();
	}

	@Override
	public long getHeaderFieldDate(String name, long Default) {
		// TODO Auto-generated method stub
		return super.getHeaderFieldDate(name, Default);
	}

	@Override
	public int getHeaderFieldInt(String name, int Default) {
		// TODO Auto-generated method stub
		return super.getHeaderFieldInt(name, Default);
	}

	@Override
	public Map<String, List<String>> getHeaderFields() {
		// TODO Auto-generated method stub
		return super.getHeaderFields();
	}

	@Override
	public boolean getInstanceFollowRedirects() {
		// TODO Auto-generated method stub
		return super.getInstanceFollowRedirects();
	}

	@Override
	public Permission getPermission() throws IOException {
		// TODO Auto-generated method stub
		return super.getPermission();
	}

	@Override
	public int getReadTimeout() {
		// TODO Auto-generated method stub
		return super.getReadTimeout();
	}

	@Override
	public Map<String, List<String>> getRequestProperties() {
		// TODO Auto-generated method stub
		return super.getRequestProperties();
	}

	@Override
	public boolean getUseCaches() {
		// TODO Auto-generated method stub
		return super.getUseCaches();
	}

	/**
	 * Unused by Android
	 * 
	 */
	@Override
	public void setAllowUserInteraction(boolean allowuserinteraction) {
		// TODO Auto-generated method stub
		super.setAllowUserInteraction(allowuserinteraction);
	}

	@Override
	public void setChunkedStreamingMode(int chunklen) {
		// TODO Auto-generated method stub
		super.setChunkedStreamingMode(chunklen);
	}

	@Override
	public void setDefaultUseCaches(boolean defaultusecaches) {
		// TODO Auto-generated method stub
		super.setDefaultUseCaches(defaultusecaches);
	}

	@Override
	public void setFixedLengthStreamingMode(int contentLength) {
		// TODO Auto-generated method stub
		super.setFixedLengthStreamingMode(contentLength);
	}

	@Override
	public void setInstanceFollowRedirects(boolean followRedirects) {
		// TODO Auto-generated method stub
		super.setInstanceFollowRedirects(followRedirects);
	}

	@Override
	public void setReadTimeout(int timeout) {
		// TODO Auto-generated method stub
		super.setReadTimeout(timeout);
	}

	@Override
	public void setUseCaches(boolean usecaches) {
		// TODO Auto-generated method stub
		super.setUseCaches(usecaches);
	}

	@Override
	public String toString() {
		// TODO Auto-generated method stub
		return super.toString();
	}

	/**
	 * Call this method in every get related methods eg: getContent(),
	 * getContentType() etc.,
	 * 
	 * @return
	 */
	private RmpResponse sendRmpRequest() {
		if (flag) {
			if (dooutput) {
				ByteArrayOutputStream baos = (ByteArrayOutputStream) ostream_content;
				rmpRequest.setContent(baos.toByteArray());
			}
			rmpResponse = rmpProvider
					.rmpWrite(url.toString(), rmpRequest, true);
			headers = rmpResponse.getHeaders();
			flag = false;
		}
		return rmpResponse;
	}

}