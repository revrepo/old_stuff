package com.rev.rmptcp.timestampapp;

import android.app.Activity;
import android.app.Dialog;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

public class Statistics extends Activity {

	private TextView tv_header = null;
	private TextView tv_content = null;
	private WebView wv_html = null;
	private ImageView image=null;
	private Button bt_results;
	private DataBean databean;
	private TextView tv_textcontent=null;

	protected void onCreate(android.os.Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.statistics);
		tv_header = (TextView) findViewById(R.id.header);
		tv_content = (TextView) findViewById(R.id.content);
		wv_html = (WebView) findViewById(R.id.wv);
		bt_results = (Button) findViewById(R.id.bt_results);
		image=(ImageView)findViewById(R.id.image);
		tv_textcontent=(TextView)findViewById(R.id.textcontent);
		Bundle b = getIntent().getExtras();
		databean = (DataBean) b.getSerializable("data");

//		System.out.println("Displaying : " + databean.getDomain());
		tv_header.setText("Domain: " + databean.getDomain() +
						  "\nHttp Response : " + databean.getStatus() +
						  "\nContent Type: " + databean.getType() + 
						  "\nContent Size: " + databean.getContentSize() +
						  "\n\nContent : \n");

		if (databean.getStatus() != null && databean.getStatus().contains("OK")) {
			if (databean.getType() != null
					&& databean.getType().contains("text/html")) {
				wv_html.setVisibility(View.VISIBLE);
				wv_html.setInitialScale(1);
				wv_html.getSettings().setBuiltInZoomControls(true);
				wv_html.getSettings().setUseWideViewPort(true);
				wv_html.loadData(new String(databean.getContent()), databean.getType(),
						null);

			} 
			else if (databean.getStatus() !=null
						&& databean.getType().contains("text/css")) {
				tv_textcontent.setVisibility(View.VISIBLE);				
			}
			
			else {
				image.setVisibility(View.VISIBLE);
				Bitmap bmp = BitmapFactory.decodeByteArray(databean.getContent(), 0, databean.getContent().length);
				image.setImageBitmap(bmp);
			}
		} else {
			tv_content.setText("");
			wv_html.setVisibility(View.INVISIBLE);
		}


		bt_results.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				alert_stats();
			}
		});

		alert_stats();
	}

	private void alert_stats() {
		
		if (databean.getCount() != 0) {
			final Dialog dialog = new Dialog(Statistics.this);
			dialog.setContentView(R.layout.d_stats);
			dialog.setTitle("Download Results (ms)");

		
			Button bt_back = (Button) dialog.findViewById(R.id.bt_back);
			bt_back.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {
					dialog.dismiss();
				}
			});

			build_table(dialog);

			dialog.show();
		}
	}
	
	private void build_table(Dialog dialog) {
		final int count = databean.getCount();
		final int pcount = databean.getProtocolCount();
		TextView tv1;
		String label;
		int res_id;
		int iter;

		for (int i = 0; i < count; i++) {
			for (int j = 0; j < pcount; j++) {
				String pName = databean.getProtocol(j);
				
				iter = i + 1;
				
				// Find the id of the iteration TextView
				label = "iterationvalue"  + iter;
				res_id = getResources().getIdentifier(label, "id", getPackageName());
				tv1 = (TextView) dialog.findViewById(res_id);
				tv1.setText("" + iter);
				
				// Find the id of the TCP TextView
				if (pName.equals("TCP")) {
					label = "tcpvalue"  + iter;
					res_id = getResources().getIdentifier(label, "id", getPackageName());
					tv1 = (TextView) dialog.findViewById(res_id);
					tv1.setText("" + databean.getDownloadTime(j, i));
				}
				
				// Find the id of the DOTS TextView
				if (pName.equals("DOTS")) {
					label = "dotsvalue"  + iter;
					res_id = getResources().getIdentifier(label, "id", getPackageName());
					tv1 = (TextView) dialog.findViewById(res_id);
					tv1.setText("" + databean.getDownloadTime(j, i));
				}
				
				// Find the id of the RMP TextView
				if (pName.equals("RMP")) {
					label = "rmpvalue"  + iter;
					res_id = getResources().getIdentifier(label, "id", getPackageName());
					tv1 = (TextView) dialog.findViewById(res_id);
					tv1.setText("" + databean.getDownloadTime(j, i));
				}
			}
		}
	}

}
