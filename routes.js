/**
 * Created by Sergey on 10/6/2015.
 */

var url = require('url');
var config = require('./config/api.js');
var api = require('./lib/dh_api.js')(config);
var faker = require('faker');

/**
 * Main entry point.
 * The goal is to get JWT by user's email.
 *
 * 1. tries to find the User by the email
 *    - if found: tries to get its AccessToken and returns it
 *    - if not found: proceed to step 2
 * 2. creates a new User, Network and JWT
 *    - if everything went smooth, returns jwt
 *
 */

module.exports.info = function (req, res) {

    var callback = {
        success: function (result) {

            var data = result.data;

            try {
                if (data.email) {
                    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
                    var info = {
                        swagger: url.resolve(fullUrl, config.url + 'api/swagger'),
                        api: url.resolve(fullUrl, config.url + 'api/rest'),
                        adminAngular: url.resolve(fullUrl, config.url + 'admin-angular'),
                        dashboard: url.resolve(fullUrl, config.url + 'grafana'),
                        accessToken: data.jwt.accessToken,
                        refreshToken: data.jwt.refreshToken,
                        accessTokenEncoded: encodeURIComponent(data.jwt.accessToken),
                        refreshTokenEncoded: encodeURIComponent(data.jwt.refreshToken),
                        network: data.network,
                        networkIds: data.networkIds,
                        uniqueDeviceName: faker.internet.domainWord() + '-' + faker.random.number(),
                        user: result.user
                    };
                    res.cookie('DeviceHiveToken', data.jwt.accessToken);
                    res.render('info', info);
                } else {
                    res.status(403).send('Your access key has expired. Please re-login.');
                }
            } catch (err) {
                res.status(500).send(err);
            }

        },
        error: function (result) {
            console.log(result);
            res.status(500).send({error: result.message});
        }
    };

    var login = req.user ? req.user.email : undefined;

    api.getAdminToken(login)
        .then(api.getUserByEmail)
        .then(api.getNetwork)
        .then(api.assignNetwork)
        .then(api.getJWT)
        .then(function (data) {
             return {
                 data: data,
                 user: req.user
             };
        })
        .then(callback.success)
        .catch(callback.error);
};
