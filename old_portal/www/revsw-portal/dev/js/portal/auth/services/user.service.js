(function () {
  'use strict';

  angular
    .module('revapm.Portal.Auth')
    .factory('User', User);

  /*@ngInject*/
  function User($localStorage, $http, $config, $q, Domains) {

    /**
     * List of Users domains
     * @type {Array}
     */
    var domains = [];

    /**
     * Domain that should be selected
     *
     * @type {object|null}
     */
    var domainSelected = null;

    /**
     * Clear all details from localstorage
     */
    function clearAll() {
      if (!localStorage) {
        return;
      }
      localStorage.clear();
    }

    /**
     * Get token from localStorage
     *
     * @returns {string|boolean}
     */
    function getToken() {
      return $localStorage.Authorization || false;
    }

    /**
     * Set new auth token into localStorage
     *
     * @param {string} token
     */
    function setToken(token) {
      if (!token) {
        return;
      }
      $localStorage.Authorization = token;
    }

    /**
     * Check if user authorized
     *
     * @returns {boolean}
     */
    function isAuthed() {
      var token = getToken();
      if (token) {
        // parse or something
        return true;
      } else {
        return false;
      }
    }

    /**
     * Will add an `Authorization` header for application
     *
     * @param {string} token
     */
    function addAuthHeaderForAPI(token) {
      $localStorage.Authorization = 'Bearer ' + token;
      $http.defaults.headers.common.Authorization = 'Bearer ' + token;
      $http.defaults.headers.common['Content-Type'] = 'application/json';
    }

    /**
     * Will remove `Authorization` header from application
     */
    function clearAuthHeaderForAPI() {
      $localStorage.Authorization = undefined;
      delete $http.defaults.headers.common['Authorization'];
    }

    /**
     * Method to login
     *
     * @throws Error
     * @param {string} email
     * @param {string} password
     * @param {string?} [oneTimePassword]
     * @returns {Promise}
     */
    function login(email, password, oneTimePassword) {
      if (!email || !password) {
        throw new Error('Please fill email and password');
      }
      // Create data that will be sent to login
      var authData = {
        email: email,
        password: password
      };
      //Check and add one time password
      if (oneTimePassword) {
        authData.oneTimePassword = oneTimePassword;
      }
      return $http.post($config.API_URL + '/authenticate', authData).then(function (data) {
        if (data.status === $config.STATUS.OK) {
          setToken(data.data.token);
          addAuthHeaderForAPI(data.data.token);
          return $http.get($config.API_URL + '/users/myself')
            .then(function (data) {
              if (data && data.status === $config.STATUS.OK) {
                // Success
                var res = data.data;
                // Check roles
                if (res.role != $config.ROLE.USER &&
                  res.role !== $config.ROLE.ADMIN &&
                  res.role !== $config.ROLE.RESELLER) {
                  // do not have permission
                  throw new Error('You do not have permission');
                }
                // Store data
                $localStorage.isLoggedIn = true;
                $localStorage.isCAdmin = true;
                //$localStorage.isAdmin = res.is_admin;
                $localStorage.user = res;
              } else {
                // Something went wrong
                throw new Error(data.response);
              }
              return data;
            });
        }
        return data;
      }).catch(function (err) {
        clearAuthHeaderForAPI();
        return $q.reject(err);
      });
    }

    /**
     * Log user out and clear LocalStorage
     */
    function logout() {
      setToken(); // set token to undefined
      // Clear user
      $localStorage.user = undefined;
      clearAuthHeaderForAPI();
      clearAll();
    }

    /**
     * Load user details from localStorage
     *
     * @returns {object|null}
     */
    function getUser() {
      return $localStorage.user || null;
    }

    /**
     * Check if user is admin
     *
     * @returns {boolean}
     */
    function isAdmin() {
      var user = getUser();
      return Boolean(isAuthed() && user && user.role === $config.ROLE.ADMIN);
    }

    /**
     * Check if user is reseller
     *
     * @returns {boolean}
     */
    function isReseller() {
      var user = getUser();
      return Boolean(isAuthed() && user && user.role === $config.ROLE.RESELLER);
    }

    /**
     * Check if user has user role
     *
     * @returns {boolean}
     */
    function isUser() {
      var user = getUser();
      return Boolean(isAuthed() && user && user.role === $config.ROLE.USER);
    }

    /**
     * Reload user details
     * @returns {*}
     */
    function reloadUser() {
      return $http.get($config.API_URL + '/users/myself')
        .then(function (data) {
          if (data && data.status === $config.STATUS.OK) {
            $localStorage.user = data.data;
          } else {
            // Something went wrong
            throw new Error(data.response);
          }
          return data;
        });
    }

    /**
     * Forgot password foor email
     *
     * @param {string} email
     */
    function forgotPassword(email) {
      return $http.post($config.API_URL + '/forgot', {email: email})
        .then(function (data) {
          if (data && data.status !== $config.STATUS.OK) {
            // Something went wrong
            throw new Error(data.response);
          }
          return data;
        });
    }

    /**
     * Reset password
     *
     * @param {string} token
     * @param {string} password
     * @returns {Promise}
     */
    function resetPassword(token, password) {
      return $http.post($config.API_URL + '/reset/' + token, {password: password})
        .then(function (data) {
          if (data && data.status !== $config.STATUS.OK) {
            // Something went wrong
            throw new Error(data.response);
          }
          return data;
        });
    }

    /**
     * Update current users password
     *
     * @throws Error is user not authed
     * @param {string} currentPassword
     * @param {string} newPassword
     * @returns {Promise}
     */
    function updatePassword(currentPassword, newPassword) {
      var user = getUser();
      if (!isAuthed() || !user.user_id) {
        throw new Error('User not authentificated');
      }
      return $http.put($config.API_URL + '/users/password/' + user.user_id, {
        current_password: currentPassword,
        new_password: newPassword
      }).then(function (data) {
        if (data && data.status !== $config.STATUS.OK) {
          throw new Error(data.response);
        }
        // Update auth headers
        //addAuthHeaderForAPI(user.email, newPassword);
        login(user.email, newPassword);
        return data;
      });
    }

    /**
     * Load user domains
     * @param {boolean} reload
     * @returns {Promise}
     */
    function getUserDomains(reload) {
      return $q(function (resolve, reject) {
        if (domains && domains.length > 0 && !reload) {
          return resolve(domains);
        }
        Domains.query()
          .$promise
          .then(function (data) {
            domains = data;
            resolve(domains);
          })
          .catch(function (err) {
            domains = [];
            resolve(domains);
          });
      }.bind(this));
    }

    /**
     * Select domain
     * @param {object|null} domain
     */
    function selectDomain(domain) {
      domainSelected = domain;
    }

    /**
     * Get domain selected by user
     *
     * @returns {Object|null}
     */
    function getSelectedDomain() {
      return domainSelected;
    }

    return {

      getToken: getToken,

      setToken: setToken,

      isAuthed: isAuthed,

      login: login,

      logout: logout,

      getUser: getUser,

      isAdmin: isAdmin,

      isReseller: isReseller,

      isUser: isUser,

      reloadUser: reloadUser,

      forgotPassword: forgotPassword,

      resetPassword: resetPassword,

      updatePassword: updatePassword,

      getUserDomains: getUserDomains,

      selectDomain: selectDomain,

      getSelectedDomain: getSelectedDomain
    };
  }
})();
