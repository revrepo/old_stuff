package com.rev.hijacked.exampleapp;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import sun.net.www.protocol.revrmp.Handler;
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

public class MainActivity extends Activity {

	TextView tv_header = null;
	TextView tv_content = null;
	WebView wv_html = null;
	protected static final String TAG = "SDK_TEST";
	static String BASE_URL = System.getProperty("baseUrl",
			"rev-rmp://rev-rmp.revsw.net/ip");
	String content = "";
//	int PORT = 9999;
	String status = "";
	boolean print = false;
	String type = "";

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		Button click = (Button) findViewById(R.id.click);
		final EditText url = (EditText) findViewById(R.id.url);
//		final EditText port = (EditText) findViewById(R.id.port);
		tv_header = (TextView) findViewById(R.id.header);
		tv_content = (TextView) findViewById(R.id.content);
		wv_html = (WebView) findViewById(R.id.wv);
		url.setText(BASE_URL);
//		port.setText("9999");
		click.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				tv_content.setText("Downloading...");
				tv_header.setText("");
				content = "";
				InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
				imm.hideSoftInputFromWindow(url.getWindowToken(), 0);
//				imm.hideSoftInputFromWindow(port.getWindowToken(), 0);

				BASE_URL = url.getText().toString().trim();
//				PORT = Integer.parseInt(port.getText().toString().trim());

				Thread thread = new Thread() {
					@Override
					public void run() {

						try {

							URL url = new URL(null, BASE_URL, new Handler());
							HttpURLConnection httpURLConnection = (HttpURLConnection) url
									.openConnection();
							type = httpURLConnection.getContentType();
							status = httpURLConnection.getResponseMessage();
							String line;
							BufferedReader rd = new BufferedReader(
									new InputStreamReader(httpURLConnection
											.getInputStream()));
							StringBuilder sb = new StringBuilder();

							while ((line = rd.readLine()) != null) {
								sb.append(line).append('\n');
							}
							content = sb.toString();
							display();
						} catch (Exception e) {
							e.printStackTrace();
							display();
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
				System.out.println("Displaying");
				tv_header.setText("Http Response : " + status
						+ "\nContent Type: " + type + "\n\nContent : \n");
				if (status != null && status.contains("OK")) {
					if (type != null && type.contains("text/html")) {
						wv_html.setVisibility(View.VISIBLE);
						tv_content.setText("");
						wv_html.setInitialScale(1);
						wv_html.getSettings().setBuiltInZoomControls(true);
						wv_html.getSettings().setUseWideViewPort(true);
						wv_html.loadData(content, type, null);

					} else {
						tv_content.setText(content);
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