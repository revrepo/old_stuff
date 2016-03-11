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

describe('Negative', function () {
  describe('User pagination', function () {

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

    // TODO: Spec fails due to the bug: Next button is enabled in empty list
    it('should not go to the next page when there is not any user to show',
      function () {
        var uniqueString = 'unique_string_' + (new Date()).getTime();
        Portal.userListPage.searcher.setSearchCriteria(uniqueString);
        var currentPage = Portal.userListPage.pager.getCurrentPageIndex();
        Portal.userListPage.pager.clickNext();
        var newCurrentPage = Portal.userListPage.pager.getCurrentPageIndex();
        expect(currentPage).toEqual(newCurrentPage);
        Portal.userListPage.searcher.clearSearchCriteria();
      });

    // TODO: spec fails due to bug: More than one page is showed in empty list
    it('should show only the first page button when the search criteria does' +
      'not match with any word in the "User List"',
      function () {
        var uniqueString = 'unique_string_' + (new Date()).getTime();
        var availablePages = Portal.userListPage.pager
          .getAllPageIndexButtons()
          .count();
        Portal.userListPage.searcher.setSearchCriteria(uniqueString);
        var filteredPages = Portal.userListPage.pager
          .getAllPageIndexButtons()
          .count();
        expect(availablePages).toBeGreaterThan(1);
        expect(filteredPages).toEqual(1);
        expect(availablePages).toBeGreaterThan(filteredPages);
        Portal.userListPage.searcher.clearSearchCriteria();
      });

    it('should display the "Previous Page" disabled after filtering does not ' +
      'return any users in the "User List"',
      function () {
        var uniqueString = 'unique_string_' + (new Date()).getTime();
        Portal.userListPage.searcher.setSearchCriteria(uniqueString);
        expect(Portal.userListPage.pager.isPreviousBtnDisabled()).toBeTruthy();
        Portal.userListPage.searcher.clearSearchCriteria();
      });

    // TODO: Spec fails due to the bug: Next button is enabled in empty list
    it('should display the "Next Page" disabled after filtering does not ' +
      'return any users in the "User List"',
      function () {
        var uniqueString = 'unique_string_' + (new Date()).getTime();
        Portal.userListPage.searcher.setSearchCriteria(uniqueString);
        expect(Portal.userListPage.pager.isNextBtnDisabled()).toBeTruthy();
        Portal.userListPage.searcher.clearSearchCriteria();
      });
  });
});
