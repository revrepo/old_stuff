var baseUrl = 'https://testsjc20-portal01.revsw.net/'; // base URL
var login_user = 'portal_qa_user_with_user_perm@revsw.com'; // user user
var login_admin = 'portal_qa_user_with_admin_perm@revsw.com'; // admin user
var password = 'password1'; // base password

var CAdminPage = function() {
  browser.driver.get(baseUrl);
};

CAdminPage.prototype = Object.create({}, {

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
  cadminSettingsUsers: {
    get: function() {
      return browser.driver.findElement(by.id("users"));
    }
  },
  cadminSettingsDomains: {
    get: function() {
      return browser.driver.findElement(by.css("li.domains_li"));
    }
  },
  cadminSettingsPurge: {
    get: function() {
      return browser.driver.findElement(by.css("li.purge_li"));
    }
  },
  cadminBackLink: {
    get: function() {
      return browser.driver.findElement(by.css("a.Backtoportal.Back_portal"));
    }
  },
  cadminLogoutLink: {
    get: function() {
      return browser.driver.findElement(By.id("log_out"));
    }
  },



  login: {
    value: function(email, password) {
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
  },



});

module.exports = CAdminPage;
module.exports.login_admin = login_admin;
module.exports.login_user = login_user;
module.exports.password = password;
