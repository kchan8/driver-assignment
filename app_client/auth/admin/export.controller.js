(function(){
// https://atasteofsandwich.wordpress.com/2014/02/03/client-side-csv-download-with-angularjs/
var stringConstructor = "test".constructor;
var arrayConstructor = [].constructor;
var objectConstructor = {}.constructor;

function whatIsIt(object) {
    if (object === null) {
        return "null";
    }
    else if (object === undefined) {
        return "undefined";
    }
    else if (object.constructor === stringConstructor) {
        return "String";
    }
    else if (object.constructor === arrayConstructor) {
        return "Array";
    }
    else if (object.constructor === objectConstructor) {
        return "Object";
    }
    else {
        return "don't know";
    }
}

// https://codepen.io/sandeep821/pen/JKaYZq
function saveTextAsFile (data, filename){
    if(!data) {
        console.error('Console.save: No data')
        return;
    }

    if(!filename) filename = 'console.json'

    var blob = new Blob([data], {type: 'text/plain'})
    var e    = document.createEvent('MouseEvents')
    var a    = document.createElement('a')
    // FOR IE:

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        // var e = document.createEvent('MouseEvents');
        // var a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
        e.initEvent('click', true, false, window,
            0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }
}

function date2Str(date){
	var date_ = new Date(date)
	return (date_.getMonth() + 1 + '/' + date_.getDate() + '/' + date_.getFullYear())
}

function getWeekDays(begin, end){
	var dayMS = 60 * 60 * 24 * 1000;
	var dayBegin = new Date(begin);
	dayBegin.setHours(0); dayBegin.setMinutes(0);
	var dayEnd = new Date(end);
	dayEnd.setHours(23); dayEnd.setMinutes(59);
	var dayPtr = dayBegin;
	dayPtr.setHours(12); dayPtr.setMinutes(0);
	var days = []
	while (dayPtr.getTime() < dayEnd.getTime()){
		if (dayPtr.getDay() >= 1 && dayPtr.getDay() <= 5){
			days.push(dayPtr.getMonth() + 1 + '/' + dayPtr.getDate() + '/' + dayPtr.getFullYear().toString().substr(-2))
		}
		dayPtr.setTime(dayPtr.getTime() + dayMS);
	}
	return days;
}

function getDate(date){
	var day = new Date(date);
	return day.getMonth() + 1 + '/' + day.getDate() + '/' + day.getFullYear().toString().substr(-2);
}

function getDateStr(date){
	var day = new Date(date);
	return day.toISOString().substr(0, 10).replace(/-/g, '');
}

function exportCtrl($scope, authentication){
	$scope.format = 'M/d/yy';
	$scope.fromDate = new Date();
	$scope.fromDate.setFullYear(2019, 0, 7);
	$scope.toDate = new Date();
	$scope.popup1 = {
		opened: false
	}
	$scope.popup2 = {
		opened: false
	}
	$scope.open1 = function(){
		$scope.popup1.opened = true;
	}
	$scope.open2 = function(){
		$scope.popup2.opened = true;
	}
	
	function findDriver(pickups, student, date){
		for(var i=0; i<pickups.length; i++){
			var pickupDate = new Date(pickups[i].date);
			if (pickups[i].studentID == student.name.firstName + student.name.lastName &&
					pickupDate.getDay() == date){
//				console.log('found: ' + student.name.firstName + student.name.lastName)
				return pickups[i].driverID;
			}
		}
		return "";
	}
	
    $scope.exportStudents = function(){
        // get this Monday to Friday
        var startDate = new Date();
		if (startDate.getDay() != 1) {
			startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
		}
		var endDate = new Date(startDate.getTime());
		// end date is Friday
		endDate.setDate(endDate.getDate() + 5 - startDate.getDay());
		
		authentication.getPickups(startDate, endDate)
			.then(function(pickups){
				authentication.getAllUsers()
				.then(function(res){
//					console.log(res);
					var students = '';
					
					var sHdr = ["First Name", "Last Name", "Gender", "Grade",
						"Home Address", "Home City", "Home Zip",
						"School", "School Address", "School City",
						"Begin Date", "Last Date",
						"Parent 1 First Name", "Parent 1 Last Name", "Parent 1 Phone", "Parent 1 e-mail", "Relationship 1",
						"Parent 2 First Name", "Parent 2 Last Name", "Parent 2 Phone", "Parent 2 e-mail", "Relationship 2",
						"Mon-Pickup", "Mon-Driver", "Tue-Pickup", "Tue-Driver", "Wed-Pickup", "Wed-Driver",
						"Thu-Pickup", "Thu-Driver", "Fri-Pickup", "Fri-Driver", "Min-Pickup"
						];
					students += sHdr.join(',') + '\n';               
					res.forEach(function(record){
						if (record.userType.indexOf('Student') !== -1){
							var fields = [record.name.firstName, record.name.lastName, record.gender, record.grade,
								record.homeAddress, record.homeCity, record.homeZip,
								record.school, record.schoolAdress, record.schoolCity,
								date2Str(record.enrollment[0].enroll), date2Str(record.enrollment[0].last),
								record.parent1FirstName, record.parent1LastName, record.parent1Phone, record.parent1Email, record.relationship1,
								record.parent2FirstName, record.parent2LastName, record.parent2Phone, record.parent2Email, record.relationship2,
								record.pickup[0].pickup, findDriver(pickups, record, 1),
								record.pickup[1].pickup, findDriver(pickups, record, 2),
								record.pickup[2].pickup, findDriver(pickups, record, 3),
								record.pickup[3].pickup, findDriver(pickups, record, 4),
								record.pickup[4].pickup, findDriver(pickups, record, 5),
								record.pickup[5].pickup
								];
							students += fields.join(',') + '\n';
						}
					})
					saveTextAsFile(students, "student.csv");
				})
			})
    }
    
    $scope.exportWorkers = function(){
    	authentication.getAllUsers()
		.then(function(res){
			var workers = '';
			var wHdr = ["First Name", "Last Name", "Cell PHone", "Carrier", "E-mail", "Roles", "Color"]
			workers += wHdr.join(',') + '\n';
			res.forEach(function(record){
				if ((record.userType.indexOf('Student') == -1) && (record.userType.indexOf('Parent') == -1)){
					var fields = [record.name.firstName, record.name.lastName, record.cellPhone, record.carrier,
						record.email, record.userType.join('-'), record.backgroundColor]
					workers += fields.join(',') + '\n';
				}
			})
			saveTextAsFile(workers, "worker.csv");
		})
    }

    $scope.exportPickups = function(){
    	authentication.getAllPickups()
		.then(function(res){
			var pickups = '';
			var pickupHdr = ["Student ID", "School", "Date", "Time", "Driver"];
			pickups += pickupHdr.join(',') + '\n';
			res.forEach(function(record){
				var fields = [record.studentID, record.school, date2Str(record.date), record.timeStr, record.driverID];
				pickups += fields.join(',') + '\n';
			})
			saveTextAsFile(pickups, "pickup.csv");
		})
    }
    
    $scope.exportAttendance = function(){
    	authentication.getPickupsByStudents($scope.fromDate, $scope.toDate)
		.then(function(pickups){
			authentication.getAllStudents($scope.fromDate, $scope.toDate)
			.then(function(res){
				var students = '';
				var sHdr = ["Student Name", "Gender", "Grade", "School"];
				// add the dates
				var days = getWeekDays($scope.fromDate, $scope.toDate)
				sHdr = sHdr.concat(days);
				students += sHdr.join(',') + '\n';
				res.forEach(function(record){
					var fields = [record.name.firstName + ' ' + record.name.lastName,
						record.gender[0], record.grade, record.school, 
						];
					// find the id
					var studentID = record.name.firstName + record.name.lastName;
					var user = pickups.find(e => e._id == studentID);
					days.forEach(function(day){
						var dayFound = false;
						for(var i=0; i<user.pickup.length; i++){
							if (day == getDate(user.pickup[i].date)){
								dayFound = true;
								fields.push(user.pickup[i].driver);
								break;
							}
						}
						if (!dayFound) {
							fields.push('');
						}
					})
					students += fields.join(',') + '\n';
				})
				saveTextAsFile(students, "attendance_" + getDateStr($scope.fromDate) + '-' + getDateStr($scope.toDate) + ".csv");
			})
		})
    }
}

angular
    .module('jkcApp')
    .controller('exportCtrl', exportCtrl)
})();