var envexpand = function (str) {
    if (!str) return str;
    return str.replace(/\$([A-Za-z0-9_\-]+)/g, function (_, n) {
        return process.env[n];
    });
};

module.exports = {

    api_url: envexpand(process.env.DH_API_URL) || "http://playground.devicehive.com/api/rest",
    admin_url: envexpand(process.env.DH_ADMIN_URL) || "http://playground.devicehive.com/admin",
    dashboard_url: envexpand(process.env.DH_DASHBOARD_URL) || "http://playground.devicehive.com/dashboard",
    swagger_url: envexpand(process.env.DH_SWAGGER_URL) || "http://playground.devicehive.com/api/swagger",

    admin_login: process.env.DH_ADMIN_LOGIN || 'dhadmin',
    admin_password: process.env.DH_ADMIN_PASSWORD || 'dhadmin_#911',

    secret: process.env.DH_SECRET || 'in god we trust'

};
