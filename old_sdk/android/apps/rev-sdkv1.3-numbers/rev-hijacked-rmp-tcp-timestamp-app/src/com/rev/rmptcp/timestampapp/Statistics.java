package com.rev.rmptcp.timestampapp;

import android.app.Activity;
import android.app.Dialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

public class Statistics extends Activity {

	TextView tv_header = null;
	TextView tv_content = null;
	WebView wv_html = null;
	ImageView image=null;
	Button bt_stats;
	DataBean databean;

	// String status = "";
	// String type = "";
	// String content = "";

	protected void onCreate(android.os.Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.statistics);
		tv_header = (TextView) findViewById(R.id.header);
		tv_content = (TextView) findViewById(R.id.content);
		wv_html = (WebView) findViewById(R.id.wv);
		bt_stats = (Button) findViewById(R.id.bt_stats);
		image=(ImageView)findViewById(R.id.image);
		Bundle b = getIntent().getExtras();
		databean = (DataBean) b.getSerializable("data");

		System.out.println("Displaying : " + databean.getTimestamp());
		tv_header.setText("Http Response : " + databean.getStatus()
				+ "\nContent Type: " + databean.getType() + "\n\nContent : \n");
		if (databean.getStatus() != null && databean.getStatus().contains("OK")) {
			if (databean.getType() != null
					&& databean.getType().contains("text/html")) {
				// tv_stats.setText(databean.getTimestamp());
				wv_html.setVisibility(View.VISIBLE);
				// tv_content.setText("bfbf");
				wv_html.setInitialScale(1);
				wv_html.getSettings().setBuiltInZoomControls(true);
				wv_html.getSettings().setUseWideViewPort(true);
				wv_html.loadData(new String(databean.getContent()), databean.getType(),
						null);

			} else {
				image.setVisibility(View.VISIBLE);
				Bitmap bmp = BitmapFactory.decodeByteArray(databean.getContent(), 0, databean.getContent().length);
				image.setImageBitmap(bmp);
			}
		} else {
			tv_content.setText("");
			wv_html.setVisibility(View.INVISIBLE);
		}

		bt_stats.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				alert_stats();
			}
		});

		alert_stats();
	}

	private void alert_stats() {
		final Dialog dialog = new Dialog(Statistics.this);
		dialog.setContentView(R.layout.d_stats);
		dialog.setTitle("Statistics");
		TextView tv_title = (TextView) dialog.findViewById(R.id.tv_title);
		Button bt_email = (Button) dialog.findViewById(R.id.bt_email);
		Button bt_back = (Button) dialog.findViewById(R.id.bt_back);
		tv_title.setText(databean.getTimestamp());
		bt_back.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				dialog.dismiss();
			}
		});

		bt_email.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				Intent i = new Intent(Intent.ACTION_SEND);
				i.setType("message/rfc822");
				i.putExtra(Intent.EXTRA_EMAIL,
						new String[] { "" });
				i.putExtra(Intent.EXTRA_SUBJECT, "RMP Statistics");
				i.putExtra(Intent.EXTRA_TEXT, databean.getTimestamp());
				try {
					startActivity(Intent.createChooser(i, "Send mail..."));
				} catch (android.content.ActivityNotFoundException ex) {
					Toast.makeText(dialog.getContext(),
							"There are no email clients installed.",
							Toast.LENGTH_SHORT).show();
				}
			}
		});
		dialog.show();
	};
}
