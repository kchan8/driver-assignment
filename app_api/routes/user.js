var express = require('express');
var router = express.Router();

var user = require('../controllers/user');

router.post('/all', user.getAllUsers);
router.post('/allbygrade', user.getAllUsersByGrade);
router.post('/students', user.getAllStudents);
router.post('/drivers', user.getDrivers);
router.post('/bygrades', user.getStudentsByGrades);
router.post('/byschools', user.getStudentsBySchools);
router.post('/bydistricts', user.getStudentsByDistricts);
router.post('/districts', user.getAllDistricts);
router.post('/details', user.getDetails);
router.post('/create', user.create);
router.post('/update', user.update);
router.post('/remove', user.remove);

module.exports = router;