/*!
 * RevPortal v1.0.0
 * Copyright 2013-2014 RevSofware, Inc.
 */

/**
 * 
 * @param cname - cookie name
 * @param cvalue - cookie value
 * @param exdays - expiry date
 */

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

/**
 * 
 * @param cname - cookie name
 * @returns cookie name
 */
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for ( var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) == 0)
			return c.substring(name.length, c.length);
	}
	return "";
}


function checkCookie() {
	var user = getCookie("username");
	if (user != "") {
		alert("Welcome again " + user);
	} else {
		user = prompt("Please enter your name:", "");
		if (user != "" && user != null) {
			setCookie("username", user, 365);
		}
	}
}


/**
 * This method return jquery ajax
 * @param url - service url
 * @param params - params for POST or GET method 
 * @param method - either POST or GET
 * @returns
 */

var  load = function(url,params,method){
	var dataType="html";
	if(params!=""){
		dataType="json";
	}
	return jQuery.ajax({
        url:url,
        contentType:"application/json",
        dataType: dataType,
        data:params,
        type:method,
        error: function(request, status, errorThrown){
            //console.log(request, status, errorThrown);
                showErrorMessages("Could not connect to server");
        }
        });        
};

/**
 * SerializeObject - It generate json object having form attributes & values 
 */

$.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name]) {
			if (!o[this.name].push) {
				o[this.name] = [ o[this.name] ];
			}
			o[this.name].push(this.value.trim() || '');
		} else {
			o[this.name] = this.value.trim() || '';
		}
	});
	return o;
};

/**
 * Clear Browser localStorage
 */
var clearStore = function(){
	localStorage.clear();
};


var showErrorMessages = function(errors, error_type){
	var msgs = [];
	var cls = "alert-info";
	/*if(error_type=="danger"){
		cls = "alert-danger";
	}else if(error_type=="success"){
		cls = "alert-success";
	}else if(!cls || cls ==""){
            cls = "alert-info";
        }*/
	
	if(typeof(errors)=="object"){
		Object.keys(errors).forEach(function(key){
			msgs.push(key+" "+errors[key][0]);
		});
		$(".flash_messages").html(msgs.join(", ")).addClass(cls).alert();
	}else{
		if(errors=="Token Error"){
			store.setItem("is_admin", false);
			store.setItem("is_logged_in", false);
			store.setItem("token", "");
			ui_for_logout_user();
			store.clear();
			$(".flash_messages").html("User already logged in different machine").addClass(cls).alert();
		}else{
			$(".flash_messages").html(errors).addClass(cls).alert();
		}
	}
	$(".flash_messages").show().fadeOut({
		duration:8000,
		complete: function(){
			$(this).hide();
		}
	});
};


var clearInputs = function(){
	$("input:text").each(function(){
		$(this).val("");
	});
	$("input:password").each(function(){
		$(this).val("");
	});
};

var forgot_password_dialog = function(){
	$(".forgot_password").click(function(){
		var service = load(settings.pages.forgot_password, "", settings.get);
		service.success(function(output) {
			$("#dialog").modal();
                        $(".modal-title").html("Forgot Password");
			$(".modal-body").html(output);
			$('#dialog').on('shown.bs.modal', function(e) {
				forgot_password_action();
			});
		});
	});
};

var forgot_password_action = function(){
	$(".btn-forgot-password").click(function(){
		formData = $(".forgot_password_form").serializeObject();
		//console.log(formData);
		if(formData.email==""){
			alert("Email should not be blank");
		}else{
			var service = load(settings.url("forgot_password"),JSON.stringify(formData), settings.post);
			service.success(function(output) {
				if(output.status){
					$("#dialog").modal('hide');
				}
                                showErrorMessages(output.response);
			});
		}
	});
};

DEBUG = false;
var LOG = function(){
	if(DEBUG){
		for(var i=0;i<arguments.length;i++){
			console.log(arguments[i]);
		}
	}
};

check_user_session_exists = function(){
	var token = store.getItem("token");
	//console.log("TOKEN IS",token);
	if(token==null){
		window.location.reload();
	}
};

validate_token = function(){
	var token = store.getItem("token");
	//console.log("TOKEN IS",token);
	if(token!=null){
		javascript_session = setInterval(check_user_session_exists,5000);
	}
};

var valNone = function(str){
    var f_str='';
    if(str == null || str == undefined || str == "" || str == "null" || str == "undefined"){
        f_str = '<span class="tdAlign">--</span>';
    }else{
        if(str.indexOf(',')!=-1){
            f_str = str.replace(/,/g,', ');
        }else{
            f_str = str;
        }
    }   
   return f_str;
};

var syncSuccess = function(str,ips){
    if(str == "Sync Failed"){
        return (ips!="" && ips!=null && ips!=undefined)?('Failed: '+ips.replace(/,/g,", ")):"Fail";
    }else{
        return 'Success';
    }
}

var Loader = function(){
	this.start = function(spinner){
		$("body").css("cursor","wait");
		document.getElementById('loading').appendChild(spinner.el);
		$(".preloading").show();
	};
	this.stop = function(spinner){
		spinner.stop();
		$(".preloading").hide();
		$("body").css("cursor","default");
	};
};
/**
* This function is used to allow only numbers
*/
function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}
