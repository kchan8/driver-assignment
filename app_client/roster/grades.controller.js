(function(){

	function gradesCtrl($uibModal, authentication){
		var vm = this;
		vm.header = {
			date: new Date()
		};
		vm.allGrades = ["TK", "K", "1st", "2nd", "3rd", "4th", "5th"];

		vm.userinfo = function(user){
			authentication.getUserDetailsById(user.id)
			.then(function(res){
				$uibModal.open({
					templateUrl: './roster/user.modal.html',
					controller: 'userModalCtrl',
					size: 'md',
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
				})
			})
		}

		function init(){
			authentication.getStudentsByGrades()
			.then(function(res){
				vm.counts = {
						"TK": 0,
						"K": 0,
						"1st": 0,
						"2nd": 0,
						"3rd": 0,
						"4th": 0,
						"5th": 0
				};
				vm.total = 0;

				vm.grades = res;
//				console.log("Result: " + JSON.stringify(res))

				angular.forEach(vm.grades, function(group, key){
					// key is only a number, no use for it
//					console.log(group._id + ":" + group._id.length);
					angular.forEach(group, function(data, key){
						if (key === "users") {
							angular.forEach(data, function(child, key){							
								vm.counts[group._id]++;
//								if ((group._id !== 'Parent') && (group._id !== null)){								
									vm.total++;
//								}
							})
						}
					});
				});
			});
		}
		init();

	}

	function userModalCtrl($scope, $uibModalInstance, user){
		$scope.user = user;
		$scope.cancel = function(){
			$uibModalInstance.close(false);
		};
		$scope.ok = function(){
			$uibModalInstance.close('save');
		};
	}

	angular
	.module('jkcApp')
	.controller('gradesCtrl', gradesCtrl)
	.controller('userModalCtrl', userModalCtrl)

})()