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

// # Constants

// This object stores constant values that are used widely in the application.
//
// These values could be:
//  * Labels
//  * URL Hash fragment
//  * Others
var Constants = {
  hashFragments: {
    users: '#/users',
    profile: '#/profile'
  },
  header: {
    appMenu: {
      ACCOUNT_SETTINGS: 'Account Settings',
      ANALYTICS: 'Analytics',
      HELP_SUPPORT: 'Help/Support',
      WEB: 'Web'
    },
    userMenu: {
      UPDATE_PASSWORD: 'Update password',
      SECURITY_SETTINGS: 'Security settings',
      LOGOUT: 'Logout'
    }
  },
  sideBar: {
    menu: {
      USERS: 'Users',
      UPDATE_PASSWORD: 'Update Password',
      SECURITY_SETTINGS: 'Security Settings',
      ACTIVITY_LOG: 'Activity Log'
    }
  },
  user: {
    roles: {
      ADMIN: 'admin',
      USER: 'user'
    },
    accessControls: {
      DASHBOARD: 'Dashboard',
      REPORTS: 'Reports',
      CONFIGURE: 'Configure',
      TEST: 'Test',
      READ_ONLY: 'Read only'
    }
  }
};

module.exports = Constants;