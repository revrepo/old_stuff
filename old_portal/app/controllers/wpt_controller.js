load('application');
//before(use('validateRequest'),{only:['wpt_history','get_wpt_history']});

//Loading the required modules
var log= require("co-logger");
var WebSocketClient = require('websocket').client;
var WebSocket = require('ws');

action('wpt_history',function(){
	if(req.body.domainName){
		MasterConfiguration.findOne({where:{"domainName":req.body.domainName}},function(err,mc_dom_det){
			if(err){
				send({ status:false,response: mc_dom_det.errors});
			}else{
				if(mc_dom_det){
					var bp_con = mc_dom_det.configurationJson;
					var wpt_config_obj = {};
						if(bp_con.rev_component_co.enable_optimization ===  false){
							wpt_config_obj.mode = "off";
						}else{
							wpt_config_obj.mode = bp_con.rev_component_co.mode;
							wpt_config_obj.img_choice = bp_con.rev_component_co.img_choice;
							wpt_config_obj.js_choice = bp_con.rev_component_co.js_choice;
							wpt_config_obj.css_choice = bp_con.rev_component_co.css_choice;
						}


						if(bp_con.rev_component_bp.enable_cache === false){
							wpt_config_obj.cdn = "off";
						}else{
							wpt_config_obj.cdn = bp_con.rev_component_bp.cache_opt_choice;	
						}

					var wptHistory = new WPTHistory();
						wptHistory.domainName = req.body.domainName;
						wptHistory.test_id = req.body.testId;
						wptHistory.test_url = req.body.test_url;
						wptHistory.user_id = req.body.user_id;
						wptHistory.configuration = wpt_config_obj;

					wptHistory.save(function(err,wpt_History){
						if(err){
							send({ status:false,response: wpt_History.errors});
						} else{
							send({ status:true,response:"Test details saved successfully"});
						}
					});
				}else{
					send({ status:false,response:"Please send valid data"});
				}
			}
		});
	}else{
		send({ status:false,response:"Please send valid data"});
	}
});

action('get_wpt_history',function(){
	if(req.body.domainList.length!=0){
		WPTHistory.all({where:{domainName:{inq: req.body.domainList}}, order:'timeofTest:DESC',limit:5},function(err,testRecords){
			if(err){
				send({ status:false,response: WPTHistory.errors});
			}else{
				send({ status:true,response: testRecords});
			}
		});
	}else{
		send({ status:true,response: []});
	}
});
