var envexpand = function (str) {
    if (!str) return str;
    return str.replace(/\$([A-Za-z0-9_\-]+)/g, function (_, n) {
        return process.env[n];
    });
};

module.exports = {

    api_url: envexpand(process.env.DH_API_URL) || "http://playground.devicehive.com/api/rest",
    admin_url: envexpand(process.env.DH_ADMIN_URL) || "http://playground.devicehive.com/admin",
    swagger_url: envexpand(process.env.DH_SWAGGER_URL) || "http://playground.devicehive.com/api/swagger",

    api: envexpand(process.env.DH_API) || "http://playground.devicehive.com/api/rest",
    api_key: process.env.DH_API_KEY || 'DFXFrZ8VQIkOYECScBbBwsYinj+o8IlaLsRQ81wO+l8',

    secret: process.env.DH_SECRET || 'in god we trust'

};
