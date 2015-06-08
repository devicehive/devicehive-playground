var express = require('express');
var router = express.Router();

// GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'DeviceHive' });
});

// About page
router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About DeviceHive' });
});

module.exports = router;
