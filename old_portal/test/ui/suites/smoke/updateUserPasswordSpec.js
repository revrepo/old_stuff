/*************************************************************************
 *
 * REV SOFTWARE CONFIDENTIAL
 *
 * [2013] - [2015] Rev Software, Inc.
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Rev Software, Inc. and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Rev Software, Inc.
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Rev Software, Inc.
 */

var config = require('config');
var Portal = require('./../../page_objects/portal');
var DataProvider = require('./../../common/providers/data');

describe('Smoke', function () {
  describe('Update user password', function () {

    var adminUser = config.get('portal.users.admin');

    beforeAll(function () {
      Portal.signIn(adminUser);
    });

    afterAll(function () {
      Portal.signOut();
    });

    beforeEach(function () {
      Portal.goToUpdatePassword();
    });

    it('should display updated password form', function () {
      expect(Portal.updatePasswordPage.isDisplayed()).toBeTruthy();
    });

    it('should update password successfully', function () {
      var carl = DataProvider.generateUser('Carl');
      var newPassword = 'password2';
      Portal.createUser(carl);
      Portal.signOut();
      Portal.signIn(carl);
      Portal.goToUpdatePassword();
      Portal.updatePasswordPage.setCurrentPassword(carl.password);
      Portal.updatePasswordPage.setNewPassword(newPassword);
      Portal.updatePasswordPage.setPasswordConfirm(newPassword);
      Portal.updatePasswordPage.clickUpdatePassword();
      var alert = Portal.alerts.getFirst();
      expect(alert.getText()).toEqual('Your password updated');
      Portal.signOut();
      Portal.signIn(adminUser);
      Portal.deleteUser(carl);
    });
  });
});
