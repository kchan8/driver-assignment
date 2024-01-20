(function(){
angular
	.module('jkcApp')
	.controller('confirmCtrl', confirmCtrl)
	
function confirmCtrl($routeParams, authentication){
	var vm = this
	
	function init(){
		var userID = $routeParams.userID
		return authentication.getUserInfoById(userID)
			.then(function(res){
				if (res.message){
					vm.validUser = false
				} else {					
					vm.validUser = true
					vm.currentUser = res
				}
				return
			})
	}

	init()
	
}
})()