/*
 db/schema.js contains database schema description for application models
 by default (when using jugglingdb as ORM) this file uses database connection
 described in config/database.json. But it's possible to use another database
 connections and multiple different schemas, docs available at

 http://railwayjs.com/orm.html

 Example of model definition:

 define('User', function () {
     property('email', String, { index: true });
     property('password', String);
     property('activated', Boolean, {default: false});
 });

 Example of schema configured without config/database.json (heroku redistogo addon):
 schema('redis', {url: process.env.REDISTOGO_URL}, function () {
     // model definitions here
 });

*/

/*var Person = define('Person', function () {
    property('email', { index: true });
    property('active', Boolean, { default: true });
    property('createdAt', Date);
});

var Book = define('Book', function () {
    property('title');
    property('ISBN');
});*/

/**
 * Creating the user domain class 
 */
var User = describe('User', function () {
    property('firstname', String);
    property('lastname', String);
    property('email', String);
    property('companyId', String);
    property('access_control_list', Object);
    property('password', String);
    property('domain', String);
    property('role', {"type":"string", "default" :"user"});
    property('status',Boolean, {"default" :true});
    property('token', String);
    property('theme', {"type":"string", "default" :"light"});
    property('created_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    property('updated_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    //set('restPath', pathTo.users);
});


var Domain = describe('Domain', function () {
    property('webpagetest_url', String);
    property('companyId', String);
    property('rum_beacon_url', String);
    property('cube_url', String);
    property('name', String,{ index: true });
    property('origin_domain', String);
    property('origin_server', String);
    property('status',Boolean, {"default" :true});
    property('nt_status',Boolean, {"default" :false});
    //property("config_url",{"type":"string", "default" :"72.172.186.70:8000"});
    property("config_url",String);
    property("BPGroup",String);
    property("COGroup",String);
    property("stats_url",String);
    property("tolerance",String);
    property("sync_status",String);
    property('co_cnames', String); 
    property('config_command_options', String); 
    property('co_apache_custom_config', String); 
    property('bp_apache_custom_config', String);
    property('bp_apache_fe_custom_config', String); 

    property('created_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    property('updated_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    //set('restPath', pathTo.domains);
});

var Company = describe('Company',function(){
    property('companyName', String);
    property('status',Boolean, {"default" :true});
    property('createdBy',{"type":"string", "default" :""}) 
    property('created_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    property('updated_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
});

var Filter = describe('Filter', function () {
    property('time_range', Object);
    property('geography', Object);
    property('network', Object);
    property('device', Object);
    property('load_time', Object);
    property('created_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    property('updated_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
   // set('restPath', pathTo.filters);
});


var Configure = describe('Configure', function () {
    property('domainName', String,{ index: true });
    property('traffic',Object);
    property('content',Object);
    property('cache',Object);
    property('security',Object);
    property('created_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    property('updated_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
});

var MasterConfiguration = describe('MasterConfiguration', function () {
    property('domainName', String,{ index: true });
    property('configurationJson',Object);
    property('created_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    property('updated_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
});

var Stats = describe('Stats',function(){
    property('domain_name', String,{ index: true });
    property('rev_component',Object);
    property('created_at',{
            type: Date,
            "default": function(){
                return new Date();
            }
        });
        property('updated_at',{
            type: Date,
            "default": function(){
                return new Date();
            }
        });
});

var DomainStats = describe('DomainStats', function() {
    property('stats_url', String, {
        index : true
    });
    property('domains', Object);
    /*property('created_at', {
        type : Date,
        "default" : function() {
            return new Date();
        }
    });
    property('updated_at', {
        type : Date,
        "default" : function() {
            return new Date();
        }
    });*/
});

var DomainLastUpdated = describe('DomainLastUpdated', function() {
     property('email', String);
     property('domainName', String);
     property('timeStamp', Object);

     property('updated_at',{
            type: Date,
            "default": function(){
            return new Date();
            }
        });
});

var UserMenuOrder = describe('UserMenuOrder', function() {
     property('email', String);
     property('domainName', String);
     property('menu_order', Object);

     property('updated_at',{
            type: Date,
            "default": function(){
            return new Date();
            }
        });
}); 

var WPTHistory = describe('WPTHistory', function(){
        property('domainName', String);
        property('test_id', String);
        property('configuration', Object);
        property('timeofTest',{
                type: Date,
                "default": function(){
                return new Date();
                }
        });
        property('test_url', String);
        property('user_id', String);
});


var SyncFailed = describe('SyncFailed', function() {
     property('domainName', String);
     property('ip', String);
     property('status', String);
     property('operation', String);
     property('configJson', Object);

     property('created_at',{
            type: Date,
            "default": function(){
                return new Date();
            }
         });

     property('updated_at',{
            type: Date,
            "default": function(){
            return new Date();
            }
        });
});

var AppToken = describe('AppToken', function() {
     property('appName', String);
     property('token', String); 
}); 

/**
* For storing cache data of heat Map
*/
var HeatMapCacheData = describe('HeatMapCacheData', function() {
     property('domainName', String);
     property('pageLoadTime', Object); 

     property('created_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    property('updated_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
});

/**
* For storing cache data of heat Map
*/
var HeatMapCache = describe('HeatMapCache', function() {
     property('domainName', String);
     property('pageLoadTime', Object); 

     property('created_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    property('updated_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
});

/**
* For storing cache data of device and browsers
*/
var DevBrowserCache = describe('DevBrowserCache', function() {
    property('domainName', String);
    property('devBrowserJson', Object);
    property('created_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    property('updated_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
});

/**
* For storing the server groups into db
*/
var ServerGroup = describe('ServerGroup', function() {
    property('groupName', String);
    property('groupType', String);
    property('servers', String);
    property('co_cnames', String); 
    property('serverType', String);
    property('publicName', String);

    property('created_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    
    property('updated_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
});

/**
* For Storing Rum Details into db
*/
var RumDetail = describe('RumDetail', function() {
    property('rum_url', String);
    property('evalutor_url', String);

    property('created_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    });
    
    property('updated_at',{
        type: Date,
        "default": function(){
            return new Date();
        }
    })
});

/**
* For storing heatmap job details
*/
var HeatMapJobDetail = describe('HeatMapJobDetail', function() {
    property('domainName', String);
    property('jobStartTime',Date);
    property('jobEndTime', Date);
});
