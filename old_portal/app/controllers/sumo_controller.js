load('application');

//Loading the required modules
var log= require("co-logger");
var http = require('http');
var https = require('https');
var fs = require('fs');

var Os_browser = {"android-chrome":["Android","Chrome"],"android":["Android",""],"android-firefox":["Android","Firefox"],"chrome":["","Chrome"],"firefox":["","Firefox"],"ie":["","IE"],"safari":["","Safari"],"ios-safari":["iPhone","Safari"],"ios-chrome":["iPhone","Chrome"],"ios-firefox":["iPhone","Firefox"],"windows-phone":["Windows",""],"others":["Other","Other"]};

action('bandwidth_reports',function(){
	var uname = "prashant@revsw.com";
	var pword="Revsw1@34";
	var api_url ="/api/v1/logs/search?";
	var _to = (new Date()).getTime();
	var sort_par = "+%7C+sum%28total_size%29+as+t_size+by+_timeslice+%7C+sort+by+_timeslice+asc";
	
	_from = _to - from_time("");
	generate_bw_query(req.body,function(q_par,geo_par,dev_par,time_slice_sec){
		console.log("GOT RESP FROM CALL BACK");
		if(req.body.filter!= undefined || req.body.filter.time_range!= undefined){
			_from = _to - from_time(req.body.filter.time_range);
		}
		
		var query = api_url+"from="+_from+"&to="+_to+q_par+geo_par+dev_par+sort_par;
		
		var options = {
	    		host: 'api.sumologic.com',
	    		path: query,
	    		headers: {
		     		'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
		   		}
		};
		console.log("bw---->");
		console.log("bw--AFT",JSON.stringify(options));

		request = https.get(options, function(res){
		    var body = "";
		    res.on('data', function(data) {
		    	body += data;
		    });
		    res.on('end', function() {
		    	console.log("end called in bw");
//			    	console.log(JSON.parse(body));
		    	if(body!="") {
		    		format_bandwidth_data(JSON.parse(body),time_slice_sec,function(resJson){
			    		send({status:true,response:resJson});
			    	});
		    	} else {
		    		var resJson = [];
		    		send({status:true,response:resJson});
		    	}
		    	
		    });
		    res.on('error', function(e) {
		    	send({status:false,response:"Unable to retrieve reports. Please try later."});
		    	console.log("Got error: " + e.message);
		    });
		});
	});
});

var format_bandwidth_data = function(bw_json,time_slice_sec,callback){
//	console.log("response---->>>",bw_json);
	var bw_res_json = [],v=0;
	prepareResponse();
	
	function prepareResponse(){
		if(v<bw_json.length){
			var bw_obj = {};
			bw_obj.x = parseFloat(bw_json[v]._timeslice)/1000;
			bw_obj.y = (bw_json[v].t_size*8)/time_slice_sec;				
			bw_res_json.push(bw_obj);
			v++;
			prepareResponse();
		}else{
			callback(bw_res_json);
		}
	}	
};

var generate_bw_query  = function(data_obj,callback){
	var q_par ="",geo_par = "",dev_par = "";
	var _dname = data_obj.domainName;//"revtest.mygraphs.com";//req.body.domainName;
	var view_type;
	var time_slice_sec=300;
	
	console.log("IF LOOP---->",data_obj);
	console.log("AAA---->",data_obj.filter);

	if(data_obj && data_obj.filter==""){
		console.log("IN IF : LOOP---->");
			q_par = "&q=_view%3Dsv_bw_generic+%7C+where+domain+matches+%22"+_dname+"%22+";
			callback(q_par,geo_par,dev_par, time_slice_sec);
	} else {
		console.log("ELSE LOOP---->",data_obj);
		if(data_obj.filter.time_range) {
			view_type = "sv_bw_generic";
		} 
		
		console.log("Q PARAM---->",q_par);
		
		if(data_obj.filter.geography== undefined && data_obj.filter.device== undefined){
			geo_par = "";
			dev_par = "";
			view_type = "sv_bw_generic";
		}else if(data_obj.filter.geography == undefined && data_obj.filter.device!= undefined){
			geo_par = "";
			
			view_type = "sv_bw_UA";
			
			var osb = Os_browser[data_obj.filter.device];
			
			if(osb[0]!="" && osb[1]==""){
				dev_par = "AND+os+matches+%22"+osb[0]+"%22";
			}else if(osb[0]=="" && osb[1]!=""){
				dev_par = "AND+browser+matches+%22"+osb[1]+"%22";
			}else if(osb[0]!="" && osb[1]!=""){
				dev_par = "AND+os+matches+%22"+osb[0]+"%22+AND+browser+matches+%22"+osb[1]+"%22";
			}else{
		    	dev_par = "";
		    }
		}else if(data_obj.filter.geography!= undefined && data_obj.filter.device == undefined){
			view_type = "sv_bw_geo";
			geo_par = "AND+country_code+matches+%22"+data_obj.filter.geography+"%22+";
			dev_par = "";
		}else{
			view_type = "sv_bw_geo_UA";
			
			geo_par = "AND+country_code+matches+%22"+data_obj.filter.geography+"%22+";
			var osb = Os_browser[data_obj.filter.device];
			
			if(osb[0]!="" && osb[1]==""){
				dev_par = "AND+os+matches+%22"+osb[0]+"%22";
			}else if(osb[0]=="" && osb[1]!=""){
				dev_par = "AND+browser+matches+%22"+osb[1]+"%22";
			}else if(osb[0]!="" && osb[1]!=""){
				dev_par = "AND+os+matches+%22"+osb[0]+"%22+AND+browser+matches+%22"+osb[1]+"%22";
			}else{
		    	dev_par = "";
		    }
		}	
		
		if(data_obj.filter.time_range == "1hour" || data_obj.filter.time_range == "3hours" || data_obj.filter.time_range == "6hours"){
			q_par = "&q=_view%3D"+view_type+"+%7C+where+domain+matches+%22"+_dname+"%22+";
			time_slice_sec = 300;
		}else if(data_obj.filter.time_range == "24hours" || data_obj.filter.time_range == "12hours"){
			q_par = "&q=_view%3D"+view_type+"_15+%7C+where+domain+matches+%22"+_dname+"%22+";
			time_slice_sec = 900;
		}else if(data_obj.filter.time_range == "7days" || data_obj.filter.time_range == "15days" || data_obj.filter.time_range == "30days"){
			q_par = "&q=_view%3D"+view_type+"_240+%7C+where+domain+matches+%22"+_dname+"%22+";
			time_slice_sec = 14400;
		}else{
			q_par = "&q=_view%3D"+view_type+"+%7C+where+domain+matches+%22"+_dname+"%22+";
			time_slice_sec = 300;
		}
		callback(q_par,geo_par,dev_par, time_slice_sec);
	}
};


var generate_traffic_query  = function(data_obj,callback){
	var q_par ="",geo_par = "",dev_par = "";
	var _dname = data_obj.domainName;//"revtest.mygraphs.com";//req.body.domainName;
	var view_type;
	var time_slice_sec=300;
	
	console.log("IF LOOP---->",data_obj);
	console.log("AAA---->",data_obj.filter);

	if(data_obj && data_obj.filter==""){
		console.log("IN IF : LOOP---->");
			q_par = "&q=_view%3Dsv_hits_generic+%7C+where+domain+matches+%22"+_dname+"%22+";
			callback(q_par,geo_par,dev_par,time_slice_sec);
	} else {
		console.log("ELSE LOOP---->",data_obj);
		if(data_obj.filter.time_range) {
			view_type = "sv_hits_generic";
		} 
		
		console.log("Q PARAM---->",q_par);
		
		if(data_obj.filter.geography== undefined && data_obj.filter.device== undefined){
			geo_par = "";
			dev_par = "";
			view_type = "sv_hits_generic";
		}else if(data_obj.filter.geography == undefined && data_obj.filter.device!= undefined){
			geo_par = "";
			
			view_type = "sv_hits_UA";
			
			var osb = Os_browser[data_obj.filter.device];
			
			if(osb[0]!="" && osb[1]==""){
				dev_par = "AND+os+matches+%22"+osb[0]+"%22";
			}else if(osb[0]=="" && osb[1]!=""){
				dev_par = "AND+browser+matches+%22"+osb[1]+"%22";
			}else if(osb[0]!="" && osb[1]!=""){
				dev_par = "AND+os+matches+%22"+osb[0]+"%22+AND+browser+matches+%22"+osb[1]+"%22";
			}else{
		    	dev_par = "";
		    }
		}else if(data_obj.filter.geography!= undefined && data_obj.filter.device == undefined){
			view_type = "sv_hits_geo";
			geo_par = "AND+country_code+matches+%22"+data_obj.filter.geography+"%22+";
			dev_par = "";
		}else{
			view_type = "sv_hits_geo_UA";
			
			geo_par = "AND+country_code+matches+%22"+data_obj.filter.geography+"%22+";
			var osb = Os_browser[data_obj.filter.device];
			
			if(osb[0]!="" && osb[1]==""){
				dev_par = "AND+os+matches+%22"+osb[0]+"%22";
			}else if(osb[0]=="" && osb[1]!=""){
				dev_par = "AND+browser+matches+%22"+osb[1]+"%22";
			}else if(osb[0]!="" && osb[1]!=""){
				dev_par = "AND+os+matches+%22"+osb[0]+"%22+AND+browser+matches+%22"+osb[1]+"%22";
			}else{
		    	dev_par = "";
		    }
		}	
		
		if(data_obj.filter.time_range == "1hour" || data_obj.filter.time_range == "3hours" || data_obj.filter.time_range == "6hours"){
			q_par = "&q=_view%3D"+view_type+"+%7C+where+domain+matches+%22"+_dname+"%22+";
			time_slice_sec = 300;
		}else if(data_obj.filter.time_range == "24hours" || data_obj.filter.time_range == "12hours"){
			q_par = "&q=_view%3D"+view_type+"_15+%7C+where+domain+matches+%22"+_dname+"%22+";
			time_slice_sec = 900;
		}else if(data_obj.filter.time_range == "7days" || data_obj.filter.time_range == "15days" || data_obj.filter.time_range == "30days"){
			q_par = "&q=_view%3D"+view_type+"_240+%7C+where+domain+matches+%22"+_dname+"%22+";
			time_slice_sec = 14400;
		}else{
			q_par = "&q=_view%3D"+view_type+"+%7C+where+domain+matches+%22"+_dname+"%22+";
			time_slice_sec = 300;
		}
		callback(q_par,geo_par,dev_par,time_slice_sec);
	}
};

action('traffic_count',function(){
	var uname = "prashant@revsw.com";
	var pword="Revsw1@34";
	var api_url ="/api/v1/logs/search?";
	var _to = (new Date()).getTime();
	var sort_par = "+%7C+sum%28count%29+as+t_hits+by+_timeslice+%7C+sort+by+_timeslice+asc";
	
	_from = _to - from_time("");
	generate_traffic_query(req.body,function(q_par,geo_par,dev_par,time_slice_sec){
		console.log("GOT RESP FROM CALL BACK");
		if(req.body.filter!= undefined || req.body.filter.time_range!= undefined){
			_from = _to - from_time(req.body.filter.time_range);
		}
		
		var query = api_url+"from="+_from+"&to="+_to+q_par+geo_par+dev_par+sort_par;
		
		var options = {
	    		host: 'api.sumologic.com',
	    		path: query,
	    		headers: {
		     		'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
		   		}
		};
		console.log("traff---->");
		console.log("count--AFT",JSON.stringify(options));

		request = https.get(options, function(res){
		    var body = "";
		    res.on('data', function(data) {
		    	body += data;
		    });
		    res.on('end', function() {
		    	console.log("end called in hc");
//			    	console.log(JSON.parse(body));
		    	if(body!="") {
		    		format_count_data(JSON.parse(body),time_slice_sec,function(resJson){
			    		send({status:true,response:resJson});
			    	});
		    	} else {
		    		var resJson = [];
		    		send({status:true,response:resJson});
		    	}
		    	
		    });
		    res.on('error', function(e) {
		    	send({status:false,response:"Unable to retrieve reports. Please try later."});
		    	console.log("Got error: " + e.message);
		    });
		});
	});
});

var format_count_data = function(bw_json,time_slice_sec,callback){
//	console.log("response---->>>",bw_json);
	var bw_res_json = [],v=0;
	prepareResponse();
	
	function prepareResponse(){
		if(v<bw_json.length){
			var bw_obj = {};
			bw_obj.x = parseFloat(bw_json[v]._timeslice)/1000;
			bw_obj.y = (bw_json[v].t_hits)/time_slice_sec;				
			bw_res_json.push(bw_obj);
			v++;
			prepareResponse();
		}else{
			callback(bw_res_json);
		}
	}		
};

 var from_time = function(data){
	 switch(data){
	 	case '1hour' : return 60*60*1000; break;
	 	case '3hours' : return 3*60*60*1000; break;
	 	case '6hours' : return 6*60*60*1000; break;
	 	case '12hours' : return 12*60*60*1000; break;
	 	case '24hours' : return 24*60*60*1000; break;
	 	case '7days' : return 7*24*60*60*1000; break;
	 	case '15days' : return 15*24*60*60*1000; break;
	 	case '30days' : return 30*24*60*60*1000; break;
	 	default : return 60*60*1000; break;
	 }
 };
