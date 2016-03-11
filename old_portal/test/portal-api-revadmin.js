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


describe('Rev portal API Rev-admin user', function() {

  var testCompanyName = 'QA Test Company ' + Date.now();
  var testCompanyID = '';
  var testBPServerGroupName = '';
  var testCOServerGroupName = '';

  var adminToken = '';
  var userToken = '';
  var userCompanyId = '';
  var domainConfigJson = {};


  it('should log in to the Admin portal', function(done) {
    request(testPortalApiUrl)
      .post('/user/login')
      .send(qaUserRevAdminJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        //  console.log(res.body);
        res.statusCode.should.be.equal(200);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.is_admin.should.be.equal(true);
        response_json.response.role.should.be.equal('revadmin');
        userToken = response_json.response.token;
        userToken.should.be.type('string');
        userToken.should.not.be.equal('');
        done();
      });
  });


  it('should get a list of server groups', function(done) {

    var listServerGroupsJson = {
      email: qaUserWithRevAdminPerm,
      token: userToken,
    };

//    console.log(listUsersJson);
    request(testPortalApiUrl)
      .post('/servergroup/list')
      .send(listServerGroupsJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

 //       console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.length.should.be.above(0);
        var defaultBPGroupPresent = false;
        var defaultCOGroupPresent = false;
        for(var i = 0; i < response_json.response.length; ++i) {
          if ( response_json.response[i].groupName === 'Default' &&  response_json.response[i].groupType === 'BP' ) {
            defaultBPGroupPresent = true;
          }
          if ( response_json.response[i].groupName === 'Default' &&  response_json.response[i].groupType === 'CO' ) {
            defaultCOGroupPresent = true;
          }
        }
        defaultBPGroupPresent.should.be.equal(true);
        defaultCOGroupPresent.should.be.equal(true);
        done();
      });
  });

  testBPServerGroupName = 'QA Test BP Group ' + Date.now();

  it('should add a new BP server group', function(done) {

    var newServerGroupJson = {
      co_cnames: '',
      groupName: testBPServerGroupName,
      groupType: 'BP',
      publicName: testBPServerGroupName,
      serverType: 'private',
      servers: 'TESTSJC20-BP01.REVSW.NET,TESTSJC20-BP02.REVSW.NET',
      email: qaUserWithRevAdminPerm,
      token: userToken,
    };

//    console.log(listUsersJson);
    request(testPortalApiUrl)
      .post('/servergroup/new')
      .send(newServerGroupJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

 //       console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('Server Group details added successfully');
        done();
      });
  });

  it('should modify a BP server group', function(done) {

    var newServerGroupJson = {
      co_cnames: '',
      groupName: testBPServerGroupName,
      groupType: 'BP',
      publicName: testBPServerGroupName,
      serverType: 'private',
      servers: 'TESTSJC20-BP01.REVSW.NET',
      email: qaUserWithRevAdminPerm,
      token: userToken,
    };

//    console.log(listUsersJson);
    request(testPortalApiUrl)
      .post('/servergroup/update')
      .send(newServerGroupJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

 //       console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('Server Group Details updated successfully');
        done();
      });
  });

  it('should get a list of users', function(done) {

    var listUsersJson = {
      email: qaUserWithRevAdminPerm,
      role: 'revadmin',
      token: userToken,
    };

//    console.log(listUsersJson);
    request(testPortalApiUrl)
      .post('/user/list')
      .send(listUsersJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

 //       console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.length.should.be.above(0);
        done();
      });
  });


  it('should create new company ' + testCompanyName, function(done) {

    var createCompaniesJson = {
      cmp_name: testCompanyName,
      email: qaUserWithRevAdminPerm,
      role: 'revadmin',
      token: userToken,
    };

//    console.log(createCompaniesJson);
    request(testPortalApiUrl)
      .post('/company/new')
      .send(createCompaniesJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

//        console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('Company created successfully');
        done();
      });
  });

  it('should get a list of companies', function(done) {

    var listCompaniesJson = {
      email: qaUserWithRevAdminPerm,
      role: 'revadmin',
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

//        console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.length.should.be.above(0);
        for(var i = 0; i < response_json.response.length; ++i) {
          if ( response_json.response[i].companyName === testCompanyName ) {
            response_json.response[i].id.should.not.be.empty();
            testCompanyID = response_json.response[i].id;
          }
        }
        testCompanyID.should.not.be.equal('');
//        console.log(testCompanyID);
        done();
      });
  });

  var newTestCompanyName = testCompanyName + '-2';

  it('should update company ' + testCompanyName, function(done) {

    var updateCompaniesJson = {
      cmp_id: testCompanyID,
      cmp_name: newTestCompanyName,
      email: qaUserWithRevAdminPerm,
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


  var testDomainName = 'qa-test-revadmin-' + Date.now() + '.revsw.net';

  it('should create new domain ' + testDomainName + ' for company ' + testCompanyName, function(done) {

    var newDomainJson = {
      BPGroup: 'Default',
      COGroup: 'Default',
      bp_apache_custom_config: '',
      bp_apache_fe_custom_config: '',
      co_apache_custom_config: '',
      co_cnames: 'TESTSJC20-CO01.REVSW.NET',
      companyId: testCompanyID,
      config_command_options: ' ',
      config_url: 'TESTSJC20-CO01.REVSW.NET,TESTSJC20-CO02.REVSW.NET',
      cube_url: 'http://testsjc20-cube01.revsw.net:1081/',
      rum_beacon_url: 'https://testsjc20-rum01.revsw.net/service',
      stats_url: 'TESTSJC20-BP01.REVSW.NET,TESTSJC20-BP02.REVSW.NET',
      stats_url_type: 'Default',
      webpagetest_url: '',
      config_url_type: 'Default',
      email: qaUserWithRevAdminPerm,
      name: testDomainName,
      origin_domain: 'testsjc20-website01.revsw.net',
      origin_server: 'testsjc20-website01.revsw.net',
      role: 'revadmin',
      token: userToken,
      tolerance: '3000'
    };

  //  console.log(newDomainJson);
    this.timeout(120000);
    request(testPortalApiUrl)
      .post('/domain/new')
      .send(newDomainJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

   //     console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('Domain created successfully');
        done();
      });
  });

  var testUser = 'qa-user-' + Date.now() + '@revsw.com';

  it('should create new user ' + testUser + ' for company ' + testCompanyName, function(done) {

    var newUsersJson = {
      data: {
        firstname: 'QA User',
        lastname: 'Automatic',
        role: 'admin',
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
        companys: testCompanyID
      },
      email: qaUserWithRevAdminPerm,
      token: userToken
    };

//    console.log(newUsersJson);
    request(testPortalApiUrl)
      .post('/user/new')
      .send(newUsersJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

//        console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('User created successfully');
        done();
      });
  });


  it('should update a new user', function(done) {

    var updateUsersJson = {
      firstname: 'QA User Updated',
      lastname: 'Automatic',
      role: 'user',
      domain: testDomainName,
      multiselect: testDomainName,
      user_email: testUser,
      configure: '',
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
      companys: testCompanyID,
      email: qaUserWithRevAdminPerm,
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
      email: qaUserWithRevAdminPerm,
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


  it('should get a list of domains', function(done) {

    var getDomainListJson = {
      email: qaUserWithRevAdminPerm,
      companyId: '',
      token: userToken
    };

//    console.log(getDomainListJson);
    this.timeout(60000);
    request(testPortalApiUrl)
      .post('/domain/names')
      .send(getDomainListJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

//        console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.length.should.be.above(1);
        var foundDomain = false;
        for(var i = 0; i < response_json.response.length; ++i) {
 //         console.log(' response_json.response[' + i + '] = ' +  response_json.response[i]);
          if ( response_json.response[i] === testDomainName ) {
   //         console.log('Setting foundDomain to true');
            foundDomain = true;
          }
        }
        foundDomain.should.be.equal(true);
        done();
      });
  });



  it('should get a domain master JSON configuration', function(done) {

    var getDomainConfigJson = {
      email: qaUserWithRevAdminPerm,
      domainName: testDomainName,
      token: userToken
    };

    //   console.log(deleteDomainJson);
    this.timeout(60000);
    request(testPortalApiUrl)
      .post('/domain/getMasterConfigDomain')
      .send(getDomainConfigJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        // console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.domain_name.should.be.equal(testDomainName);
        domainConfigJson = response_json.response;
//         console.log('Domain configuration JSON:', domainConfigJson);
        done();
      });
  });


  it('should push new domain JSON configuration', function(done) {

    var updateDomainConfigJson = {
      actType: 'domJson',
      configurationJson: domainConfigJson,
      email: qaUserWithRevAdminPerm,
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
      BPGroup: 'Default',
      COGroup: 'Default',
      bp_apache_custom_config: '',
      bp_apache_fe_custom_config: '',
      co_apache_custom_config: '',
      co_cnames: 'TESTSJC20-CO01.REVSW.NET',
      companyId: testCompanyID,
      config_command_options: ' ',
      config_url: 'TESTSJC20-CO01.REVSW.NET,TESTSJC20-CO02.REVSW.NET',
      cube_url: 'http://testsjc20-cube01.revsw.net:1081/',
      rum_beacon_url: 'https://testsjc20-rum01.revsw.net/service',
      stats_url: 'TESTSJC20-BP01.REVSW.NET,TESTSJC20-BP02.REVSW.NET',
      stats_url_type: 'Default',
      webpagetest_url: '',
      config_url_type: 'Default',
      email: qaUserWithRevAdminPerm,
      name: testDomainName,
      origin_domain: 'testsjc20-website01.revsw.net',
      origin_server: 'qa-testsjc20-website01.revsw.net',
      role: 'revadmin',
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
      email: qaUserWithRevAdminPerm,
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
      email: qaUserWithRevAdminPerm,
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

  it('should delete company ' + testCompanyName, function(done) {

    var deleteCompaniesJson = {
      cmp_id: testCompanyID,
      email: qaUserWithRevAdminPerm,
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
      email: qaUserWithRevAdminPerm,
      token: userToken
    };

    //     console.log('userLogoutJson = ', userLogoutJson);
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
