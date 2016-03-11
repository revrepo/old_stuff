process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var should = require('should-http');
var request = require('supertest');
var agent = require('supertest-as-promised');

var express = require('express');
var fs = require('fs');
var https = require('https');
var sleep = require('sleep');
var crypto = require('crypto');

var testPortalApiUrl = process.env.PORTAL_API_QA_URL || 'https://localhost';
var testPortalApiUrlHTTP = process.env.PORTAL_API_QA_HTTP_URL || 'http://localhost';
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


describe('Rev portal API Admin user', function() {

  var adminToken = '';
  var userToken = '';
  var userCompanyId = '';
  var domainConfigJson = {};

  it('should receive HTTPS redirect when accessing HTTP URL ' + testPortalApiUrlHTTP, function(done) {

    request(testPortalApiUrlHTTP)
      .get('/')
      .expect('Location', testPortalApiUrl + '/')
      .expect(302)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(302);

        done();
      });
  });

  it('should get OK on portal health check', function(done) {

    request(testPortalApiUrl)
      .get('/healthcheck/check')
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

        //      console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.message.should.be.equal('OK: Everything is great');
        response_json.version.should.be.type('string');
        done();
      });
  });


  it('should log in to the user portal', function(done) {

    var userUserJson = {
      email: qaUserWithAdminPerm,
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
        response_json.response.role.should.be.equal('admin');
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
      email: qaUserWithAdminPerm,
      role: 'admin',
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
        response_json.response.length.should.be.above(4);
        done();
      });
  });

  var testUser = 'qa-test-user-' + Date.now() + '@revsw.com';

  it('should create a new user', function(done) {

    var newUsersJson = {
      data: {
        firstname: 'QA User',
        lastname: 'Automatic',
        role: 'admin',
        domain: 'test-proxy-cache-config.revsw.net',
        multiselect: 'test-proxy-cache-config.revsw.net',
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
        companys: userCompanyId
      },
      email: qaUserWithAdminPerm,
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
      firstname: 'QA User Updated',
      lastname: 'Automatic',
      role: 'admin',
      domain: 'test-proxy-acl-allow-except.revsw.net',
      multiselect: 'test-proxy-acl-allow-except.revsw.net',
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
      companyId: userCompanyId,
      companys: userCompanyId,
      email: qaUserWithAdminPerm,
      token: userToken
    };

    //    console.log(updateUsersJson);
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
      email: qaUserWithAdminPerm,
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

  var testDomainName = 'qa-test-domain-delete-me-' + Date.now() + '.revsw.net';

  it('should create a new domain', function(done) {

    var newDomainJson = {
      companyId: userCompanyId,
      companys: userCompanyId,
      config_url_type: 'Default',
      email: qaUserWithAdminPerm,
      name: testDomainName,
      origin_domain: 'testsjc20-website01.revsw.net',
      origin_server: 'testsjc20-website01.revsw.net',
      role: 'admin',
      token: userToken,
      tolerance: '3000'
    };

//    console.log(newDomainJson);
    this.timeout(120000);
    request(testPortalApiUrl)
      .post('/domain/new')
      .send(newDomainJson)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.statusCode.should.be.equal(200);

 //       console.log(res.text);
        var response_json = JSON.parse(res.text);
        response_json.status.should.be.equal(true);
        response_json.response.should.be.equal('Domain created successfully');
        done();
      });
  });


  var expectedDomainConfigJson = {
    domainName: testDomainName,
    'configurationJson': {
      'domain_name': testDomainName,
      'version': '1.0.5',
      'origin_domain': 'testsjc20-website01.revsw.net',
      'operation': 'add',
      'origin_server': 'testsjc20-website01.revsw.net',
      'origin_protocol': 'https-only',
      'config_command_options': '  ',
      '3rd_party_rewrite': {
        'enable_3rd_party_rewrite': false,
        '3rd_party_urls': '',
        'enable_3rd_party_runtime_rewrite': false,
        '3rd_party_runtime_domains': '',
        'enable_3rd_party_root_rewrite': false,
        '3rd_party_root_rewrite_domains': ''
      },
      'rev_component_co': {
        'co_apache_custom_config': 'ProxyTimeout 300',
        'enable_rum': true,
        'rum_beacon_url': 'https://testsjc20-rum01.revsw.net/service',
        'enable_optimization': false,
        'mode': 'moderate',
        'img_choice': 'medium',
        'js_choice': 'medium',
        'css_choice': 'medium'
      },
      'rev_traffic_mgr': {
        'tier': 'SILVER',
        'page_views': '40M',
        'transfer_size': '160 TB',
        'overage': 30,
        'apdex_threshold_ms': 2000
      },
      'rev_component_bp': {
        'bp_apache_custom_config': '',
        'bp_apache_fe_custom_config': '',
        'enable_cache': true,
        'block_crawlers': false,
        'cache_opt_choice': 'Rev CDN',
        'cdn_overlay_urls': [],
        'caching_rules': [{
          'version': 1,
          'url': {
            'is_wildcard': true,
            'value': '**'
          },
          'edge_caching': {
            'override_origin': false,
            'new_ttl': 0,
            'override_no_cc': false
          },
          'browser_caching': {
            'override_edge': false,
            'new_ttl': 0,
            'force_revalidate': false
          },
          'cookies': {
            'override': false,
            'ignore_all': false,
            'list_is_keep': false,
            'keep_or_ignore_list': [],
            'remove_ignored_from_request': false,
            'remove_ignored_from_response': false
          }
        }],
        'enable_security': true,
        'web_app_firewall': 'off',
        'ssl_certificates': 'rev_certs',
        'certificate_urls': [],
        'acl': {
          'enabled': false,
          'action': 'deny_except',
          'acl_rules': [{
            'host_name': '',
            'subnet_mask': '',
            'country_code': '',
            'header_name': '',
            'header_value': ''
          }]
        }
      },
      'bp_list': [
        'TESTSJC20-BP01.REVSW.NET',
        'TESTSJC20-BP02.REVSW.NET'
      ],
      'co_list': [
        'TESTSJC20-CO01.REVSW.NET',
        'TESTSJC20-CO02.REVSW.NET'
      ],
      'co_cnames': [
        'TESTSJC20-CO01.REVSW.NET'
      ]
    }
  };


  it('should get a domain configuration', function(done) {

    var getDomainConfigJson = {
      email: qaUserWithAdminPerm,
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
      email: qaUserWithAdminPerm,
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
      companyId: userCompanyId,
      companys: userCompanyId,
      config_url_type: 'Default',
      email: qaUserWithAdminPerm,
      name: testDomainName,
      origin_domain: 'testsjc20-website01.revsw.net',
      origin_server: 'qa-testsjc20-website01.revsw.net',
      role: 'admin',
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
      email: qaUserWithAdminPerm,
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
      email: qaUserWithAdminPerm,
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


  it('should log out from the user portal', function(done) {

    var userLogoutJson = {
      domainName: '',
      email: qaUserWithAdminPerm,
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

  it('should log in to the user portal using Master password', function(done) {

    var userUserJson = {
      email: qaUserWithAdminPerm,
      password: 'rjU7rO9Y5kbvdM408Mz8',
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
        response_json.response.role.should.be.equal('admin');
        userToken = response_json.response.token;
        userCompanyId = response_json.response.companyId;
        userToken.should.be.type('string');
        userToken.should.not.be.equal('');
        userCompanyId.should.not.be.equal('');
        done();
      });
  });

  it('should log in to the user portal as Admin user with hashed password', function(done) {

    var userUserJson = {
      email: qaUserWithAdminPerm,
      password: 'wrong_passwisdfsdfsdrd',
      password_hashed: crypto.createHash('md5').update('password1').digest('hex'),
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
        response_json.response.role.should.be.equal('admin');
        userToken = response_json.response.token;
        userCompanyId = response_json.response.companyId;
        userToken.should.be.type('string');
        userToken.should.not.be.equal('');
        userCompanyId.should.not.be.equal('');
        done();
      });
  });

});
