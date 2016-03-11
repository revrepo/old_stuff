var config = require('config');
var Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');

exports.config = {
  directConnect: false,
  seleniumAddress: config.get('protractor.seleniumAddress'),
  capabilities: {
    browserName: 'firefox'
  },
  specs: [
     '../suites/smoke/*Spec.js',
     '../suites/negative/*Spec.js',
     '../suites/boundary/*Spec.js',
     '../suites/functional/*Spec.js',
     '../suites/workflow/*Spec.js'
  ],
  getPageTimeout: 60000,
  allScriptsTimeout: 70000,
  framework: 'jasmine2',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 360000,
    showColors: true,
    isVerbose: true
  },
  onPrepare: function () {
    browser.manage().window().setSize(1024, 768);

    jasmine.getEnv().addReporter(
      new Jasmine2HtmlReporter({
        savePath: './results/tests/',
        takeScreenshots: true,
        takeScreenshotsOnlyOnFailures: true,
        consolidate: true,
        consolidateAll: true
      })
    );
  }
};
