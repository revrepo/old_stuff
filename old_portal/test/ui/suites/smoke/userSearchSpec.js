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

describe('Smoke', function () {
  describe('User search', function () {

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

    it('should be displayed when displaying User List page', function () {
      var searchField = Portal.userListPage.searcher.getSearchCriteriaTxtIn();
      expect(searchField.isPresent()).toBeTruthy();
    });

    it('should filter items according to text filled', function () {
      var emailToSearch = Portal.userListPage.userTbl
        .getFirstRow()
        .getEmail();
      Portal.userListPage.searcher.setSearchCriteria(emailToSearch);
      var allRows = Portal.userListPage.userTbl.getRows();
      expect(allRows.count()).toEqual(1);
    });
  });
});
