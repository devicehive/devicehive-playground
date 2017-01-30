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
 *    - if found: tries to get its AccessKey and returns it
 *    - if not found: proceed to step 2
 * 2. creates a new User, Network and JWT
 *    - if everything went smooth, returns jwt
 *
 */

module.exports.info = function (req, res) {

    if (!req.user || !req.user.email_verified ) {
        return res.status(403).send('Access Denied');
    }

    var callback = {
        success: function (data) {
            try{
                if (data.email && !data.user.status) {
                    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
                    var info = {
                        swagger: url.resolve(fullUrl, config.swagger_url),
                        api: url.resolve(fullUrl, config.api_url),
                        admin: url.resolve(fullUrl, config.admin_url),
                        dashboard:url.resolve(fullUrl, config.dashboard_url),
                        accessToken: data.jwt.accessToken,
                        refreshToken: data.jwt.refreshToken,
                        network: data.network,
                        uniqueDeviceName: faker.internet.domainWord() + '-' + faker.random.number()
                    };
                    res.cookie('DeviceHiveToken', data.jwt.accessToken);
                    res.render('info', info);
                } else {
                    res.status(403).send('Access Denied');
                }
            } catch(err){
                res.status(500).send(err);
            }

        },
        error: function (data) {
            console.log(data);
            res.status(500).send({error:data.message});
        }
    };

    api.getUserByEmail(req.user.email)
        .then(api.getNetwork)
        .then(api.assignNetwork)
        .then(api.getJWT)
        .then(callback.success)
        .catch(callback.error);
};
