// view -> controller(client) -> service(client) -> controller(api)
// info: https://toddmotto.com/factory-versus-service

(function(){
angular
	.module('jkcApp')
	.controller('resetPasswordCtrl', resetPasswordCtrl)
	
function resetPasswordCtrl($routeParams, $location, authentication){
	var vm = this
	vm.pageHeader = {
		title: 'Reset Your Password'
	}
	vm.returnPage = $location.path()
	
	vm.credentials = {
		password: "",
		confirmPassword: ""
	}
	vm.onSubmit = function(){
		vm.formError = "";
		if (!vm.credentials.password || !vm.credentials.confirmPassword
				|| vm.credentials.password != vm.credentials.confirmPassword){
			vm.formError = "Passwords not matching, please try again.";
			return false;
		} else {
			vm.doSetPassword();
		}
	}
	vm.doSetPassword = function(){
		console.log("In controller set password...")
		vm.formError = "";
		vm.credentials.userID = $routeParams.userID;
		vm.credentials.key = $routeParams.key;
		authentication.setPassword(vm.credentials)
			.then(function(data){
				if (data.message){
					vm.formError = data.message
				} else {
					$location.path('/login')
				}
			})
	}
}
})()