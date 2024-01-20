var express = require('express');
var router = express.Router();

/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});
var ctrlMain = require('../controllers/main');

//router.get('/', ctrlMain.index);
router.get('/', ctrlMain.angularApp);	// routes below are not used in SPA
router.get('/home', ctrlMain.index);
router.get('/classes', ctrlMain.classes);
router.get('/register', ctrlMain.register);
router.get('/about', ctrlMain.about);
router.get('/contact', ctrlMain.contact);
//router.post('/', ctrlMain.bell);

module.exports = router;
