var request = require('request');
var Promise = require('promise');

var api = function (config) {
  var self = this;
  
  self.api_url = config.api;
  self.username = config.admin_username;
  self.password = config.admin_password;
  

  /**
   * Searches for a User with the login spcified, if found, then tries 
   * to look up its AccessKey. Returns false if the User or AccessKey 
   * were not found.
   */
  self.findUserAccessKey = function (login) {
    var options = {
      method: 'GET', uri: self.api_url + '/user',
      qs: { login: login }
    };

    return self.promiseRequest(options, self.parseArrayResult)
               .then(self.getAccessKey);
  };
  
  /**
   * Returns the first AccessKey.key value it finds for the specified User
   */
  self.getAccessKey = function (user) {
    if (!user)
      return false;

    var options = {
      method: 'GET', uri: self.api_url + '/user/' + user.id + '/accesskey'
    };

    return self.promiseRequest(options, self.parseArrayResult);
  }

  /**
   * Creates a new User, Network and AccessKey, binds them all together
   * and returns the AccessKey if everything went ok.
   */
  self.createAndInitUser = function (email) {
    var options = {
      method: 'POST', uri: self.api_url + '/user',
      json: {
        status: 0,
        role: 1,
        login: email,
        password: ""
      }
    };
    
    return self.promiseRequest(options, self.parseResultWithId)
               .then(self.createNetwork.bind(null, email));
  };
  
  /**
   * Creates a new Network and assignes it to a User
   */
  self.createNetwork = function (email, user) {
    // put user's email here, we'll use it to give concise names to network and AccessKey
    user.email = email; 

    var options = {
      method: 'POST', uri: self.api_url + '/network',
      json: {
        name: "Sample network for " + user.email
      },
    };

    return self.promiseRequest(options, self.parseResultWithId)
               .then(self.assignNetwork.bind(null, user));
  };
  
  /**
   * Assigns Network to the User
   */
  self.assignNetwork = function (user, network) {
    var assignOptions = {
      method: 'PUT', uri: self.api_url + '/user/' + user.id + '/network/' + network.id,
      form: {}
    };
    
    return self.promiseRequest(assignOptions, self.parseEmptyResult)
               .then(self.createAccessKey.bind(null, user, network));
  };
  
  /**
   * Creates an AccessKey for the user
   */
  self.createAccessKey = function (user, allowedNetwork) {
    var options = {
      method: 'POST', uri: self.api_url + '/user/' + user.id + '/accesskey',
      json: {
        type: 0,
        label: 'Default access token for ' + user.email,
        permissions: [
          {
            networkIds: [allowedNetwork.id]
          }
        ]
      }
    };

    return self.promiseRequest(options, self.parseResultWithId);
  }


  /* Private helpers */
  
  /**
   * Creates a Promise with a request. Once the request completes,
   * the promise is resolved.
   */
  self.promiseRequest = function (options, unpackResultCallback) {
    self.addAuthHeader(options);

    return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        if (!error) {
          var result = unpackResultCallback(body);
          resolve(result);
        }
        else reject(error);
      });
    });
  };
  
  /**
   * adds a "Authorization" header to the request 
   */
  self.addAuthHeader = function (options) {
    options['headers'] = { 'Authorization': 'Basic ' + new Buffer(self.username + ":" + self.password).toString('base64') };
  };
  
  /**
   * Result parser: if the response is expected to have an "id" parameter
   * then use this function to get the result
   */
  self.parseResultWithId = function (result) {
    if (result.error){
      console.error(result);
      return false;
    }
    return (result.id > 0) ? result : false;
  };
  
  /**
   * Result parser: if the response is an array, then it returns the first
   * element of the array, otherwise returns false.
   */
  self.parseArrayResult = function (body) {
    if (!body|| body == '')
      return false;

    var result = JSON.parse(body);
    return (result.length > 0) ? result[0] : false;
  };
  
  /**
   * Returns true if the body to parse is an empty string
   */
  self.parseEmptyResult = function (body) {
    return body == "";
  }

  return self;
};

module.exports = api;
