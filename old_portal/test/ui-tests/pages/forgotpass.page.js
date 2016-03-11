var baseUrl = 'https://testsjc20-portal01.revsw.net/'; // base URL
var login_reuser = 'revswqa@gmail.com'; // recovered user
var password = 'revswqa1'; // mailbox password

var ForgotpassPage = function() {
  browser.driver.get(baseUrl);
};

ForgotpassPage.prototype = Object.create({}, {

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
  forgotInput: {
    get: function() {
      return browser.driver.findElement(by.css('input.form-control.input-sm.frgt_pwd_email'));
    }
  },
  forgotResetButton: {
    get: function() {
      return browser.driver.findElement(by.css('button.btn.btn-primary.btn-sm.btn-forgot-password'));
    }
  },
  recoverPassNew: {
    get: function() {
      return browser.driver.findElement(by.css("input.form-control.newPassword.input-sm"));
    }
  },
  recoverPassCon: {
    get: function() {
      return browser.driver.findElement(by.css("input.form-control.conPassword.input-sm"));
    }
  },
  recoverButton: {
    get: function() {
      return browser.driver.findElement(by.css("input.btn.btn-primary.btn-sm.btn-change-password.btn-change-pwd"));
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

module.exports = ForgotpassPage;
module.exports.login_reuser = login_reuser;
module.exports.password = password;