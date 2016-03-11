'use strict';

var PortalPage = require('../pages/portal.page.js');

describe('portal and user settings test suite:', function() {

  var portalPage = new PortalPage();

  it('test visibility portal objects', function() {
    browser.sleep(2000);
    portalPage.login(PortalPage.login_admin, PortalPage.password)
    expect(portalPage.logoutButton.isDisplayed()).toBeTruthy();
    expect(portalPage.portalAvatar.isDisplayed()).toBeTruthy();
    expect(portalPage.portalLinkDashboard.isDisplayed()).toBeTruthy();
    expect(portalPage.portalLinkReports.isDisplayed()).toBeTruthy();
    expect(portalPage.portalLinkConfigure.isDisplayed()).toBeTruthy();
    expect(portalPage.portalLinkTest.isDisplayed()).toBeTruthy();
  });

  it('test visibility user settings', function() {
    portalPage.portalAvatar.click();
    browser.sleep(2000);
    expect(portalPage.portalSettingsFName.isDisplayed()).toBeTruthy();
    expect(portalPage.portalSettingsLName.isDisplayed()).toBeTruthy();
    expect(portalPage.portalSettingsPassword.isDisplayed()).toBeTruthy();
    expect(portalPage.portalSettingsTheme.isDisplayed()).toBeTruthy();
    expect(portalPage.portalSettingsFNameEdit.isDisplayed()).toBeTruthy();
    expect(portalPage.portalSettingsLNameEdit.isDisplayed()).toBeTruthy();
    expect(portalPage.portalSettingsPasswordEdit.isDisplayed()).toBeTruthy();
    expect(portalPage.portalSettingsThemeEdit.isDisplayed()).toBeTruthy();
  });

  it('test edit first name', function() {
    portalPage.portalSettingsFNameEdit.click();
    browser.sleep(1000);
    expect(portalPage.portalSettingsFNameForm.isDisplayed()).toBeTruthy();
    expect(portalPage.portalSettingsFNameChange.isDisplayed()).toBeTruthy();
    portalPage.portalSettingsFNameForm.clear();
    portalPage.portalSettingsFNameForm.sendKeys('FNameTested');
    portalPage.portalSettingsFNameChange.click();
    browser.sleep(10000);
    expect(portalPage.portalSettingsFNameText.getText()).toEqual('FNameTested');

    portalPage.portalSettingsFNameEdit.click();
    browser.sleep(1000);
    expect(portalPage.portalSettingsFNameForm.isDisplayed()).toBeTruthy();
    expect(portalPage.portalSettingsFNameChange.isDisplayed()).toBeTruthy();
    portalPage.portalSettingsFNameForm.clear();
    portalPage.portalSettingsFNameForm.sendKeys('Portal UI QA User');
    portalPage.portalSettingsFNameChange.click();
    browser.sleep(10000);
    expect(portalPage.portalSettingsFNameText.getText()).toEqual('Portal UI QA User');
  });

  it('test edit last name', function() {
    portalPage.portalSettingsLNameEdit.click();
    browser.sleep(1000);
    expect(portalPage.portalSettingsLNameForm.isDisplayed()).toBeTruthy();
    expect(portalPage.portalSettingsLNameChange.isDisplayed()).toBeTruthy();
    portalPage.portalSettingsLNameForm.clear();
    portalPage.portalSettingsLNameForm.sendKeys('LNameTested');
    portalPage.portalSettingsLNameChange.click();
    browser.sleep(10000);
    expect(portalPage.portalSettingsLNameText.getText()).toEqual('LNameTested');

    portalPage.portalSettingsLNameEdit.click();
    browser.sleep(1000);
    expect(portalPage.portalSettingsLNameForm.isDisplayed()).toBeTruthy();
    expect(portalPage.portalSettingsLNameChange.isDisplayed()).toBeTruthy();
    portalPage.portalSettingsLNameForm.clear();
    portalPage.portalSettingsLNameForm.sendKeys('With Admin Perm');
    portalPage.portalSettingsLNameChange.click();
    browser.sleep(10000);
    expect(portalPage.portalSettingsLNameText.getText()).toEqual('With Admin Perm');
  });

  it('test edit theme', function() {
    portalPage.portalSettingsThemeEdit.click();
    browser.sleep(1000);
    portalPage.portalSettingsThemeSelector.click();
    browser.sleep(1000);
    portalPage.portalSettingsThemeSelectorDark.click();
    browser.sleep(1000);
    portalPage.portalSettingsThemeCancel.click();
    browser.sleep(1000);
  });

  it('test edit password', function() {
    portalPage.portalSettingsPasswordEdit.click();
    browser.sleep(1000);
    portalPage.portalSettingsPasswordFormOld.sendKeys(PortalPage.password);
    portalPage.portalSettingsPasswordFormNew.sendKeys(PortalPage.passwordNew);
    portalPage.portalSettingsPasswordFormCon.sendKeys(PortalPage.passwordNew);
    portalPage.portalSettingsPasswordChange.click();
    browser.sleep(10000);
    portalPage.login(PortalPage.login_admin, PortalPage.passwordNew)
    portalPage.portalAvatar.click();
    browser.sleep(2000);
    portalPage.portalSettingsPasswordEdit.click();
    browser.sleep(1000);
    portalPage.portalSettingsPasswordFormOld.sendKeys(PortalPage.passwordNew);
    portalPage.portalSettingsPasswordFormNew.sendKeys(PortalPage.password);
    portalPage.portalSettingsPasswordFormCon.sendKeys(PortalPage.password);
    portalPage.portalSettingsPasswordChange.click();
    browser.sleep(10000);
  });
});