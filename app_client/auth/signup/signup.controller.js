(function(){

function signupCtrl($location, authentication){
	var vm = this;
	vm.pageHeader = {
		title: $location.path()
	};
	vm.returnPage = $location.path();
	
	vm.credentials = {
		firstname: "",
		lastname: "",
		email: "",
		username: "",
		password: "",
		confirm_password: ""
	};
	vm.onSubmit = function(){
		vm.formError = "";
		if (!vm.credentials.firstname || !vm.credentials.lastname ||
			!vm.credentials.username || !vm.credentials.password || !vm.credentials.confirm_password ||
			!vm.credentials.email){
			vm.formError = "All fields required, please try again";
			return false;
		} else {
			vm.doSignUp();
		}
	};
	vm.doSignUp = function(){
		vm.formError = "";
		authentication.signup(vm.credentials)
			.then(function(data){
				if (data){
					vm.formError = data.message;
				} else {
					// display a confirmation message to check email
					$location.path('/signupDone');
				}
			});
	};
}

angular
	.module('jkcApp')
	.controller('signupCtrl', signupCtrl);
})();