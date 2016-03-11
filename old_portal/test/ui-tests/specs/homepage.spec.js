'use strict';

var HomePage = require('../pages/homepage.page.js');

describe('homepage-login-logout test suite:', function() {

  var homePage = new HomePage();

  it('test visibility homepage objects', function() {
    browser.sleep(2000);
    expect(homePage.emailInput.isDisplayed()).toBeTruthy();
    expect(homePage.passwordInput.isDisplayed()).toBeTruthy();
    expect(homePage.loginButton.isDisplayed()).toBeTruthy();
    expect(homePage.forgotButton.isDisplayed()).toBeTruthy();
  });

  it('test forgot password modal is active', function() {
    homePage.forgotPassword();
  });

  it('test login failed with empty fields', function() {
    homePage.loginInvalid('', '', HomePage.alertTextInvalidNull);
  });

  it('test login failed with both incorrect credentials', function() {
    homePage.loginInvalid('name@company.com', '123456', HomePage.alertTextInvalidBoth);
  });

  it('test login failed with incorrect password only', function() {
    homePage.loginInvalid(HomePage.login_user, '123456', HomePage.alertTextInvalidPass);
  });

  it('test login failed with incorrect email only', function() {
    homePage.loginInvalid('name@company.com', HomePage.password, HomePage.alertTextInvalidBoth);
  });

  it('test login failed with restricted user', function() {
    homePage.loginInvalid(HomePage.login_revadmin, HomePage.password, HomePage.alertTextInvalidSpecial);
  });

  it('test successfull login with admin user', function() {
    homePage.loginValid(HomePage.login_admin, HomePage.password);
  });

  it('test successfull login with common user', function() {
    homePage.loginValid(HomePage.login_user, HomePage.password);
  });

  it('test successfull login with reseller user', function() {
    homePage.loginValid(HomePage.login_reseller, HomePage.password);
  });

});
