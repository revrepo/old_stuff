var alert_message = function(type,message){
	$(".flash_messages").html("<div class='alert alert-"+type+"'>"+message+"</div>");
}


var loginTemplate = '<div class="pull-right"><div class="form-inline ">\n\
	<div class="form-group">\n\
		<input type="text" name="email" placeholder="Email" id="login_email" class="form-control input-sm"/>\n\
	</div>\n\
	<div class="form-group">\n\
		<input type="password" name="password" placeholder="Password" id="login_password" class="form-control input-sm"/>\n\
	</div>\n\
	<div class="form-group">\n\
		<input type="button" value="Signin" class="btn btn-primary btn-sm"/>\n\
	</div>\n\
</div>\n\
<div class="form-inline pull-right">\n\
		<div class="form-group"><a href="">Forgot email</a></div>\n\
		<div class="form-group marl_med"><a href="">Forgot password</a></div>\n\
	</div>\n\
</div>\n\
<div class="clearfix">\n\
</div>';