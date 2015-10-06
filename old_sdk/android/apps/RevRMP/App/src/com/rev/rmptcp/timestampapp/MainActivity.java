package com.rev.rmptcp.timestampapp;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;

import sun.net.www.protocol.revrmp.Handler;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.Spinner;
import android.widget.Toast;

public class MainActivity extends Activity {

	protected static final String TAG = "REV_SDK";
	private static final String KEY_DOMAIN = "domainPos";
	private static final String KEY_OBJECT = "objectPos";
	private static final String KEY_ITER = "iterPos";
	private static final String KEY_DELAY = "delayPos";

	private CheckBox cb_tcp;
	private CheckBox cb_dots;
	private CheckBox cb_rmp;
	private Button bn_sendrequest;
	private Spinner sp_domain;
	private Spinner sp_object;
	private Spinner sp_iterations;
	private Spinner sp_testdelay;

	private ArrayAdapter<CharSequence> domain_adapter;
	private ArrayAdapter<CharSequence> iterations_adapter;
	private ArrayAdapter<CharSequence> testdelay_adapter;
	private ArrayAdapter<String> object_adapter;
	
	private DataBean dataBean;
	private int lastDP = -1;
	
	static final String[] domain_array = {
		"www.popsugar.com",
		"shop.gopro.com",
//		"www.yellowpages.com",
//		"www.mmafighting.com",
	};
	
	static final String[][] objects_array = {
			{
				"",
				" 87KB image",
				"125KB image",
				"218KB image",
			},
			{
				"",
				" 70KB image",
				"101KB image",
				"354KB image",
				"416KB image",
			},
			{
				"",
				"yp1",
			},
			{
				"",
				"mma1",
				"mma2",
				"mma3",
				"mma4",
			},
	};

	static final String[][] tcp_objects_url_array = {
		{
			"http://www.popsugar.com",
			"http://media2.popsugar-assets.com/files/2014/05/27/022/n/1922729/b8330d7a543e40db_thumb_temp_front_page_image_file212191311375946261.xxxlarge/i/Secret-Flat-Abs.jpg",
			"http://media4.popsugar-assets.com/files/2014/08/12/859/n/1922729/2e51d8d4ddce89fc_thumb_temp_front_page_image_file8452391407766247.xxxlarge/i/Salad-Jar-Recipes.jpg",
			"http://media4.popsugar-assets.com/files/2014/06/17/043/n/1922195/a664497c694395ec_thumb_temp_front_page_image_file236623771372865112.xxxlarge/i/US-State-Foods.jpg",
		},
		{
			"http://shop.gopro.com",
			"http://shop.gopro.revdn.net/on/demandware.static/Sites-GoPro-Site/Library-Sites-sharedGoProLibrary/default/v1426026649788/images/slot/landing/ProductsHome_4images_3.jpg",
			"http://shop.gopro.com/on/demandware.static/Sites-GoPro-Site/Library-Sites-sharedGoProLibrary/default/v1426026649788/images/slot/landing/GoProAppProductsHome_thumbnail.jpg",
			"http://shop.gopro.com/on/demandware.static/Sites-GoPro-Site/Sites/default/v1426026649788/images/slot/ProductsHome_Parallax3CaptureCreateShare.jpg",
			"http://shop.gopro.com/on/demandware.static/Sites-GoPro-Site/Sites/default/v1426026649788/images/slot/ProductsHome_Parallax1Capture+ShareYourWorld.jpg",
		},
		{
			"http://www.yellowpages.com",
			"yp1",
		},
		{
			"",
			"mma1",
			"mma2",
			"mma3",
			"mma4",
		},
	};

	static final String[][] dots_objects_url_array = {
		{
			"http://popsugar.revdn.net",
			"http://popsugar.revdn.net/rev-third-party-http/media2.popsugar-assets.com/files/2014/05/27/022/n/1922729/b8330d7a543e40db_thumb_temp_front_page_image_file212191311375946261.xxxlarge/i/Secret-Flat-Abs.jpg",
			"http://popsugar.revdn.net/rev-third-party-http/media4.popsugar-assets.com/files/2014/08/12/859/n/1922729/2e51d8d4ddce89fc_thumb_temp_front_page_image_file8452391407766247.xxxlarge/i/Salad-Jar-Recipes.jpg",
			"http://popsugar.revdn.net/rev-third-party-http/media4.popsugar-assets.com/files/2014/06/17/043/n/1922195/a664497c694395ec_thumb_temp_front_page_image_file236623771372865112.xxxlarge/i/US-State-Foods.jpg",
		},
		{
			"http://shopgopro.revdn.net",
			"http://shopgopro.revdn.net/on/demandware.static/Sites-GoPro-Site/Library-Sites-sharedGoProLibrary/default/v1426026649788/images/slot/landing/ProductsHome_4images_3.jpg",
			"http://shopgopro.revdn.net/on/demandware.static/Sites-GoPro-Site/Library-Sites-sharedGoProLibrary/default/v1426026649788/images/slot/landing/GoProAppProductsHome_thumbnail.jpg",
			"http://shopgopro.revdn.net/on/demandware.static/Sites-GoPro-Site/Sites/default/v1426026649788/images/slot/ProductsHome_Parallax3CaptureCreateShare.jpg",
			"http://shopgopro.revdn.net/on/demandware.static/Sites-GoPro-Site/Sites/default/v1426026649788/images/slot/ProductsHome_Parallax1Capture+ShareYourWorld.jpg",
			},
		{
			"http://yellowpages.tt.revdn.net",
			"yp1",
		},
		{
			"",
			"mma1",
			"mma2",
			"mma3",
			"mma4",
		},
	};
	
	static final String[][] rmp_objects_url_array = {
		{
			"http://popsugar.revdn.net",
			"http://popsugar.revdn.net/rev-third-party-http/media2.popsugar-assets.com/files/2014/05/27/022/n/1922729/b8330d7a543e40db_thumb_temp_front_page_image_file212191311375946261.xxxlarge/i/Secret-Flat-Abs.jpg",
			"http://popsugar.revdn.net/rev-third-party-http/media4.popsugar-assets.com/files/2014/08/12/859/n/1922729/2e51d8d4ddce89fc_thumb_temp_front_page_image_file8452391407766247.xxxlarge/i/Salad-Jar-Recipes.jpg",
			"http://popsugar.revdn.net/rev-third-party-http/media4.popsugar-assets.com/files/2014/06/17/043/n/1922195/a664497c694395ec_thumb_temp_front_page_image_file236623771372865112.xxxlarge/i/US-State-Foods.jpg",
		},
		{
			"http://shopgopro.revdn.net",
			"http://shopgopro.revdn.net/on/demandware.static/Sites-GoPro-Site/Library-Sites-sharedGoProLibrary/default/v1426026649788/images/slot/landing/ProductsHome_4images_3.jpg",
			"http://shopgopro.revdn.net/on/demandware.static/Sites-GoPro-Site/Library-Sites-sharedGoProLibrary/default/v1426026649788/images/slot/landing/GoProAppProductsHome_thumbnail.jpg",
			"http://shopgopro.revdn.net/on/demandware.static/Sites-GoPro-Site/Sites/default/v1426026649788/images/slot/ProductsHome_Parallax3CaptureCreateShare.jpg",
			"http://shopgopro.revdn.net/on/demandware.static/Sites-GoPro-Site/Sites/default/v1426026649788/images/slot/ProductsHome_Parallax1Capture+ShareYourWorld.jpg",
		},
		{
			"http://yellowpages.tt.revdn.net",
			"yp1",
		},
		{
			"",
			"mma1",
			"mma2",
			"mma3",
			"mma4",
		},
	};


    static final String[] iterations_array = {
    	"1", "2", "3", "4", "5",
    };

    static final String[] testdelay_array = {
    	"1", "2", "3", "4", "5", "10",
    };

	private String status;
	private String type;
	private byte[] array;
	private long time;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		
		bn_sendrequest = (Button) findViewById(R.id.bn_sendrequest);

		cb_tcp = (CheckBox) findViewById(R.id.cb_tcp);
		cb_dots = (CheckBox) findViewById(R.id.cb_dots);
		cb_rmp = (CheckBox) findViewById(R.id.cb_rmp);
		
		createSpinnerAdapters(savedInstanceState);
		
		bn_sendrequest.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				int pcount = initializeDataBean();
				
				if (pcount != 0) {
					runTests();
					
					if (array == null) {
						Toast.makeText(v.getContext(), "Content download failed!", Toast.LENGTH_LONG).show();
					} else {
						dataBean.setContent(array);
						display();					
					}
					
				} else {
					Toast.makeText(v.getContext(), "No Protocol Selected!", Toast.LENGTH_SHORT).show();					
				}
			}
		});
	}

	private void createSpinnerAdapters(Bundle savedInstanceState) {
		sp_domain = (Spinner) findViewById(R.id.sp_domain);
		domain_adapter = new ArrayAdapter<CharSequence>(this, android.R.layout.simple_spinner_item, domain_array);
		domain_adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
		sp_domain.setAdapter(domain_adapter);

		sp_object = (Spinner) findViewById(R.id.sp_object);
		
		ArrayList<String> lst = new ArrayList<String>();
		
		object_adapter = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, lst);
		object_adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
		sp_object.setAdapter(object_adapter);
		
		sp_iterations = (Spinner) findViewById(R.id.sp_iterations);
		iterations_adapter = new ArrayAdapter<CharSequence>(this, android.R.layout.simple_spinner_item, iterations_array);
		iterations_adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
		sp_iterations.setAdapter(iterations_adapter);
		
		sp_testdelay = (Spinner) findViewById(R.id.sp_testdelay);
		testdelay_adapter = new ArrayAdapter<CharSequence>(this, android.R.layout.simple_spinner_item, testdelay_array);
		testdelay_adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
		sp_testdelay.setAdapter(testdelay_adapter);

		/*
		 *  Set the OnItemSelectedListener of the Domain spinner so we can trigger a
		 *  change to the Object/File spinner list of items
		 */
		sp_domain.setOnItemSelectedListener(new OnItemSelectedListener() {

		    @Override
		    public void onItemSelected(AdapterView<?> adapter, View view, int pos, long id) {
		    	if (pos != lastDP) {
			    	updateObjectsSpinner(pos, true);
			    	lastDP = pos;
		    	}
		    }

		    @Override
		    public void onNothingSelected(AdapterView<?> adapter) {
		        // TODO Auto-generated method stub
		    }
		});

		if (savedInstanceState != null) {
			lastDP = savedInstanceState.getInt(KEY_DOMAIN, 0);
			sp_domain.setSelection(lastDP);
			updateObjectsSpinner(lastDP, false);
			sp_object.setSelection(savedInstanceState.getInt(KEY_OBJECT, 0));
			sp_iterations.setSelection(savedInstanceState.getInt(KEY_ITER, 0));
			sp_testdelay.setSelection(savedInstanceState.getInt(KEY_DELAY, 0));
		}
	}
	
	protected void updateObjectsSpinner(int domainPos, Boolean resetOP) {
    	String [] objects = objects_array[domainPos];
    	
   		object_adapter.clear();
		for(int i = 0; i < objects.length; i++){
			object_adapter.add(objects[i]);
		}
		
		object_adapter.notifyDataSetChanged();
		
		if (resetOP == true) {
			sp_object.setSelection(0);
		}
	}
	
	private int getProtocolsSelected() {
		int count = 0;
		
		if (cb_tcp.isChecked()) {
			count++;
		}

		if (cb_dots.isChecked()) {
			count++;
		}

		if (cb_rmp.isChecked()) {
			count++;
		}
		
		return count;
	}

	private int initializeDataBean() {
		int count = 0;
		int pcount = getProtocolsSelected();
		int iterations = Integer.parseInt(iterations_adapter.getItem(sp_iterations.getSelectedItemPosition()).toString());
		
		if (pcount > 0) {
			dataBean = new DataBean(pcount, iterations);
			dataBean.setDomain(domain_array[sp_domain.getSelectedItemPosition()]);

			if (cb_tcp.isChecked()) {
				dataBean.setProtocol(count, cb_tcp.getText().toString());
				dataBean.setUrl(count, getProtocolUrl(cb_tcp.getId()));
				count++;
			}

			if (cb_dots.isChecked()) {
				dataBean.setProtocol(count, cb_dots.getText().toString());
				dataBean.setUrl(count, getProtocolUrl(cb_dots.getId()));
				count++;
			}

			if (cb_rmp.isChecked()) {
				dataBean.setProtocol(count, cb_rmp.getText().toString());
				dataBean.setUrl(count, getProtocolUrl(cb_rmp.getId()));
				count++;
			}			
		}
		
		return pcount;
	}
	
	protected String getProtocolUrl(int id) {
		switch (id) {
		case R.id.cb_tcp:
			return tcp_objects_url_array[sp_domain.getSelectedItemPosition()][sp_object.getSelectedItemPosition()];
		case R.id.cb_dots:
			return rmp_objects_url_array[sp_domain.getSelectedItemPosition()][sp_object.getSelectedItemPosition()];
		case R.id.cb_rmp:
			return rmp_objects_url_array[sp_domain.getSelectedItemPosition()][sp_object.getSelectedItemPosition()];
		}

		return null;
	}
	
	protected void runTests() {
		int iterations = dataBean.getCount();
		int protocols = dataBean.getProtocolCount();
		int testdelay = Integer.parseInt(testdelay_adapter.getItem(sp_testdelay.getSelectedItemPosition()).toString());

		for (int i = 0; i < iterations; i++) {
			for (int j = 0; j < protocols; j++) {
				final int count = i;
				final int pidx = j;
					
				final String url = dataBean.getUrl(pidx);
					
				Thread thread = new Thread() {
					@Override
					public void run() {
						try {
							time = System.currentTimeMillis();
							array = getUrlBytes(url, dataBean.getProtocol(pidx));
							time = System.currentTimeMillis() - time;
								
							dataBean.setStatus(status);
							dataBean.setType(type);
							dataBean.setDownloadTime(pidx, count, time);
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
					
				// Need to sleep before executing the next test
				try {
					Thread.sleep(testdelay * 1000);
				} catch (InterruptedException e1) {
					e1.printStackTrace();
				}
			}
		}
	}
	
	protected void display() {
		Intent intent = new Intent(getApplicationContext(), Statistics.class);
		intent.putExtra("data", dataBean);
		startActivity(intent);
	}
	
	@Override
	public void onSaveInstanceState(Bundle savedInstanceState) {
		super.onSaveInstanceState(savedInstanceState);
		savedInstanceState.putInt(KEY_DOMAIN, sp_domain.getSelectedItemPosition());
		savedInstanceState.putInt(KEY_OBJECT, sp_object.getSelectedItemPosition());
		savedInstanceState.putInt(KEY_ITER, sp_iterations.getSelectedItemPosition());
		savedInstanceState.putInt(KEY_DELAY, sp_testdelay.getSelectedItemPosition());
	}
	
	private byte[] getUrlBytes(String urlSpec, String protocol) throws IOException {
		URL url = new URL(null, urlSpec, new Handler(protocol));
		//URL url = new URL(urlSpec);
		HttpURLConnection connection = (HttpURLConnection)url.openConnection();
	
		try {
			InputStream in = connection.getInputStream();
			
			type = connection.getContentType();
			status = connection.getResponseMessage();
			
			if (connection.getResponseCode() == HttpURLConnection.HTTP_OK) {
				byte[] buffer = new byte[in.available()];
				in.read(buffer);
				return buffer;
			}
			
			return null;
		} finally {
			connection.disconnect();
		}
	}
}