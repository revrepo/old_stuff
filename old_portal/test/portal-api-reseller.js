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

var qaUserWithResellerPerm = 'qa_user_with_reseller_perm@revsw.com';

var qaUserRevAdminJson = {
  email: qaUserWithRevAdminPerm,
  password: 'password1',
  user_type: 'revadmin'
};


describe('Rev portal API Reseller user', function() {

  var adminToken = '';
  var userToken = '';
  var userCompanyId = '';
  var domainConfigJson = {};

  it('should log in to the user portal', function(done) {

    var userUserJson = {
      email: qaUserWithResellerPerm,
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

        //      console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.is_admin.should.be.equal(false);
        response_json.response.role.should.be.equal('reseller');
        userToken = response_json.response.token;
        userCompanyId = response_json.response.companyId;
        userToken.should.be.type('string');
        userToken.should.not.be.equal('');
        userCompanyId.should.not.be.equal('');
        done();
      });
  });

  it('should get a list of users', function(done) {

    var listUsersJson = {
      companyId: userCompanyId,
      email: qaUserWithResellerPerm,
      role: 'reseller',
      token: userToken,
    };

    //   console.log(newDomainJson);
    request(testPortalApiUrl)
      .post('/user/list')
      .send(listUsersJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //     console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.length.should.be.above(0);
        done();
      });
  });

  it('should get a list of companies', function(done) {

    var listCompaniesJson = {
      companyId: userCompanyId,
      email: qaUserWithResellerPerm,
      role: 'reseller',
      token: userToken,
    };

    //   console.log(newDomainJson);
    request(testPortalApiUrl)
      .post('/company/list')
      .send(listCompaniesJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //     console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.length.should.be.above(0);
        done();
      });
  });

  var testCompanyName = 'QA Sub-reseller Test Company ' + Date.now();

  var testCompanyID = '';

  it('should create new company ' + testCompanyName, function(done) {

    var createCompaniesJson = {
      cmp_name: testCompanyName,
      email: qaUserWithResellerPerm,
      role: 'reseller',
      token: userToken,
    };

    //   console.log(newDomainJson);
    request(testPortalApiUrl)
      .post('/company/new')
      .send(createCompaniesJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //     console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.message.should.be.equal('Company created successfully');
        response_json.response.comp_id.should.be.a.String();
        testCompanyId = response_json.response.comp_id;
        done();
      });
  });

  var testDomainName = 'qa-test-sub-reseller-' + Date.now() + '.revsw.net';

  it('should create new domain ' + testDomainName + ' for sub-reseller company ' + testCompanyName, function(done) {

    var newDomainJson = {
      companyId: testCompanyId,
      companys: testCompanyId,
      config_url_type: 'Default',
      email: qaUserWithResellerPerm,
      name: testDomainName,
      origin_domain: 'testsjc20-website01.revsw.net',
      origin_server: 'testsjc20-website01.revsw.net',
      role: 'reseller',
      token: userToken,
      tolerance: '3000'
    };

//     console.log(newDomainJson);
    this.timeout(120000);
    request(testPortalApiUrl)
      .post('/domain/new')
      .send(newDomainJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

//        console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('Domain created successfully');
        done();
      });
  });


  var testUser = 'qa-sub-reseller-' + Date.now() + '@revsw.com';

  it('should create a new user ' + testUser + ' for company ' + testCompanyName, function(done) {

    var newUsersJson = {
      data: {
        firstname: 'QA Sub-Reseller User',
        lastname: 'Automatic',
        role: 'reseller',
        domain: testDomainName,
        multiselect: testDomainName,
        email: testUser,
        reports: '',
        configure: '',
        read: 'true',
        test: '',
        password: 'password1',
        confirm_password: 'password1',
        access_control_list: {
          dashBoard: true,
          reports: true,
          configure: true,
          test: true,
          readOnly: false
        },
        companys: testCompanyId
      },
      email: qaUserWithResellerPerm,
      token: userToken
    };

    //   console.log(newDomainJson);
    request(testPortalApiUrl)
      .post('/user/new')
      .send(newUsersJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //     console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('User created successfully');
        done();
      });
  });


  it('should update a new user', function(done) {

    var updateUsersJson = {
      firstname: 'QA Sub-Reseller User',
      lastname: 'Automatic',
      role: 'reseller',
      domain: testDomainName,
      multiselect: testDomainName,
      user_email: testUser,
      reports: '',
      read: 'true',
      password: 'password1',
      confirm_password: 'password1',
      access_control_list: {
        dashBoard: true,
        reports: true,
        configure: false,
        test: false,
        readOnly: false
      },
      companys: testCompanyId,
      email: qaUserWithResellerPerm,
      token: userToken
    };

//     console.log(updateUsersJson);
    request(testPortalApiUrl)
      .post('/user/update')
      .send(updateUsersJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

//        console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('User updated successfully');
        done();
      });
  });


  it('should delete a user', function(done) {

    var deleteUsersJson = {
      email: qaUserWithResellerPerm,
      user_email: testUser,
      token: userToken,
    };

    //   console.log(newDomainJson);
    request(testPortalApiUrl)
      .post('/user/delete')
      .send(deleteUsersJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //     console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('User has been deleted successfully');
        done();
      });
  });

  it('should get a domain configuration', function(done) {

    var getDomainConfigJson = {
      email: qaUserWithResellerPerm,
      domainName: testDomainName,
      token: userToken
    };

    //   console.log(deleteDomainJson);
    this.timeout(60000);
    request(testPortalApiUrl)
      .post('/domain/configure')
      .send(getDomainConfigJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        // console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.domainName.should.be.equal(testDomainName);
        response_json.response.configurationJson.should.not.be.empty();
        domainConfigJson = response_json.response;
        delete domainConfigJson.created_at;
        delete domainConfigJson.updated_at;
        delete domainConfigJson.id;

        //	console.log('Domain configuration JSON:', domainConfigJson);
        //	domainConfigJson.should.be.equal(expectedDomainConfigJson);
        done();
      });
  });


  it('should push new domain configuration', function(done) {

    var updateDomainConfigJson = {
      actType: 'configJson',
      configurationJson: domainConfigJson.configurationJson,
      email: qaUserWithResellerPerm,
      domainName: testDomainName,
      token: userToken
    };

    updateDomainConfigJson.configurationJson.rev_component_bp.acl.enabled = true;

    //   console.log(deleteDomainJson);
    this.timeout(120000);
    request(testPortalApiUrl)
      .post('/domain/updateConfigure')
      .send(updateDomainConfigJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        // console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.response.should.be.equal('Configuration updated successfully');
        response_json.response.configurationJson.should.not.be.empty();
        domainConfigJson = response_json.response.configurationJson;
        done();
      });
  });

  it('should update a domain', function(done) {

    var updateDomainJson = {
      companyId: testCompanyId,
      companys: testCompanyId,
      config_url_type: 'Default',
      email: qaUserWithResellerPerm,
      name: testDomainName,
      origin_domain: 'testsjc20-website01.revsw.net',
      origin_server: 'qa-testsjc20-website01.revsw.net',
      role: 'reseller',
      token: userToken,
      tolerance: '3000'
    };

    //   console.log(newDomainJson);
    this.timeout(120000);
    request(testPortalApiUrl)
      .post('/domain/update')
      .send(updateDomainJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //     console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('Domain has been updated successfully');
        done();
      });
  });


  it('should purge an object', function(done) {

    var purgeObjectJson = {
      stats_url: 'TESTSJC20-BP01.REVSW.NET,TESTSJC20-BP02.REVSW.NET',
      email: qaUserWithResellerPerm,
      token: userToken,
      inputJson: {
        version: 1,
        purges: [{
          url: {
            is_wildcard: true,
            expression: '/images/*.png',
            domain: testDomainName
          }
        }]
      }
    };

    //    console.log(purgeObjectJson);
    this.timeout(10000);
    request(testPortalApiUrl)
      .post('/domain/purge')
      .send(purgeObjectJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //       console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('Purge request has been sent');
        done();
      });
  });


  it('should delete a domain', function(done) {

    var deleteDomainJson = {
      email: qaUserWithResellerPerm,
      name: testDomainName,
      token: userToken
    };

    //   console.log(deleteDomainJson);
    this.timeout(120000);
    request(testPortalApiUrl)
      .post('/domain/delete')
      .send(deleteDomainJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //        console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('Domain deleted successfully');
        done();
      });
  });

  var newTestCompanyName = testCompanyName + '-2';

  it('should update company ' + testCompanyName, function(done) {

    var updateCompaniesJson = {
      cmp_id: testCompanyId,
      cmp_name: newTestCompanyName,
      email: qaUserWithResellerPerm,
      token: userToken,
    };

//    console.log(updateCompaniesJson);
    request(testPortalApiUrl)
      .post('/company/update')
      .send(updateCompaniesJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

//        console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('Company updated successfully');
        testCompanyName = newTestCompanyName;
        done();
      });
  });

/*
  it('should verify the domain name change', function(done) {

    var listCompaniesJson = {
      companyId: testCompanyId,
      email: qaUserWithResellerPerm,
      role: 'reseller',
      token: userToken,
    };

    console.log(listCompaniesJson);
    request(testPortalApiUrl)
      .post('/company/list')
      .send(listCompaniesJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response[0].companyName.should.be.equal(newTestCompanyName);
        testCompanyName = newTestCompanyName;
        done();
      });
  });

*/


  it('should delete company ' + testCompanyName, function(done) {

    var deleteCompaniesJson = {
      cmp_id: testCompanyId,
      email: qaUserWithResellerPerm,
      token: userToken,
    };

    //   console.log(newDomainJson);
    request(testPortalApiUrl)
      .post('/company/delete')
      .send(deleteCompaniesJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //     console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('Company deleted successfully.');
        done();
      });
  });


  it('should log out from the user portal', function(done) {

    var userLogoutJson = {
      domainName: '',
      email: qaUserWithResellerPerm,
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
