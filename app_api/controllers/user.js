var mongoose	= require('mongoose')
var User		= mongoose.model('User')
var dayMS 		= 60 * 60 * 24 * 1000;

module.exports.getAllUsers = function(req, res){
	User.find({}, null, {sort:{schoolCity:1, school:1, grade:1, 'name.firstName':1}}, function(err, users){
		res.status(200).json(users)
	})
};

module.exports.getAllUsersByGrade = function(req, res){
	User.aggregate([
		{$group: {
			_id: "$grade", 
			users: {
				$push: {
					id: "$_id",
					name: {
//						$concat : ["$name.firstName", " ", "$name.lastName"]
						$concat : ["$name.firstName",
								   {$cond:[{$ifNull: ["$name.lastName", false]}, {$concat:[" ", "$name.lastName"]}, ""]}
//								   {$cond:[{$ifNull: ["$name.lastName", false]}, " ", '']},
//								   " ",
//								   {$ifNull: ["$name.lastName", ""]}
								  ]
					},
					school: "$school",
					color: "$backgroundColor",
					email: "$parent1Email"
				}
			}
		}},
		{$sort:{
			"_id": 1
		}}
	], function(err, grades){
		res.status(200).json(grades);
	})
};

// update user.active everyday, then if startDate is today, then just count on user.active
function isActive(startDate, endDate, enrollment, user){
	if (user.name.firstName == "John"){		
		console.log("Start: " + startDate)
		console.log("End:   " + endDate)
		console.log("Enroll:" + enrollment)
	}
	if (enrollment == undefined || enrollment == null || enrollment == ''){
//		console.log("enrollment is missing")
		return true;
	}
	var active = false;
	var startDateTime = startDate.getTime();
	var endDateTime = endDate.getTime();
	// check each day in the range to see if enrolled or not, default is false, exit on one true
	var enrollBegin = new Date(enrollment[0].enroll);
	enrollBegin.setHours(0);
	var enrollBeginTime = enrollBegin.getTime();
	var enrollLast = new Date(enrollment[0].last);
	enrollLast.setHours(23);
	var enrollLastTime = enrollLast.getTime();
	
	timePtr = startDateTime;
	if (user.name.firstName == "John"){	
		console.log("enrollBeginTime: " + enrollBeginTime)
		console.log("enrollLastTime: " + enrollLastTime)
	}
	while (timePtr < endDateTime){
		if (user.name.firstName == "John"){	
			console.log("timePtr: " + timePtr)
		}
		if (timePtr > enrollBeginTime && timePtr < enrollLastTime) {
			return true
		}
		timePtr += dayMS;
	}
	return active;
}

// with date range
module.exports.getAllStudents = function(req, res){
	var startDate = new Date(req.body.startDate);
	startDate.setHours(12);
	var endDate = new Date(req.body.endDate);
	endDate.setHours(12);
	var usersActive = [];
	User.find({grade: {$in: ["TK", "K", "1st", "2nd", "3rd", "4th", "5th"]}}, null, {sort:{schoolCity:1, school:1, grade:1, 'name.firstName':1}}, function(err, users){
		if (err)
			throw err;
		console.log("Got " + users.length + " from DB")
		users.forEach(function(user){
			if (isActive(startDate, endDate, user.enrollment, user)){
				usersActive.push(user)
			}
		})
		console.log("Filtered users: " + usersActive.length)
		res.status(200).json(usersActive)
	})
}

module.exports.getStudentsByGrades = function(req, res){
	User.aggregate([
		{$match: {
			"active": {$eq: true},
			"grade": {"$exists": true, "$in": ["TK", "K", "1st", "2nd", "3rd", "4th", "5th"]}
		}},
		{$group: {
			_id: "$grade", 
			users: {
				$push: {
					id: "$_id",
					name: {
						$concat : ["$name.firstName",
							{$cond:[{$ifNull: ["$name.lastName", false]}, {$concat:[" ", "$name.lastName"]}, ""]}
						]
					},
					school: "$school",
					email1: "$parent1Email",
					email2: "$parent2Email",
				}
			}
		}},
		{$sort:{
			"_id": 1
		}}
	], function(err, grades){
		res.status(200).json(grades);
	})
};

// https://stackoverflow.com/questions/25666187/mongodb-nested-group
//module.exports.getStudentsBySchool1 = function(req, res){
//	User.aggregate([
//		// Note: $match has to preceed $group, like pipeline
//		{$match: {
//			"school": {"$exists": true, "$ne": ''}
//		}},
//		{$group: {
//			_id: {district: "$schoolCity", school: "$school",
//			name: {
//				$concat : ["$name.firstName",
//				{$cond:[{$ifNull: ["$name.lastName", false]}, {$concat:[" ", "$name.lastName"]}, ""]}
//				]
//			},
//			grade: "$grade",
//			email1: "$parent1Email",
//			email2: "$parent2Email",
//			}}
//		},
//		{$group: {
//			_id: "$_id.district",
//			school: {
//				$push: {
//					id: "$_id.school",
//					name: "$_id.name",
//					grade: "$_id.grade",
//					email: "$_id.email"
//				}
//			}
//		}},
////		{$sort:{
////			"_id": 1
////		}}
//	], function(err, schools){
//		res.status(200).json(schools);
//	})
//};

module.exports.getStudentsBySchools = function(req, res){
	User.aggregate([
		// Note: $match has to preceed $group, like pipeline
		// sort first, then group, then sort again, it is like pipe
		{$match: {
			"active": {$eq: true},
			"school": {"$exists": true, "$ne": ''}
		}},
		{$sort:{
			"grade": 1
		}},
		{$group: {
			_id: "$school", 
			users: {
				$push: {
					id: "$_id",
					name: {
						$concat : ["$name.firstName",
							{$cond:[{$ifNull: ["$name.lastName", false]}, {$concat:[" ", "$name.lastName"]}, ""]}
						]
					},
					grade: "$grade",
					email1: "$parent1Email",
					email2: "$parent2Email",
				}
			}
		}},
		{$sort:{
			"_id": 1
		}}
	], function(err, schools){
		res.status(200).json(schools);
	})
};

module.exports.getStudentsByDistricts = function(req, res){
	User.aggregate([
		// Note: $match has to preceed $group, like pipeline
		{$match: {
			"active": {$eq: true},
			"school": {"$exists": true, "$ne": ''}
		}},
		{$sort:{
			"grade": 1
		}},
		{$group: {
			_id: "$schoolCity",
			users: {
				$push: {
					id: "$_id",
					name: {
						$concat : ["$name.firstName",
							{$cond:[{$ifNull: ["$name.lastName", false]}, {$concat:[" ", "$name.lastName"]}, ""]}
						]
					},
					school: "$school",
					grade: "$grade",
					email1: "$parent1Email",
					email2: "$parent2Email",
				}
			}
		}},
		{$sort:{
			"_id": 1
		}},
	], function(err, schools){
		res.status(200).json(schools);
	})
};

module.exports.getAllDistricts = function(req, res){
	User.aggregate([
		// Note: $match has to preceed $group, like pipeline
		{$match: {
			"schoolCity": {"$exists": true, "$ne": ''}
		}},
		{$group: {
			_id: "$schoolCity"
		}},
		{$sort:{
			"_id": 1
		}}
	], function(err, districts){
		res.status(200).json(districts);
	})
}

module.exports.getDrivers = function(req, res){
	User.find({userType: {$in: ["Driver"]}}, null, {sort:{'name.firstName':1}}, function(err, users){
		res.status(200).json(users)
	})
}

module.exports.getDetails = function(req, res){
	User.findOne({_id: req.body.userID}, function(err, user){
		res.status(200).json(user);
	})
};

function createParent(firstName, lastName, email, phone, student){
//	no entry on web form is undefined if unedited, but can be null once edited
//	if ((firstName !== undefined) && (firstName !== null) && (firstName !== '')){
	if (firstName !== undefined && firstName !== '' && lastName !== undefined && lastName !== ''){
		var uniqueID = firstName.toLowerCase() + lastName.toLowerCase();
		User.findOne({uniqueID: uniqueID}, function(err, user){
			if (err){
				throw err;
			}
			if (!user){
				user = new User();
				user.uniqueID = uniqueID;
				user.username = uniqueID;
				user.name.firstName = firstName;
				user.name.lastName = lastName;
				user.email = email;
				user.cellPhone = phone;
				user.userType = ["Parent"];
				user.grade = "";
				user.children = [{firstName: student.name.firstName, lastName: student.name.lastName, id: student._id}];
				user.save(function(err){
					if (err)
						throw err;
				})
			} else {
				// check if needed to add student
				children = user.children;
				if (children == undefined || children == null || children == []){
					user.children = [{firstName: student.name.firstName, lastName: student.name.lastName, id: student._id}];
				} else {
					if (children.find(o => o.firstName == student.name.firstName && o.lastName == student.name.lastName) == undefined){
						children.push({firstName: student.name.firstName, lastName: student.name.lastName, id: student._id});
						user.children = children;
					}
				}
				user.save(function(err){
					if (err)
						throw err;
				})
			}
		})
	} else {
		console.log("No parent created!")
	}
}

module.exports.create = function(req, res){
//	console.log('In api create user ...');
//	console.log(req.body)
	var uniqueID = req.body.name.firstName.toLowerCase();		
	// check if user exists already
	if (req.body.name.lastName != undefined){		
		uniqueID += req.body.name.lastName.toLowerCase();
	}
//	console.log('UniqueID = ' + uniqueID);
	User.findOne({uniqueID: uniqueID}, function(err, user){
		if (err){
			throw err;
		}
		if (user){			
			res.status(400).json({message: 'User exists'});
		} else {
			console.log('create new user ...');
			user = new User();
			user.uniqueID = uniqueID;
			user.username = uniqueID;
			user.name = req.body.name;
			user.gender = req.body.gender;
			user.email = req.body.email;
			user.homeAddress = req.body.homeAddress;
			user.homeCity = req.body.homeCity;
			user.homeZip = req.body.homeZip;
			user.homePhone = req.body.homePhone;
			user.cellPhone = req.body.cellPhone;
			user.carrier = req.body.carrier;
			user.userType = req.body.userType;
			user.backgroundColor = req.body.backgroundColor;
			user.pickup = req.body.pickup;
			user.active = req.body.active;
			user.enrollment = req.body.enrollment;
			
			user.school = req.body.school;
			user.schoolAddress = req.body.schoolAddress;
			user.schoolCity = req.body.schoolCity;
			user.grade = req.body.grade;
			if (user.userType.indexOf('Student') == -1){
				user.grade = "";
			}
			
			user.parent1FirstName = req.body.parent1FirstName;
			user.parent1LastName = req.body.parent1LastName;
			user.parent1Email = req.body.parent1Email;
			user.parent1Phone = req.body.parent1Phone;
			user.parent2FirstName = req.body.parent2FirstName;
			user.parent2LastName = req.body.parent2LastName;
			user.parent2Email = req.body.parent2Email;
			user.parent2Phone = req.body.parent2Phone;
			user.touched = true;
			user.save(function(err){
				if (err) {
					throw err;
				}
				createParent(user.parent1FirstName, user.parent1LastName, user.parent1Email, user.parent1Phone, user);
				createParent(user.parent2FirstName, user.parent2LastName, user.parent2Email, user.parent2Phone, user);
				res.status(200).json({message: 'User created'});
			});
		}
	});
};

module.exports.update = function(req, res){
	User.findOne({_id: req.body._id}, function(err, user){
		user.email = req.body.email;
		user.name = req.body.name;
		user.userType = req.body.userType;
		user.gender = req.body.gender;
		user.homeAddress = req.body.homeAddress;
		user.homeCity = req.body.homeCity;
		user.homeZip = req.body.homeZip;
		user.homePhone = req.body.homePhone;
		user.cellPhone = req.body.cellPhone;
		user.carrier = req.body.carrier;
		user.backgroundColor = req.body.backgroundColor;
		
		user.school = req.body.school;
		user.schoolAddress = req.body.schoolAddress;
		user.schoolCity = req.body.schoolCity;
		user.grade = req.body.grade;
		user.pickup = req.body.pickup;
		console.log("Active: " + req.body.active)
		user.active = req.body.active;
		user.enrollment = req.body.enrollment;
		
		user.parent1FirstName = req.body.parent1FirstName;
		user.parent1LastName = req.body.parent1LastName;
		user.parent1Email = req.body.parent1Email;
		user.parent1Phone = req.body.parent1Phone;
		user.parent2FirstName = req.body.parent2FirstName;
		user.parent2LastName = req.body.parent2LastName;
		user.parent2Email = req.body.parent2Email;
		user.parent2Phone = req.body.parent2Phone;
		user.save(function(err){
			if (err) {
				throw err;
			}
			createParent(user.parent1FirstName, user.parent1LastName, user.parent1Email, user.parent1Phone, user);
			createParent(user.parent2FirstName, user.parent2LastName, user.parent2Email, user.parent2Phone, user);
			res.status(200).json({message: 'User updated'});
		});
	});
};

module.exports.remove = function(req, res){
	// do not use angular.forEach
	// to remove student, get parents
	for(var i=0; i<req.body.id.length; i++){
		User.remove({_id: req.body.id[i]}, function(err){
			if (err){
				throw err;
			}
		})
	}
	res.status(200).json({message: 'User removed'});
};
