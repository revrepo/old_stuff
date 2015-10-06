package com.rev.rmptcp.timestampapp;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

import javax.net.ssl.HttpsURLConnection;

import com.rev.sdk.RmpProvider;
import com.rev.sdk.RmpRequest;
import com.rev.sdk.RmpResponse;

import sun.net.www.protocol.revrmp.RmpHandler;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TextView;

public class MainActivity extends Activity {

	protected static final String TAG = "SDK_TEST";
	static String BASE_URL = System.getProperty("baseUrl",
			"http://www.tutorialspoint.com/images/google_play.png");
	//	"http://as1.wdpromedia.com/media/abd/north-america/alaska-vacations/denali-national-park.jpg");
	//String content = "";
	// int PORT = 9999;
	String status = "";
	boolean print = false;
	String type = "";
	static String timestamp = "";
	URL url;
	int freq, iter;
	static int count;
	TextView tv_load;
	long time = 0;
	byte[] array;
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		Button click = (Button) findViewById(R.id.click);
		final EditText et_url = (EditText) findViewById(R.id.et_url);
		tv_load = (TextView) findViewById(R.id.tv_loading);
		final CheckBox cb_rmptcp = (CheckBox) findViewById(R.id.cb_rmptcp);
		final EditText et_iterations = (EditText) findViewById(R.id.et_iterations);
		final EditText et_frequency = (EditText) findViewById(R.id.et_frequency);
		et_frequency.setText("1");
		et_iterations.setText("1");
//		cb_rmptcp.setChecked(true);
		et_url.setText(BASE_URL);
		
//		  freq = 5; while (true) { try { Thread.sleep(freq * 1000); freq--; if
//		  (freq <= 0) { break; } } catch (InterruptedException e) {
//		  e.printStackTrace(); }
		  
//		  System.out.println("freq : " + freq + " ms:" +
//		  System.currentTimeMillis()); }
//		 
		click.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				count = 1;
				//content = "";
				InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
				imm.hideSoftInputFromWindow(et_url.getWindowToken(), 0);
				BASE_URL = et_url.getText().toString().trim();
				 freq = Integer.parseInt(et_frequency.getText().toString()
				 .trim());
				 iter = Integer.parseInt(et_iterations.getText().toString()
				 .trim());
				//freq = 0;
				//iter = 1;
				timestamp = "Url : " + BASE_URL;
				try {
					if (cb_rmptcp.isChecked()) { // rmp
						url = new URL(null, BASE_URL);
						while (count <= iter) {
							// updateUI();
							count++;
							System.err.println("COUNT : " + count);
							try {
								Thread.sleep(freq * 1000);
							} catch (InterruptedException e1) {
								e1.printStackTrace();
							}

							Thread thread = new Thread() {
								@Override
								public void run() {
									try {
										System.out.println(" type : ");
										RmpRequest rmpRequest = new RmpRequest(BASE_URL);
										RmpResponse rmpResponse = new RmpResponse();
										RmpProvider rmpProvider = new RmpProvider();
										rmpRequest.setMethod("GET");
										rmpRequest.setHost(url.getHost());
										rmpResponse=rmpProvider.rmpWrite(BASE_URL, rmpRequest, false);
										type=rmpResponse.getContentType();
										status=rmpResponse.getResponseMessage();								
										array=rmpResponse.getContent();										
										time = System.currentTimeMillis() - time;
										System.out.println(" type : "+type+" status: "+status);
										if (cb_rmptcp.isChecked()) { // rmp
											timestamp += "\nRun : "
													+ (count - 1)
													+ "\nFirst chunck time: "
													+ rmpResponse
															.getFirstChunkTime()
													+ "\nTotal download time: "
													+ rmpResponse
															.getTotalTime();
										} 
									} catch (Exception e) {
										e.printStackTrace();
									}
								}
							};
							thread.start();
							try {
								thread.join();
							} catch (InterruptedException e) {
								e.printStackTrace();
							}
						}
					} else {
						url = new URL(BASE_URL);
						while (count <= iter) {
							// updateUI();
							count++;
							System.err.println("COUNT : " + count);
							try {
								Thread.sleep(freq * 1000);
							} catch (InterruptedException e1) {
								e1.printStackTrace();
							}

							Thread thread = new Thread() {
								@Override
								public void run() {
									try {
										System.out.println(" type : ");

										HttpURLConnection httpURLConnection = (HttpURLConnection) url
												.openConnection();
//										HttpsURLConnection conn=(HttpsURLConnection) url
//												.openConnection();
										//conn.
										time = System.currentTimeMillis();
										type = httpURLConnection.getContentType();
										status = httpURLConnection.getResponseMessage();
										System.out.println(" type : "+type+" status: "+status);
										/*ByteArrayInputStream rd = new ByteArrayInputStream(
												new InputStreamReader(httpURLConnection
														.getInputStream())); */
										InputStream rd=httpURLConnection
												.getInputStream();
										 array = new byte[rd.available()];
										rd.read(array);
										
//										byte[] bytes = new byte[4];
//										ByteArrayInputStream bais = new ByteArrayInputStream(bytes);				
		/*								while((line = rd.read())!=-1){
											
											rd.read(buffer)
										}*/
										
										time = System.currentTimeMillis() - time;
										System.out.println(" type : "+type+" status: "+status);
										if (cb_rmptcp.isChecked()) { // rmp
											timestamp += "\nRun : "
													+ (count - 1)
													+ "\nFirst chunck time: "
													+ httpURLConnection
															.getRequestMethod()
													+ "\nTotal download time: "
													+ httpURLConnection
															.getIfModifiedSince();
										} else {
											timestamp += "\nRun : " + (count - 1)
													+ "\nFirst chunck time: " + 0+"ms"
													+ "\nTotal download time: " + time+"ms";
										}
										httpURLConnection.disconnect();
										StringBuilder sb = new StringBuilder();

//										while ((line = rd.readLine()) != null) {
//											sb.append(line).append('\n');
//										}
										/*ByteArrayInputStream bais = new ByteArrayInputStream(bytes);				
										while((line = rd.read())!=-1)
										{
											
										}*/
										
//										content = sb.toString();
										rd.close();
									} catch (Exception e) {
										e.printStackTrace();
									}
								}
							};
							thread.start();
							try {
								thread.join();
							} catch (InterruptedException e) {
								e.printStackTrace();
							}
						}
					}
				} catch (MalformedURLException e) {
					e.printStackTrace();
				}
			
				display();
			}
		});

	}

	public void updateUI() {
		runOnUiThread(new Thread(new Runnable() {
			public void run() {
				TextView tv_load = (TextView) findViewById(R.id.tv_loading);
				tv_load.setText("Iteration... " + count);
			}
		}));
	}

	protected void display() {
		DataBean dataBean = new DataBean();
		dataBean.setContent(array);
		dataBean.setStatus(status);
		dataBean.setTimestamp(timestamp);
		System.err.println("TIME : " + timestamp);
		dataBean.setType(type);
		Intent intent = new Intent(getApplicationContext(), Statistics.class);
		intent.putExtra("data", dataBean);
		startActivity(intent);
	}

	@Override
	protected void onResume() {
		super.onResume();
	}
}