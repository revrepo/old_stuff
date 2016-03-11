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

describe('Negative', function () {
  describe('Edit user', function () {

    var adminUser = config.get('portal.users.admin');
    var carl = DataProvider.generateUser('Carl');

    beforeAll(function () {
      Portal.signIn(adminUser);
      Portal.createUser(carl);
      Portal.signOut();
    });

    afterAll(function () {
      Portal.signIn(adminUser);
      Portal.deleteUser(carl);
      Portal.signOut();
    });

    beforeEach(function () {
      Portal.signIn(adminUser);
      Portal.getUsersPage();
    });

    afterEach(function () {
      Portal.signOut();
    });

    it('should not allow to edit the user\'s email', function () {
      Portal.userListPage.searchAndClickEdit(carl.email);
      var emailField = Portal.editUserPage.userForm.getEmailTxtIn();
      expect(emailField.isEnabled()).not.toBeTruthy();
    });

    it('should display an error message when trying to edit user without ' +
      '"First Name"',
      function () {
        Portal.userListPage.searchAndClickEdit(carl.email);
        Portal.editUserPage.userForm.clearFirstName();
        Portal.editUserPage.clickUpdateUser();
        var alert = Portal.alerts.getFirst();
        var expectedMessage = 'child "firstname" fails because ["firstname" ' +
          'is not allowed to be empty]';
        expect(alert.getText()).toEqual(expectedMessage);
      });

    it('should display an error message when trying to edit user without ' +
      '"Last Name"',
      function () {
        Portal.userListPage.searchAndClickEdit(carl.email);
        Portal.editUserPage.userForm.clearLastName();
        Portal.editUserPage.clickUpdateUser();
        var alert = Portal.alerts.getFirst();
        var expectedMessage = 'child "lastname" fails because ["lastname" ' +
          'is not allowed to be empty]';
        expect(alert.getText()).toEqual(expectedMessage);
      });

    it('should display an error message when trying to edit user without ' +
      '"Role"',
      function () {
        Portal.userListPage.searchAndClickEdit(carl.email);
        Portal.editUserPage.userForm.setRole('--- Select role ---');
        Portal.editUserPage.clickUpdateUser();
        var alert = Portal.alerts.getFirst();
        var expectedMessage = 'child "role" fails because ["role" must be ' +
          'a string]';
        expect(alert.getText()).toEqual(expectedMessage);
      });
  });
});
