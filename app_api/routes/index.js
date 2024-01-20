var express = require('express')
var router = express.Router()
var jwt = require('express-jwt')
var multer = require('multer')
var storage = multer.diskStorage({
	destinatin: function(req, file, callback){
		callback(null, './uploads')
	},
	filename: function(req, file, callback){
		callback(null, file.originalname)
	}
})
var user = require('./user')
//var event = require('./event')
var ctrlAuth = require('../controllers/authentication')
var ctrlAdmin = require('../controllers/admin')
var pickup = require('./pickup')
var schedule = require('./schedule')

var auth = jwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'payload'
})

router.use('/user', auth, user)
router.use('/pickup', auth, pickup)
router.use('/schedule', auth, schedule)
router.post('/signup', ctrlAuth.signup)
router.post('/login', ctrlAuth.login)
router.post('/resetPassword', ctrlAuth.resetPassword)
router.post('/setPassword', ctrlAuth.setPassword)
router.post('/userInfo', ctrlAuth.userInfo)
var upload = multer({storage: storage})
router.post('/email', upload.array('file', process.env.EMAIL_ATTACHMENT_MAX_COUNT), auth, ctrlAdmin.email)
router.post('/op_email', upload.array('file', process.env.EMAIL_ATTACHMENT_MAX_COUNT), ctrlAdmin.unsecure_email)
router.post('/sms', ctrlAdmin.sms)
router.post('/upload/:filetype', upload.single('file'), ctrlAdmin.fileUpload)
//router.use('/event', auth, event)

module.exports = router