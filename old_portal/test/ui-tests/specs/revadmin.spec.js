'use strict';

var RevAdminPage = require('../pages/revadmin.page.js');

describe('revadmin and user settings test suite:', function() {

  var revadminPage = new RevAdminPage();

  it('test rev-admin settings are not available for user', function() {
    browser.sleep(2000);
    revadminPage.login(RevAdminPage.login_user, RevAdminPage.password);
    browser.sleep(5000);
    expect(revadminPage.portalSettings.isDisplayed()).toBeFalsy();
    expect(revadminPage.loginButton.isDisplayed()).toBeTruthy();
  });

  it('test rev-admin settings are not available for admin', function() {
    revadminPage.login(RevAdminPage.login_admin, RevAdminPage.password);
    browser.sleep(5000);
    expect(revadminPage.portalSettings.isDisplayed()).toBeFalsy();
    expect(revadminPage.loginButton.isDisplayed()).toBeTruthy();
  });

  it('test rev-admin settings are not available for reseller', function() {
    revadminPage.login(RevAdminPage.login_reseller, RevAdminPage.password);
    browser.sleep(5000);
    expect(revadminPage.portalSettings.isDisplayed()).toBeFalsy();
    expect(revadminPage.loginButton.isDisplayed()).toBeTruthy();
  });

  it('test login failed with incorrect rev-admin password', function() {
    revadminPage.login(RevAdminPage.login_revadmin, "123456");
    browser.sleep(5000);
    expect(revadminPage.portalSettings.isDisplayed()).toBeFalsy();
    expect(revadminPage.loginButton.isDisplayed()).toBeTruthy();
  });

  it('test rev-admin settings are available for admin', function() {
    revadminPage.login(RevAdminPage.login_revadmin, RevAdminPage.password);
    browser.sleep(5000);
    expect(revadminPage.portalSettings.isDisplayed()).toBeTruthy();
    expect(revadminPage.portalCompanies.isDisplayed()).toBeTruthy();
    expect(revadminPage.portalUsers.isDisplayed()).toBeTruthy();
    expect(revadminPage.portalDomains.isDisplayed()).toBeTruthy();
    expect(revadminPage.portalPurge.isDisplayed()).toBeTruthy();
    expect(revadminPage.portalGroups.isDisplayed()).toBeTruthy();
    revadminPage.revadminLogoutLink.click();
    browser.sleep(2000);
    expect(revadminPage.logoutDialog.isDisplayed()).toBeTruthy();
    revadminPage.logoutButtonYes.click();
    browser.sleep(2000);
    expect(revadminPage.loginButton.isDisplayed()).toBeTruthy();
  });
});