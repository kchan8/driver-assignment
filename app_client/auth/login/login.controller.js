// view -> controller(client) -> service(client) -> controller(api)
// info: https://toddmotto.com/factory-versus-service

(function(){

function loginCtrl($location, authentication){
	var vm = this;
	vm.pageHeader = {
		title: 'Login'
	};
	vm.returnPage = $location.path();
	
	vm.credentials = {
		username: "",
		password: ""
	};
	vm.onSubmit = function(){
		vm.formError = "";
		if (!vm.credentials.username || !vm.credentials.password){
			vm.formError = "All fields required, please try again";
			return false;
		} else {
			vm.doLogin();
		}
	};
	vm.doLogin = function(){
		console.log("In controller login...");
		vm.formError = "";
		authentication.login(vm.credentials)
			.then(function(data){
				if (data){
//					console.log(data)
					vm.formError = data.message;
				} else {
					// login successful
					$location.path('/');
				}
			});
	};
}

angular
	.module('jkcApp')
	.controller('loginCtrl', loginCtrl);

})();