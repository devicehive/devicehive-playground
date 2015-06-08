// Routes for landing pages

var express = require('express');
var router = express.Router();

// About page
router.get('/devicehive-in-azure-marketplace', function(req, res, next) {
  res.render('landing/azure', { title: 'Landing page about Azure' });
});

module.exports = router; 