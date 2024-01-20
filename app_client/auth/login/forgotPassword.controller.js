// view -> controller(client) -> service(client) -> controller(api)
// info: https://toddmotto.com/factory-versus-service

(function(){
angular
	.module('jkcApp')
	.controller('forgotPasswordCtrl', forgotPasswordCtrl)
	
function forgotPasswordCtrl($location, authentication){
	var vm = this
	vm.pageHeader = {
		title: 'Forgot Your Password?'
	}
	vm.returnPage = $location.path()
	
	vm.credentials = {
		email: ""
	}
	vm.onSubmit = function(){
		vm.formError = "";
		if (!vm.credentials.email){
			vm.formError = "E-mail required, please try again";
			return false;
		} else {
			vm.doResetPassword();
		}
	}
	vm.doResetPassword = function(){
		console.log("In controller reset password...")
		vm.formError = ""
		authentication.resetPassword(vm.credentials.email)
			.then(function(data){
				if (data){
					console.log(data)
					vm.formError = data.message
				} else {
					$location.path('/')
				}
			})
	}
}
})()