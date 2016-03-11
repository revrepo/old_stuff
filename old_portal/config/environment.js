module.exports = function (compound) {

    var express = require('express');
    var app = compound.app;
      
    app.configure(function(){
        app.use(express.static(app.root + '/www/revsw-portal', { maxAge: 120000 })); // maxAge is in ms, not seconds; 36000000 is 10 hours
        // app.use(express.static(app.root + '/public', { maxAge: 86400000 }));
        app.set('jsDirectory', '/javascripts/');
        app.set('cssDirectory', '/stylesheets/');
        app.set('cssEngine', 'stylus');
        compound.loadConfigs(__dirname);
        app.use(express.urlencoded());
        app.use(express.json());
        app.use(express.methodOverride());
        app.use(app.router);

        /*
        Allowing cross domain
        */
        app.all('/*',function(req, res, next) {
        	res.header('Access-Control-Allow-Origin', '*');
        	res.header('Access-Control-Allow-Methods', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.header('Access-Control-Max-Age', 365*24*60*60); // seconds
        	next();
        });
    });

};
