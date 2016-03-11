'use strict';

var CAdminPage = require('../pages/cadmin.page.js');

describe('cadmin and user settings test suite:', function() {

  var cadminPage = new CAdminPage();

  it('test admin settings are not available for user', function() {
    browser.sleep(2000);
    cadminPage.login(CAdminPage.login_user, CAdminPage.password);
    expect(cadminPage.portalSettings.isDisplayed()).toBeFalsy();
    cadminPage.logout();
  });

  it('test admin settings are available for admin', function() {
    cadminPage.login(CAdminPage.login_admin, CAdminPage.password);
    expect(cadminPage.portalSettings.isDisplayed()).toBeTruthy();
    cadminPage.portalSettings.click();
    browser.sleep(10000);
    expect(cadminPage.cadminSettingsUsers.isDisplayed()).toBeTruthy();
    expect(cadminPage.cadminBackLink.isDisplayed()).toBeTruthy();
    expect(cadminPage.cadminLogoutLink.isDisplayed()).toBeTruthy();
    cadminPage.cadminBackLink.click();
    browser.sleep(5000);
    cadminPage.portalSettings.click();
    browser.sleep(5000);
    cadminPage.cadminLogoutLink.click();
    browser.sleep(2000);
    cadminPage.logoutButtonYes.click();
    browser.sleep(5000);
    expect(cadminPage.loginButton.isDisplayed()).toBeTruthy();
  });

});
