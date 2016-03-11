'use strict';

var ConfigurePage = require('../pages/configure.page.js');

describe('configuration tests', function() {

  var configurePage = new ConfigurePage();

  it('test configure section is operable', function() {
    browser.sleep(2000);
    // logging in and check the result page
    configurePage.login(ConfigurePage.login_admin, ConfigurePage.password);
    expect(configurePage.portalSettings.isDisplayed()).toBeTruthy();

    // clicking configuration tab
    configurePage.portalConfigureButton.click();
    browser.sleep(2000);
  });

  it('selecting the first domain and check visibility of base elements', function() {
    configurePage.portalDom0Panel.click();
    browser.sleep(5000);
    expect(configurePage.portalConfigureDomain.isDisplayed()).toBeTruthy();
    expect(configurePage.portalConfigureContent.isDisplayed()).toBeTruthy();
    expect(configurePage.portalConfigureCDN.isDisplayed()).toBeTruthy();
    expect(configurePage.portalConfigureSecurity.isDisplayed()).toBeTruthy();
    expect(configurePage.portalConfigureDomainSave.isDisplayed()).toBeTruthy();
    expect(configurePage.portalConfigureContentSave.isDisplayed()).toBeTruthy();
    expect(configurePage.portalConfigureCDNSave.isDisplayed()).toBeTruthy();
    expect(configurePage.portalConfigureSecuritySave.isDisplayed()).toBeTruthy();
  });

  it('clicking on sections and checking visibility of base elements', function() {
    configurePage.portalConfigureDomain.click();
    browser.sleep(3000);
    expect(configurePage.portalConfigureDomainContent.isDisplayed()).toBeTruthy();

    configurePage.portalConfigureContent.click();
    browser.sleep(3000);
    expect(configurePage.portalConfigureContentContent.isDisplayed()).toBeTruthy();

    configurePage.portalConfigureCDN.click();
    browser.sleep(3000);
    expect(configurePage.portalConfigureCDNContent.isDisplayed()).toBeTruthy();

    configurePage.portalConfigureSecurity.click();
    browser.sleep(3000);
    expect(configurePage.portalConfigureSecurityContent.isDisplayed()).toBeTruthy();

    // checking save button for the last section
    configurePage.portalConfigureSecuritySave.click();
    browser.sleep(5000);
    expect(configurePage.portalConfigureSecuritySaveY.isDisplayed()).toBeTruthy();
    expect(configurePage.portalConfigureSecuritySaveN.isDisplayed()).toBeTruthy();
    configurePage.portalConfigureSecuritySaveN.click();
    browser.sleep(2000);
    configurePage.logout();
  });

});
