var passport = require('passport')
var mongoose = require('mongoose')
var User = mongoose.model('User')
var sendEmail = require('./sendEmail')
var util = require('util')
var crypto = require('crypto')

var sendJSONresponse = function(res, status, content){
	// somehow these 2 lines can't set the status
//	res.status = status
//	res.json(content)
	res.status(status).json(content)
}

// these functions are called from api
module.exports.signup = function(req, res){
	if (!req.body.firstname || !req.body.lastname
			|| !req.body.email
			|| !req.body.username
			|| !req.body.password
			|| !req.body.confirm_password
	){
		sendJSONresponse(res, 400, {message: 'All fields required'})
		return
	}
	if (req.body.password !== req.body.confirm_password){
		sendJSONresponse(res, 400, {message: 'Passwords not match'})
		return
	}
	
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email.toLowerCase();
	var username = req.body.username;
	var password = req.body.password;

	var uniqueID = firstname.toLowerCase() + lastname.toLowerCase();
	var isAdmin = (firstname.toLowerCase() === process.env.ADMIN_FIRSTNAME.toLowerCase())
			   && (lastname.toLowerCase() === process.env.ADMIN_LASTNAME.toLowerCase())
			   && (email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
			   );
	var msg, link;
	if (isAdmin) {
		// check if registered already
		User.findOne({email: email}, function(err, user){
			if (user){
				console.log("Duplicate admin registration");
				sendJSONresponse(res, 400, {message: 'Duplicate admin registration'})
				return
			} else {
				// skip checking database for admin, this is the first signup, no database yet
				var newUser = User({
					uniqueID: uniqueID,
					username: username,
					password: password,
					name: {firstName: firstname,
						   lastName: lastname},
					userType: ["Admin", "Teacher", "Driver"],
					registered: false,
					email: email,
					grade: ""
				});
				newUser.save(function(err, user){
					// due to async nature, same name will cause duplication error
					if (err) {
						throw err;
					}
					link = req.protocol + '://' + req.get('host') + '/confirm/' + user._id
					msg = "Hello " + firstname + "!"
						+ "\n\nYou recently registered an account. To activate your account, click the link below or paste it in web broswer.\n\n"
						+ "<a href=\"" + link + "\">" + link + "<\/a>"
						+ "\n\nWebmaster";
					msg = msg.replace(/\n/g, '<br>');
					// from and to addresses can't be the same ??
					sendEmail.sendgrid([user.email], [], process.env.ADMIN_EMAIL, process.env.ADMIN_FIRSTNAME + " " + process.env.ADMIN_LASTNAME, "Registration confirmation", msg, [], null)
					sendJSONresponse(res, 200, {message: 'Admin registration successful'})
				})
			}
		})
	} else {
		// search by firstname and lastname
		var re = new RegExp(uniqueID, "g")
		User.find({email: email}, function(err, users){
			if (err){
				throw err
			}
			if ((users.length == 0) && !process.env.OPEN_REGISTRATION
					|| ((users.length == 1) && (users[0].email != "" && users[0].email.toLowerCase() != email.toLowerCase()))) {
				sendJSONresponse(res, 400, {message: 'Invalid Registration'})
				return
			} else {
				var user
				if (users.length == 1){					
					user = users[0];
				} else {
					user = new User()
					user.uniqueID = uniqueID
					user.name.firstName = firstname
					user.name.lastName = lastname
				}
				user.username = username;
				user.password = password;
				user.email = email;
				user.registered = false;
				user.save(function(err){
					if (err)
						throw err
				})
				link = req.protocol + '://' + req.get('host') + '/confirm/' + user._id
				msg = "Hello " + user.name.firstName + "!"
					+ "\n\nYou recently registered an account. To activate your account, click the link below or paste it in web broswer.\n\n"
					+ "<a href=\"" + link + "\">" + link + "<\/a>"
					+ "\n\nWebmaster";
				msg = msg.replace(/\n/g, '<br>');
				sendEmail.sendgrid([user.email], [], process.env.ADMIN_EMAIL, process.env.ADMIN_FIRSTNAME + " " + process.env.ADMIN_LASTNAME, "Registration confirmation", msg, [], null)
				sendJSONresponse(res, 200, {message: 'Create new registration'})
			}
		});
	}
}

module.exports.login = function(req, res){
	if (!req.body.username || !req.body.password){
		sendJSONresponse(res, 400, {message: 'All fields required'})
		return
	}
	passport.authenticate('local', function(err, user, info){
		var token;
		if (err) {
			sendJSONresponse(res, 404, err);	// User had not registered yet
			return
		}
		if (!user) {
			sendJSONresponse(res, 401, info);	// Invalid user
		} else {
			token = user.generateJwt();
			sendJSONresponse(res, 200, {token: token});
		}
	})(req, res)
}

// https://blog.tompawlak.org/generate-random-values-nodejs-javascript
function randomValueBase64(len){
	return crypto.randomBytes(Math.ceil(len * 3 / 4))
		.toString('base64')		// convert to base64 format
		.slice(0, len)			// return required number of characters
		.replace(/\+/g, '0')	// replace '+' with '0'
		.replace(/\//g, '0');	// replace '/' with '0'
}

module.exports.resetPassword = function(req, res){
	// get the email from req
	User.findOne({email: req.body.email}, function(err, user){
		if (err){
			throw err;
		}
		if (user){
			var key = randomValueBase64(12);
			var link = req.protocol + '://' + req.get('host') + '/resetPassword/' + user._id + "/" + key
			var msg = "Hello, " + user.name.firstName + "!"
				+ "\n\nYou recently requested a password reset. To update your login information, click the link below or paste it in web broswer to reset password.\n\n"
				+ "<a href=\"" + link + "\">" + link + "<\/a>"
				+ "\n\nPLEASE NOTE: If you do not want to update your login, you may ignore this email and nothing will be changed."
				+ "\n\nWebmaster";
			msg = msg.replace(/\n/g, '<br>');
			user.resetPasswordKey = key
			user.save(function(err){
				if (err){
					throw err;
				}
				console.log(msg);
				sendEmail.sendgrid([user.email], [], process.env.ADMIN_EMAIL, process.env.ADMIN_FIRSTNAME + " " + process.env.ADMIN_LASTNAME, "Password reset", msg, [], null)
				sendJSONresponse(res, 200, {message: 'Email for reseting password sent, please check inBox'})
			})
		} else {
			sendJSONresponse(res, 404, {message: 'Invalid user'})
		}
		
	})
}

module.exports.setPassword = function(req, res){	
	User.findOne({_id: req.body.userID}, function(err, user){
		if (err){
			throw err;
		}
		if (user.resetPasswordKey == req.body.key){
			user.password = req.body.password;
			user.resetPasswordKey = "";
			user.save(function(err){
				if (err){
					throw err;
				}
				sendJSONresponse(res, 200, {message: ''});
			})
		} else {
			sendJSONresponse(res, 404, {message: 'Invalid link'});
		}
	});
}

// Used for confirming registration, called without authentication
module.exports.userInfo = function(req, res){
	if (mongoose.Types.ObjectId.isValid(req.body.userID)){
		var userID = req.body.userID
		User.findOne({_id: userID}, function(err, user){
			if (err){
				throw err
			}
			if (user){
				console.log(user.name.firstName)
				sendJSONresponse(res, 200, {firstname: user.name.firstName})
				user.registered = true
				user.save(function(err){
					if (err)
						throw err
				})
			} else {
				sendJSONresponse(res, 404, {message: "Invalid request"})
			}
		})
	} else {
		sendJSONresponse(res, 404, {message: "Invalid ID"})
	}
}