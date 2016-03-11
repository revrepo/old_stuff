// An example configuration file.
exports.config = {
  directConnect: false,

  // The address of a running selenium server.
  seleniumAddress: 'http://127.0.0.1:4444/wd/hub',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    browserName: 'firefox'
  },

  // Framework to use. Jasmine 2 is recommended.
  framework: 'jasmine2',

  suites: {
    homepage: 'specs/homepage.spec.js',
    portal: 'specs/portal.spec.js',
    cadmin: 'specs/cadmin.spec.js',
    dashboard: 'specs/dashboard.spec.js',
    forgotpass: 'specs/forgotpass.spec.js',
    reports: 'specs/reports.spec.js',
    configure: 'specs/configure.spec.js',
    revadmin: 'specs/revadmin.spec.js'
  },

  onPrepare: function() {
    // set implicit wait times in ms
    browser.manage().timeouts().implicitlyWait(30000);
    // set browser size...
    browser.manage().window().setSize(1024, 768);
    // reports for jenkins
    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      consolidateAll: true,
      savePath: 'testresults',
      filePrefix: 'xmloutput'
    }));
  },

  // Options to be passed to Jasmine.
  jasmineNodeOpts: {
    showColors: true,
    displayStacktrace: true,
    displaySpecDuration: true,
    // set overall times for each test suite
    defaultTimeoutInterval: 180000
  }

};
