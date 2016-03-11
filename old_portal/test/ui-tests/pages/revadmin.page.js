var baseUrl = 'https://testsjc20-portal01.revsw.net/'; // base URL
var login_admin = 'portal_qa_user_with_admin_perm@revsw.com'; // admin user
var login_user = 'portal_qa_user_with_user_perm@revsw.com'; // user user
var login_revadmin = 'portal_qa_user_with_rev-admin_perm@revsw.com'; // rev-admin user
var login_reseller = 'portal_qa_user_with_reseller_perm@revsw.com'; // reseller user
var password = 'password1'; // base password

var RevAdminPage = function() {
  browser.driver.get(baseUrl + "admin");
};

RevAdminPage.prototype = Object.create({}, {

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
      return browser.driver.findElement(by.id("companies"));
    }
  },
  portalCompanies: {
    get: function() {
      return browser.driver.findElement(by.css("i.glyphicon.glyphicon-tower"));
    }
  },
  portalUsers: {
    get: function() {
      return browser.driver.findElement(by.css("i.glyphicon.glyphicon-user"));
    }
  },
  portalDomains: {
    get: function() {
      return browser.driver.findElement(by.css("i.glyphicon.glyphicon-cloud"));
    }
  },
  portalPurge: {
    get: function() {
      return browser.driver.findElement(by.css("i.glyphicon.glyphicon-minus"));
    }
  },
  portalGroups: {
    get: function() {
      return browser.driver.findElement(by.css("i.glyphicon.glyphicon-tasks"));
    }
  },
  revadminLogoutLink: {
    get: function() {
      return browser.driver.findElement(By.id("logout"));
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
  }
});

module.exports = RevAdminPage;
module.exports.login_admin = login_admin;
module.exports.login_user = login_user;
module.exports.login_revadmin = login_revadmin;
module.exports.login_reseller = login_reseller;
module.exports.password = password;