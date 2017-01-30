var request = require('request-promise');
var errors = require('request-promise/errors');
var Hashids = require('hashids');
var _ = require('lodash');

var api = function (config) {
    var self = this;

    self.api_url = config.api;
    self.jwt = config.jwt;
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

    self.getUserByEmail = function (email) {
        return new Promise(function (resolve, reject) {

            // get user by email
            request.get(path('user', {login: email}), {
                headers: auth(self.jwt),
                json: true
            }).then(function (response) {
                if (response && response.length) {
                    return resolve({user: response[0], email: email});
                }
                console.log('User ' + email + ' does not exist yet. Creating...');
                self.createUser(email).then(function (response) {
                    return resolve({user: response, email: email});
                })['catch'](reject);
            })['catch'](reject);
        });
    };

    self.getNetwork = function (data) {
        return new Promise(function (resolve, reject) {
            if (!data || !data.user || !data.user.id) {
                reject({message: 'user id is required'});
            }

            var networkName = network(data.user.id, data.email);
            var networkKey = hashids16.encode(data.user.id);

            // get network
            request.get(path('network', {name: networkName}), {
                headers: auth(self.jwt),
                json: true
            }).then(function (response) {
                if (response && response.length) {
                    return resolve(_.extend(data, {network: response[0]}));
                }
                console.log('User ' + data.email + ' has no network key yet. Creating...');
                self.createNetwork(networkName, networkKey).then(function (response) {
                    return resolve(_.extend(data, {network: response}));
                })['catch'](reject);
            })['catch'](reject);
        });
    };

    self.assignNetwork = function (data) {
        return new Promise(function (resolve, reject) {
            if (!data || !data.user || !data.user.id) {
                reject({message: 'user id is required'});
            }

            if (!data || !data.network || !data.network.id) {
                reject({message: 'network id is required'});
            }


            // get network
            request.put(path('user/' + data.user.id + '/network/' + data.network.id),
                {headers: auth(self.jwt), json: true}).then(function (response) {
                    return resolve(data);
                })['catch'](reject);
        });
    };

    self.getJWT = function (data) {
        return new Promise(function (resolve, reject) {

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
                    , 'ManageAccessKey'
                    , 'ManageOAuthGrant'],
                networkIds: [data.network.id],
                deviceGuids: ['*'] // all user devices
            };
            console.log(token);
            // get jwt
            request.post(path('token'), {
                headers: auth(self.jwt),
                body: token,
                json: true
            }).then(function (response) {
                return resolve(_.extend(data, {jwt: response}));
            })['catch'](reject);
        });
    };

    self.createUser = function (email) {
        var user = {
            status: 0, // active
            role: 1, // client role
            login: email,
            password: "" // no login by password
        };
        return request.post(path('user'), {headers: auth(self.jwt), body: user, json: true});
    };

    self.createNetwork = function (name, key) {
        var network = {
            name: name,
            key: key,
            description: 'Playground Network'
        };

        return request.post(path('network'), {headers: auth(self.jwt), body: network, json: true});
    };

    return self;
};

module.exports = api;