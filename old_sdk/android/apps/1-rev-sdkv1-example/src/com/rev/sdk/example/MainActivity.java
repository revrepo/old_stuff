package com.rev.sdk.example;

import java.net.URI;
import java.util.HashMap;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.inputmethod.InputMethodManager;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.rev.sdk.RmpHeaders;
import com.rev.sdk.RmpProvider;
import com.rev.sdk.RmpRequest;
import com.rev.sdk.RmpResponse;

public class MainActivity extends Activity {

	TextView tv_header = null;
	TextView tv_content = null;
	WebView wv_html = null;
	protected static final String TAG = "SDK_TEST";
	static String BASE_URL = System.getProperty("baseUrl",
			"http://rev-rmp.revsw.net/ip");
	String content = "";
	int PORT = 9999;
	String status = "";
	boolean print = false;
	String type = "";

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		Button click = (Button) findViewById(R.id.click);
		final EditText url = (EditText) findViewById(R.id.url);
		final EditText port = (EditText) findViewById(R.id.port);
		tv_header = (TextView) findViewById(R.id.header);
		tv_content = (TextView) findViewById(R.id.content);
		wv_html = (WebView) findViewById(R.id.wv);
		url.setText(BASE_URL);
		port.setText("9999");
		final RmpProvider rmpProvider = new RmpProvider() {
			@Override
			public void rmpRead(RmpResponse rmpResponse) {

				if (rmpResponse.isResponseIsContent()) {
					content += rmpResponse.getContent();
					System.out.println("" + rmpResponse.getContent());

					if (rmpResponse.isLastChunk()) {
						display();
					}
				} else {

					status = rmpResponse.getStatus();
					type = rmpResponse.getContentType();
					HashMap<String, String> headers = rmpResponse.getHeaders();

					for (String key : headers.keySet()) {
						System.out.println("HEADER  " + key + " : "
								+ headers.get(key));
					}
					System.out.println(rmpResponse.getProtocolVersion());
				}
			}
		};

		click.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				tv_content.setText("Downloading...");
				tv_header.setText("");
				content = "";
				InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
				imm.hideSoftInputFromWindow(url.getWindowToken(), 0);
				imm.hideSoftInputFromWindow(port.getWindowToken(), 0);

				BASE_URL = url.getText().toString().trim();
				PORT = Integer.parseInt(port.getText().toString().trim());
				tv_content.setText("Downloading...");

				Thread thread = new Thread() {
					@Override
					public void run() {

						try {
							/**
							 * Building Request here
							 * */
							URI uriSimple = new URI(BASE_URL);
							String host = uriSimple.getHost() == null ? "127.0.0.1"
									: uriSimple.getHost();

							RmpRequest rmpRequest = new RmpRequest("GET",
									uriSimple.getRawPath());

							rmpRequest.addHeaders(RmpHeaders.Names.HOST, host);
							rmpRequest.addHeaders(RmpHeaders.Names.CONNECTION,
									RmpHeaders.Values.CLOSE);
							rmpRequest.addHeaders(
									RmpHeaders.Names.ACCEPT_ENCODING,
									RmpHeaders.Values.GZIP + ','
											+ RmpHeaders.Values.DEFLATE);
							rmpRequest.addHeaders(RmpHeaders.Names.AGE, "99");

							rmpRequest.addHeaders(
									RmpHeaders.Names.ACCEPT_CHARSET,
									"ISO-8859-1,utf-8;q=0.7,*;q=0.7");
							rmpRequest.addHeaders(
									RmpHeaders.Names.ACCEPT_LANGUAGE, "fr");
							rmpRequest.addHeaders(RmpHeaders.Names.REFERER,
									uriSimple.toString());
							rmpRequest.addHeaders(RmpHeaders.Names.USER_AGENT,
									"Wget/1.14 (linux-gnu)");
							rmpRequest
									.addHeaders(RmpHeaders.Names.ACCEPT,
											"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");

							rmpRequest.addHeaders(RmpHeaders.Names.ACCEPT,
									"*/*");
							rmpRequest.addHeaders(RmpHeaders.Names.USER_AGENT,
									"rev rmp sdk 1.0");

							rmpProvider.rmpWrite(BASE_URL, rmpRequest);

						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				};
				thread.start();
			}
		});

	}

	protected void display() {
		runOnUiThread(new Thread(new Runnable() {
			public void run() {
				tv_header.setText("Http Response : " + status
						+ "\nContent Type: " + type + "\n\nContent : \n");
				if (status.equals("200 OK")) {
					if (type.contains("text/html")) {
						wv_html.setVisibility(View.VISIBLE);
						tv_content.setText("");
						wv_html.setInitialScale(1);
						wv_html.getSettings().setBuiltInZoomControls(true);
						wv_html.getSettings().setUseWideViewPort(true);
						wv_html.loadData(content.toString(), type, null);

					} else {
						tv_content.setText(content.toString());
						wv_html.setVisibility(View.INVISIBLE);
					}
				} else {
					tv_content.setText("");
					wv_html.setVisibility(View.INVISIBLE);
				}
			}
		}));
	}
}

