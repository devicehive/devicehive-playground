var envexpand = function(str){
	return str.replace(/\$([A-Za-z0-9_\-]+)/g, function(_,n) {
    	return process.env[n];
    });
};

module.exports = {
  
  api_url: envexpand(process.env.DH_API_URL) || "http://nn8576.pg.devicehive.com/api",
  admin_url: envexpand(process.env.DH_ADMIN_URL) || "http://nn8576.pg.devicehive.com/admin",
  swagger_url: envexpand(process.env.DH_SWAGGER_URL) || "http://nn8576.pg.devicehive.com/api/swagger",

  api: envexpand(process.env.DH_API) || "http://nn8576.pg.devicehive.com/api",    
  admin_username: process.env.DH_USER || 'dhadmin',
  admin_password: process.env.DH_PASS || 'dhadmin_#911'

};
