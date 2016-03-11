/*!
* RevPortal v1.0.0
* Copyright 2013-2014 RevSofware, Inc.
*/

/**
* Display Company List
*/
companyList = null;
var company_list = function(url){
    var params = {
        email: store.getItem("email"),
        token: store.getItem("token"),
        role:store.getItem("role")
    };

    if(params.email!=null && params.token!=null){
        var service = load(url, JSON.stringify(params), "POST");
        service.success(function(output){
            if(output.status){
                $("#company_list .data").html("");
                var c_html = "";
                companyList = output.response;
                var clist ={};
                $(output.response).each(function(i,v){
                    clist[v.id] = v.companyName;
                    c_html = "<tr><td>"
                            + v.companyName
                            + "</td>"
                            + "<td>"
                            + format_date(v.created_at)
                            + "</td>"
                            + "<td>"
                            + format_date(v.updated_at)
                            + "</td>"
                            + "<td><input type='button' class='btn btn-sm btn-primary btn-edit-company' value='Edit' data-row='"
                            + i
                            + "'></td>"
                            + "<td><input type='button'"
                            + disable_def_company(v.createdBy)
                            +"value='Delete' data-row='"
                            + i
                            + "'></td>"
                            + "</tr>";
                    $("#company_list .data").append(c_html);
                });
                store.setItem("clist",JSON.stringify(clist));
                company_actions();
            }else{
                    showErrorMessages(output.response);
            }
        });
    }
};

var disable_def_company = function(c_by){
    if(c_by == "superadmin"){
        return "class='btn btn-sm btn-danger btn-delete-company disabled'";
    }else{
        return "class='btn btn-sm btn-danger btn-delete-company'";
    }
};

/**
* Display Account List
*/
userList = null;
var account_list = function(url) {

var params = {
                email: store.getItem("email"),
                token: store.getItem("token"),
                role: store.getItem("role")
};
if(params.email!=null && params.token!=null){
        var service = load(url, JSON.stringify(params), "POST");
        service.success(function(output) {
                                if (output.status) {
                                        $("#account_list .data").html("");
                                        var HTML = "";
                                        userList = output.response;
                                        $(output.response)
                                                        .each(
                                                                        function(i, v) {
                                                                                HTML = "<tr><td>"
                                                                                                + v.firstname
                                                                                                + "</td>"
                                                                                                + "<td>"
                                                                                                + v.lastname
                                                                                                + "</td>"
                                                                                                + "<td>"
                                                                                                + v.email
                                                                                                + "</td>"
                                                                                                + "<td>"
                                                                                                + v.role
                                                                                                + "</td>"
                                                                                                + "<td>"
                                                                                                + get_companyNamesbyId(v.companyId,v.role)
                                                                                                + "</td>"
                                                                                                + "<td>"
                                                                                                + format_domains_list(v.domain)
                                                                                                + "</td>"
                                                                                                + "<td>"
                                                                                                + format_date(v.created_at)
                                                                                                + "</td>"
                                                                                                + "<td>"
                                                                                                + format_date(v.updated_at)
                                                                                                + "</td>"
                                                                                                + "<td><input type='button' class='btn btn-sm btn-primary btn-edit-user' value='Edit' data-row='"
                                                                                                + i
                                                                                                + "'></td><td><input type='button'"
                                                                                                +check_existingUser(v.email,v.role)
                                                                                                +"value='Delete' data-row='"
                                                                                                + i
                                                                                                + "'></td>"
                                                                                                + "</tr>";
                                                                                $("#account_list .data").append(HTML);
                                                                        });
                                        user_actions();
                                        pop_dList();
                                } else {
                                        showErrorMessages(output.response);
                                }
                        });
}
};

var format_domains_list = function(str){
    var f_str='';
    if(str == null || str == undefined || str == "" || str == "null" || str == "undefined"){
        f_str = '<span class="tdAlign">--</span>';
        return f_str;
    }else{
        if(str.indexOf(',')!=-1){
            var k_str = str.split(',');
            if(k_str.length<=3){
                f_str = str.replace(/,/g,', ');
                return f_str;
            }else{
                f_str = '<span class="btn btn-link dlist_pop" data-container="body" data-toggle="popover" data-content="'+str.replace(/,/g,', ')+'">Domains List</span>';
                return f_str;
            }
        }else{
            return str;
        }
    }
};

function pop_dList(){
    $('.dlist_pop').click(function(){
        $('.dlist_pop').popover('destroy');
        $(this).popover({
            animation : true,
            html : true,
            placement : "bottom",
            title : '<span><strong>Domains List</strong></span>'+
                    '<button type="button" id="close" class="close" '+
                    'onclick="$(&quot;.dlist_pop&quot;).popover(&quot;hide&quot;);">&times;</button>'
        });
    });
}

var get_companyNamesbyId = function(cmp_id,role){
    if(cmp_id){
        var companyList = JSON.parse(store.getItem("clist"));
        if(role=="reseller"){
            var c_arr,cn_arr=[];
            if(cmp_id){
            c_arr = cmp_id.split(','); 
            $.each(c_arr,function(i){
                if(companyList[c_arr[i]])
                cn_arr.push(companyList[c_arr[i]]); 
            });
            return valNone(cn_arr.join(','));
        }else{
            return valNone("");  
        }
        }else if(role=='revadmin'){
            return valNone("");
        }else{
            return valNone(companyList[cmp_id]);
        }
    }else{
            return valNone("");  
        }
};

var check_existingUser = function(u_email,u_role){
    if(u_email==store.getItem('email') || u_role=="revadmin"){
        return "class='btn btn-sm btn-danger btn-delete-user disabled'";
    }else{
        return "class='btn btn-sm btn-danger btn-delete-user'";
    }
};

/**
* Getting Domain list to select box
*/
var get_domain_list = function(url, cls, selected_domain) {
var params = {
                email: store.getItem("email"),
                token: store.getItem("token"),
                role: store.getItem("role")
};
var service = load(url, JSON.stringify(params) , "POST");
service.success(function(output) {
        if (output.status) {
                var HTML="";
                $(output.response).each(function(i, v) {
                        //LOG(v,selected_domain, selected_domain == v);
                        if(selected_domain!="" && selected_domain == v){
                                attr = "selected='selected'";
                        }else{
                                attr = "";
                        }
                        HTML+="<option "+attr+" value='" + v + "'>" + v + "</option>";

                });
                $(cls).html(HTML);
                $("#registration_form .domain_names").multiselect('destroy');

                $("#registration_form .domain_names").multiselect({
                                    buttonWidth: false,
                                    dropRight: true,
                                    numberDisplayed:1,
                                    maxHeight: 250,
                                    includeSelectAllOption: true,
                                    enableCaseInsensitiveFiltering: true
                });

                /*if(selected_domain==""){
                        get_domain_settings(output.response[0]);
                }*/
        } else {
                showErrorMessages(output.response);
        }
        $('#registration_form .ACL_config_Opt').addClass('hide');
});
};

/**
    * Getting Domain list to select box
    */
    var get_companydomain_list = function(url,opt, cls) {
// $(cls).multiselect('destroy');
    var params = {
                    email: store.getItem("email"),
                    token: store.getItem("token"),
                    companyId:opt,
                    role: store.getItem("role")
    };
    var service = load(url, JSON.stringify(params) , "POST");
    service.success(function(output) {
            if (output.status) {
                if(cls=="#edit-domain-select"){
                if(output.response.length<=0){
                    showErrorMessages("No Domains for this Company");
                }
                        $('.edit_domain_new').removeClass('hide'); 
                        jQuery("#edit_user_form .domain_names").multiselect('destroy');
                        $("#edit-domain-select ").prop('disabled',false);
                        jQuery("#edit_user_form .domain_names").multiselect();
                            var HTML ="";
                            jQuery("#edit_user_form .domain_names").html("");
                            jQuery(output.response).each(function(i,d){
                                if(opt!="" && opt == d){
                                    attr = "selected='selected'";
                                }else{
                                    attr = "";
                                }
                                HTML+="<option "+attr+" value='" + d + "'>" + d + "</option>";
                            });
                                jQuery("#edit_user_form .domain_names").multiselect('destroy');
                                jQuery("#edit_user_form .domain_names").html(HTML);
                                jQuery("#edit_user_form .domain_names").multiselect({
                                    buttonWidth: false,
                                    dropRight: true,
                                    numberDisplayed:1,
                                    maxHeight: 250,
                                    includeSelectAllOption: true,
                                    enableCaseInsensitiveFiltering: true
                                });

                }else{
                    var HTML="";
                    if(output.response.length<=0){
                        showErrorMessages("No Domains for this Company");
                        $('.domain_new').addClass('hide')
                    }else{
                        $('.domain_new').removeClass('hide')
                        $(output.response).each(function(i, v) {
                            HTML+="<option value='" + v + "'>" + v + "</option>";
                    });
                    $("#registration_form .domain_names").multiselect('destroy');
                    $('#domain-select').html(HTML);

                    $("#registration_form .domain_names").multiselect({
                                        buttonWidth: false,
                                        dropRight: true,
                                        numberDisplayed:1,
                                        maxHeight: 250,
                                        includeSelectAllOption: true,
                                        enableCaseInsensitiveFiltering: true

                    });
                    }
                }
            } else {
                    showErrorMessages(output.response);
            }
    });
    };

/**
    * Getting get_comapanys_list list to select box, for intializing the dropdown list in while creation
    * and also showing vallue while editing
    */
    var get_comapanys_list = function(url, cls,selectedval, curr_companyid) {
    var params = {
                    email: store.getItem("email"),
                    token: store.getItem("token"),
                    role: store.getItem("role")
    };

    if(selectedval){
        params.sel_role = selectedval;
    }
    if(curr_companyid){
        params.curr_companyId = curr_companyid;
    }
    var service = load(url, JSON.stringify(params) , "POST");
    service.success(function(output) {
            if (output.status) {
                $('.edit_compny_new').removeClass('hide');
                var HTML="";
                if(selectedval!="reseller"){
                    HTML+="<option value=''>select</option>";
                    }
                $(output.response).each(function(i, v) {
                    if(selectedval!="" && selectedval == v.id){
                        attr = "selected='selected'";
                    }else{
                        attr = "";
                    }
                        HTML+="<option "+attr+" value='" + v.id + "'>" + v.companyName + "</option>";
                });
                    if(selectedval=="reseller"){
                        $(cls).multiselect('destroy');
                        $(cls).html(HTML);
                        $(cls).multiselect({
                                            buttonWidth: false,
                                            dropRight: true,
                                            numberDisplayed:1,
                                            maxHeight: 250,
                                            onChange: function() {
                                                var opt = $('#company-select').val();
                                                $('.domain_new').removeClass('hide');
                                                $(cls).removeAttr('disabled');
                                                if(opt){
                                                    opt=opt.toString();
                                                    get_companydomain_list(settings.url("get_domain_names"),opt,cls)
                                            }else{
                                                $('.domain_new').addClass('hide');
                                            }
                                            }
                        });

                    }else{
                        $(cls).html(HTML);
                    }
            } else {
                    showErrorMessages(output.response);
            }
    });
    };


/**
* Displaying domain list
*/
domainList = null;
var domain_list = function(url) {
var params = {
                email: store.getItem("email"),
                token: store.getItem("token"),
                role: store.getItem("role")
};
var service = load(url, JSON.stringify(params), "POST");
service
                .success(function(output) {
                        if (output.status) {
                                var list = $("#domain_list .data");
                                list.html("");
                                var HTML = "";
                                domainList = output.response;
                                $(output.response)
                                                .each(
                                                                function(i, v) {
                                                                        HTML = "<tr><td>"
                                                                                        + v.name
                                                                                        + "</td>"
                                                                                        + "<td>"
                                                                                        + valNone(v.origin_domain)
                                                                                        + "</td>"
                                                                                        + "<td>"
                                                                                        + valNone(v.origin_server)
                                                                                        + "</td>"
                                                                                        /*+ "<td>"
                                                                                        + valNone(v.rum_beacon_url)
                                                                                        + "</td>"
                                                                                        + "<td>"
                                                                                        + valNone(v.cube_url)
                                                                                        + "</td>"*/
                                                                                        + "<td>"
                                                                                        + valNone(v.stats_url)
                                                                                        + "</td>"
                                                                                        + "<td class='word_wrap'>"
                                                                                        + valNone(v.config_url)
                                                                                        + "</td>"
                                                                                        + "<td class='word_wrap'>"
                                                                                        + valNone(v.co_cnames)
                                                                                        + "</td>"
                                                                                        + "<td>"
                                                                                        + v.tolerance
                                                                                        + "</td>"
                                                                                        + "<td>"
                                                                                        + syncSuccess(v.sync_status,v.sync_failed_ips)
                                                                                        + "</td>"
                                                                                        + "<td><input type='button' class='btn btn-sm btn-primary btn-edit-domain' value='Edit' data-row='"
                                                                                        + i
                                                                                        + "'></td>"
                                                                                        + "<td><input type='button' class='btn btn-sm btn-danger btn-delete-domain' value='Delete' data-row='"
                                                                                        + i + "'></td>" + "</tr>";
                                                                        list.append(HTML);
                                                                });
                                domain_actions();
                        } else {
                                showErrorMessages(output.response);
                        }
                });
};

/**
* UI actions to perform when account page loads
*/
var account_ui_interaction = function() {
account_list(settings.url("user_list"));

$('.account_list,.account_create,.btn-create-account').off("click");
$('.account_list,.account_create,.btn-create-account').on("click");

$('.account_list').click(function(e) {
        e.preventDefault();
        account_list(settings.url("user_list"));
});
$(".account_create").click(function(e) {
            e.preventDefault();
            $('.dlist_pop').popover('destroy');
            $('#edit_user_form .access_control_list').parent().addClass('hide');
            $('#registration_form .ACL_config_Opt').addClass('hide');
            $("#registration_form")[0].reset();
            //Start
            $('.domain_new,.cmpny_new').addClass('hide');
            $("#domain-select").multiselect();
            $("#registration_form #role-select").on('change',function(){
                var opt_val = $(this).val();
                $('#company-select').multiselect('destroy');
                $('.domain_new').addClass('hide');
                switch(opt_val){
                case 'reseller' :  $('#registration_form .access_control_list').parent().removeClass('hide');
                                    $('.cmpny_new').removeClass('hide');
                                    $('#company-select').attr('multiple','multiple');
                                        break;
                case 'admin'    :    
                case 'user'     :  $('#registration_form .access_control_list').parent().removeClass('hide');
                                    $('#company-select').removeAttr('multiple');
                                    $('.cmpny_new').removeClass('hide');
                                    break;
                case ''         : 
                case 'revadmin' :  $('#registration_form .access_control_list').parent().addClass('hide');
                                    $('.cmpny_new').addClass('hide');
                                    break;
                }
                get_comapanys_list(settings.url("company_list"), ".company_names",opt_val);
                if(opt_val!=="reseller"){
                    $('#company-select').on('change',function(){
                        var opt = $('#company-select').val();
                        if(opt){
                            opt=opt.toString();
                            get_companydomain_list(settings.url("get_domain_names"),opt,"#domain-select")
                    }else{
                            if(opt!="")
                            showErrorMessages("NO Domains for the selected company");
                            $('.domain_new').addClass('hide');

                    }
                    });
                }else{
                /* $('#company-select').multiselect({
                        onDropdownHide: function() {
                            var opt = $('#company-select').val();
                            $('.domain_new').removeClass('hide');
                            $(cls).removeAttr('disabled');
                            if(opt){
                                opt=opt.toString();
                                get_companydomain_list(settings.url("get_domain_names"),opt,cls)
                        }else{
                            $('.domain_new').addClass('hide');
                        }
                        }

                    });*/
                }
            });  
        bindConfigACL();
        setTimeout(function(){$('#registration_form input[name="firstname"]').focus();},350);
});

/*$('#registration_form input[name="firstname"],#registration_form input[name="lastname"]').blur(function(){
    //var pattern = /^[a-zA-Z ]*$/,
    var pattern = /^[a-z ,.'-]+$/i;
        inp_value = $(this).val(),
        inp_name = $(this).attr('name');
    if(pattern.test(inp_value)!==true){
        showErrorMessages(inp_name+" should contain only letters (a-z or A-Z) and special characters like dot [ . ], space [ &nbsp; ], hyphen [ - ], apostrophe [ ' ].","danger");
    }
});

$('#registration_form input[name="email"]').blur(function(){
    var pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        email_value = $(this).val();
    if(pattern.test(email_value)!==true){
        showErrorMessages("Please enter a valid email address.","danger"); 
    }
});

$('#registration_form input[name="confirm_password"]').blur(function(){
    var con_pswd_value = $(this).val(),
        pswd_value = $('#registration_form input[name="password"]').val();
    if(con_pswd_value!==pswd_value){
        showErrorMessages("Your password does not match with confirmation password.","danger"); 
    }
});*/

$(".btn-create-account").click(function(e) {
        e.preventDefault();
        create_account_action(e);
});
};

var company_actions = function(){
    $('.btn-edit-company,.btn-delete-company,.btn-update-company').off("click");
    $('.btn-edit-company,.btn-delete-company,.btn-update-company').on("click");

    $(".btn-edit-company").click(function(e){
        e.preventDefault();
        var selected_cmp = [],
            row = $(this).attr("data-row");
        selected_cmp = companyList[row];

        var service = load(settings.pages.edit_company,"", settings.get);
            service.success(function(output) {
                    $("#dialog").modal();
                    $(".modal-title").html("Edit Company");
                    $(".modal-body").html(output); 
                    $("#edit_company_form input.cmp_name").val(selected_cmp.companyName);
                    $(".btn-update-company").attr("data-row", row);
                    company_actions();
            });
    });

    $(".btn-update-company").click(function(){
        var params = $("#edit_company_form").serializeObject();
        var row = $(this).attr("data-row");
        if(params.cmp_name.trim()!=""){
            params.email = store.getItem("email");
            params.token = store.getItem("token");
            params.cmp_id = companyList[row].id;
            var service = load(settings.url("update_company"), JSON.stringify(params), settings.post);
                service.success(function(output){
                    if (output.status) {
                        $('#dialog').modal('hide');
                        showErrorMessages(output.response);
                        load_company_page();
                    } else {
                        showErrorMessages(output.response);
                    }
                });
        }else{
                showErrorMessages("Company Name should not be Empty");
        }
    });

    $(".btn-delete-company").click(function(e){
        e.preventDefault();
        var row = $(this).attr("data-row");
        var selected_cmp = companyList[row];

        $("#dialog").modal();                   
        $(".modal-title").html("Delete Company");
        $(".modal-body").html('<p class="font_med">Are you sure you want to delete <b>'+selected_cmp.companyName+'</b> from companies list? <br> Deleting the company will result in deletion of all users and domains associated to it.</p>');
        $('.modal-footer').css('display',"block");
        $('.modal-footer .btn-primary').addClass('del_cmp_btn');

        confirm_company_delete(selected_cmp.id);       
    });
}

var confirm_company_delete = function(cmp_del){
    $('.del_cmp_btn').off('click');
    $('.del_cmp_btn').on('click');

    $('.del_cmp_btn').click(function(){
        var params = {
            email : store.getItem("email"),
            cmp_id : cmp_del,
            token: store.getItem("token")
        };

        var service = load(settings.url("delete_company"), JSON.stringify(params), settings.post);
        service.success(function(output) {
            if (output.status) {  
                $("#dialog").modal('hide');
                showErrorMessages(output.response);
                load_company_page();
            } else {
                showErrorMessages(output.response);
            }
        });
    });

    $('#dialog').on('hidden.bs.modal', function(){
        $('.del_usr_btn').removeClass('del_cmp_btn');
        $('.modal-footer').css('display',"none");  
    });
};

var user_actions = function(){

$('.btn-edit-user,.btn-delete-user,.btn-update-account').off("click");
$('.btn-edit-user,.btn-delete-user,.btn-update-account').on("click");


$(".btn-edit-user").click(function(e){
        e.preventDefault();
        var selected_user = [];
        var row = $(this).attr("data-row");
        selected_user = userList[row];

            var params = {
                email: store.getItem("email"),
                token: store.getItem("token"),
                role:store.getItem("role"),
                sel_role:selected_user.role,
                                    sel_email:selected_user.email,
                curr_companyId:selected_user.companyId
        };

        var params_domains = {
                email: store.getItem("email"),
                token: store.getItem("token"),
                role:store.getItem("role"), 
                companyId:selected_user.companyId
        };
        $('.dlist_pop').popover('destroy');
        var service = load(settings.url("get_domain_names"), JSON.stringify(params_domains) , "POST");
        service.success(function(d_output) {
                if (d_output.status) {
                        domains = d_output.response;
                        var page_service = load(settings.pages.edit_user, "", settings.get);
                        page_service.success(function(output) {
                var companies=[];
                var company_service = load(settings.url("company_list"),JSON.stringify(params),"POST")
                company_service.success(function(compListoutput){
                    if (compListoutput.status) {
                        companies = compListoutput.response;
                    $("#dialog").modal();
                            $(".modal-title").html("Edit User");
                            $(".modal-body").html(output);
                            $(".btn-update-user").attr("data-row", row);
                        /*setting values on page load    */
                            $(".edit_user label.email").html(selected_user.email);
                            $(".edit_user input.firstname").val(selected_user.firstname);
                            $(".edit_user input.lastname").val(selected_user.lastname);
                            $(".edit_user .user_email").val(selected_user.email);

                            if(selected_user.email == store.getItem('email')){
                                        $(".edit_user #edit-role-select").val(selected_user.role);
                                        $(".edit_user #edit-role-select").prop('disabled',true);
                                    }else{
                                        $(".edit_user #edit-role-select").val(selected_user.role);
                                        $(".edit_user #edit-role-select").prop('disabled',false);
                                    }

                                    if(selected_user.role == "revadmin"){
                                        $('#edit_user_form .access_control_list').parent().addClass('hide');
                                    }else{
                                        $('#edit_user_form .access_control_list').parent().removeClass('hide');
                                    }


                            $(".btn-update-account").attr("data-row", row);

                            $('#edit-domain-select').removeAttr('disabled');
                                $('#edit-domain-select').prop('disabled',false);
                                jQuery(".edit_user .domain_names").html("");
                                var multi_dm="";
                                if(selected_user.companyId!="" && selected_user.companyId!=undefined && selected_user.companyId!=null){
                                    jQuery(domains).each(function(i,d){
                                        multi_dm+="<option value='"+d+"'>"+d+"</option>";
                                        });
                                }

                            if(selected_user.role=="revadmin"){
                                //console.log('cl')
                                jQuery(".edit_user .domain_names").html("");

                                jQuery("#edit_user_form .domain_names").html("");
                                jQuery("#edit_user_form .domain_names").attr("multiple","multiple");

                                jQuery("#edit_user_form .domain_names").multiselect('destroy');

                                jQuery("#edit_user_form .domain_names").multiselect({
                                    buttonWidth: false,
                                    dropRight: true,
                                    numberDisplayed:1,
                                    maxHeight: 250,
                                    includeSelectAllOption: true,
                                    enableCaseInsensitiveFiltering: true
                                });

                            }else{
                                jQuery("#edit_user_form .domain_names").html(multi_dm);
                                jQuery("#edit_user_form .domain_names").attr("multiple","multiple");

                                jQuery("#edit_user_form .domain_names").multiselect('destroy');

                                jQuery("#edit_user_form .domain_names").multiselect({
                                    buttonWidth: false,
                                    dropRight: true,
                                    numberDisplayed:1,
                                    maxHeight: 250,
                                    includeSelectAllOption: true,
                                    enableCaseInsensitiveFiltering: true
                                });
                                if(selected_user.domain!=""){
                                    var selArr=[];
                                    if(selected_user.domain){
                                        selArr = selected_user.domain.split(",");
                                        jQuery(selArr).each(function(i,val){
                                            jQuery("#edit_user_form .domain_names").multiselect('select', val);
                                        });
                                        var sel_len = selArr.length;
                                        var opt_len = $("#edit_user_form .domain_names").find('option').length
                                        if(sel_len == opt_len-1){
                                            jQuery("#edit_user_form .domain_names").multiselect('select', "multiselect-all");
                                        }
                                    }
                                }
                            }

                            if(selected_user.role=="reseller"){
                                        jQuery("#edit_user_form .edit-company_names").multiselect('destroy');
                                    jQuery(".edit-company_names").html("");
                                    var multi_cmpny="";
                                    jQuery(companies).each(function(i,d){
                                        multi_cmpny+="<option value='"+d.id+"'>"+d.companyName+"</option>";
                                    });

                                    jQuery("#edit_user_form .edit-company_names").html(multi_cmpny);
                                    jQuery("#edit_user_form .edit-company_names").attr("multiple","multiple");

                                    jQuery("#edit_user_form .edit-company_names").multiselect({
                                        buttonWidth: false,
                                        dropRight: true,
                                        numberDisplayed:1,
                                        maxHeight: 250
                                    });
                                    jQuery("#edit_user_form .edit-company_names").multiselect('clearSelection');
                                    if(selected_user.companyId!=""){
                                        var selArr=[];
                                        if(selected_user.companyId){
                                            selArr = selected_user.companyId.split(",");
                                            jQuery(selArr).each(function(i,val){
                                                jQuery("#edit_user_form .edit-company_names").multiselect('select', val);
                                            });
                                        }
                                    }
                            }else if(selected_user.role=="revadmin"){
                                jQuery(".edit-company_names").html("");
                                jQuery(".edit-company_names").removeAttr('multiple');
                                jQuery(".edit-company_names").multiselect('destroy');
                                jQuery("#edit_user_form .edit-company_names").html("<option value=''>select</option>");
                            $('#edit-company-select').prop('disabled',true);
                            $('#edit-domain-select').prop('disabled',true);
                            }

                            else{
                                // console.log("not reseller")
                                jQuery(".edit-company_names").removeAttr('multiple');
                                jQuery(".edit-company_names").multiselect('destroy');
                                    jQuery(".edit-company_names").html("");
                                    var cmpny="";
                                    jQuery(companies).each(function(i,d){
                                        cmpny+="<option value='"+d.id+"'>"+d.companyName+"</option>";
                                    });
                                    jQuery("#edit_user_form .edit-company_names").html(cmpny);
                                    jQuery("#edit_user_form .edit-company_names").val(selected_user.companyId)
                            }
                            if(typeof selected_user.access_control_list == "object" && selected_user.access_control_list !=null){
                                    $.each(selected_user.access_control_list, function( key, value ) {
                                        jQuery("#edit_user_form .access_control_list input[name='"+key+"']").prop('checked',value);

                                    });
                                    if(selected_user.access_control_list.configure){
                                        $('.ACL_config_Opt').removeClass('hide');
                                            if(selected_user.access_control_list.readOnly){
                                            $('#edit_user_form .ACL_config_Opt .read').prop("checked",true);
                                            $('#edit_user_form .ACL_config_Opt .write').prop("checked",false);
                                        }else{
                                            $('#edit_user_form .ACL_config_Opt .read').prop("checked",false);
                                            $('#edit_user_form .ACL_config_Opt .write').prop("checked",true);
                                        }   
                                    }else{
                                        $('#edit_user_form .ACL_config_Opt').addClass('hide');
                                    }
                                }
                                /*ON change actions START*/  
                            //$("#edit-domain-select").multiselect('destroy');
                            // $("#edit-domain-select").multiselect();
                            $("#edit-role-select").on('change',function(){
                                var opt_val = $(this).val();
                                $('#edit-company-select').multiselect('destroy');
                                switch(opt_val){
                                    case 'reseller' :  $('#edit_user_form .access_control_list').parent().removeClass('hide');
                                                            $('#edit-company-select').removeAttr('disabled');
                                                    $('#edit-company-select').attr('multiple','multiple');
                                                        break;
                                    case 'admin'    :    
                                    case 'user'     :   $('#edit_user_form .access_control_list').parent().removeClass('hide');
                                                        $('#edit-company-select').removeAttr('multiple');
                                                        $('#edit-company-select').multiselect('destroy');
                                                        $('#edit-company-select').removeAttr('disabled');
                                                        break;

                                    case 'revadmin' :  $('#edit_user_form .access_control_list').parent().addClass('hide');
                                                            $('#edit-company-select').removeAttr('multiple').multiselect('destroy').attr("disabled","disabled");
                                                        break;
                                    case ''         : $('#edit-company-select').removeAttr('multiple');
                                                $('#edit-company-select,#edit-domain-select').attr("disabled","disabled");
                                                        break;
                                }
                                $('#edit-company-select').multiselect('destroy');
                                if(selected_user.role!='reseller'){
                                    get_comapanys_list(settings.url("company_list"), "#edit-company-select",opt_val);
                                }else{
                                    get_comapanys_list(settings.url("company_list"), "#edit-company-select",opt_val, selected_user.companyId);
                                }
                                $("#edit-domain-select ").prop('disabled',false);
                                jQuery("#edit_user_form .domain_names").multiselect();
                                var HTML ="";
                                jQuery("#edit_user_form .domain_names").html("");
                                jQuery("#edit_user_form .domain_names").multiselect('destroy');
                                jQuery("#edit_user_form .domain_names").html(HTML);
                                jQuery("#edit_user_form .domain_names").multiselect({
                                    buttonWidth: false,
                                    dropRight: true,
                                    numberDisplayed:1,
                                    maxHeight: 250,
                                    includeSelectAllOption: true,
                                    enableCaseInsensitiveFiltering: true
                                });

                                if(opt_val=="reseller"){
                                    $('#edit-company-select').removeAttr('disabled');
                                    $('#edit-domain-select').prop('disabled',false);
                                    $('#edit-company-select').multiselect({
                                        onDropdownHide: function() {
                                        var opt = $('#edit-company-select').val();
                                        if(opt!=null||opt!=undefined){
                                                opt=opt.toString();
                                    get_companydomain_list(settings.url("get_domain_names"),opt,"#edit-domain-select");
                                        }else{
                                            showErrorMessages("NO Domains for the selected company");
                                        }
                                        }});
                                }else if(opt_val=="revadmin"){
                                    $('#edit-company-select').prop('disabled',true);
                                    $('#edit-domain-select').prop('disabled',true);
                                }else{
                                    $('#edit-company-select').removeAttr('disabled');
                                    $('#edit-domain-select').prop('disabled',false);
                                    $('#editcompany-select').removeAttr('multiple');
                                    $("#edit-company-select").on('change',function(){
                                        var opt = $('#edit-company-select').val();
                                        // console.log("opt 1",opt)
                                        if(opt){
                                                opt=opt.toString();
                                    get_companydomain_list(settings.url("get_domain_names"),opt,"#edit-domain-select");
                                        }else{
                                            $('.edit_domain_new').addClass('hide');
                                            showErrorMessages("NO Domains for the selected company");
                                        }
                                    });
                                }
                                });  
                                role_company_domain_change(selected_user.role);
                            //   });
                            user_actions();
                            bindConfigACL();

            }else{
                    showErrorMessages(output.response);
                    }
            });
        });


                } else {
                        showErrorMessages(d_output.response);
                }
        });
});

$(".btn-delete-user").click(function(e){
        e.preventDefault();
        var row = $(this).attr("data-row");
        var selected_user = userList[row];
        $('.dlist_pop').popover('destroy');
        $("#dialog").modal();                   
        $(".modal-title").html("Delete User");
        $(".modal-body").html('<p class="font_med">Are you sure you want to delete <b>'+selected_user.email+'</b> from users list?</p>');
        $('.modal-footer').css('display',"block");
        $('.modal-footer .btn-primary').addClass('del_usr_btn');

        confirm_user_delete(selected_user.email);       
});

$(".btn-update-account").click(function(){
    //e.preventDefault();
    var row = $(this).attr("data-row"),rt=false;

    if($(".edit_user #edit-role-select").prop('disabled')){
        $(".edit_user #edit-role-select").prop('disabled',false);
        rt = true;
    }        

    var params = $(".edit_user").serializeObject();

    if(params.domain && params.domain!=undefined && params.domain.indexOf('multiselect-all')!=-1){
            var index = params.domain.indexOf('multiselect-all');
            params.domain.splice(index,1);
    }

    if(rt){
        $(".edit_user #edit-role-select").prop('disabled',true);  
    }

    //var pattern = /^[a-zA-Z0-9]*$/;
    var pattern = /^[a-z ,.'-]+$/i;
    params.access_control_list = getACL('#edit_user_form');
    if(params.firstname.trim()!="" && pattern.test(params.firstname)==true){
        if(params.lastname.trim()!="" && pattern.test(params.lastname)==true){
            if(params.role){
                if(params.role == "revadmin" || params.role == "reseller"){
                    update_account_action_validation(params,row);
                }else{
                    if(params.companys && params.companys.length>0){
                        //console.log("params.companys",params.companys)
                        if(params.domain && params.domain.length>0){
                            update_account_action_validation(params,row);
                        }else{
                            showErrorMessages("Please select a domain.");
                        }
                    }else{
                        showErrorMessages("Please select a Company.");
                    }
                }
            }else{
                showErrorMessages("Please select role."); 
            }
        }else{
            if(pattern.test(params.lastname)==false){
                showErrorMessages("Last name should only have letters and special characters like dot [ . ], space [ &nbsp; ], hyphen [ - ], apostrophe [ ' ].");
            }else{
                showErrorMessages("Please enter Last name.");
            }
        } 
    }else{
        if(pattern.test(params.firstname)==false){
            showErrorMessages("First name should only have letters and special characters like dot [ . ], space [ &nbsp; ], hyphen [ - ], apostrophe [ ' ].");
        }else{
            showErrorMessages("Please enter First name.");
        }
    }
});
};

var update_account_action_validation = function(params,row){
params.email = store.getItem("email");
params.user_email = userList[row].email;
params.token = store.getItem("token");
if(params.companys==undefined){
    params.companys = "";   
}
//console.log("update_account_action_validation",params.companys)
var service = load(settings.url("update_user"), JSON.stringify(params), settings.post);
service.success(function(output) {
    if (output.status) {
            $('#dialog').modal('hide');
            $('#edit_user_form .ACL_config_Opt').addClass('hide');
            showErrorMessages(output.response);
            load_account_page();
    } else {
            showErrorMessages(output.response);
    }
});
}

var confirm_user_delete = function(usr_del){

$('.del_usr_btn').off('click');
$('.del_usr_btn').on('click');

$('.del_usr_btn').click(function(){
var params = {
        email : store.getItem("email"),
        user_email : usr_del,
        token: store.getItem("token")
};

var service = load(settings.url("delete_user"), JSON.stringify(params), settings.post);
service.success(function(output) {
        if (output.status) {  
            $("#dialog").modal('hide');
            showErrorMessages(output.response);
            load_account_page();
        } else {
                showErrorMessages(output.response);
        }
});
});

$('#dialog').on('hidden.bs.modal', function(){
$('.del_usr_btn').removeClass('del_usr_btn');
$('.modal-footer').css('display',"none");  
});
};

var role_company_domain_change = function(cmpnyval){
        if(cmpnyval=="reseller"){
            $('#edit-company-select').multiselect('destroy');
            $('#edit-company-select').multiselect({
                    buttonWidth: false,
                    dropRight: true,
                    numberDisplayed:1,
                    maxHeight: 250,
                    onChange: function() {
                    var opt = $('#edit-company-select').val();
                    $("#edit-domain-select").removeAttr('disabled');
                    if(opt){
                            opt=opt.toString();
                        get_companydomain_list(settings.url("get_domain_names"),opt,"#edit-domain-select");
                    }else{
                        $("#edit-domain-select ").prop('disabled',false);
                        jQuery("#edit_user_form .domain_names").multiselect();
                        var HTML ="";
                        jQuery("#edit_user_form .domain_names").html("");
                        jQuery("#edit_user_form .domain_names").multiselect('destroy');
                        jQuery("#edit_user_form .domain_names").html(HTML);
                        jQuery("#edit_user_form .domain_names").multiselect({
                            buttonWidth: false,
                            dropRight: true,
                            numberDisplayed:1,
                            maxHeight: 250,
                            includeSelectAllOption: true,
                            enableCaseInsensitiveFiltering: true
                        });

                    }
                    }});
        }else{
                    $("#edit-company-select").on('change',function(){
            var opt = $('#edit-company-select').val();
            if(opt){
                opt=opt.toString();
                get_companydomain_list(settings.url("get_domain_names"),opt,"#edit-domain-select");
            }else{
                $("#edit-domain-select ").prop('disabled',false);
                jQuery("#edit_user_form .domain_names").multiselect();
                var HTML ="";
                jQuery("#edit_user_form .domain_names").html("");
                jQuery("#edit_user_form .domain_names").multiselect('destroy');
                jQuery("#edit_user_form .domain_names").html(HTML);
                jQuery("#edit_user_form .domain_names").multiselect({
                    buttonWidth: false,
                    dropRight: true,
                    numberDisplayed:1,
                    maxHeight: 250,
                    includeSelectAllOption: true,
                    enableCaseInsensitiveFiltering: true
                });
            }
        });
            }
};

/**
* Domain Create
*/
var domain_create = function() {
var formData = '',st = false,ct = false,co=false;
    if($("#domain_registration_form .stats_url").prop('disabled')){
        $("#domain_registration_form .stats_url").prop('disabled',false);
        st = true;
    }

    if($("#domain_registration_form .config_url").prop('disabled')){
        $("#domain_registration_form .config_url").prop('disabled',false);
        ct = true;
    }

            if($("#domain_registration_form .co_cnames").prop('disabled')){
        $("#domain_registration_form .co_cnames").prop('disabled',false);
        co = true;
    }

    formData = $("#domain_registration_form").serializeObject();
    var regex = /^http([s]?):\/\/.*/;

    var config_cmd = formData.cnfCmd1.trim()+" "+formData.cnfCmd2.trim()+" "+formData.cnfCmd3.trim();
    formData.config_command_options = (formData.cnfCmd4.trim()!="" && formData.cnfCmd4.trim()!=undefined)?config_cmd+" "+formData.cnfCmd4.trim():config_cmd;
    delete formData.cnfCmd1;
    delete formData.cnfCmd2;
    delete formData.cnfCmd3;
    delete formData.cnfCmd4;

    if(st){
        $("#domain_registration_form .stats_url").prop('disabled',true); 
    }

    if(ct){
        $("#domain_registration_form .config_url").prop('disabled',true); 
    }

    if(co){
        $("#domain_registration_form .co_cnames").prop('disabled',true); 
    }

if(formData.name.trim()!="" && !(regex.test(formData.name))){
        if(formData.origin_domain.trim()!=""){
            if(formData.companyId.trim()!=""){
                if(formData.rum_beacon_url.trim()!=""){
                    if(formData.cube_url.trim()!=""){
                        if(formData.tolerance.trim()!=""){
                            if(formData.stats_url.trim()!="" || formData.config_url.trim()!=""){
                                $('.d_conf_info').css('display','block');
                            }
                            formData.token = store.getItem("token");
                            formData.email = store.getItem("email");
                            var find = '\r\n';
                            var re = new RegExp(find, 'g');
                            formData.co_apache_custom_config = formData.co_apache_custom_config.replace(re, '\n');
                            formData.bp_apache_custom_config = formData.bp_apache_custom_config.replace(re, '\n');
                            formData.bp_apache_fe_custom_config = formData.bp_apache_fe_custom_config.replace(re, '\n');
                            formData.BPGroup = formData.stats_url_type;
                            formData.COGroup = formData.config_url_type;
                            var service = load(settings.url("create_domain"), JSON.stringify(formData), settings.post);
                            service.success(function(output) {
                                $('.d_conf_info').css('display','none');
                                // // console.log("getting service response---->",JSON.stringify(output));
                                    if (output.status) {
                                            clearInputs();
                                            $(".domain_list").tab("show");
                                            showErrorMessages(output.response);
                                            domain_ui_interaction();
                                    } else {
                                            showErrorMessages(output.response);
                                    }
                            });

                            service.fail(function(xhr,erreq){
                                if(erreq == "timeout"){
                                    $('.d_conf_info').css('display','none');
                                    showErrorMessages("Unable to connect with Policy Controller. Will retry later.");
                                    domain_ui_interaction();
                                }
                            });
                        }else{
                            showErrorMessages("Please enter threshold in milliseconds.");
                        }
                    }else{
                        showErrorMessages("Please enter Evaluator URL.");
                    }
                }else{
                    showErrorMessages("Please enter RUM Beacon URL."); 
                }
        }else{
            showErrorMessages("Please Select Company"); 
        }
        }else{
        showErrorMessages("Please enter Origin Domain."); 
        }
}else{
    if((regex.test(formData.name))){
            showErrorMessages("Domain name should not contain protocol.");
    }

    if(formData.name.trim()==""){
            showErrorMessages("Please enter Domain Name.");   
    }
}
};

/**
* Load Main Page
*/
var load_main_page = function() {
    var service = load(settings.pages.main, "", settings.get);
    service.success(function(response) {    
            $("#main").html(response);
            $('.carousel').carousel();
    });
    };

    /**
    * Load login page
    */
    var load_login_page = function() {
    var service = load(settings.pages.login, "", settings.get);
    service.success(function(response) {
            $(".login_box").html(response);
            $("#login_email").focus();
            login_action();
            forgot_password_dialog();
    });
};

/**
* Load menus
*/
var load_menus = function() {
LOG("LOAD MENUS");
var service = load(settings.pages.menus, "", settings.get);
service.success(function(response) {
        $("#menus").html(response);
        show_page_hide_all(location.hash, function() {
                switchPage(location.hash);
        });
});
};

var load_settings_page = function() {
var service = load(settings.pages.settings, "", settings.get);
service.success(function(response) {
        $("#settings").html("").html(response).show();
        settings_action();
        get_domain_list(settings.url("get_domain_names"),".settings_domain_list","");
});
};

/**
* UI actions to perform when login page loads
*/
var login_action = function() {
$('#login_password,#login_email').on('keyup',function(e){
    if (e.which == 13) {
        login_validate();
    }
});

$(".signin").click(function(e){
        e.preventDefault();
        login_validate();
});
};


var login_validate = function() {
if(store.getItem("email")==null){
        var params = $(".login_form").serializeObject();
        if(params.email=="" || params.password==""){
                showErrorMessages("Email & Password should not be blank!");
                return true;
        }
        var email = params.email;
        params.user_type="revadmin";
        params = JSON.stringify(params);
        var service = load(settings.url("login"), params, settings.post);
        service.success(function(output) {
                if (output.status) {
                        if (output.response.is_admin && output.response.role=="revadmin") {
                                store.setItem("is_admin", output.response.is_admin);
                                store.setItem("is_logged_in", true);
                                store.setItem("email", email);
                                store.setItem("token",output.response.token);
                                store.setItem("role",output.response.role);
                                store.setItem("def_rum_url",output.response.rum_url);
                                store.setItem("def_evaluator_url",output.response.evalutor_url);
                                ui_for_logged_user();
                                javascript_session = setInterval(check_user_session_exists,5000);
                        } else {
                                showErrorMessages("Please send valid email and password.");
                        }
                } else {
                        showErrorMessages(output.response);
                }
        });
}else{
        showErrorMessages("Please logout "+store.getItem("email")+" and login with new user");
}
};

/**
* UI actions to perform when domain page loads
*/
var domain_ui_interaction = function() {
domain_list(settings.url("domain_list"));

$('.domain_list,.domain_create,.btn-create-domain').off("click");
$('.domain_list,.domain_create,.btn-create-domain').on("click");

$('.domain_list').click(function(e) {
        e.preventDefault();
        domain_list(settings.url("domain_list"));
});
$('.domain_create').click(function(e) {
                    $("#domain_registration_form #cnamedisp").hide();
        $("#domain_registration_form")[0].reset();
        get_comapanys_list(settings.url("company_list"), ".domain-company_names");
        get_servergroup_names("#domain_registration_form","add","");
        setTimeout(function(){$('#domain_registration_form input[name="name"]').focus();},350);
                    $("#domain_registration_form .domain_name").on('change',function(){
                var dname = $(this).val();
                                if(dname!=''){
                                            $("#domain_registration_form #cnameVal").html(dname+".revdn.net");
                                            $("#domain_registration_form #cnamedisp").show();
                                }else{
                                        $("#domain_registration_form #cnamedisp").hide();
                                }
            });
            $("#domain_registration_form .config_url_type").on('change',function(){
                                    if($(this).val()=="Manual"){
                            $("#domain_registration_form .co_cnames").prop('disabled',false).val("");
                    }else{
                                                    var coDNSName=$('#domain_registration_form .config_url_type option[value="'+$(this).val()+'"]').attr('data-cnames');
                                                    if(coDNSName!="" && coDNSName!="undefined" && coDNSName!="null"){
                                                            $("#domain_registration_form .co_cnames").prop('disabled',false).val(coDNSName).prop('disabled',true);
                                                    }else{
                                                            $("#domain_registration_form .co_cnames").prop('disabled',false).val("");	
                                                    }
                                    }
                                    });
        $("#domain_registration_form .stats_url_type").on('change',function(){
            if($(this).val()=="Manual"){
                $("#domain_registration_form .stats_url").prop('disabled',false).val("");
            }else{
                var bp_set_val = $('#domain_registration_form .stats_url_type option[value="'+$(this).val()+'"]').attr('data-servers');
                $("#domain_registration_form .stats_url").prop('disabled',false).val(bp_set_val).prop('disabled',true);
            }
        });

        $("#domain_registration_form .config_url_type").on('change',function(){
            if($(this).val()=="Manual"){
                $("#domain_registration_form .config_url").prop('disabled',false).val("");
            }else{
                var co_set_val = $('#domain_registration_form .config_url_type option[value="'+$(this).val()+'"]').attr('data-servers');
                $("#domain_registration_form .config_url").prop('disabled',false).val(co_set_val).prop('disabled',true);
            }
        }); 

        $('#domain_registration_form .rum_beacon_url').val(settings.default_rum_url);
        $('#domain_registration_form .cube_url').val(settings.default_evalutor_url);
});

$(".btn-create-domain").click(function(e) {
        e.preventDefault();
        domain_create();
});
$(".tip").tooltip({
        trigger : "focus"
});

$('.url_valid').on('keydown',function(e){
    if(e.which == 32 || e.which == 58){
        e.preventDefault();
    }
});
};

var get_servergroup_names = function(cls,act,domObj){
    var params = {
        email: store.getItem("email"),
        token: store.getItem("token"),
        type: "group"
    };

    var service = load(settings.url("s_group_list"), JSON.stringify(params), "POST");
    service.success(function(output){
        if(output.status){
            var groupList = output.response;
            var bphtml = "",cohtml = "",bp=0,co=0;

            $.each(groupList,function(i){
                if(groupList[i].groupType == "BP"){
                    bphtml+= '<option value="'+groupList[i].groupName+'" data-servers="'+groupList[i].servers+'">'+groupList[i].groupName+'</option>'; 
                    bp++
                }else{
                    cohtml+= '<option value="'+groupList[i].groupName+'" data-servers="'+groupList[i].servers+'" data-cnames="'+groupList[i].co_cnames+'">'+groupList[i].groupName+'</option>';
                    co++;
                }
            });

            if(bp>0){
                $(cls+" .stats_url_type").html('<option value="Manual">Manual</option>'+bphtml);
                if(act=="add"){
                    $(cls+" .stats_url").prop('disabled',false);
                }else{
                    //console.log("BPGROUP",domObj.BPGroup);
                    if(domObj.BPGroup!="" && domObj.BPGroup!="Manual") { 
                    //console.log("IN IF LOOP");
                    $(cls+" .stats_url_type").val(domObj.BPGroup);
                    $(cls+" .stats_url").val(domObj.stats_url);	 
                        $(cls+" .stats_url").prop('disabled',true);
                    } else {
                            $(cls+" .stats_url").prop('disabled',false);
                            $(cls+" .stats_url").val(domObj.stats_url);
                    } 
                }
            }else{
                $(cls+" .stats_url_type").html('<option value="Manual">Manual</option>');
                $(cls+" .stats_url").prop('disabled',false);
                    $(cls+" .stats_url").val(domObj.stats_url);
            }

            if(co>0){
                $(cls+" .config_url_type").html('<option value="Manual">Manual</option>'+cohtml);
                if(act=="add"){
                    $(cls+" .config_url").prop('disabled',false);
                                            $(cls+" .co_cnames").prop('disabled',false);
                }else{
                    //console.log("CO GRP",domObj.COGroup);
                                            if(domObj.COGroup!="" && domObj.COGroup!="Manual") {
                                                    $(cls+" .config_url_type").val(domObj.COGroup);
                                                    $(cls+" .config_url").val(domObj.config_url);
                                                    $(cls+" .config_url").prop('disabled',true);
                                                    $(cls+" .co_cnames").val(domObj.co_cnames);
                                                    $(cls+" .co_cnames").prop('disabled',true);
                    } else {
                                                    $(cls+" .config_url").prop('disabled',false);
                                                    $(cls+" .config_url").val(domObj.config_url);
                                                    $(cls+" .co_cnames").val(domObj.co_cnames);
                                                    $(cls+" .co_cnames").prop('disabled',false);
                    }

                }

            }else{
                $(cls+" .config_url_type").html('<option value="Manual">Manual</option>');
                $(cls+" .config_url").prop('disabled',false);
            $(cls+" .config_url").val(domObj.config_url);
            }

        }else{
            showErrorMessages(output.response); 
        }
    });
};

var domain_actions = function() {
$('.btn-edit-domain,.btn-update-domain,.btn-delete-domain').off("click");
$('.btn-edit-domain,.btn-update-domain,.btn-delete-domain').on("click");
$(".btn-edit-domain").click(function(e){
        e.preventDefault();
        var row = $(this).attr("data-row");
        var selected_domain = domainList[row];
        var params = {
                email: store.getItem("email"),
                token: store.getItem("token"),
                role: store.getItem("role")
                    };
        var service = load(settings.url("company_list"), JSON.stringify(params) , "POST");
        service.success(function(output) {
                if (output.status) {
                    //// console.log(output.response);
                        companys = output.response;

                        var service = load(settings.pages.edit_domain, "", settings.get);
                        service.success(function(output) {
                                $("#dialog").modal();
                                $(".modal-title").html("Edit Domain");
                                $(".modal-body").html(output);
                                get_servergroup_names("#edit_domain_form","edit",selected_domain);
                                $(".edit_domain .btn-update-domain").attr("data-row", row);
                                $('#dialog').on('shown.bs.modal', function(e) {
                                var HTML ="";
                                jQuery(".edit_domain #edit-domain-company").html("");
                                jQuery(companys).each(function(i,d){
                                    HTML+="<option value='"+d.id+"'>"+d.companyName+"</option>";
                                });

                                jQuery(".edit_domain #edit-domain-company").html(HTML);
                                $(".edit_domain #edit-domain-company").val(selected_domain.companyId);
                                    $('.edit_domain #edit-domain-company').attr('disabled', true);
                                $(".edit_domain .domain_name").val(selected_domain.name);
                                $(".edit_domain .origin_domain").val(selected_domain.origin_domain);
                                $(".edit_domain .origin_server").val(selected_domain.origin_server);
                                // $(".edit_domain .webpagetest_url").val(selected_domain.webpagetest_url);
                                $(".edit_domain .rum_beacon_url").val(selected_domain.rum_beacon_url);
                                $(".edit_domain .cube_url").val(selected_domain.cube_url);
                                /**  if($(".edit_domain .stats_url_type option[value='"+selected_domain.BPGroup+"']").length>0){
                                    $(".edit_domain .stats_url_type").val(selected_domain.BPGroup);
                                    $(".edit_domain .stats_url").val(selected_domain.stats_url);
                                    $(".edit_domain .stats_url").prop('disabled',true);
                                }else{
                                    $(".edit_domain .stats_url_type").val(selected_domain.BPGroup);
                                    $(".edit_domain .stats_url").val(selected_domain.stats_url);
                                    $(".edit_domain .stats_url").prop('disabled',false);
                                }

                                if($(".edit_domain .config_url_type option[value='"+selected_domain.COGroup+"']").length>0){
                                    $(".edit_domain .config_url_type").val(selected_domain.COGroup);
                                    $(".edit_domain .config_url").val(selected_domain.config_url);
                                    $(".edit_domain .config_url").prop('disabled',true);
                                }else{
                                    $(".edit_domain .config_url_type").val(selected_domain.COGroup);
                                    $(".edit_domain .config_url").val(selected_domain.config_url);
                                    $(".edit_domain .config_url").prop('disabled',false);
                                }*/

                                $(".edit_domain .config_command_options").val(selected_domain.config_command_options);
                                if(selected_domain.config_command_options!==null){
                                var confComand = selected_domain.config_command_options.split(" ");
                                $(".edit_domain .cnfCmd1").val(confComand[0]!=undefined?confComand[0]:"");
                                $(".edit_domain .cnfCmd2").val(confComand[1]!=undefined?confComand[1]:"");
                                $(".edit_domain .cnfCmd3").val(confComand[2]!=undefined?confComand[2]:"");

                                if(confComand.length<4){
                                    $(".edit_domain .cnfCmd4").val(""); 
                                }else if(confComand.length==4){
                                    $(".edit_domain .cnfCmd4").val(confComand[3]); 
                                }else if(confComand.length>4){
                                    var config_commands = "";
                                    for(var k=3;k<confComand.length;k++){
                                        config_commands+=confComand[k]+" ";
                                    }
                                    $(".edit_domain .cnfCmd4").val(config_commands);
                                }
                                }
                                $(".edit_domain .bp_apache_custom_config").val(selected_domain.bp_apache_custom_config);
                                $(".edit_domain .bp_apache_fe_custom_config").val(selected_domain.bp_apache_fe_custom_config);
                                $(".edit_domain .co_apache_custom_config").val(selected_domain.co_apache_custom_config);
                                $(".edit_domain .tolerance").val(selected_domain.tolerance);
                                                                    //$(".edit_domain .co_cnames").prop('disabled',false).val(selected_domain.co_cnames).prop('disabled',true);

                                    $(".edit_domain .config_url_type").on('change',function(){
                                                                            if($(this).val()=="Manual"){
                                        $(".edit_domain .co_cnames").prop('disabled',false).val(selected_domain.co_cnames);
                                    }else{
                                                                                    var coDNSName=$('.edit_domain .config_url_type option[value="'+$(this).val()+'"]').attr('data-cnames');
                                                                                    if(coDNSName!="" && coDNSName!="undefined" && coDNSName!="null"){
                                                                                            $(".edit_domain .co_cnames").prop('disabled',false).val(coDNSName).prop('disabled',true);
                                                                                    }else{
                                                                                            $(".edit_domain .co_cnames").prop('disabled',false).val("");	
                                                                                    }
                                                                            }
                                                                    });
                                $(".edit_domain .stats_url_type").on('change',function(){
                                    if($(this).val()=="Manual"){
                                        $(".edit_domain .stats_url").prop('disabled',false).val(selected_domain.stats_url);
                                    }else{
                                            var bp_set_val = $('.edit_domain .stats_url_type option[value="'+$(this).val()+'"]').attr('data-servers'); 
                                            $(".edit_domain .stats_url").prop('disabled',false).val(bp_set_val).prop('disabled',true);
                                    }
                                });

                                $(".edit_domain .config_url_type").on('change',function(){
                                    if($(this).val()=="Manual"){
                                        $(".edit_domain .config_url").prop('disabled',false).val(selected_domain.config_url);
                                    }else{
                                        var co_set_val = $('.edit_domain .config_url_type option[value="'+$(this).val()+'"]').attr('data-servers');

                                            $(".edit_domain .config_url").prop('disabled',false).val(co_set_val).prop('disabled',true);
                                    }
                                });
                            });
                            $('#dialog').on('shown.bs.modal', function(e) {
                                        $(".tip").tooltip({
                                                trigger : "focus"
                                        });
                                        domain_actions();
                                });
                        });
                }else{
                    showErrorMessages(output.response);
                }
        });
});

$(".btn-update-domain").click(function(e) {
    e.preventDefault();
    var row = $(this).attr("data-row"),st=false,ct=false,cmp = false,co=false;

    if($(".edit_domain .stats_url").prop('disabled')){
        $(".edit_domain .stats_url").prop('disabled',false);
        st = true;
    }

    if($(".edit_domain .config_url").prop('disabled')){
        $(".edit_domain .config_url").prop('disabled',false);
        ct = true;
    }
            if($(".edit_domain .co_cnames").prop('disabled')){
        $(".edit_domain .co_cnames").prop('disabled',false);
        co = true;
    }

    if($(".edit_domain #edit-domain-company").prop('disabled')){
        $(".edit_domain #edit-domain-company").prop('disabled',false);
        cmp = true;
    };
    //LOG("UPDATE DOMAIN");
    var params = $(".edit_domain").serializeObject();
    //// console.log('params:::::::::::::',params);
    var config_cmd = params.cnfCmd1.trim()+" "+params.cnfCmd2.trim()+" "+params.cnfCmd3.trim();

    params.config_command_options = (params.cnfCmd4.trim()!="" && params.cnfCmd4.trim()!=undefined)?config_cmd+" "+params.cnfCmd4.trim():config_cmd;
    delete params.cnfCmd1;
    delete params.cnfCmd2;
    delete params.cnfCmd3;
    delete params.cnfCmd4;

    if(st){
        $(".edit_domain .stats_url").prop('disabled',true); 
    }

    if(ct){
        $(".edit_domain .config_url").prop('disabled',true); 
    }

                if(co){
        $(".edit_domain .co_cnames").prop('disabled',true); 
    }

    if(cmp){
        $(".edit_domain #edit-domain-company").prop('disabled',true); 
    }

    if(params.origin_domain.trim()!=""){
                    if(params.rum_beacon_url.trim()!=""){
                    if(params.cube_url.trim()!=""){
                        if(params.tolerance.trim()!=""){
                            if(params.stats_url.trim()!="" || params.config_url.trim()!=""){
                                $('.d_conf_info').css('display','block');
                            }
                            params.email = store.getItem("email");
                            params.name = domainList[row].name;
                            params.token = store.getItem("token");

                            var find = '\r\n';
                            var re = new RegExp(find, 'g');
                            params.co_apache_custom_config = params.co_apache_custom_config.replace(re, '\n');
                            params.bp_apache_custom_config = params.bp_apache_custom_config.replace(re, '\n');
                            params.bp_apache_fe_custom_config = params.bp_apache_fe_custom_config.replace(re, '\n');
                            params.BPGroup = params.stats_url_type;
                            params.COGroup = params.config_url_type;
                            //params.co_apache_custom_config = params.co_apache_custom_config.replace("\r\n","\n");
                            //params.bp_apache_custom_config = params.bp_apache_custom_config.replace("\r\n","\n");
                            var service = load(settings.url("update_domain"), JSON .stringify(params), settings.post);
                            service.success(function(output) {
                                $('.d_conf_info').css('display','none');
                                    if (output.status) {
                                        $('#dialog').modal('hide');
                                        showErrorMessages(output.response);
                                        load_domains_page();
                                    }else{
                                        showErrorMessages(output.response);
                                    }
                            });
                            service.fail(function(xhr,erreq){
                                if(erreq == "timeout"){
                                    $('.d_conf_info').css('display','none');
                                    $('#dialog').modal('hide');
                                    showErrorMessages("Unable to connect with Policy Controller. Will retry later.");
                                    load_domains_page();
                                }
                            }); 
                        }else{
                            showErrorMessages("Please enter threshold in milliseconds.");
                        }  
                    }else{
                        showErrorMessages("Please enter Evaluator URL.");
                    }
                }else{
                    showErrorMessages("Please enter RUM Beacon URL."); 
                }

    }else{
        showErrorMessages("Please enter Origin Domain."); 
    }
});

$(".btn-delete-domain").click(function(e) {
        e.preventDefault();
        var row = $(this).attr("data-row");
        var selected_domain = domainList[row];

        $("#dialog").modal();                   
        $(".modal-title").html("Delete Domain");
        $(".modal-body").html('<p class="font_med">Are you sure you want to delete <b>'+selected_domain.name+'</b> from domains list?</p>');
        $('.modal-footer').css('display',"block");
        $('.modal-footer .btn-primary').addClass('del_dom_btn');

        confirm_domain_delete(selected_domain.name);
});
};

var confirm_domain_delete = function(del_domain){
$('.del_dom_btn').off('click');
$('.del_dom_btn').on('click');

$('.del_dom_btn').click(function(){
$('.d_conf_info').css('display','block');
var params = {
                email : store.getItem("email"),
                name : del_domain,
                token : store.getItem("token")
        };
        //// console.log("params before call---->",params);
        var service = load(settings.url("delete_domain"), JSON.stringify(params), settings.post);
        service.success(function(output) {
            $('.d_conf_info').css('display','none');
            //// console.log("responce after deleting--->",output);
                if (output.status) { 
                    $("#dialog").modal('hide'); 
                    showErrorMessages(output.response);
                    load_domains_page();
                } else {
                        showErrorMessages(output.response);
                }
        });

        service.fail(function(xhr,erreq){
            if(erreq == "timeout"){
                $('.d_conf_info').css('display','none');
                $('#dialog').modal('hide');
                showErrorMessages("Unable to connect with Policy Controller. Will retry later.");
                load_domains_page();
            }
        });
});

$('#dialog').on('hidden.bs.modal', function(){
$('.del_dom_btn').removeClass('del_dom_btn');
$('.modal-footer').css('display',"none"); 
});
};

/**
* UI actions to perform when account creation
*/
var create_account_action = function(e) {
//var pattern = /^[a-zA-Z0-9]*$/;
var pattern = /^[a-z ,.'-]+$/i;
//var password_pattern =  /^[a-zA-Z0-9 ~!$%^@#(){}_+<>?,.'-]+$/i;
var password_pattern = /^[a-zA-Z0-9~!$%^@]+$/i;

var accountParams = $("#registration_form").serializeObject();
accountParams.access_control_list = getACL('#account_create');
if(accountParams.domain && accountParams.domain!=undefined && accountParams.domain.indexOf('multiselect-all')!=-1){
            var index = accountParams.domain.indexOf('multiselect-all');
            accountParams.domain.splice(index,1);
    }    
if(accountParams.firstname.trim()!="" && pattern.test(accountParams.firstname)==true){
    if(accountParams.lastname.trim()!="" && pattern.test(accountParams.lastname)==true){
        if(accountParams.password.trim()!="" && password_pattern.test(accountParams.password)==true){
            if(accountParams.role){
            if(accountParams.role == "revadmin" || accountParams.role == "reseller"){
                create_account_action_validation(accountParams);
            }else{
                if(accountParams.companys && accountParams.companys.length>0){
                    if(accountParams.domain && accountParams.domain.length>0){
                        create_account_action_validation(accountParams);
                    }else{
                        showErrorMessages("Please select a domain.");
                    }
                }else{
                    showErrorMessages("Please select a Company.");
                }
            }
            }else{
                showErrorMessages("Please select role."); 
            }
        } else {
            if(password_pattern.test(accountParams.password)==false){
                showErrorMessages("password should only have letters,numbers and Special characters allowed are ~ ! @ # $ % ^ & * () {} _ - + = | ; < > , . ?.");
            }else{
                showErrorMessages("Please enter password");
            }
        }
    }else{
        if(pattern.test(accountParams.lastname)==false){
            showErrorMessages("Last name should only have letters and special characters like dot [ . ], space [ &nbsp; ], hyphen [ - ], apostrophe [ ' ].");
        }else{
            showErrorMessages("Please enter Last name.");
        }
    }
}else{
    if(pattern.test(accountParams.firstname)==false){
        showErrorMessages("First name should only have letters and special characters like dot [ . ], space [ &nbsp; ], hyphen [ - ], apostrophe [ ' ].");
    }else{
        showErrorMessages("Please enter First name.");
    }
}
};

var create_account_action_validation = function(accountParams){
if(accountParams.email.trim()!=""){
    if(accountParams.password.trim()!=""){
        if(accountParams.confirm_password.trim()!=""){
            var params = {
                data:  accountParams,
                email: store.getItem("email"),
                token: store.getItem("token")
            };
            var create_user_url = settings.url("create_user");
            var service = load(create_user_url, JSON.stringify(params),settings.post);
            service.success(function(output) {
                    if (!output.status) {
                            showErrorMessages(output.response);
                    } else {
                            showErrorMessages(output.response);
                            clearInputs();
                            $(".account_list").tab("show");
                            account_ui_interaction();
                    }
            });
        }else{
            showErrorMessages("Please confirm password.");
        }
    }else{
        showErrorMessages("Please enter password.");
    } 
}else{
    showErrorMessages("Please enter email.");
}
};

/**
* UI actions to perform when logout
*/
var user_logout_action = function() {
$(".logout").click(function(e) {
        e.preventDefault();
        $("#dialog").modal();                   
        $(".modal-title").html("Logout");
        $(".modal-body").html('<p class="font_med">Are you sure you want to logout?</p>');
        $('.modal-footer').css('display',"block");
        $('.modal-footer .btn-primary').addClass('logout_yes');

        confirm_logout();
});
};

var confirm_logout = function(){
$('.logout_yes').click(function(){        
var params = {
            email: store.getItem("email"),
            token: store.getItem("token")
        };

var service = load(settings.url("user_logout"), JSON.stringify(params),
                settings.post);
service.success(function(output) {
        if (output.status) {
                $("#dialog").modal('hide');
                clearInterval(javascript_session);
                showErrorMessages(output.response);
                store.setItem("is_admin", false);
                store.setItem("is_logged_in", false);
                store.setItem("token", "");
                store.clear();
                ui_for_logout_user();
        } else {
                showErrorMessages(output.response);
        }
});
});

$('#dialog').on('hidden.bs.modal', function(){
    $('.logout_yes').removeClass('logout_yes');
    $('.modal-footer').css('display',"none");  
});
};

/**
* UI sections to display when user logged in
*/
var ui_for_logged_user = function() {
$(".login_box").html("<div class='pull-right'><a href='#' id='logout' class='logout'>Logout</a></div><div class='clearfix'></div>");
$("#main").html("");
settings.default_rum_url = store.getItem("def_rum_url");
settings.default_evalutor_url = store.getItem("def_evaluator_url");
load_menus();
user_logout_action();
};

/**
* UI sections not to display when user logout
*/
var ui_for_logout_user = function() {
window.location.href = "";
load_login_page();
$("#menus").html("");
load_main_page();
$(".page").hide();
};

/**
* Date Format
*/
var format_date = function(d) {
var date = new Date(d);
var options = {
        weekday : "long",
        year : "numeric",
        month : "short",
        day : "numeric",
        hour : "2-digit",
        minute : "2-digit"
};
return date.toLocaleDateString("en-US", options);
};

var settings_action = function() {
$(".btn-user-settings").click(function(e) {
        e.preventDefault();
        var formData = $(".user_settings").serializeObject();
        formData.token = store.getItem("token");
        formData.email = store.getItem("email");
        var service = load(settings.url("set_domain_settings"),JSON.stringify(formData),settings.post);
        service.success(function(output) {
                LOG(output);
                if(output.status){
                        LOG(output.response);
                }
                showErrorMessages(output.response);
        });
});
/*$(".settings_domain_list").change(function(){
        $("input:radio").removeAttr("checked");
        get_domain_settings($(this).val());
});*/
};

var company_ui_interaction = function() {
    company_list(settings.url("company_list"));

    $('.company_list,.company_create,.btn-create-company').off("click");
    $('.company_list,.company_create,.btn-create-company').on("click");

    $('.company_list').click(function(e) {
            e.preventDefault();
            company_list(settings.url("company_list"));
    });

    $(".company_create").click(function(e) {
            e.preventDefault();
            $("#cmp_registration_form")[0].reset();
    });

    $(".btn-create-company").click(function(e) {
            e.preventDefault();
            var formData = $('#cmp_registration_form').serializeObject();
                formData.email = store.getItem('email');
                formData.token = store.getItem('token');
                formData.role = store.getItem('role');
            if(formData.cmp_name!=""){
                var service = load(settings.url("create_company"), JSON.stringify(formData), settings.post);
                    service.success(function(output){
                        if(!output.status){
                            showErrorMessages(output.response);
                        }else{
                            showErrorMessages(output.response);
                            clearInputs();
                            $(".company_list").tab("show");
                            company_ui_interaction();  
                        }
                    });
            }else{
                showErrorMessages("Please enter Company name.");
            }
    });
};

var load_company_page = function() {
    var service = load(settings.pages.companies, "", settings.get);
    service.success(function(response) {
            $("#companies").html(response);
            $('.tab-content').css('height',function(){
                var scr_h = $(window).height();
                var head_h = $('header').height();
                var foot_h = $('footer').height();
                return scr_h - (2*head_h + foot_h - 10)+'px';
            });
            company_ui_interaction();
    });
};

var load_account_page = function() {
    var service = load(settings.pages.accounts, "", settings.get);
    service.success(function(response) {
            $("#users").html(response);
            $('.tab-content').css('height',function(){
                var scr_h = $(window).height();
                var head_h = $('header').height();
                var foot_h = $('footer').height();
                return scr_h - (2*head_h + foot_h - 10)+'px';
            });
            account_ui_interaction();
    });
};

var load_domains_page = function() {
    var service = load(settings.pages.domains, "", settings.get);
    service.success(function(response) {
            $("#domains").html(response);
            $('.tab-content').css('height',function(){
                var scr_h = $(window).height();
                var head_h = $('header').height();
                var foot_h = $('footer').height();
                return scr_h - (2*head_h + foot_h - 10)+'px';
            });
            domain_ui_interaction();
    });
};

var editor = null;
var get_domain_settings = function(domain_name){
var params = {
        email:store.getItem("email"),
        domain: domain_name,
        token: store.getItem("token")
};
var service = load(settings.url("get_domain_settings"),JSON.stringify(params), settings.post);
service.success(function(output) {
        if(output.status){
                Object.keys(output.response).forEach(function(key){
                        if(typeof output.response[key]=="boolean"){
                                var select_input = $(".user_settings input[name='"+key+"'][value='"+output.response[key]+"']");
                                select_input.trigger("click");
                        }
                });
        }else{
                showErrorMessages(output.response);
        }
});
};

var load_purge_page =function(){
        var service = load(settings.pages.purge, "", settings.get);
        service.success(function(response) {
                $("#purge").html(response);
                $('.tab-content').css('height',function(){
                    var scr_h = $(window).height();
                    var head_h = $('header').height();
                    var foot_h = $('footer').height();
                    return scr_h - (head_h + foot_h - 10)+'px';
                });
                purge_ui_interaction();
        });
}
var edior = null;
var setEditor = function(idSel,json){
    var container = document.getElementById(idSel);
    var options = {
        mode: 'code',
        modes: ['code','view'], // allowed modes['code', 'form', 'text', 'tree', 'view']
        error: function (err) {
            alert(err.toString());
        }
    };
        $('#'+idSel).html("");
        editor = null;
        editor = new JSONEditor(container,options,json);
    $('.btn-validateJson').off("click");
    $('.btn-validateJson').on("click");

        $('.btn-validateJson').click(function(){
        if(validateJson()){
                $('.errJson').html('<span style="color:green;">Valid JSON</span>').show();
        }
        });
}
var purge_ui_interaction = function(){
        get_domain_BP_list(settings.url("get_domain_bp_list"), ".purge_domains");
        $('.btn-purge').off("click");
        $('.btn-purge').on("click");
        var samplePurge = {
                            "version": 1,
                            "purges": [
                                {
                                    "url": {
                                        "is_wildcard": true,
                                        "expression": "/images/*.png"
                                    }
                                }
                            ]
                        };


        setEditor("purgeJsonEditor",samplePurge);
        $('.btn-purge').click(function(){
            if(validateJson()){
            $('.errJson').hide();
            $("#dialog").modal();
            $(".modal-title").html("Purge");
            $(".modal-body").html('<p class="font_med">This will purge the cached objects as specified in the JSON. Are you sure?</p>');
            $('.modal-footer').css('display',"block");
            $('.modal-footer .btn-primary').addClass('purge_yes');
            confirm_purge();
                /*
                    var len = $( "#purge input:checked" ).length;
                    //$('.modal-footer .btn-primary').attr('class','btn btn-primary purge_yes');
                    if(len>0){
                    //confirm dialog
                    }else{
                    showErrorMessages("Select at least one Protocol (http or https)");
                    }
                */
            }
        });

        $('.purge_domains').off("change");
        $('.purge_domains').on("change");

        $('.purge_domains').change(function(){
            if($(this).val()!=""){
            $('.btn-validateJson,.btn-purge').removeClass('disabled');
            }else{
            $('.btn-validateJson,.btn-purge').addClass('disabled'); 
            }
            $('.errJson').css('display','none');
        });
    }

// Getting Domain&BP URL  list to select box in purge page
var get_domain_BP_list = function(url, cls, selected_domain) {

    var params = {
                    email: store.getItem("email"),
                    token: store.getItem("token")
    };
    var service = load(url, JSON.stringify(params) , "POST");
    service.success(function(output) {
            //// console.log('domain list',output);
            if (output.status) {
                    var HTML="<option value=''>-- Select Domain --</option>";
                    $(output.response).each(function(i, v) {
                            if(selected_domain!="" && selected_domain == v.domainName){
                                    attr = "selected='selected'";
                            }else{
                                    attr = "";
                            }
                            var val = v.domainName+"||"+v.bpUrl.join(',')
                            HTML+="<option "+attr+" value='" +val+"'>" + v.domainName + "</option>";
                    });
                    $(cls).html(HTML);
                    $(cls).multiselect('destroy');
                    $('.btn-validateJson,.btn-purge').addClass('disabled');
            } else {
                    showErrorMessages(output.response);
            }

    });
};

//validate purge Cache Json 
var validateJson = function(){
    try {
        var result = jsonlint.parse(JSON.stringify(editor.get()));
        if(typeof(result) == "object"){
            //$('.cacheJson').val(JSON.stringify(result, null, "  "))
            if (result)  return true;
        }else{
            //invalid JSON
            //showErrorMessages("Parse error Expecting '{', '['");
            $('.errJson').html("<pre>Parse error Expecting '{', '['</pre>").show();
        return false;
        }   

    } catch(e) { 
            //error parsing JSON
            $('.errJson').html('<pre>'+e+'</pre>').show();
        //showErrorMessages('<pre>'+e+'</pre>');
        return false;
    }
};
//confirm_purge JSON
var confirm_purge = function(){
    $('.purge_yes,.del_usr_btn,.del_dom_btn,logout_yes').off('click');
    $('.purge_yes').on('click')
    $('.purge_yes').click(function(e){ 
        e.stopPropagation();
        e.preventDefault();
        var params = {};
        $('#dialog').modal('hide');
        var dominVal = $('#purge .purge_domains').val();
        var domainName =null;; 
        if(dominVal != undefined && dominVal != null){
            domainName = dominVal.split("||")[0]
            params.stats_url = dominVal.split("||")[1]
        } 

        params.email =  store.getItem("email");
        params.token = store.getItem("token");
        var  isValidFormat = false;
        var inputJson = {};
        var urlList = new Array();
        var userJson =  editor.get()//JSON.parse($('.cacheJson').val());

        if(userJson.version != undefined && userJson.version !=""){
            inputJson.version = userJson.version;
                if(userJson.purges!=undefined) {
                    $.each( userJson.purges, function( k, val ) {
                    if(val.url.expression != undefined && val.url.is_wildcard != undefined){
                        if(val.url.is_wildcard == true || val.url.is_wildcard == false){
                            /*for http & https protocols
                            $("input:checked").each(function(i,ele){
                                var obj ={} 
                                //// console.log($(ele).attr('value'));
                                obj.is_wildcard = userJson.purges[0].url.is_wildcard; 
                                obj.expression = $(ele).attr('value')+params.dominName+val.url.value;
                                var urlObj = {"url":obj}
                                urlList.push(urlObj);
                                isValidFormat =true
                            });*/
                            var obj ={} ;
                            obj.is_wildcard = userJson.purges[0].url.is_wildcard; 
                            obj.expression = val.url.expression;
                            obj.domain  = domainName;
                            var urlObj = {"url":obj}
                            urlList.push(urlObj);
                            isValidFormat =true
                        }else{
                            showErrorMessages("'is_wildcard' should be boolean value");
                            isValidFormat = false;
                            return false;
                        }
                    }else{
                        showErrorMessages("invalid JSON format");
                        isValidFormat = false;
                        return false;
                    }
                });
                if(isValidFormat){
                    $('.d_conf_info').css('display','block');
                    inputJson.purges = urlList;
                    params.inputJson = inputJson;
                    // console.log("params",params);
                    //made server call
                    var service = load(settings.url("purge"), JSON.stringify(params) , "POST");
                    service.success(function(output) {
                        $('.d_conf_info').css('display','none');
                        showErrorMessages(output.response);
                    });
                }
            }else{
                showErrorMessages("'Purge' is missing in JSON");
                isValidFormat = false;
                return false;
            }
        }else{
            showErrorMessages("'version' is missing in JSON");
        }
        return false;
    });
        $('#dialog').on('hidden.bs.modal', function(){
        $('.purge_yes').removeClass('logout_yes');
        $('.modal-footer').css('display',"none");  
    });
}

var load_domain_editor_page =function(){
    var service = load(settings.pages.domainEditor, "", settings.get);
        service.success(function(response) {
                $("#domainEditor").html(response);
                $('.tab-content').css('height',function(){
                    var scr_h = $(window).height();
                    var head_h = $('header').height();
                    var foot_h = $('footer').height();
                    return scr_h - (head_h + foot_h - 10)+'px';
                });
                domainEditor_ui_interaction();
        });   
}
var domainEditor_ui_interaction = function(){
    //// console.log("domain editor ui interaction");
    //get_domain_BP_list(settings.url("get_domain_bp_list"), ".domainsList");
    getdomainList(settings.url("get_domain_names"),".domainsList");
    $(".domainsList").off('change')
    $(".domainsList").on('change')
    $(".domainsList").change(function(){
        if($(this).val()!=""){
            setDmoainJson($(this).val());
        }else{
            $('#domainJsonEditor').html("");
            $('.btn-validateJson,.btn-saveDomainJson').addClass('hide');
        }
        $('#domain_editor_form .errJson').css("display","none");
    });

    $(".btn-saveDomainJson").off('click');
    $(".btn-saveDomainJson").on('click');

    $(".btn-saveDomainJson").click(function(e){
        if(validateJson()){
            $('#domain_editor_form .errJson').css("display","none");
            $('.d_conf_info').css('display','block');
            var params = {
                    "domainName": $('.domainsList').val(),
                    email: store.getItem("email"),
                    actType: "domJson",
                    token: store.getItem("token")
                }; 
                var config = editor.get();
                params.configurationJson = config;
                var service = load(settings.url("update_config"), JSON.stringify(params), settings.post);
                service.success(function(output) { 
                        $('.d_conf_info').css('display','none');
                        if(output.status){
                        if(output.response.response == "Configuration updated successfully"){
                            showErrorMessages("Configuration successfully queued.");   
                        }else{
                            showErrorMessages(output.response.response);
                        }

                    }else{
                        if(output.response.isDomainExist==false){
                            showErrorMessages('This domain has been deleted');
                            }else{
                            showErrorMessages(output.response);  
                        }
                    }
                });                 
        }else{
            return false
        }
    });

};
var getdomainList = function(url,cls,selected_domain) {
    var params = {
                    email: store.getItem("email"),
                    token: store.getItem("token")
    };
    params.companyId = "";
    var service = load(url, JSON.stringify(params), "POST");
    service.success(function(output) {
        // console.log("get out put",output)
        if (output.status) {
            var HTML="<option value=''>-- Select Domain --</option>";
            $(output.response).each(function(i, v) {
                    if(selected_domain!="" && selected_domain == v){
                            attr = "selected='selected'";
                    }else{
                            attr = "";
                    }
                    HTML+="<option "+attr+" value='" + v + "'>" + v + "</option>";

            });
            $(cls).html(HTML);
            $('.editor_loader').hide();
            //setDmoainJson($(cls).val());
        }else{
                showErrorMessages(output.response);
        }
    });
};
var setDmoainJson = function(domainName){
    var params = {
            email: store.getItem("email"),
            token: store.getItem("token"),
            domainName:domainName
    };
    var service = load(settings.url("get_masterConfig_domain"), JSON.stringify(params), "POST");
    service.success(function(output) {
        if (output.status) {
        $(".btn-saveDomainJson,.btn-validateJson").removeClass('hide');
            $('.editor_loader').hide();
                var json  = output.response;
        //      $(".cacheJson").remove("<div class='editor_loader' style='display:none'>@nbsp</div>");
                //delete json.domainName ;
                //delete json.configurationJson.domain_name ;
                setEditor("domainJsonEditor",json);
        }else{
                showErrorMessages(output.response);
        }
    });
}
var validate = {
    domainJson:function(){
        var json = editor.get();
        if(validate.rev_component_co(json)){
            return true;
            /*if(validate.rev_traffic_mgr(json)){
                if(validate.cache(json)){
                    if(validate.security(json)){
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
            }else{
                return false;
            }*/
        }else{
            return false;
        }
    },
    rev_component_co:function(json){
        if(validate.checkKey(json,'rev_component_co',"domain Json")){
            return true;
        }else{
            return false;
        }
    },
    rev_traffic_mgr:function(json){
        if(validate.checkKey(json,'rev_traffic_mgr',"domain Json")){
            return true;
        }else{
            return false;
        }
    },
    rev_component_bp:function(json){
        if(validate.checkKey(json,'rev_component_bp',"domain Json")){
            return true;
        }else{
            return false;
        }
    },
    security:function(json){
        if(validate.checkKey(json,'content',"domain Json")){
            return true;
        }else{
            return false;
        }
    },
    checkBoolean:function(val){
        if(typeof val == "boolean"){
            return true;
        }else{
            showErrorMessages(val+" should be boolean (true/false)");
            return false;
        }
    },
    checkKey :function(obj,key,objName){
        if(typeof obj == "object" && obj.hasOwnProperty(key)){
            return true;
        }else{
            showErrorMessages(key+"should be there in "+objName+" object")
            return false;
        }
    },
    checkEmpty :function(str){
        if(typeof str == "strring" && str && str.trim() != ""){
            return true;
        }else{
            showErrorMessages(str+"should not empty")
            return false;
        }
    },
    checkNum :function(num){
        if(typeof num == "number"){
            return true;
        }else{
            showErrorMessages(str+"should not empty")
            return false;
        }
    },
    checkArray :function(arr,key){
        if(typeof arr == "object" && $.isArray(arr)){
            return true;
        }else{
            showErrorMessages(str+"should not empty")
            return false;
        }
    },
    checkArrEleType :function(arr,typeVal,key){
        var status = true;
        $.each(arr, function(index, val) {
            if(typeof val != typeVal){
                showErrorMessages(key +" array should contain all "+typeVal+" type values")
                return false;
            }
        });
        return status;
    },
    checkValInArr:function(val,arr,key){
        if(arr.indexOf(val) >= 0){
            return true;
        }else{
            showErrorMessages("enter valid value for "+key)
            return false;
        }
    }
};
var getACL = function(parentSel){
var obj = {};
$(parentSel+" .access_control_list input[type=checkbox]").each(function(i,ele){
    obj[$(ele).attr('name')] = $(ele).prop('checked'); 

});

if($(parentSel+" .access_control_list input[name=configure]").prop("checked")){
    obj.readOnly = $(parentSel+" .access_control_list .read").prop("checked");
}else{
    obj.readOnly = false;
} 
return obj;
};
var getActiveACL = function(obj){
    // console.log("obj",obj);
    if(typeof obj == "object" && obj != null){
    var strArr = [];
        $.each( obj, function( key, value ) {
        if(value) strArr.push(key) 
        });
        return strArr.join(",");
    }else{
        return "dashBoard";
    }
}
var bindConfigACL = function(){
    $(".access_control_list input[name=configure]").off("change");
    $(".access_control_list input[name=configure]").change(function(){
        if($(this).prop("checked")){
            $('.ACL_config_Opt').removeClass('hide');
            $(".access_control_list .write").prop("checked",true);
        }else{
            $('.ACL_config_Opt').addClass('hide');
            $(".access_control_list .read").prop("checked",true);
        }
    });
}

/****************server groups*************/

var load_sgroups_page = function() {
var service = load(settings.pages.sgroups, "", settings.get);
service.success(function(response) {
        $("#serverGroups").html(response);
        $('.tab-content').css('height',function(){
            var scr_h = $(window).height();
            var head_h = $('header').height();
            var foot_h = $('footer').height();
            return scr_h - (2*head_h + foot_h - 10)+'px';
        });
        sg_ui_interaction();
});
};

var sg_ui_interaction = function() {
sgroups_list(settings.url("s_group_list"));

$('.sg_list,.sg_create,.btn-create-sgroup').off("click");
$('.sg_list,.sg_create,.btn-create-sgroup').on("click");

$('.sg_list').click(function(e) {
        e.preventDefault();
        sgroups_list(settings.url("s_group_list"));
});

$(".sg_create").click(function(e){
    $("#sg_registration_form")[0].reset();
            $("#sg_registration_form #coServerGrp").hide();
            var selectedBox='';
                                        $("#sg_registration_form .form-chk").click(function() {
                                            selectedBox = this.id;
                                            if(selectedBox=="serverPublic"){
                                                    $(".pubName").show();	
                                            }else{
                                                    $(".pubName").hide();	
                                            }
                                            $(".form-chk").each(function() {
                                                    if ( this.id == selectedBox )
                                                    {
                                                            this.checked = true;
                                                    }
                                                    else
                                                    {
                                                            this.checked = false;
                                                    };        
                                            });
                                    });   

                                /*$("#sg_registration_form .co_cnames").on('keyup',function(){
                                                                                                                    FindDuplicateCoNames();		  
                                                                                                                                                        });*/
                $("#sg_registration_form #type-select").on('change',function(){
                                                    if($(this).val()=="CO"){
                                                                $("#sg_registration_form #coServerGrp").show();
                                                    }else{
                                                            $("#sg_registration_form #coServerGrp").hide();
                                                    }
                                    });
});

$(".btn-create-sgroup").click(function(e){
    var params = $('#sg_registration_form').serializeObject();
            var cName=1, pName=1;
            //if(params.serverType=="public" && params.publicName!=''){
    if(params.groupName!=""){
        if(params.groupType!=""){
            if(params.servers!=""){
                                    if(FindDuplicateCoNames(params.servers)==0){
                                    if(params.groupType=="CO"){
                                            if(params.co_cnames==""){
                                                    cName=0;	
                                            }
                                    }
                                    if(params.serverType=="public"){
                                            if(params.publicName==""){
                                                    pName=0;	
                                            }
                                    }
                                                    if(params.groupName.toLowerCase()=="manual") {
                                                            showErrorMessages("Group name can not be defined as 'Manual'");
                                                    } else {
                                                            if(cName==1){
                                                                    if(FindDuplicateCoNames(params.co_cnames)==0){
                                                                    if(pName==1){
                                                            if(params.serverType=="private"){
                                                                    params.publicName=params.groupName;
                                                            }
                                                            params.email = store.getItem('email');
                                                            params.token = store.getItem('token');
                                                            var service = load(settings.url("s_group_add"),JSON.stringify(params),settings.post);
                                                            service.success(function(output){
                                                                    if(output.status){
                                                                            clearInputs();
                                                                            $(".sg_list").tab("show");
                                                                            showErrorMessages(output.response);
                                                                            sg_ui_interaction();
                                                                    }else{
                                                                            showErrorMessages(output.response);
                                                                    }
                                                            });
                                                            }else{
                                                            showErrorMessages("Please enter Public Group name.");
                                                        }
                                                        }else{
                                                            showErrorMessages("Please enter unique values for CO DNS Names.");
                                                        }
                                        }else{
                showErrorMessages("Please enter CO DNS names.");
                                        }
                                                    }
                                    }else{
                                                            showErrorMessages("Please enter unique values for servers.");
                                    }		
            }else{
                showErrorMessages("Please enter servers.");
            }
        }else{
            showErrorMessages("Please select group type."); 
        }
    }else{
        showErrorMessages("Please enter group name."); 
    }
});

};
sg_list = null;
var sgroups_list = function(url){
var params = {
        email: store.getItem("email"),
        token: store.getItem("token")
    };

    if(params.email!=null && params.token!=null){
        var service = load(url, JSON.stringify(params), "POST");
        service.success(function(output){
            if(output.status){
                $("#sgroups_list .data").html("");
                var sg_html = "";
                sg_list = output.response;
                $(output.response).each(function(i,v){
                    sg_html = "<tr><td>"
                            + v.groupName
                            + "</td>"
                            +"<td>"
                            + v.groupType
                            + "</td>"
                            +"<td>"
                            + v.servers
                            + "</td>"
                            + "<td>"
                            + format_date(v.created_at)
                            + "</td>"
                            + "<td>"
                            + format_date(v.updated_at)
                            + "</td>"
                            + "<td><input type='button' class='btn btn-sm btn-primary btn-edit-sgroup' value='Edit' data-row='"
                            + i
                            + "'></td>"
                            + "</tr>";
                    $("#sgroups_list .data").append(sg_html);
                });
                sgroups_actions();
            }else{
                    showErrorMessages(output.response);
            }
        });
    }
};

var sgroups_actions = function(){
$('.btn-edit-sgroup,.btn-update-sgroup').off("click");
$('.btn-edit-sgroup,.btn-update-sgroup').on("click");

$(".btn-edit-sgroup").click(function(e){
    e.preventDefault();
    var selected_sg = [],
        row = $(this).attr("data-row");
    selected_sg = sg_list[row];

    var service = load(settings.pages.edit_sgroups,"", settings.get);
        service.success(function(output) {
                $("#dialog").modal();
                $(".modal-title").html("Edit Server Group");
                $(".modal-body").html(output); 
                $("#edit_sgroup_form label.groupName").html(selected_sg.groupName);
                $("#edit_sgroup_form #edit-type-select").val(selected_sg.groupType);
                                    if(selected_sg.groupType=="CO"){
                                                $("#edit_sgroup_form #coServerGrp").show();
                                                    }else{
                                                            $("#edit_sgroup_form #coServerGrp").hide();
                                    }
                                    if(selected_sg.serverType=="public"){
                                                $("#edit_sgroup_form .pubName").show();
                                                    }else{
                                                            $("#edit_sgroup_form .pubName").hide();
                                    }
                $("#edit_sgroup_form input.servers").val(selected_sg.servers);
                                    $("#edit_sgroup_form input.co_cnames").val(selected_sg.co_cnames);
                                    $("#edit_sgroup_form input.publicName").val(selected_sg.publicName);

                                    if(selected_sg.serverType=="public"){
                                            $("#edit_sgroup_form input.serverTypePublic").attr("checked",true);
                                    }else if(selected_sg.serverType=="private"){
                                            $("#edit_sgroup_form input.serverTypePrivate").attr("checked",true);
                                    }
                $(".btn-update-sgroup").attr("data-row", row);
                $("#edit_sgroup_form #edit-type-select").prop('disabled',true);
                                    var selectedBox='';
                                        $("#edit_sgroup_form .form-chk").click(function() {
                                            selectedBox = this.id;
                                            if(selectedBox=="serverPublic"){
                                                    $(".pubName").show();	
                                            }else{
                                                    $(".pubName").hide();	
                                            }
                                            $(".form-chk").each(function() {
                                                    if ( this.id == selectedBox )
                                                    {
                                                            this.checked = true;
                                                    }
                                                    else
                                                    {
                                                            this.checked = false;
                                                    };        
                                            });
                                    });   
                sgroups_actions();
        });

                        $("#edit_sgroup_form #type-select").on('change',function(){
                                    if($(this).val()=="CO"){
                                                $("#edit_sgroup_form #coServerGrp").show();
                                    }else{
                                            $("#edit_sgroup_form #coServerGrp").hide();
                                    }
                    });
});

$(".btn-update-sgroup").click(function(){
    var params = $("#edit_sgroup_form").serializeObject();
    var row = $(this).attr("data-row");
            var pName=1,cName=1;
    if(params.servers.trim()!=""){
        var ser_arr = params.servers.split(',');
        var new_ser_arr = ser_arr.filter( function( item, index, inputArray ) {
                return inputArray.indexOf(item) == index;
        });

        if(new_ser_arr.length == ser_arr.length){
                            if(sg_list[row].groupType=="CO"){
                                            if(params.co_cnames==""){
                                                    cName=0;	
                                            }
                                    }
                            if(params.serverType=="public"){
                                            if(params.publicName==""){
                                                    pName=0;	
                                            }
                                    }
                            if(cName==1){
                                            if(FindDuplicateCoNames(params.co_cnames)==0){
                            if(pName==1){
            params.email = store.getItem("email");
            params.token = store.getItem("token");
            params.groupName = sg_list[row].groupName;
            params.groupType = sg_list[row].groupType;
                            if(params.serverType=="private"){
                                        params.publicName = sg_list[row].groupName;
                            }
            params.servers = new_ser_arr.join(',');
            var service = load(settings.url("s_group_update"), JSON.stringify(params), settings.post);
                service.success(function(output){
                    if (output.status) {
                        $('#dialog').modal('hide');
                        showErrorMessages(output.response);
                        load_sgroups_page();
                    } else {
                        showErrorMessages(output.response);
                    }
                });
                            }else{
                                    showErrorMessages("Please enter Public Group name.");
                                }
                                }else{
                                            showErrorMessages("Please enter unique values for CO DNS Names.");
                                        }
                            }else{
                showErrorMessages("Please enter CO DNS names.");
                                        }
        }else{
            showErrorMessages("Servers should not have duplicate values.");
        }
    }else{
            showErrorMessages("Servers should not be Empty");
    }

});
};

Array.prototype.unique = function () {
    var res=0;
var r = new Array();
o:for(var i = 0, n = this.length; i < n; i++)
{
    for(var x = 0, y = r.length; x < y; x++)
    {
            if(r[x]==this[i])
            {
            res=1;
                            //showErrorMessages("Please enter unique values for CO DNS Names");
                    continue o;
            }
    }
    r[r.length] = this[i];
}
return res;
}

function getDistinctArray(arr) {
var compareArray = new Array();
    var duplicateArray = new Array();
    var res=0;
if (arr.length > 0) {
    for (i = 0;i < arr.length;i++) {
                    arr[i] = arr[i].trim();
        if (compareArray.indexOf(arr[i]) == -1) {
            compareArray.push(arr[i]);
        }else{
                            duplicateArray.push(arr[i]);
                    }
    }
}
return duplicateArray.length;
}
function FindDuplicateCoNames(current) {
            var arr = current.split(",");
            var arr_sort = arr.sort();
    var unique = getDistinctArray(arr_sort);
            if(unique>0){
                    return 1;	
            }else return 0;
}
