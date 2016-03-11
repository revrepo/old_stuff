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
  describe('Add user', function () {

    var adminUser = config.get('portal.users.admin');

    beforeAll(function () {
      Portal.signIn(adminUser);
    });

    afterAll(function () {
      Portal.signOut();
    });

    beforeEach(function () {
      Portal.getUsersPage();
    });

    it('should display "Add user" form', function () {
      Portal.userListPage.clickAddNewUser();
      expect(Portal.addUserPage.isDisplayed()).toBeTruthy();
      expect(Portal.addUserPage.userForm.isDisplayed()).toBeTruthy();
    });

    it('should allow to cancel an user edition', function () {
      Portal.userListPage.clickAddNewUser();
      Portal.addUserPage.userForm.setEmail('something');
      Portal.addUserPage.clickCancel();
      expect(Portal.userListPage.isDisplayed()).toBeTruthy();
    });

    it('should create an user successfully when filling all required data',
      function () {
        // Create user
        var bruce = DataProvider.generateUser('Bruce');
        Portal.userListPage.clickAddNewUser();
        Portal.addUserPage.createUser(bruce);
        // Check App alert notifications
        expect(Portal.alerts.getAll().count()).toEqual(1);
        expect(Portal.alerts.getFirst().getText()).toEqual('User created');
        // Delete created user
        Portal.deleteUser(bruce);
      });
  });
});
