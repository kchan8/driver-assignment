(function(){

	function removeUserCtrl ($uibModal, $window, authentication){
		var vm = this
		vm.header = {
			title: 'Remove User'
		}
		
		vm.removeUser = function(){
			var removeUsers = []
			angular.forEach(vm.users, function(user){
				if (user.select == true){
					console.log(user.name.firstName)
					removeUsers.push(user)
				}
			})
			$uibModal.open({
				templateUrl: './auth/admin/removeUser.modal.html',
				controller: 'removeUserModalCtrl',
				size: 'lg',
				resolve: {
					users: function(){
						return removeUsers;
					}
				}
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
			})
		}

		function init(){
			return authentication.getAllUsers()
			.then(function(res){
				vm.users = res;
			})
		}
		init();
	}
	
	function removeUserModalCtrl($scope, $uibModalInstance, authentication, users){
		var userStr = "";
		var userIDs = [];
		angular.forEach(users, function(user){
			if (userStr != ""){
				userStr += ', ';
			}
			userStr += user.name.firstName + ' ' + user.name.lastName
			userIDs.push(user._id)
		})
		$scope.message = "Proceed to remove " + userStr + " from database?";
		$scope.cancel = function(){
			$uibModalInstance.close(false)
		}
		$scope.remove = function(){
			authentication.removeUser(userIDs)
			.then(function(){				
				$uibModalInstance.close('save');
			});
		}
	}

	angular
	.module('jkcApp')
	.controller('removeUserCtrl', removeUserCtrl)
	.controller('removeUserModalCtrl', removeUserModalCtrl)
})();