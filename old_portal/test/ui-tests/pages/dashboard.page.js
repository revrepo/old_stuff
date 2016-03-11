var baseUrl = 'https://testsjc20-portal01.revsw.net/'; // base URL
var login_admin = 'portal_qa_user_with_admin_perm@revsw.com'; // admin user
var password = 'password1'; // base password

var DashboardPage = function() {
  browser.driver.get(baseUrl);
};

DashboardPage.prototype = Object.create({}, {
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
  portalDashboardButton: {
    get: function() {
      return browser.driver.findElement(by.id("main_men_0"));
    }
  },
  portalDom0Panel: {
    get: function() {
      return browser.driver.findElement(by.id("domainDB0TitleLabel"));
    }
  },
  portalReportsChartBreakdown: {
    get: function() {
      return browser.driver.findElement(by.id("area_chart"));
    }
  },
  portalDashboardMap: {
    get: function() {
      return browser.driver.findElement(by.id("draggable-item3"));
    }
  },
  portalDashboardDevices: {
    get: function() {
      return browser.driver.findElement(by.id("draggable-item5"));
    }
  },
  portalDashboardPerformance: {
    get: function() {
      return browser.driver.findElement(by.id("draggable-item8"));
    }
  },
  portalDashboardBreakdown: {
    get: function() {
      return browser.driver.findElement(by.id("draggable-item9"));
    }
  },
  portalDashboardCountries: {
    get: function() {
      return browser.driver.findElement(by.id("draggable-item10"));
    }
  },
  portalDashboardCache: {
    get: function() {
      return browser.driver.findElement(by.id("draggable-item11"));
    }
  },
  portalDashboardDropArea: {
    get: function() {
      return browser.driver.findElement(by.xpath("//*[@class='rft_content_con']/div[3]"));
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

module.exports = DashboardPage;
module.exports.login_admin = login_admin;
module.exports.password = password;