var request = require('request-promise');
var randomstring = require("randomstring");
var errors = require('request-promise/errors');
var Hashids = require('hashids');
var _ = require('lodash');

var api = function (config) {
    var self = this;

    self.api_url = config.internal_api;
    self.secret = config.secret;

    var hashids = new Hashids(self.secret, 6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    var hashids16 = new Hashids(self.secret, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');

    var auth = function (accessKey) {
        return {
            'Authorization': 'Bearer ' + accessKey
        };
    };

    var path = function (_path, query) {
        if (query) {
            var queryString = Object.keys(query).reduce(function (a, k) {
                a.push(k + '=' + encodeURIComponent(query[k]));
                return a;
            }, []).join('&');
            return self.api_url + '/' + _path + '?' + queryString;
        } else {
            return self.api_url + '/' + _path;
        }
    };

    var network = function (user_id, email) {
        return 'Network ' + hashids.encode(user_id) + ' for (' + email + ')';
    };

    self.getAdminToken = function (email) {
        return new Promise(function (resolve, reject) {
            var credentials = {
                login: config.admin_login,
                password: config.admin_password
            };

            request.post(path('token'), {
                body: credentials,
                json: true
            }).then(function (response) {
                return resolve({jwt: response.accessToken, email: email});
            })['catch'](reject);
        });
    };

    self.getUserByEmail = function (data) {
        return new Promise(function (resolve, reject) {
            if (!data || !data.jwt) {
                reject({message: 'access token is required'});
            }

            // get user by email
            request.get(path('user', {login: data.email}), {
                headers: auth(data.jwt),
                json: true
            }).then(function (response) {
                if (response && response.length) {
                    return resolve(_.extend(data, {user: response[0], email: data.email}));
                }
                console.log('User ' + data.email + ' does not exist yet. Creating...');
                self.createUser(data.email, data.jwt).then(function (response) {
                    return resolve(_.extend(data, {user: response, email: data.email}));
                })['catch'](reject);
            })['catch'](reject);
        });
    };

    self.getNetwork = function (data) {
        return new Promise(function (resolve, reject) {
            if (!data || !data.jwt) {
                reject({message: 'access token is required'});
            }

            if (!data || !data.user || !data.user.id) {
                reject({message: 'user id is required'});
            }

            var networkName = network(data.user.id, data.email);

            // get network
            request.get(path('network', {name: networkName}), {
                headers: auth(data.jwt),
                json: true
            }).then(function (response) {
                if (response && response.length) {
                    console.log('Getting all networks for user ' + data.email);
                    request.get(path('user/' + data.user.id), {
                        headers: auth(data.jwt),
                        json: true
                    }).then(function (user) {
                        var networkIds = user.networks.map(function (item) {
                            return item.id;
                        });
                        return resolve(_.extend(data, {network: response[0], networkIds: networkIds}));
                    })['catch'](reject);
                } else {
                    console.log('User ' + data.email + ' has no network key yet. Creating...');
                    self.createNetwork(networkName, data.jwt).then(function (response) {
                        return resolve(_.extend(data, {network: response}));
                    })['catch'](reject);
                }
            })['catch'](reject);
        });
    };

    self.assignNetwork = function (data) {
        return new Promise(function (resolve, reject) {
            if (!data || !data.jwt) {
                reject({message: 'access token is required'});
            }

            if (!data || !data.user || !data.user.id) {
                reject({message: 'user id is required'});
            }

            if (!data || !data.network || !data.network.id) {
                reject({message: 'network id is required'});
            }


            // get network
            request.put(path('user/' + data.user.id + '/network/' + data.network.id),
                {headers: auth(data.jwt), json: true}).then(function (response) {
                    return resolve(data);
                })['catch'](reject);
        });
    };

    self.getJWT = function (data) {
        return new Promise(function (resolve, reject) {
            if (!data || !data.jwt) {
                reject({message: 'access token is required'});
            }

            if (!data || !data.user || !data.user.id) {
                reject({message: 'user id is required'});
            }

            var token = {
                userId: data.user.id,
                actions: ['GetNetwork'
                    , 'GetDevice'
                    , 'GetDeviceState'
                    , 'GetDeviceNotification'
                    , 'GetDeviceCommand'
                    , 'GetDeviceClass'
                    , 'RegisterDevice'
                    , 'CreateDeviceNotification'
                    , 'CreateDeviceCommand'
                    , 'UpdateDeviceCommand'
                    , 'GetCurrentUser'
                    , 'UpdateCurrentUser'
                    , 'ManageToken'],
                networkIds: data.networkIds,
                deviceIds: ['*'] // all user devices
            };
            // get jwt
            request.post(path('token/create'), {
                headers: auth(data.jwt),
                body: token,
                json: true
            }).then(function (response) {
                return resolve(_.extend(data, {jwt: response}));
            })['catch'](reject);
        });
    };

    self.createUser = function (email, jwt) {
        var user = {
            status: 0, // active
            role: 1, // client role
            login: email,
            password: randomstring.generate({length: 64, charset: 'alphanumeric'}) // no login by password
        };
        return request.post(path('user'), {headers: auth(jwt), body: user, json: true});
    };

    self.createNetwork = function (name, jwt) {
        var network = {
            name: name,
            description: 'Playground Network'
        };

        return request.post(path('network'), {headers: auth(jwt), body: network, json: true});
    };

    return self;
};

module.exports = api;