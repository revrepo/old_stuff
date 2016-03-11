'use strict';

var DashboardPage = require('../pages/dashboard.page.js');

describe('dashboard tests', function() {

  var dashboardPage = new DashboardPage();

  it('test dashboard section is operable', function() {
    browser.sleep(2000);
    dashboardPage.login(DashboardPage.login_admin, DashboardPage.password);
    browser.sleep(2000);
    expect(dashboardPage.portalSettings.isDisplayed()).toBeTruthy();
    expect(dashboardPage.portalDashboardButton.isDisplayed()).toBeTruthy();
    dashboardPage.portalDashboardButton.click();
    browser.sleep(2000);
    expect(dashboardPage.portalDom0Panel.isDisplayed()).toBeTruthy();
  });

  it('test dashboard elements are visible', function() {
    dashboardPage.portalDom0Panel.click();
    browser.sleep(5000);
    expect(dashboardPage.portalDashboardMap.isDisplayed()).toBeTruthy();
    expect(dashboardPage.portalDashboardDevices.isDisplayed()).toBeTruthy();
    expect(dashboardPage.portalDashboardPerformance.isDisplayed()).toBeTruthy();
    expect(dashboardPage.portalDashboardBreakdown.isDisplayed()).toBeTruthy();
    expect(dashboardPage.portalDashboardCountries.isDisplayed()).toBeTruthy();
    expect(dashboardPage.portalDashboardCountries.isDisplayed()).toBeTruthy();
    expect(dashboardPage.portalDashboardCache.isDisplayed()).toBeTruthy();
    // not working now, protractor bug
    //browser.driver.actions().dragAndDrop(dashboardPage.portalDashboardMap, dashboardPage.portalDashboardDropArea).perform();
    dashboardPage.logout();
  });
});
