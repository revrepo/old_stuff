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
  describe('Add user', function () {

    var adminUser = config.get('portal.users.admin');

    beforeAll(function () {
    });

    afterAll(function () {
    });

    beforeEach(function () {
      Portal.signIn(adminUser);
      Portal.getUsersPage();
    });

    afterEach(function () {
      Portal.signOut();
    });

    it('should not create user when a required field is filled with blank ' +
      'space chars',
      function () {
        var emptyUserData = {};
        Portal.userListPage.clickAddNewUser();
        Portal.addUserPage.createUser(emptyUserData);
        var alert = Portal.alerts.getFirst();
        var expectedMessage = 'child "email" fails because ["email" is ' +
          'required]';
        expect(alert.getText()).toEqual(expectedMessage);
      });

    it('should not create user when the filled email is already used by ' +
      'another user',
      function () {
        var tom = DataProvider.generateUser('Tom');
        var jerry = DataProvider.generateUser('Jerry');
        jerry.email = tom.email;
        Portal.createUser(tom);
        Portal.userListPage.clickAddNewUser();
        Portal.addUserPage.createUser(jerry);
        var alert = Portal.alerts.getFirst();
        var expectedMessage = 'child "access_control_list" fails because ' +
          '["access_control_list" must be an object]';
        expect(alert.getText()).toEqual(expectedMessage);
        Portal.deleteUser(tom);
      });

    it('should display an error message when trying to create user without ' +
      'email',
      function () {
        var derek = DataProvider.generateUser('Derek');
        derek.email = '';
        Portal.userListPage.clickAddNewUser();
        Portal.addUserPage.createUser(derek);
        var alert = Portal.alerts.getFirst();
        var expectedMessage = 'child "email" fails because ["email" is ' +
          'required]';
        expect(alert.getText()).toEqual(expectedMessage);
      });

    it('should not create user when the email is not filled', function () {
      var andrew = DataProvider.generateUser('Andrew');
      andrew.email = '';
      Portal.createUser(andrew);
      Portal.userListPage.searcher.setSearchCriteria(andrew.firstName);
      var filteredRows = Portal.userListPage.userTbl.getRows().count();
      expect(filteredRows).toEqual(0);
    });

    it('should display an error message when trying to create user without ' +
      'first name',
      function () {
        var mathew = DataProvider.generateUser('Mathew');
        mathew.firstName = '';
        Portal.userListPage.clickAddNewUser();
        Portal.addUserPage.createUser(mathew);
        var alert = Portal.alerts.getFirst();
        var expectedMessage = 'child "firstname" fails because ["firstname" ' +
          'is required]';
        expect(alert.getText()).toEqual(expectedMessage);
      });

    it('should not create user when the "First Name" is not filled',
      function () {
        var michael = DataProvider.generateUser('Michael');
        michael.firstName = '';
        Portal.createUser(michael);
        Portal.userListPage.searcher.setSearchCriteria(michael.email);
        var filteredRows = Portal.userListPage.userTbl.getRows().count();
        expect(filteredRows).toEqual(0);
      });

    it('should display an error message when trying to create user without ' +
      'last name',
      function () {
        var frank = DataProvider.generateUser('Frank');
        frank.firstName = '';
        Portal.userListPage.clickAddNewUser();
        Portal.addUserPage.createUser(frank);
        var alert = Portal.alerts.getFirst();
        var expectedMessage = 'child "firstname" fails because ["firstname" ' +
          'is required]';
        expect(alert.getText()).toEqual(expectedMessage);
      });

    it('should not create user  when the "Last Name" is not filled',
      function () {
        var bruce = DataProvider.generateUser('Bruce');
        bruce.firstName = '';
        Portal.createUser(bruce);
        Portal.userListPage.searcher.setSearchCriteria(bruce.email);
        var filteredRows = Portal.userListPage.userTbl.getRows().count();
        expect(filteredRows).toEqual(0);
      });

    it('should display an error message when trying to create user without ' +
      'any role',
      function () {
        var scott = DataProvider.generateUser('Scott');
        delete scott.role;
        Portal.userListPage.clickAddNewUser();
        Portal.addUserPage.createUser(scott);
        var alert = Portal.alerts.getFirst();
        var expectedMessage = 'child "role" fails because ["role" is required]';
        expect(alert.getText()).toEqual(expectedMessage);
      });

    it('should not create user  when no "Role" is selected', function () {
      var bruno = DataProvider.generateUser('Bruno');
      delete bruno.role;
      Portal.createUser(bruno);
      Portal.userListPage.searcher.setSearchCriteria(bruno.email);
      var filteredRows = Portal.userListPage.userTbl.getRows().count();
      expect(filteredRows).toEqual(0);
    });

    it('should display an error message when trying to create user without ' +
      'password',
      function () {
        var brian = DataProvider.generateUser('Brian');
        delete brian.password;
        Portal.userListPage.clickAddNewUser();
        Portal.addUserPage.createUser(brian);
        var alert = Portal.alerts.getFirst();
        var expectedMessage = 'Passwords did not match';
        expect(alert.getText()).toEqual(expectedMessage);
      });

    it('should display an error message when trying to create user without ' +
      '"Confirmation Password"',
      function () {
        var joe = DataProvider.generateUser('Joe');
        delete joe.passwordConfirm;
        Portal.userListPage.clickAddNewUser();
        Portal.addUserPage.createUser(joe);
        var alert = Portal.alerts.getFirst();
        var expectedMessage = 'Passwords did not match';
        expect(alert.getText()).toEqual(expectedMessage);
      });

    it('should display an error message when creating user when "Password" ' +
      'and "Confirmation Password" do not match',
      function () {
        var vincent = DataProvider.generateUser('Vincent');
        vincent.password = 'something';
        vincent.passwordConfirm = 'different';
        Portal.userListPage.clickAddNewUser();
        Portal.addUserPage.createUser(vincent);
        var alert = Portal.alerts.getFirst();
        var expectedMessage = 'Passwords did not match';
        expect(alert.getText()).toEqual(expectedMessage);
      });
  });
});
