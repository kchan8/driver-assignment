(function(){
	
	function str2Time(strTime){
		if (strTime == undefined || strTime == null || strTime == '')
			return {
				hour: 23,
				minute: 59
			}
		var regex = /(\d+):(\d+)\s*(\w+)/;
		var token = regex.exec(strTime);
		if (token.length < 4 || !(token[3].toLowerCase() === "am" || token[3].toLowerCase() === "pm"))
			return {
				hour: 23,
				minute: 59
			}
		var hour = parseInt(token[1])
		// if hour is 12 and not PM, then hour is 0
		if (hour == 12 && token[3].toLowerCase() == "am"){
			hour = 0;
		} else if (hour != 12 && token[3].toLowerCase() == "pm") {			
			hour = hour + 12
		}
		var minute = parseInt(token[2])
		return {
			hour: hour,
			minute: minute
		}
	}
	
	function time2Str(date){
		var time = new Date(date);
		var hour = time.getHours();
		var minute = time.getMinutes();
		if (hour == 23 && minute == 59)
			return '';
		else if (hour <= 11) 
			return hour + ":" + minute.toLocaleString(undefined, {minimumIntegerDigits:2}) + " AM";
		else if (hour == 12)
			return hour + ":" + minute.toLocaleString(undefined, {minimumIntegerDigits:2}) + " PM";
		else
			return hour - 12 + ":" + minute.toLocaleString(undefined, {minimumIntegerDigits:2}) + " PM";
	}
	
	function getTime(strTime){
		if ((strTime == undefined) || strTime == '')
			return 1440
		var regex = /(\d+):(\d+)\s*(\w+)/;
		var token = regex.exec(strTime)
//		console.log(strTime)
		if (token == '' || token.length < 4)
			return 1440
		var hour = parseInt(token[1])
		// if hour is 12 and not PM, then hour is 0
		if (hour == 12 && token[3].toLowerCase() == "am"){
			console.log('detect 12:00am')
			hour = 0;
		} else if (hour != 12 && token[3].toLowerCase() == "pm") {			
			hour = hour + 12
		}
		var minute = parseInt(token[2])
		return hour * 60 + minute
	}

	function pickupAllCtrl($scope, $uibModal, $window, authentication){
		var vm = this;
		vm.drivers = [];
		var dayMS = 60 * 60 * 24 * 1000;
		$scope.disableSave = false;
		
		function isAdmin(){
			return authentication.isAdmin();
		};
		
		function setDates(start_date, end_date){
			if (start_date == null){			
				$scope.startDate = new Date();
				$scope.startDate.setHours(0);
				$scope.startDate.setMinutes(0);
				$scope.startDate.setSeconds(0);
				// always display 5 days
				if ($scope.startDate.getDay() == 6){
					$scope.startDate.setTime($scope.startDate.getTime() + 2 * dayMS);
				} else if ($scope.startDate.getDay() == 0){
					$scope.startDate.setTime($scope.startDate.getTime() + 1 * dayMS);					
				} 
				// this will display from Monday all the time
//				else if ($scope.startDate.getDay() != 1) {
//					$scope.startDate.setTime($scope.startDate.getTime() - ($scope.startDate.getDay() - 1) * dayMS);
//				}
//				console.log("Start " +$scope.startDate)
			}
			if (end_date == null){				
				$scope.endDate = new Date($scope.startDate.getTime())
				$scope.endDate.setHours(23);
				$scope.endDate.setMinutes(59);
				$scope.endDate.setSeconds(59);
				// show 5 days
				var numDays = 6 - $scope.startDate.getDay()
				// end date is Friday
				$scope.endDate.setTime($scope.endDate.getTime() + (numDays - 1) * dayMS)
//				console.log("End " +$scope.endDate)
			}
			
			$scope.displayDays = []
			for (var i=$scope.startDate.getDay(), j=0; i<=$scope.endDate.getDay(); i++, j++){
				$scope.weekDate = new Date()
				// Warning - setDate will keep the same MONTH!!! use set/getTime
//				$scope.weekDate.setDate($scope.startDate.getDate() + j)
				$scope.weekDate.setTime($scope.startDate.getTime() + j * dayMS);
				$scope.weekDate.setHours(12);
				$scope.weekDate.setMinutes(0);
				$scope.weekDate.setSeconds(0);
				// index: 0 is Monday... 4 is Friday, used to access user.pickup
				$scope.displayDays.push({index: i-1, weekday: $scope.days[i], date: $scope.weekDate})
			}
			
			// read user database, read pickup database, NO need to consider bell schedule
			authentication.getAllStudents($scope.startDate, $scope.endDate)
			.then(function(res){
				$scope.students = res;
//				$scope.students = [];
//				angular.forEach(res, function(student){
//					$scope.students.push(student)
//				})
				angular.forEach($scope.students, function(student){
					// deep copy, otherwise share same reference
					student.pickupSave = JSON.parse(JSON.stringify(student.pickup));
				})
				authentication.getPickups($scope.startDate, $scope.endDate)
				.then(function(res){
					console.log(res);
					// can't use pickup data to loop, if date is updated, then not every box will be updated
					res.forEach(function(entry){
//						console.log(entry.date + " | " + entry.timeStr + " | " + entry.studentID + " | " + entry.driverID)
						var pickupDate = new Date(entry.date);
						var weekday = pickupDate.getDay() - 1;
						entryFound = false;
						for (i=0; i<$scope.students.length; i++){
							if (entry.studentID == $scope.students[i].name.firstName + $scope.students[i].name.lastName){
//								$scope.students[i].pickup[weekday].pickup = entry.timeStr;
								entryFound = true;
								$scope.students[i].pickup[weekday].pickup = time2Str(entry.date);
								$scope.students[i].pickup[weekday].driver = entry.driverID;
							}
						}
						if (!entryFound){
							// can remove this pickup entry
							authentication.removeOnePickup(entry._id)
						}
					})
					// sort students based on time, then school
					$scope.students.sort(function(a,b){
						index = $scope.displayDays[0].index
						if (getTime(a.pickup[index].pickup) > getTime(b.pickup[index].pickup)){
							return 1;
						} else if (getTime(a.pickup[index].pickup) < getTime(b.pickup[index].pickup)){
							return -1;
						} else {
							// sort name in ascending order
							if (a.pickup[index].driver == null ||
								a.pickup[index].driver == undefined ||
								a.pickup[index].driver == "") {
								return 1
							} else if (b.pickup[index].driver == null ||
									b.pickup[index].driver == undefined ||
									b.pickup[index].driver == "") {
								return -1
							}
							return a.pickup[index].driver.localeCompare(b.pickup[index].driver)
						}
					})
					updateCount();
				})
			})
		}
		function updateCount(){
			angular.forEach($scope.displayDays, function(day){
				day.count = 0;
				angular.forEach($scope.students, function(student){
					if (student.pickup[day.index].pickup != '' || student.pickup[day.index].driver != ''){
						day.count++;
					}
				})
			})
		}
		
		$scope.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		
		$scope.format = 'M/d/yy'
//			$scope.today = new Date();
		$scope.popup1 = {
			opened: false
		}
		$scope.popup2 = {
			opened: false
		}
		$scope.open1 = function(){
			$scope.popup1.opened = true
		}
		$scope.open2 = function(){
			$scope.popup2.opened = true
		}
		$scope.startDateUpdated = function(){
			// change date to future or it is greater than 5 days 
			if ($scope.startDate > $scope.endDate || ($scope.endDate.getTime() - $scope.startDate.getTime()) / (60 * 60* 24 * 1000) > 5){
				setDates($scope.startDate, null);
			} else { 
				setDates($scope.startDate, $scope.endDate);
			}
		}
		$scope.endDateUpdated = function(){
			setDates($scope.startDate, $scope.endDate);
		}
		$scope.update = function(){
			$scope.disableSave = true;
			var pickups = [];
			angular.forEach($scope.displayDays, function(day){
				// set school schedule to regular if not set yet, use create
//				anthentication.createSchedule(day.date, 'All', 'Regulsr');
				angular.forEach($scope.students, function(student){
					var pickupTime = new Date(day.date);
					pickupTime.setHours(str2Time(student.pickup[day.index].pickup).hour)
					pickupTime.setMinutes(str2Time(student.pickup[day.index].pickup).minute)
					pickups.push({studentID: student.name.firstName + student.name.lastName,
						school: student.school,
						timeStr: student.pickup[day.index].pickup,
						date: pickupTime,
						driverID: student.pickup[day.index].driver});
				})
			})
//			console.log("Update count: " + pickups.length)
			authentication.updatePickup(pickups)
			.then(function(res){
//				console.log("res: " + JSON.stringify(res))
				$scope.disableSave = false;
			});
		}
		// copy current week assignment to week in the future
		$scope.copyToWeek = function(week){
			var pickups = [];
			angular.forEach($scope.displayDays, function(day){
				var nextWeek = new Date(day.date);
				nextWeek.setTime(nextWeek.getTime() + 7 * dayMS * week);
				console.log(nextWeek.getDate())
				angular.forEach($scope.students, function(student){
					pickups.push({studentID: student.name.firstName + student.name.lastName,
						school: student.school,
						timeStr: student.pickup[day.index].pickup,
						date: new Date(nextWeek),
						driverID: student.pickup[day.index].driver});
				})
//				console.log(pickups)
			})
			authentication.updatePickup(pickups);
		}
		// copy historical week assignment to current week
		$scope.copyFromWeek = function(week){
			var startDate = new Date($scope.displayDays[0].date)
			startDate.setHours(0); startDate.setMinutes(0); startDate.setSeconds(0);
			startDate.setTime(startDate.getTime() - 7 * dayMS * week)
			var endDate = new Date($scope.displayDays.slice(-1)[0].date)
			endDate.setHours(23); endDate.setMinutes(59); endDate.setSeconds(59);
			endDate.setTime(endDate.getTime() - 7 * dayMS * week)
			authentication.getPickups(startDate, endDate)
			.then(function(res){
				res.forEach(function(entry){
					var pickupDate = new Date(entry.date);
					var weekday = pickupDate.getDay() - 1;
					for (i=0; i<$scope.students.length; i++){
						if (entry.studentID == $scope.students[i].name.firstName + $scope.students[i].name.lastName){
							$scope.students[i].pickup[weekday].pickup = entry.timeStr;
							$scope.students[i].pickup[weekday].driver = entry.driverID;
						}
					}
				})
				$scope.update();
			})
		}
		
		$scope.remove = function(date){
//			console.log($scope.students)
			$scope.date = date;
			$uibModal.open({
				templateUrl: './pickup/removePickup.modal.html',
				controller: 'removePickupModalCtrl',
				size: 'lg',
				resolve: {
					date: function(){
						return date;
					},
					students: function(){
						return $scope.students;
					}
				}
			}).result.then(function(){
				// https://stackoverflow.com/questions/30356844/angularjs-bootstrap-modal-closing-call-when-clicking-outside-esc
				// 1st function is doClosure
				// 2nd function is doDismiss
//				$window.location.reload();
			}, function(res){
				// this takes care of unhandled rejection backdrop click & escape
				if (['backdrop click', 'escape key press'].indexOf(res) === -1){
					throw res;
				}
			});			
		}
		$scope.changeSchedule = function(date){
			// get all districts
			authentication.getAllDistricts()
			.then(function(res){
				var districts = res;
				// get the schedule in database
				authentication.getSchedule(date)
				.then(function(res){
					var schedules = []
					if (res.length != 0){
						console.log("Find record")
						schedules = res.schedules;
					} else {
						console.log("New record")
						districts.forEach(function(district){
							schedules.push({district: district._id, bell:"1"})
						})
					}

					var note = "";
					$uibModal.open({
						templateUrl: './pickup/changeSchedule.modal.html',
						controller: 'changeScheduleModalCtrl',
						size: 'md',
						resolve: {
							date: function(){
								return date;
							},
							schedules: function(){
								return schedules;
							},
							note: function(){
								return note;
							},
							students: function(){
								return $scope.students;
							}
						}
					}).result.then(function(){
						// https://stackoverflow.com/questions/30356844/angularjs-bootstrap-modal-closing-call-when-clicking-outside-esc
						// 1st function is doClosure
						// 2nd function is doDismiss
					}, function(res){
						// this takes care of unhandled rejection backdrop click & escape
						if (['backdrop click', 'escape key press'].indexOf(res) === -1){
							throw res;
						}
					});
				})
			})
		}
		
		$scope.drivers = function(){
			report = genReport();
			drivers = vm.drivers.slice(1);
			// show drivers that are in the report
			removeList = [];
			angular.forEach(drivers, function(driver){
				if (report.find(o => o.driver === driver.name) == undefined){
					removeList.push(driver)
				}
			})
//			console.log("Remove: " + JSON.stringify(removeList))
			angular.forEach(removeList, function(entry){
				var index = drivers.map(function(item){
					return item.name
				}).indexOf(entry.name)
				drivers.splice(index, 1);
			})
			drivers.push({name:'ALL', color:"#dddddd"})
			$uibModal.open({
				templateUrl: './pickup/driver.modal.html',
				controller: 'driverModalCtrl',
				size: 'md',
				resolve: {
					drivers: function(){
						return drivers;
					},
					report: function(){
						return report;
					}
				}
			}).result.then(function(){
				// https://stackoverflow.com/questions/30356844/angularjs-bootstrap-modal-closing-call-when-clicking-outside-esc
				// 1st function is doClosure
				// 2nd function is doDismiss
			}, function(res){
				// this takes care of unhandled rejection backdrop click & escape
				if (['backdrop click', 'escape key press'].indexOf(res) === -1){
					throw res;
				}
			});
			
		}
		
		function compareDate(date1, date2){
			return date1.getMonth() == date2.getMonth() &&
				   date1.getDay() == date2.getDay() &&
				   date1.getYear() == date2.getYear()
		}
		
		function genReport(){
			var report = [];	// driver:, id:, task:[{date: pickup:[{time:, school:, students:[]}]}]
			var driver, pickupDate, pickupTime, school, name;
			var foundDriver, foundTask, foundPickup;
			angular.forEach($scope.displayDays, function(day){
				angular.forEach($scope.students, function(student){
					if (student.pickup[day.index].pickup != '' ||
						student.pickup[day.index].driver != ''
						){
						driver = student.pickup[day.index].driver;
						pickupTime = student.pickup[day.index].pickup;
						pickupDate = new Date(day.date)
						pickupDate.setHours(str2Time(pickupTime).hour)
						pickupDate.setMinutes(str2Time(pickupTime).minute)
						school = student.school
//						name = student.name.firstName + " " + student.name.lastName
						name = student.name.firstName
						
						foundDriver = false;
						foundTask = false;
						foundPickup = false
						for(var i=0; i<report.length; i++){
							if (report[i].driver == driver){
								foundDriver = true
								for(var j=0; j<report[i].task.length; j++){
									if (compareDate(report[i].task[j].date, pickupDate)){
										foundTask = true
										for(var k=0; k<report[i].task[j].pickup.length; k++){
											if (report[i].task[j].pickup[k].time == pickupTime &&
												report[i].task[j].pickup[k].school == school){
												foundPickup = true
												report[i].task[j].pickup[k].students.push(name)
											}
										}
										if (!foundPickup){
											report[i].task[j].pickup.push({time: pickupTime,
																		   school: school,
																		   students: [name]})
										}
									}								
								}
								if (!foundTask){
									report[i].task.push({date: pickupDate,
														 pickup:[{time: pickupTime,
															 	  school: school,
															 	  students: [name]}]})
								}
							}
						}
						if (!foundDriver && driver.toLowerCase() !== "self" && driver !== ''){
							report.push({driver: driver, id: vm.drivers.find(o => o.name == driver).id,
								task:[{date: pickupDate,
										pickup:[{time: pickupTime,
												 school: school,
												 students: [name]}]
								}]
							})
						}
					}
				})
			})
			// sort the pickup by time
			angular.forEach(report, function(entry){
				angular.forEach(entry.task, function(task){
					task.pickup.sort(function(a,b){
						return getTime(a.time) - getTime(b.time)
					})
				})
			})
			return report;
		}
		
		$scope.getColor = function(driver){
			for(var i=0; i<vm.drivers.length; i++){
				if (vm.drivers[i].name == driver){
					return vm.drivers[i].color;
				}
			}
		}

		// function code start here
		authentication.getDrivers()
		.then(function(res){
			vm.drivers.push({name:'', color:"#ffffff"});
			vm.drivers.push({name:'Self', color:"#eeeeee"});
			angular.forEach(res, function(user){
				vm.drivers.push({name:user.name.firstName, id:user._id, color:user.backgroundColor});
			})
			setDates(null, null);	// read active users
			updateCount();
		})
	}
	
	function driverModalCtrl($scope, $uibModalInstance, authentication, drivers, report){
		$scope.drivers = drivers;
		$scope.getReport = function(driver){
			if (driver == "ALL"){
				$scope.report = report
			} else {
				entry = [];
				entry.push(report.find(o => o.driver === driver));
				$scope.report = entry;
			}
		}
		$scope.cancel = function(){
			$uibModalInstance.close(false);
		}
		$scope.send = function(reports){
			angular.forEach(reports, function(report){
				if (report != undefined){
					console.log("Send to " + report.driver)
					authentication.sendReport(report)
				}
			})
			$uibModalInstance.close('save');
		}
	}
	
	// todo - add option to distinguish close vs no school
	function removePickupModalCtrl($scope, $uibModalInstance, authentication, date, students, $window){
		$scope.date = date;
		$scope.index = date.getDay() - 1;
		$scope.cancel = function(){
			$uibModalInstance.close(false);
		}
		$scope.noSchool = function(){
			for (i=0; i<students.length; i++){
				students[i].pickup[$scope.index].pickup = '9:00 AM';
				students[i].pickup[$scope.index].driver = 'Self';
			}
			$uibModalInstance.close('save');
		}
		$scope.close = function(){	
			for (i=0; i<students.length; i++){
				students[i].pickup[$scope.index].pickup = '';
				students[i].pickup[$scope.index].driver = '';
			}
			$uibModalInstance.close('save');
			
//			authentication.removePickup(date)
//			.then(function(){
//				var index = date.getDay() - 1;
//				angular.forEach(students, function(student){
//					console.log(student.pickup[index].driver);
//				});
//				$uibModalInstance.close('save');
//				$window.location.reload();
//			});
		}
	}
	
	function changeScheduleModalCtrl($scope, $uibModalInstance, authentication, date, schedules, note, students, $window){
		$scope.schedules = schedules;
		$scope.cancel = function(){
			$uibModalInstance.close(false);
		}
		$scope.save = function(){
			authentication.updateSchedule(date, schedules, note)
			.then(function(){
				$uibModalInstance.close('save');
				var weekDay = date.getDay() - 1;
				var pickups = [];
				angular.forEach(students, function(student){
					var schedule = schedules.find(o => o.district == student.schoolCity);
					if (schedule != undefined){						
						if (schedule.bell == "1"){	// regular
							student.pickup[weekDay].pickup = student.pickupSave[weekDay].pickup;
						} else if (schedule.bell == "2"){ // minimum
							// only if driver is not null
							if (student.pickup[weekDay].driver != ""){								
								student.pickup[weekDay].pickup = student.pickupSave[5].pickup;						
							}
						} else if (schedule.bell == "3"){ // no school
							student.pickup[weekDay].pickup = "";
						}
						var pickupTime = new Date(date);
						pickupTime.setHours(str2Time(student.pickup[weekDay].pickup).hour)
						pickupTime.setMinutes(str2Time(student.pickup[weekDay].pickup).minute)
						pickups.push({studentID: student.name.firstName + student.name.lastName,
							school: student.school,
							timeStr: student.pickup[weekDay].pickup,
							date: pickupTime,
							driverID: student.pickup[weekDay].driver});
					}
				})
				authentication.updatePickup(pickups);
			});
		}
	}

	
	angular
	.module('jkcApp')
	.controller('pickupAllCtrl', pickupAllCtrl)
	.controller('removePickupModalCtrl', removePickupModalCtrl)
	.controller('changeScheduleModalCtrl', changeScheduleModalCtrl)
	.controller('driverModalCtrl', driverModalCtrl)

})();