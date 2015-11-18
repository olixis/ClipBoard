var express = require('express');
var router = express.Router();



router.get('/teste', function(req, res, next) {
  res.send('cu');
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
