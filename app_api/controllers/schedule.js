var mongoose = require('mongoose');
var Schedule = mongoose.model('Schedule');

module.exports.get = function(req, res){
	var time_start = new Date(req.body.date);
	time_start.setHours(0); time_start.setMinutes(0); time_start.setSeconds(0);
	var time_end = new Date(req.body.date);
	time_end.setHours(23); time_end.setMinutes(59); time_end.setSeconds(59);
	Schedule.find({date: {'$gte': time_start, '$lt': time_end}}, function(err, records){
		if (err)
			throw err;
		if (records.length == 0){
			res.status(200).json();
		} else {			
			res.status(200).json(records[0]);
		}
	})
}

module.exports.update = function(req, res){
	var time_start = new Date(req.body.date);
	time_start.setHours(0); time_start.setMinutes(0); time_start.setSeconds(0);
	var time_end = new Date(req.body.date);
	time_end.setHours(23); time_end.setMinutes(59); time_end.setSeconds(59);
	Schedule.find({date: {'$gte': time_start, '$lt': time_end}}, function(err, records){
		if (err)
			throw err;
		var record;
		if (records.length == 0){
			record = new Schedule();
			time_start.setHours(12);
			record.date = time_start;
		} else {
			record = records[0];
		}
		record.schedules = req.body.schedules;
		record.note = req.body.note;
		record.save(function(err){
			if (err)
				throw err;
			res.status(200).json({message: "Schedule updated!"});
		})
	})
}