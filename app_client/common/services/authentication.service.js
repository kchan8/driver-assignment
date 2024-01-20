// info: https://toddmotto.com/factory-versus-service
// service acts as a constructor that is invoked once at runtime with new, like api
(function(){

//authentication.$inject = ['$window', '$http', '$location'];
function authentication($window, $http, $location){
	var saveToken = function(token){
		$window.localStorage['jkcApp-token'] = token;
	};
	var getToken = function(){
		return $window.localStorage['jkcApp-token'];
	};
	var signup = function(user){
		var url = $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/api/signup/";
		return $http.post(url, user)
			.then(function(res){
//				console.log(res.data.token);
				saveToken(res.data.token);
				// return nothing
			}, function(res){
//				console.log(res.status);
//				console.log(res.data.message);
				return (res.data);
			})
			.catch(function(err){
				console.log("Error: " + err);
			});
	};
	var login = function(user){
		var url = $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/api/login/";
		return $http.post(url, user)
			.then(function(res){
//				console.log(res.data.token);
				saveToken(res.data.token);
				// return nothing
			}, function(res){
//				console.log(res.data.message);
				return (res.data);
			});
	};
	var resetPassword = function(email){
		var user = {email: email};
		return $http.post('/api/resetPassword', user)
		.then(function(res){
//			console.log('Res.data: ', res.data);
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - resetPassword, status: ' + res.status);
			return (res.data);
		});
	};
	var setPassword = function(rec){
		return $http.post('/api/setPassword', rec)
		.then(function(res){
			console.log('Res.data: ', res.data);
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - setPassword, status: ' + res.status);
			return (res.data);
		});
	};
	var isLoggedIn = function(){
		var token = getToken();
//		console.log('$window: ' + $window)
//		console.log('token= ' + token)
		if ((token !== 'undefined') && (token !== undefined)){
			// token = header.payload.signature
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now()/1000;
		} else {			
			return false;
		}
	};
	var isAdmin = function(){
		if (isLoggedIn()){
			var token = getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			if (payload.usertype.indexOf('Admin') > -1){
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};
	var isTeacher = function(){
		if (isLoggedIn()){
			var token = getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			if (payload.usertype.indexOf('Teacher') > -1){
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};
	var currentUser = function(){
		if (isLoggedIn()){
			var token = getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
//			console.log(payload)
			return{
				id: payload.id,
				firstname: payload.firstname,
				lastname: payload.lastname,
				usertype: payload.usertype,
				email: payload.email,
				children: payload.children
			};
		}
	};
	var logout = function(){
		$window.localStorage.removeItem('jkcApp-token');
	};
	var getUserInfoById = function(userID){
		var user = {};
		user.userID = userID;
		return $http.post('/api/userInfo', user)
		.then(function(res){
//			console.log('Res.data: ', res.data);
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getUserInfoById, status: ' + res.status);
			return (res.data);
		});
	};
	var getUserDetailsById = function(userID){
		var user = {};
		user.userID = userID;
		return $http.post('/api/user/details', user, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
//			console.log('Res.data: ' + JSON.stringify(res.data));
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getUserDetailsById');
		});
	};
	
	var getAllUsers = function(){
		return $http.post('/api/user/all', null, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
//			console.log('Res.data: ' + JSON.stringify(res.data));
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getAllUsers');
		});
	}
	var getAllUsersByGrade = function(){
		return $http.post('/api/user/allbygrade', null, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
//			console.log('Res.data: ' + JSON.stringify(res.data));
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getAllUsersByGrade');
		});
	}
	var getAllStudents = function(startDate, endDate){
		var range = {startDate: startDate, endDate: endDate}
		return $http.post('/api/user/students', range, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
//			console.log('Res.data: ' + JSON.stringify(res.data));
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getAllStudents');
		});
	}
	var getStudentsByGrades = function(){
		return $http.post('/api/user/bygrades', null, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
//			console.log('Res.data: ' + JSON.stringify(res.data));
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getStudentsByGrades');
		});
	}
	
	var getStudentsBySchools = function(){
		return $http.post('/api/user/byschools', null, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
//			console.log('Res.data: ' + JSON.stringify(res.data));
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getStudentsBySchools');
		});
	}
	
	var getStudentsByDistricts = function(){
		return $http.post('/api/user/bydistricts', null, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
//			console.log('Res.data: ' + JSON.stringify(res.data));
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getStudentsByDistricts');
		});
	}
	
	var getAllDistricts = function(){
		return $http.post('/api/user/districts', null, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
//			console.log('Res.data: ' + JSON.stringify(res.data));
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getAllDistricts');
		});
	}
	
	var getDrivers = function(){
		return $http.post('/api/user/drivers', null, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
//			console.log('Res.data: ' + JSON.stringify(res.data));
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getDrivers');
		});
	}
	
	var createUser = function(user){
		console.log('service : ' + user)
		return $http.post('/api/user/create', user, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
//			console.log('Res.data: ' + JSON.stringify(res.data));
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - createUser');
		});
	}
	
	var updateUser = function(user){
		return $http.post('/api/user/update', user, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
//			console.log('Res.data: ' + JSON.stringify(res.data));
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - updateUser');
		});
	}
	
	var removeUser = function(userID){
		var user = {id: userID};
		return $http.post('/api/user/remove', user, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
//			console.log('Res.data: ' + JSON.stringify(res.data));
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - removeUser');
		});
	}
	
	var updatePickup = function(pickups){
		var data = {pickups: pickups}
		return $http.post('/api/pickup/update', data, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - updatePickup');
		})
	}
	
	var getPickups = function(start_date, end_date){
		var data = {start_date: start_date, end_date: end_date}
		return $http.post('/api/pickup/get', data, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getPickups');
		})
	}
	
	var getPickupsByStudents = function(start_date, end_date){
		var data = {start_date: start_date, end_date: end_date}
		return $http.post('/api/pickup/getbystudents', data, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getPickupsByStudents');
		})
	}
	
	var getAllPickups = function(){
		return $http.post('/api/pickup/get_all', null, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getAllPickups');
		})
	}
	
	var removePickup = function(date) {
		var data = {start_date: date, end_date: date}
		return $http.post('/api/pickup/remove', data, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - removePickup');
		})
	}
	
	var removeOnePickup = function(id){
		var data = {id: id};
		return $http.post('/api/pickup/remove_one', data, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - removeOnePickup');
		})
	}
	
	var sendReport = function(report){
		var data = {senderEmail: currentUser().email,
				senderName: currentUser().firstname + " " + currentUser().lastname,
				report: report}
		return $http.post('/api/pickup/send', data, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - sendReport');
		})
	}
	
	var updateSchedule = function(date, schedules, note){
		var data = {date: date, schedules: schedules, note:note}
		return $http.post('/api/schedule/update', data, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - updateSchedule');
		})
	}
	
	var getSchedule = function(date){
		var data = {date: date}
		return $http.post('/api/schedule/get', data, {
			headers:{
				'Authorization': 'Bearer ' + getToken()
			}
		})
		.then(function(res){
			return (res.data);
		}, function(res){
			console.log('Something wrong in authentication.service - getSchedule');
		})
	}
	
	
	
	return {
		saveToken: saveToken,
		getToken: getToken,
		signup: signup,
		login: login,
		resetPassword: resetPassword,
		setPassword: setPassword,
		logout: logout,
		isLoggedIn: isLoggedIn,
		isAdmin: isAdmin,
		isTeacher: isTeacher,
		currentUser: currentUser,
		getUserInfoById: getUserInfoById,
		getUserDetailsById: getUserDetailsById,
		getAllUsers: getAllUsers,
		getAllUsersByGrade: getAllUsersByGrade,
		getAllStudents: getAllStudents,
		getStudentsByGrades: getStudentsByGrades,
		getStudentsBySchools: getStudentsBySchools,
		getStudentsByDistricts: getStudentsByDistricts,
		getAllDistricts: getAllDistricts,
		getDrivers: getDrivers,
		createUser: createUser,
		updateUser: updateUser,
		removeUser: removeUser,
		updatePickup: updatePickup,
		getPickups: getPickups,
		getPickupsByStudents: getPickupsByStudents,
		getAllPickups: getAllPickups,
		removePickup: removePickup,
		removeOnePickup: removeOnePickup,
		sendReport: sendReport,
		updateSchedule: updateSchedule,
		getSchedule: getSchedule
	};
}

angular
	.module('jkcApp')
	.service('authentication', authentication);
})();