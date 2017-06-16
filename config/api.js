var envexpand = function (str) {
    if (!str) return str;
    return str.replace(/\$([A-Za-z0-9_\-]+)/g, function (_, n) {
        return process.env[n];
    });
};

module.exports = {
    url: envexpand(process.env.DH_URL) || "http://playground.devicehive.com/",

    internal_api: envexpand(process.env.DH_INTERNAL_API) || "http://dh_frontend:8080/api/rest",
    admin_login: process.env.DH_ADMIN_LOGIN || 'dhadmin',
    admin_password: process.env.DH_ADMIN_PASSWORD || 'dhadmin_#911',

    secret: process.env.DH_SECRET || 'in god we trust'
};
