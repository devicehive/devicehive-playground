var express = require('express');
var router = express.Router();

// About page
router.get('/about', function(req, res, next) {
  res.render('pages/about', { title: 'About DeviceHive' });
});

module.exports = router;