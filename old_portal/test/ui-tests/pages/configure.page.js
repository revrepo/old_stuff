var baseUrl = 'https://testsjc20-portal01.revsw.net/'; // base URL
var login_admin = 'portal_qa_user_with_admin_perm@revsw.com'; // admin user
var password = 'password1'; // base password

var ConfigurePage = function() {
  browser.driver.get(baseUrl);
};

ConfigurePage.prototype = Object.create({}, {
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
  portalConfigureButton: {
    get: function() {
      return browser.driver.findElement(by.id("main_men_2"));
    }
  },
  portalDom0Panel: {
    get: function() {
      return browser.driver.findElement(by.id("domainCon0TitleLabel"));
    }
  },
  portalConfigureDomain: {
    get: function() {
      return browser.driver.findElement(by.id("traffic"));
    }
  },
  portalConfigureContent: {
    get: function() {
      return browser.driver.findElement(by.id("contentOp"));
    }
  },
  portalConfigureCDN: {
    get: function() {
      return browser.driver.findElement(by.id("cache"));
    }
  },
  portalConfigureSecurity: {
    get: function() {
      return browser.driver.findElement(by.id("security"));
    }
  },
  portalConfigureDomainContent: {
    get: function() {
      return browser.driver.findElement(by.css("div.traffic_inn.item.active"));
    }
  },
  portalConfigureContentContent: {
    get: function() {
      return browser.driver.findElement(by.css("div.content_inn.item.active"));
    }
  },
  portalConfigureCDNContent: {
    get: function() {
      return browser.driver.findElement(by.css("div.cache_inn.item.active"));
    }
  },
  portalConfigureSecurityContent: {
    get: function() {
      return browser.driver.findElement(by.css("div.security_inn.item.active"));
    }
  },
  portalConfigureDomainSave: {
    get: function() {
      return browser.driver.findElement(by.id("clicker1"));
    }
  },
  portalConfigureContentSave: {
    get: function() {
      return browser.driver.findElement(by.id("clicker2"));
    }
  },
  portalConfigureCDNSave: {
    get: function() {
      return browser.driver.findElement(by.id("clicker3"));
    }
  },
  portalConfigureSecuritySave: {
    get: function() {
      return browser.driver.findElement(by.id("clicker4"));
    }
  },
  portalConfigureSecuritySaveY: {
    get: function() {
      return browser.driver.findElement(by.xpath("//*[@id='security']/div/div[2]/div[3]/img[1]"));
    }
  },
  portalConfigureSecuritySaveN: {
    get: function() {
      return browser.driver.findElement(by.xpath("//*[@id='security']/div/div[2]/div[3]/img[2]"));
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
      browser.sleep(2000);
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

module.exports = ConfigurePage;
module.exports.login_admin = login_admin;
module.exports.password = password;