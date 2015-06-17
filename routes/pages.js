var express = require('express');
var router = express.Router();

// Home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'DeviceHive' });
});

// About page
router.get('/about', function(req, res, next) {
  res.render('pages/about', { title: 'About DeviceHive' });
});

module.exports = router;