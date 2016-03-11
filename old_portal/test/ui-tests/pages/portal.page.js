var baseUrl = 'https://testsjc20-portal01.revsw.net/'; // base URL
var login_admin = 'portal_qa_user_with_admin_perm@revsw.com'; // admin user
var password = 'password1'; // base password
var passwordNew = 'password2'; // new password

var PortalPage = function() {
  browser.driver.get(baseUrl);
};

PortalPage.prototype = Object.create({}, {

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
  portalAvatar: {
    get: function() {
      return browser.driver.findElement(by.id("avatarImage"));
    }
  },
  portalSettings: {
    get: function() {
      return browser.driver.findElement(by.id("userSettings"));
    }
  },
  portalLinkDashboard: {
    get: function() {
      return browser.driver.findElement(by.id("main_men_0"));
    }
  },
  portalLinkReports: {
    get: function() {
      return browser.driver.findElement(by.id("main_men_1"));
    }
  },
  portalLinkConfigure: {
    get: function() {
      return browser.driver.findElement(by.id("main_men_2"));
    }
  },
  portalLinkTest: {
    get: function() {
      return browser.driver.findElement(by.id("main_men_3"));
    }
  },
  portalDom0Panel: {
    get: function() {
      return browser.driver.findElement(by.css("div.sectionHeader.panel-heading"));
    }
  },
  portalDom0Title: {
    get: function() {
      return browser.driver.findElement(by.css("div.tTitleContainer.pointer"));
    }
  },
  portalDom0Triang: {
    get: function() {
      return browser.driver.findElement(by.css("div.tTriangle"));
    }
  },
  portalDom0Icon: {
    get: function() {
      return browser.driver.findElement(by.css("div.tIcon"));
    }
  },
  portalDom0Label: {
    get: function() {
      return browser.driver.findElement(by.css("div.tLabel"));
    }
  },
  portalDom0RefreshIcon: {
    get: function() {
      return browser.driver.findElement(by.css("div.refreshIcon.pointer"));
    }
  },
  portalSettingsDialog: {
    get: function() {
      return browser.driver.findElement(by.css("#dialogLabel"));
    }
  },
  portalSettingsFName: {
    get: function() {
      return browser.driver.findElement(by.css("li.list-group-item.change_fname_li"));
    }
  },
  portalSettingsLName: {
    get: function() {
      return browser.driver.findElement(by.css("li.list-group-item.change_lname_li"));
    }
  },
  portalSettingsPassword: {
    get: function() {
      return browser.driver.findElement(by.css("li.list-group-item.change_password_li"));
    }
  },
  portalSettingsTheme: {
    get: function() {
      return browser.driver.findElement(by.css("li.list-group-item.change_theme_li"));
    }
  },
  portalSettingsFNameEdit: {
    get: function() {
      return browser.driver.findElement(by.xpath("//button[@data-act='fname']"));
    }
  },
  portalSettingsLNameEdit: {
    get: function() {
      return browser.driver.findElement(by.xpath("//button[@data-act='lname']"));
    }
  },
  portalSettingsPasswordEdit: {
    get: function() {
      return browser.driver.findElement(by.xpath("//button[@data-act='pswd']"));
    }
  },
  portalSettingsThemeEdit: {
    get: function() {
      return browser.driver.findElement(by.xpath("//button[@data-act='theme']"));
    }
  },
  portalSettingsFNameText: {
    get: function() {
      return browser.driver.findElement(by.css("span.change_fname_sp.s_p"));
    }
  },
  portalSettingsLNameText: {
    get: function() {
      return browser.driver.findElement(by.css("span.change_lname_sp.s_p"));
    }
  },
  portalSettingsFNameForm: {
    get: function() {
      return browser.driver.findElement(by.css("input.form-control.input-sm.upd_fname"));
    }
  },
  portalSettingsLNameForm: {
    get: function() {
      return browser.driver.findElement(by.css("input.form-control.input-sm.upd_lname"));
    }
  },
  portalSettingsPasswordFormOld: {
    get: function() {
      return browser.driver.findElement(by.name("password"));
    }
  },
  portalSettingsPasswordFormNew: {
    get: function() {
      return browser.driver.findElement(by.name("newPassword"));
    }
  },
  portalSettingsPasswordFormCon: {
    get: function() {
      return browser.driver.findElement(by.name("conPassword"));
    }
  },
  portalSettingsFNameChange: {
    get: function() {
      return browser.driver.findElement(by.css("input.btn.btn-primary.btn-sm.btn_change_fname"));
    }
  },
  portalSettingsLNameChange: {
    get: function() {
      return browser.driver.findElement(by.css("input.btn.btn-primary.btn-sm.btn_change_lname"));
    }
  },
  portalSettingsPasswordChange: {
    get: function() {
      return browser.driver.findElement(by.css("input.btn.btn-primary.btn-sm.btn-change-password"));
    }
  },
  portalSettingsThemeChange: {
    get: function() {
      return browser.driver.findElement(by.css("input.btn.btn-primary.btn-sm.btn_change_theme"));
    }
  },
  portalSettingsThemeSelector: {
    get: function() {
      return browser.driver.findElement(by.css("select.form-control.input-sm.chng_theme_sel"));
    }
  },
  portalSettingsThemeSelectorDark: {
    get: function() {
      return browser.driver.findElement(by.xpath("//option[@value='dark']"));
    }
  },
  portalSettingsThemeCancel: {
    get: function() {
      return browser.driver.findElement(by.xpath("(//input[@value='Cancel'])[4]"));
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

module.exports = PortalPage;
module.exports.login_admin = login_admin;
module.exports.password = password;
module.exports.passwordNew = passwordNew;