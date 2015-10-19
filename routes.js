/**
 * Created by Sergey on 10/6/2015.
 */

var url = require('url');
var config = require('./config/api.js');
var api = require('./lib/dh_api.js')(config);

/**
 * Main entry point.
 * The goal is to get the AccessKey by user's email.
 *
 * 1. tries to find the User by the email
 *    - if found: tries to get its AccessKey and returns it
 *    - if not found: proceed to step 2
 * 2. creates a new User, Network and AccessKey
 *    - if everything went smooth, returns the AccessKey
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
                        accessKey: data.accessKey.key,
                        accessKeyEncoded: encodeURIComponent(data.accessKey.key),
                        network: data.network
                    };
                    res.cookie('DeviceHiveToken', data.accessKey.key);
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
        .then(api.getAccessKey)
        .then(api.getNetwork)
        .then(api.assignNetwork)
        .then(callback.success)
        .catch(callback.error);


};
