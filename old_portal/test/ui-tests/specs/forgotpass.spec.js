'use strict';

var ForgotpassPage = require('../pages/forgotpass.page.js');

describe('forgot password test suite:', function() {

  var forgotpassPage = new ForgotpassPage();
  var forgotlink = '';

  it('test recovering a password', function() {
    browser.sleep(2000);
    forgotpassPage.forgotButton.click();
    browser.sleep(2000);
    expect(forgotpassPage.forgotModal.isDisplayed()).toBeTruthy();
    forgotpassPage.forgotInput.sendKeys(ForgotpassPage.login_reuser);
    forgotpassPage.forgotResetButton.click();
    browser.sleep(10000);
  });


  it('test receiving and updating the password', function() {
    browser.sleep(2000);

    var inbox = require("inbox");
    var client = inbox.createConnection(false, "imap.gmail.com", {
      secureConnection: true,
      auth: {
        user: ForgotpassPage.login_reuser,
        pass: ForgotpassPage.password
      },
      debug: false
    });

    client.connect();

    client.on("connect", function() {
      client.openMailbox("INBOX", function(error, mailbox) {
        if (error) throw error;
        client.listMessages(-1, function(error, messages) {
          if (error) throw error;
          var uid = messages[0]['UID'];
          process.stdin.setEncoding('utf8');
          var messageStream = client.createMessageStream(uid)
          var readable = messageStream;
          readable.on('data', function(chunk) {
            var text = chunk.toString();
            var ytre = /(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig;
            var resultArray = text.match(ytre);
            var i = 0;
            if (resultArray !== null) {
              for (i = 0; i < resultArray.length; i++) {
                if (resultArray[i].indexOf('forgot') + 1) {
                  forgotlink = resultArray[i];
                }
              };
              // for debug
              //console.log("Link 1: "+forgotlink);
              client.close();

              var date = new Date();
              var time = date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString();
              var newpass = 'pass' + time
              // for debug
              //console.log("New password: " + newpass);

              browser.driver.get(forgotlink);
              browser.sleep(2000);
              forgotpassPage.recoverPassNew.sendKeys(newpass);
              forgotpassPage.recoverPassCon.sendKeys(newpass);
              forgotpassPage.recoverButton.click();
              browser.sleep(10000);
              forgotpassPage.login(ForgotpassPage.login_reuser, newpass);
              forgotpassPage.logout();
            };
          });
        });
      });
    });
  });
});