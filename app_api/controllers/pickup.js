var mongoose = require('mongoose')
var Pickup	 = mongoose.model('Pickup')
var User     = mongoose.model('User')
var sendEmail = require('./sendEmail');

module.exports.update = function(req, res){
	var pickups = req.body.pickups;
	var saveCnt = 0;
	pickups.forEach(function(pickup){
		// check if entry exists: studentID, day
		var time_start = new Date(pickup.date);
		time_start.setHours(0); time_start.setMinutes(0); time_start.setSeconds(0);
		var time_end = new Date(pickup.date);
		time_end.setHours(23); time_end.setMinutes(59); time_end.setSeconds(59);
//		console.log("Get from: " + time_start + " to " + time_end)
		Pickup.find({studentID: pickup.studentID, date: {'$gte': time_start, '$lt': time_end}}, function(err, entries){
			if (err){
				throw err;
			}
			var entry;
			if (entries.length > 1){
				console.log("More than 1 entries: " + pickup.studentID)
				entries.forEach(function(pickup){
					console.log(pickup.date + '|' + pickup.timeStr + '|' + pickup.driverID);
					Pickup.remove({_id: pickup._id}, function(err){
						if (err)
							throw err;
					})
				})
			}
			if (entries.length == 1){
				entry = entries[0];
			} else {
				entry = new Pickup();
				entry.studentID = pickup.studentID;
			}
//			if (entry.date !== pickup.date || entry.driverID !== pickup.driverID){
				entry.school = pickup.school;
				entry.timeStr = pickup.timeStr;
				entry.date = pickup.date;					
				entry.driverID = pickup.driverID;
				entry.save(function(err){
					if (err){
						throw err;
					}
					saveCnt++
					if (saveCnt == pickups.length){
						res.status(200).json({message: "Data updated!"});						
					}
				})
//			}
		})
	})
//	res.status(200).json({message: "Data updated!"});
}

module.exports.getAll = function(req, res){
	Pickup.find({}, function(err, pickups){
		if (err){
			throw err;
		}
		console.log("Get count: " + pickups.length)
		res.status(200).json(pickups)
	})
}

module.exports.get = function(req, res){
	var time_start = new Date(req.body.start_date);
	time_start.setHours(0); time_start.setMinutes(0); time_start.setSeconds(0);
	var time_end = new Date(req.body.end_date);
	time_end.setHours(23); time_end.setMinutes(59); time_end.setSeconds(59);
	console.log("Get All from: " + time_start)
	console.log("Get All to  : " + time_end)
	Pickup.find({date: {'$gte': time_start, '$lt': time_end}}, function(err, pickups){
		if (err){
			throw err;
		}
		console.log("Get count: " + pickups.length)
		res.status(200).json(pickups)
	})
}

module.exports.getByStudents = function(req, res){
	var time_start = new Date(req.body.start_date);
	time_start.setHours(0); time_start.setMinutes(0); time_start.setSeconds(0);
	var time_end = new Date(req.body.end_date);
	time_end.setHours(23); time_end.setMinutes(59); time_end.setSeconds(59);
	console.log("Get All from: " + time_start)
	console.log("Get All to  : " + time_end)
	Pickup.aggregate([
		{$match: {
			date: {'$gte': time_start, '$lt': time_end}
		}},
		{$sort:{
			"date": 1
		}},
		{$group: {
			_id: "$studentID",
			pickup: {
				$push: {
					date: "$date",
					time: "$timeStr",
					driver: "$driverID"
				}
			}
		}}
	], function(err, pickups){
		res.status(200).json(pickups)
	})
}

module.exports.getDrivers = function(req, res){
	var time_start = new Date(req.body.start_date);
	time_start.setHours(0); time_start.setMinutes(0); time_start.setSeconds(0);
	var time_end = new Date(req.body.end_date);
	time_end.setHours(23); time_end.setMinutes(59); time_end.setSeconds(59);
	
	Pickup.aggregate([
		{$match: {
			"timeStr": {"$exists": true, "$ne": ''}
		}},
		{$group: {
			_id: "$driveID",
			pickup: {
				$push: {
					name: "$studentID"
					
				}
			}
		}}
	], function(err, drivers){
		res.status(200).json(drivers);
	})
}

module.exports.remove = function(req, res){
	var time_start = new Date(req.body.start_date);
	time_start.setHours(0); time_start.setMinutes(0); time_start.setSeconds(0);
	var time_end = new Date(req.body.end_date);
	time_end.setHours(23); time_end.setMinutes(59); time_end.setSeconds(59);
	console.log("Remove from: " + time_start)
	console.log("Remove to  : " + time_end)
	Pickup.find({date: {'$gte': time_start, '$lte': time_end}}, function(err, pickups){
		if (err){
			throw err;
		}
		console.log("Remove count: " + pickups.length)
		pickups.forEach(function(pickup){
			Pickup.remove({_id: pickup._id}, function(err){
				if (err)
					throw err;
			})
		})
		res.status(200).json({message: 'data removed'});
	})
}

module.exports.removeOne = function(req, res){
	console.log("Removing pickupID: " + req.body.id)
	Pickup.remove({_id: req.body.id}, function(err){
		if (err)
			throw err;
	})
	res.status(200).json({message: 'data removed'});
}

module.exports.send = function(req, res){
	User.findOne({_id: req.body.report.id}, function(err, user){
		if (err){
			throw err;
		}
		// get cell phone and carrer
		var toText = user.cellPhone.replace(/[- ]/g, '') + '@' + user.carrier;
		var senderEmail = req.body.senderEmail;
		var senderName = req.body.senderName;
		var msg = [];
		req.body.report.task.forEach(function(task){
			var date = new Date(task.date)
			msg += date.getMonth() + 1 + '/' + date.getDate() + '\n'
			task.pickup.forEach(function(pickup){
				msg += pickup.time + ' @ ' + pickup.school + ':- '
				pickup.students.forEach(function(student, index){
					msg += ((index == 0) ? '' : ", ") + student;
				})
				msg += '\n'
			})
		})
		sendEmail.sendgridText([toText], process.env.ORG_EMAIL, process.env.ORG_NAME, "Pickup Schedule", msg, function(code){
			res.status(code).json({message: 'Report sent successfully!'});
		});
	})
	
	
}