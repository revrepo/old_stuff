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

// # Data Provider object

// Requiring constants object
var Constants = require('./../../page_objects/constants');

// This `DataProvider` object abstracts all data generation process for all
// object-data used in the application. In this way, we facilitate the test
// data generation.
var DataProvider = {

  /**
   * ### DataProvider.generateUser()
   *
   * Generates user data object based on the unique para that it requires.
   *
   * @param {string} prefix, the prefix value to use in all user data fields
   *
   * @returns {Object}, generate user data with the following schema:
   *
   *     {
   *         email: string,
   *         firstName: string,
   *         lastName: string,
   *         role: string,
   *         password: string,
   *         passwordConfirm: string
   *     }
   */
  generateUser: function (prefix) {
    var prefixEmail= prefix.toLowerCase().replace(' ', '_');
    var names = prefix.split(' ');
    var prefixFirstName = names[0];
    var prefixLastName = names[0] || names[1];
    var timestamp = (new Date()).getTime();
    return {
      email: prefixEmail + '_' + timestamp + '@ui-test-email.com',
      firstName: prefixFirstName + ' Fname',
      lastName: prefixLastName + ' Lname',
      role: Constants.user.roles.USER,
      password: 'password1',
      passwordConfirm: 'password1'
    };
  }
};

module.exports = DataProvider;