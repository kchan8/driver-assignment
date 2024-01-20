var express = require('express');
var router = express.Router();

var schedule = require('../controllers/schedule');

router.post('/update', schedule.update);
router.post('/get', schedule.get);
//router.post('/remove', schedule.remove);

module.exports = router;