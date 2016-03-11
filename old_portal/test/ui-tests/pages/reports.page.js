var baseUrl = 'https://testsjc20-portal01.revsw.net/'; // base URL
var login_admin = 'portal_qa_user_with_admin_perm@revsw.com'; // admin user
var password = 'password1'; // base password

var ReportsPage = function() {
  browser.driver.get(baseUrl);
};

ReportsPage.prototype = Object.create({}, {
  emailInput: {
    get: function() {
      return browser.driver.findElement(by.id('login_email'));
    }
  },
  passwordInput: {
    get: function() {
      return browser.driver.findElement(by.id('login_password'));
    }
  },
  loginButton: {
    get: function() {
      return browser.driver.findElement(by.id('sign_in'));
    }
  },
  logoutButton: {
    get: function() {
      return browser.driver.findElement(by.xpath("//div[@id='logOut']/span"));
    }
  },
  logoutDialog: {
    get: function() {
      return browser.driver.findElement(by.id("dialogLabel"));
    }
  },
  logoutButtonYes: {
    get: function() {
      return browser.driver.findElement(by.xpath("(//div[@class='modal-footer']/button)[2]"));
    }
  },
  portalSettings: {
    get: function() {
      return browser.driver.findElement(by.id("userSettings"));
    }
  },
  portalReportsButton: {
    get: function() {
      return browser.driver.findElement(by.id("main_men_1"));
    }
  },
  portalDom0Panel: {
    get: function() {
      return browser.driver.findElement(by.id("domain0TitleLabel"));
    }
  },
  portalReportsChartBreakdown: {
    get: function() {
      return browser.driver.findElement(by.id("area_chart"));
    }
  },
  portalReportsChartDistribution: {
    get: function() {
      return browser.driver.findElement(by.id("normal-dist-graph"));
    }
  },
  portalReportsTrafficButton: {
    get: function() {
      return browser.driver.findElement(by.id("rep_traff"));
    }
  },
  portalReportsTrafficChartBandwidth: {
    get: function() {
      return browser.driver.findElement(by.id("bwLine_chart"));
    }
  },
  portalReportsTrafficChartHits: {
    get: function() {
      return browser.driver.findElement(by.id("ht_Line_chart"));
    }
  },
  portalReportsTrafficChartBytes: {
    get: function() {
      return browser.driver.findElement(by.id("bytes_bar_chart"));
    }
  },
  portalReportsTrafficChartCache: {
    get: function() {
      return browser.driver.findElement(by.id("ceArea_chart"));
    }
  },
  portalReportsTrafficChartResponse: {
    get: function() {
      return browser.driver.findElement(by.id("tresp_area_chart"));
    }
  },

  login: {
    value: function(email, password) {
      expect(this.emailInput.isDisplayed()).toBeTruthy();
      expect(this.passwordInput.isDisplayed()).toBeTruthy();
      expect(this.loginButton.isDisplayed()).toBeTruthy();
      this.emailInput.clear();
      this.emailInput.sendKeys(email);
      this.passwordInput.clear();
      this.passwordInput.sendKeys(password);
      this.loginButton.click();
    }
  },

  logout: {
    value: function() {
      expect(this.logoutButton.isDisplayed()).toBeTruthy();
      this.logoutButton.click();
      browser.sleep(2000);
      expect(this.logoutDialog.isDisplayed()).toBeTruthy();
      this.logoutButtonYes.click();
      browser.sleep(2000);
      expect(this.loginButton.isDisplayed()).toBeTruthy();
    }
  }
});

module.exports = ReportsPage;
module.exports.login_admin = login_admin;
module.exports.password = password;