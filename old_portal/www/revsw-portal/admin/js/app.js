/*!
 * RevPortal v3.1
 * Copyright 2015 RevSofware, Inc.
 */

// Identifying whether browser supports localStorage or not
if (window.localStorage) {
	store = window.localStorage;
} else {
	alert("Your browser does not support localStorage");
}
is_logged_in = false;
is_admin = false;

// Document Ready function
jQuery(document).ready(function() {
	// Check if user is an admin or not
	is_admin = JSON.parse(store.getItem("is_admin"));
	is_logged_in = JSON.parse(store.getItem("is_logged_in"));
	LOG("IS ADMIN", is_admin);
	LOG("IS LOGGED IN", is_logged_in);
	if (is_logged_in) {
		if (is_admin) {
			ui_for_logged_user();			
		} else {
			window.location.href="../";
		}
                
	} else {
		load_login_page();
		load_main_page();
	}
        
        $(window).resize(function(){
            $(".main_container").css('height',function(){
                var scr_ht = $(window).height();
                return (scr_ht-$("header").height()-$("footer").height()-1) + "px" ;
            });
        });
        
	if(window.addEventListener){
		window.addEventListener("hashchange", pageNavigate,false);
	}else if(window.attachEvent){
		window.attachEvent("hashchange", pageNavigate,false);
	}else {
		LOG("WINDOW HASH CHANGE EVENT DOES NOT SUPPORT IN YOUR BROWSER");
	}
	javascript_session = function(){};
	validate_token();
});



/**
 * Switching the UI page when user click the menus or page refresh
 * @param page
 */

var switchPage = function(page) {
	switch (page) {
        case "#companies":
		load_company_page();
		break;
	case "#users":
		load_account_page();
		break;
	case "#domains":
		load_domains_page();
		break;
	/*case "#settings":
		load_settings_page();
		break;*/
        case "#purge":  load_purge_page();
                        break;
        case "#domainEditor":	load_domain_editor_page();
                                break;
        case "#serverGroups":  load_sgroups_page();
                        break;
        case "#about" : load_about_page();
                        break;
	default:
		LOG("DEFAULT PAGE");
		is_admin = JSON.parse(store.getItem("is_admin"));
		LOG(is_admin);
		if(is_admin){
			load_company_page();
		}
		break;
	}
        
        $(".main_container").css('height',function(){
            var scr_ht = $(window).height();
            return (scr_ht-$("header").height()-$("footer").height()-1) + "px" ;
        });
        $('.dlist_pop').popover('destroy');
};

/**
 * PageNavigate - Inorder to show/hide page
 */

var pageNavigate = function(){    // call function to hide/show pages
	show_page_hide_all(location.hash,function(){
		LOG("LOCATION :", location.hash);
		is_admin = JSON.parse(store.getItem("is_admin"));
		if(is_admin){
			switchPage(location.hash);
		}
	});
};

/**
 * Show/Hide UI pages
 * @param page
 * @param callback
 */
var show_page_hide_all = function(page,callback){ // show current page and hide the previous page
	jQuery(".page").each(function(index, element) {
		ele = $(element);
		var page_id = ele.attr("id");
		if (page_id != page) {
			ele.hide();
			$("a[href='#" + page_id + "']").parent().removeClass("active");
		}
	});
	if(page==""){
		page = settings.default_to_render;
	}
	$(page).show();
	$("a[href='" + page + "']").parent().addClass("active");
	callback();
};

var load_about_page = function(){
    var service = load(settings.pages.about,"", settings.get);
    service.success(function(response) {
        $("#about").html(response);
        $(".version_sp").html(version_settings.version);
        $(".package_sp").html(version_settings.package_no);
        $("#about").show();
    });
};