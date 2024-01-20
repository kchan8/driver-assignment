(function(){

function navigationCtrl($scope, $window, $location, $uibModal, authentication){
	var vm = this;
	
	// use function can update directive automatically
	var isLoggedIn = function(){
		return authentication.isLoggedIn();
	};
	var isAdmin = function(){
		return authentication.isAdmin();
	};
	var isTeacher = function(){
		return authentication.isTeacher();
	};
	var currentUser = function(){
		return authentication.currentUser();
	};
	var logout = function(){
		authentication.logout();
		$location.path('/');
	};
	
	var profile = function(id){
		authentication.getUserDetailsById(id)
			.then(function(res){
				$uibModal.open({
					templateUrl: './common/directives/navigation/profile.modal.html',
					controller: 'profileModalCtrl',
					size: 'lg',
					resolve: {
						user: function(){
							return res;
						}
					}
				}).result.catch(function(res){
					// this takes care of unhandled rejection backdrop click & escape
					if (['backdrop click', 'escape key press'].indexOf(res) === -1){
						throw res;
					}
				});
			});
	};
	
	var addUser = function(){
		$uibModal.open({
			templateUrl: './common/directives/navigation/addUser.modal.html',
			controller: 'addUserModalCtrl',
			size: 'lg',
//			scope: $scope,
//			resolve: {
//				addUser: function(){
//					return $scope.addUser;
//				}
//			}
		}).result.then(function(){
			// https://stackoverflow.com/questions/30356844/angularjs-bootstrap-modal-closing-call-when-clicking-outside-esc
			// 1st function is doClosure
			// 2nd function is doDismiss
			$window.location.reload();
		}, function(res){
			// this takes care of unhandled rejection backdrop click & escape
			if (['backdrop click', 'escape key press'].indexOf(res) === -1){
				throw res;
			}
		});
	};
	
	var children = isLoggedIn() ? currentUser().children : [];
	var getChildren = function(){
		return children;
	};
	
	vm.currentPath = $location.path();
	vm.isLoggedIn = isLoggedIn;
	vm.isAdmin = isAdmin;
	vm.isTeacher = isTeacher;
	vm.currentUser = currentUser;
	vm.logout = logout;
	vm.profile = profile;
	vm.getChildren = getChildren;
	vm.addUser = addUser;
}

function profileModalCtrl($scope, $uibModalInstance, authentication, user){
	$scope.user = user;
	$scope.cancel = function(){
		$uibModalInstance.close(false);
	};
	$scope.update = function(){
		authentication.updateUser(user)
			.then(function(){				
				$uibModalInstance.close('save');
			});
	};
}

// http://bl.ocks.org/rnkoaa/8333940
// not working yet - form can't validate
function addUserModalCtrl($scope, $uibModalInstance, authentication){
	$scope.form = {};
	$scope.active = true;
	$scope.child = "child";	// html can use ng-value="child" or use plain value="child"
	$scope.adult = "adult";
	$scope.days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Min-Day"];
	$scope.daylist = [{pickup:'', driver:''},
		{pickup:'', driver:''},
		{pickup:'', driver:''},
		{pickup:'', driver:''},
		{pickup:'', driver:''},
		{pickup:'', driver:''}];
//	$scope.updateWeekday = function(weekday){
//		console.log(weekday.name + " is clicked state is " + weekday.attend )
//		if (!weekday.attend){
//			console.log("set allWeek to false")
//			// no ng-checked for the 5-days checkbox, ng-model can't be changed in code
//			$scope.allWeek = false;
//		}
//	}
//	$scope.allWeekToggle = function(allWeek){
//		angular.forEach($scope.daylist, function(weekday){
//			weekday.attend = allWeek
//		})
//	}
	
	// doing this will not have $scope.user in create() ??? 
//	$scope.user = []
//	$scope.user.type = "child"
	$scope.enrollDate = new Date();
	$scope.lastDate = new Date();
	$scope.lastDate.setFullYear(2019, 4, 31);
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
		
	$scope.cancel = function(){
		$uibModalInstance.close(false);
	};
	$scope.create = function(){
		if ($scope.form.addUser.$valid){
//			console.log('type: ' + $scope.user.type);
//			console.log('firstname: ' + $scope.user.name.firstName);
//			console.log('userType: ' + $scope.user.userType);
			$scope.user.active = $scope.active;
			$scope.user.pickup = $scope.daylist;
			if ($scope.user.name.firstName){
				if ($scope.user.type == "adult"){
					$scope.user.grade = "";
				}
				if ($scope.user.type == "child"){
					$scope.user.userType = ['Student'];
				}
				$scope.user.enrollment = [{enroll: $scope.enrollDate, last: $scope.lastDate}]
				authentication.createUser($scope.user)
					.then(function(){
						$uibModalInstance.close('save');
					});
			} 
		}
	};
}

angular
	.module('jkcApp')
	.controller('navigationCtrl', navigationCtrl)
	.controller('profileModalCtrl', profileModalCtrl)
	.controller('addUserModalCtrl', addUserModalCtrl);

})();