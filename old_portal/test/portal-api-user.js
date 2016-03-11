process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var testPortalApiUrl = process.env.PORTAL_API_QA_URL || 'https://localhost';

var should = require('should-http');
var request = require('supertest');
var agent = require('supertest-as-promised');

var express = require('express');
var fs = require('fs');
var https = require('https');
var sleep = require('sleep');

// var testPortalWebUrl = 'https://testsjc20-portal01.revsw.net';

var wrongUserJson = {
  email: 'non_exiting_user@revsw.com',
  password: '12345678',
  logFrm: 'user',
  user_type: 'user'
};

var wrongPasswordJson = {
  email: 'eng@revsw.com',
  password: '12345678',
  logFrm: 'user',
  user_type: 'user'
};

var qaUserWithUserPerm = 'qa_user_with_user_perm@revsw.com';
var qaUserWithAdminPerm = 'qa_user_with_admin_perm@revsw.com';

var qaUserWithRevAdminPerm = 'qa_user_with_rev-admin_perm@revsw.com';

var qaUserRevAdminJson = {
  email: qaUserWithRevAdminPerm,
  password: 'password1',
  user_type: 'revadmin'
};


describe('Rev portal API regular user', function() {

  var adminToken = '';
  var userToken = '';
  var userCompanyId = '';
  var domainConfigJson = {};

  it('should return status "false" for non-existing user name', function(done) {
    request(testPortalApiUrl)
      .post('/user/login')
      .send(wrongUserJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(false);
        response_json.response.should.be.equal('Please send valid email & password');
        done();
      });
  });

  it('should return status "false" for existing user with wrong password', function(done) {
    request(testPortalApiUrl)
      .post('/user/login')
      .send(wrongPasswordJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(false);
        response_json.response.should.be.equal('Please send valid password');
        done();
      });
  });



  it('should request a password reset for existing user account', function(done) {

    var resetPasswordJson = {
      user_email: qaUserWithUserPerm
    };

    request(testPortalApiUrl)
      .post('/user/forgot_pwd')
      .send(resetPasswordJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //      console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.not.be.equal('');
        done();
      });
  });

  it('should return error while requesting password reset for not existing user account', function(done) {

    var resetPasswordJson = {
      user_email: 'some_strange_non_exisitng_user_account@revsw.com'
    };

    request(testPortalApiUrl)
      .post('/user/forgot_pwd')
      .send(resetPasswordJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //      console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(false);
        response_json.response.should.not.be.equal('');
        done();
      });
  });


  it('should log in to the user portal as user with User permissions', function(done) {


    var userUserJson = {
      email: qaUserWithUserPerm,
      password: 'password1',
      logFrm: 'user',
      user_type: 'user'
    };

    request(testPortalApiUrl)
      .post('/user/login')
      .send(userUserJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //	console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.is_admin.should.be.equal(false);
        response_json.response.role.should.be.equal('user');
        userToken = response_json.response.token;
        userCompanyId = response_json.response.companyId;
        userToken.should.be.type('string');
        userToken.should.not.be.equal('');
        userCompanyId.should.not.be.equal('');
        done();
      });
  });

  it('should NOT be able to create new domain as user with User permissions', function(done) {

    var newDomainJson = {
      companyId: userCompanyId,
      companys: userCompanyId,
      config_url_type: 'Default',
      email: qaUserWithUserPerm,
      name: 'testdomaintodelete11244323.com',
      origin_domain: 'testsjc20-website01.revsw.net',
      origin_server: 'testsjc20-website01.revsw.net',
      role: 'admin',
      token: userToken,
      tolerance: '3000'
    };

    //  console.log(newDomainJson);
    this.timeout(30000);
    request(testPortalApiUrl)
      .post('/domain/new')
      .send(newDomainJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //   console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(false);
        //        response_json.response.should.be.equal('Domain created successfully');
        done();
      });
  });




  it('should log out from the user portal as user with User permissions', function(done) {

    var userLogoutJson = {
      domainName: '',
      email: qaUserWithUserPerm,
      token: userToken
    };
    // console.log('userLogoutJson = ', userLogoutJson);
    request(testPortalApiUrl)
      .post('/user/logout')
      .send(userLogoutJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //   console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('User logout successfully');
        done();
      });
  });

});
