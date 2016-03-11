'use strict';

var ReportsPage = require('../pages/reports.page.js');

describe('reports tests', function() {

  var reportsPage = new ReportsPage();

  it('test reports section is operable', function() {
    browser.sleep(2000);
    reportsPage.login(ReportsPage.login_admin, ReportsPage.password);
    browser.sleep(2000);
    expect(reportsPage.portalSettings.isDisplayed()).toBeTruthy();
    expect(reportsPage.portalReportsButton.isDisplayed()).toBeTruthy();
    reportsPage.portalReportsButton.click();
    browser.sleep(2000);
    expect(reportsPage.portalDom0Panel.isDisplayed()).toBeTruthy();
  });

  it('test reports charts are visible', function() {
    reportsPage.portalDom0Panel.click();
    browser.sleep(5000);
    expect(reportsPage.portalReportsChartBreakdown.isDisplayed()).toBeTruthy();
    expect(reportsPage.portalReportsChartDistribution.isDisplayed()).toBeTruthy();
    reportsPage.portalReportsTrafficButton.click();
    browser.sleep(5000);
    expect(reportsPage.portalReportsTrafficChartBandwidth.isDisplayed()).toBeTruthy();
    expect(reportsPage.portalReportsTrafficChartHits.isDisplayed()).toBeTruthy();
    expect(reportsPage.portalReportsTrafficChartBytes.isDisplayed()).toBeTruthy();
    expect(reportsPage.portalReportsTrafficChartCache.isDisplayed()).toBeTruthy();
    expect(reportsPage.portalReportsTrafficChartResponse.isDisplayed()).toBeTruthy();
    reportsPage.logout();
  });
});