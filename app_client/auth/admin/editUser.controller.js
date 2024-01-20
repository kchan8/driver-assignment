(function(){
angular
	.module('jkcApp')
	.controller('editUserCtrl', editUserCtrl)
	.controller('editUserModalCtrl', editUserModalCtrl)
	
function editUserCtrl(authentication, $uibModal, $scope){
	var vm = this
	vm.header = {
		date: new Date()
	}
	
	$scope.getStudents = function(grade){
		return grade._id == "1st" ||
			   grade._id == "2nd" ||
			   grade._id == "3rd" ||
			   grade._id == "4th" ||
			   grade._id == "5th"
	}
	$scope.getAdults = function(grade){
		return grade._id == undefined || grade._id == null || grade._id == ''
	}
	function init(){
		authentication.getAllUsersByGrade()
		.then(function(res){
			vm.counts = {
					"TK": 0,
					"K": 0,
					"1st": 0,
					"2nd": 0,
					"3rd": 0,
					"4th": 0,
					"5th": 0,
					"Adults": 0
			};
			
			vm.grades = res;
//			console.log("Result: " + JSON.stringify(res))
			
			angular.forEach(vm.grades, function(group, key){
				// key is only a number, no use for it
//				console.log(group._id + ":" + group._id.length);
				angular.forEach(group, function(data, key){
					if (key === "users") {
						angular.forEach(data, function(child, key){							
							if (group._id == undefined || group._id == ""){
								vm.counts["Adults"]++
							} else {								
								vm.counts[group._id]++;
							}
						})
					}
				});
			});
		});
	}
	init();
	
	vm.allGroups = ["TK", "K", "1st", "2nd", "3rd", "4th", "5th", "Adults"];
	
	vm.userinfo = function(user){
		authentication.getUserDetailsById(user.id)
			.then(function(res){
//				console.log(res)
				var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Min-Day"];
				if (res.pickup == ''){
					console.log ("pickup is null")
					res.pickup = [{pickup:'', driver:''},
						{pickup:'', driver:''},
						{pickup:'', driver:''},
						{pickup:'', driver:''},
						{pickup:'', driver:''},
						{pickup:'', driver:''}];
				} else {
					for (var i=0; i<res.pickup.length; i++){
						if (res.pickup[i].pickup !== '') {
							res.pickup[i].attend = true;
						} else {
							res.pickup[i].attend = false;
						}
					}
				}
				$uibModal.open({
					templateUrl: './auth/admin/user.modal.html',
					controller: 'editUserModalCtrl',
					size: 'lg',
					resolve: {
						user: function(){
							return res;
						},
						days: function(){
							return days;
						}
					}
				}).result.catch(function(res){
					// this takes care of unhandled rejection backdrop click & escape
					if (['backdrop click', 'escape key press'].indexOf(res) === -1){
						throw res;
					}
				})
			})
	}
}

function editUserModalCtrl($scope, $uibModalInstance, authentication, user, days){
	if (user.enrollment == undefined || user.enrollment == null || user.enrollment == ''){
		$scope.enrollDate = new Date();
		$scope.enrollDate.setFullYear(2018, 7, 13);
		$scope.lastDate = new Date();
		$scope.lastDate.setFullYear(2019, 4, 31);
	} else {
		// todo- get the last in the array
		$scope.enrollDate = new Date(user.enrollment[0].enroll)
		$scope.lastDate = new Date(user.enrollment[0].last)
	}
//	console.log(user.active)
	$scope.user = user;
	$scope.days = days;
	
	$scope.format = 'M/d/yy'
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
	
	if (user.userType.indexOf("Student") != -1){
		$scope.user.type = "child"
	} else {
		$scope.user.type = "adult"		
	}
	$scope.cancel = function(){
		$uibModalInstance.close(false)
	}
//	$scope.allWeekToggle = function(allWeek){
//		angular.forEach($scope.user.pickup, function(weekday){
//			weekday.attend = allWeek
//		})
//	}
	$scope.update = function(){
		for (var i=0; i<user.pickup.length; i++){
			if (user.pickup[i].attend == false) {
				user.pickup[i].pickup = '';
			}	
		}
		if ($scope.user.type == "child"){
			user.userType = "Student"
		}
		user.enrollment = [{enroll: $scope.enrollDate, last: $scope.lastDate}]
		console.log("Update active: " + user.active)
		authentication.updateUser(user)
		.then(function(){				
			$uibModalInstance.close('save');
		});
	}
}
	
})()