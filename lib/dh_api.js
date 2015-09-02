var request = require('request');
var Promise = require('promise');

var api = function (config) {
  var self = this;
  
  self.api_url = config.api_url;
  self.username = config.admin_username;
  self.password = config.admin_password;

  /**
   * Returns a User or false if the User is not found
   */
  self.findUser = function (login) {
    var options = {
      method: 'GET', uri: self.api_url + '/user',
      qs: { login: login }
    };
    self.addAuthHeader(options);
    
    var parseResult = function (body) {
      var result = JSON.parse(body);
      if (result.length > 0) {
        var user = result[0];
        return user;
      }
      else return false;
    };
    
    return self.promiseToDoTheRequest(options, parseResult);
  };

  /**
   * Creates a user and returns the result
   */
  self.createUser = function (email) {
    var options = {
      method: 'POST', uri: self.api_url + '/user',
      form: {
        status: 0,
        role: 0,
        login: email,
        password: "123qwe#s"
      },                       
    };
    self.addAuthHeader(options);
    
    var parseResult = function (body) {
      var result = JSON.parse(body);
      return (result.id > 0) ? result : false;
    };
    
    return self.promiseToDoTheRequest(options, parseResult);
  };
  

  /* Private helpers */
  
  self.promiseToDoTheRequest = function (options, unpackResultCallback) {
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

  self.addAuthHeader = function (options) {
    options['headers'] = { 'Authorization': 'Basic ' + new Buffer(self.username + ":" + self.password).toString('base64') };
  };

  return self;
};

module.exports = api;
