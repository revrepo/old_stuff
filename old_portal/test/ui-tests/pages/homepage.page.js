var baseUrl = 'https://testsjc20-portal01.revsw.net/'; // base URL
var login_admin = 'portal_qa_user_with_admin_perm@revsw.com'; // admin user
var login_user = 'portal_qa_user_with_user_perm@revsw.com'; // user user
var login_revadmin = 'portal_qa_user_with_rev-admin_perm@revsw.com'; // rev-admin user
var login_reseller = 'portal_qa_user_with_reseller_perm@revsw.com'; // reseller user
var password = 'password1'; // base password

// alert texts for checking
var alertTextInvalidBoth = 'Please send valid email & password'; 
var alertTextInvalidPass = 'Please send valid password';
var alertTextInvalidNull = 'Email & Password should not be blank!';
var alertTextInvalidSpecial = 'Please send valid email & password.';

var HomePage = function() {
  browser.driver.get(baseUrl);
};

HomePage.prototype = Object.create({}, {

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
  forgotButton: {
    get: function() {
      return browser.driver.findElement(by.id('forgot_password'));
    }
  },
  forgotModal: {
    get: function() {
      return browser.driver.findElement(by.css('div.modal-content'));
    }
  },
  alertInfo: {
    get: function() {
      return browser.driver.findElement(by.css('div.alert.flash_messages.fade.in.alert-info'));
    }
  },
  closeButton: {
    get: function() {
      return browser.driver.findElement(by.xpath("//div[@class='modal-content']/div/button"));
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
  },

  // module for positive login tests
  loginValid: {
    value: function(email, password) {
      this.login(email, password);
      this.logout();
    }
  },

  // module for negative login tests
  loginInvalid: {
    value: function(email, password, alert) {
      this.login(email, password);
      browser.sleep(2000);
      expect(this.alertInfo.isDisplayed()).toBeTruthy();
      expect(this.alertInfo.getText()).toEqual(alert);
      browser.sleep(10000);
    }
  },

  // module for basic test of password recovery elements
  forgotPassword: {
    value: function() {
      browser.sleep(2000);
      this.forgotButton.click();
      browser.sleep(2000);
      expect(this.forgotModal.isDisplayed()).toBeTruthy();
      this.closeButton.click();
      browser.sleep(1000);
    }
  }
});

module.exports = HomePage;
module.exports.login_admin = login_admin;
module.exports.login_user = login_user;
module.exports.login_revadmin = login_revadmin;
module.exports.login_reseller = login_reseller;
module.exports.password = password;
module.exports.alertTextInvalidBoth = alertTextInvalidBoth;
module.exports.alertTextInvalidPass = alertTextInvalidPass;
module.exports.alertTextInvalidNull = alertTextInvalidNull;
module.exports.alertTextInvalidSpecial = alertTextInvalidSpecial;