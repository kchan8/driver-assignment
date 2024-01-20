(function(){
//configRouter.$inject = ['$routeProvider'];
//function configRouter($routeProvider){
configRouter.$inject = ['$routeProvider', '$locationProvider'];

// route definitions
function configRouter($routeProvider, $locationProvider){
	$routeProvider
		.when('/', {
			templateUrl: '/home/home.view.html',
			controller: 'homeCtrl',
			controllerAs: 'vm'
		})
		.when('/signup', {
			templateUrl: '/auth/signup/signup.view.html',
			controller: 'signupCtrl',
			controllerAs: 'vm'
		})
		.when('/signupDone', {
			templateUrl: '/auth/signup/signupDone.view.html'
		})
		.when('/confirm/:userID', {
			templateUrl: '/auth/signup/confirm.view.html',
			controller: 'confirmCtrl',
			controllerAs: 'vm'
		})
		.when('/login', {
			templateUrl: '/auth/login/login.view.html',
			controller: 'loginCtrl',
			controllerAs: 'vm'
		})
		.when('/forgotPassword', {
			templateUrl: '/auth/login/forgotPassword.view.html',
			controller: 'forgotPasswordCtrl',
			controllerAs: 'vm'
		})
		.when('/resetPassword/:userID/:key', {
			templateUrl: '/auth/login/resetPassword.view.html',
			controller: 'resetPasswordCtrl',
			controllerAs: 'vm'
		})
		.when('/classes', {
			templateUrl: '/classes/classes.view.html',
		})
		.when('/register', {
			templateUrl: '/register/register.view.html',
			controller: 'registerCtrl',
			controllerAs: 'vm'
		})
		.when('/about', {
			templateUrl: '/about/about.view.html',
		})
		.when('/contact', {
			templateUrl: '/contact/contact.view.html',
		})
		.when('/admin/upload', {
			templateUrl: '/auth/admin/upload.view.html',
			controller: 'uploadCtrl',
			controllerAs: 'vm'
		})
		.when('/admin/export', {
			templateUrl: '/auth/admin/export.view.html',
			controller: 'exportCtrl',
			controllerAs: 'vm'
		})
		.when('/admin/edituser', {
			templateUrl: '/auth/admin/editUser.view.html',
			controller: 'editUserCtrl',
			controllerAs: 'vm'
		})
		.when('/admin/removeuser', {
			templateUrl: '/auth/admin/removeUser.view.html',
			controller: 'removeUserCtrl',
			controllerAs: 'vm'
		})
		.when('/admin/email/grades', {
			templateUrl: '/auth/admin/email.view.html',
			controller: 'emailCtrl',
			controllerAs: 'vm'
		})
		.when('/admin/email/schools', {
			templateUrl: '/auth/admin/email_by_school.view.html',
			controller: 'emailBySchoolCtrl',
			controllerAs: 'vm'
		})
		.when('/admin/email/districts', {
			templateUrl: '/auth/admin/email_by_district.view.html',
			controller: 'emailByDistrictCtrl',
			controllerAs: 'vm'
		})
		.when('/admin/pickup', {
			templateUrl: '/pickup/all.view.html',
			controller: 'pickupAllCtrl',
			controllerAs: 'vm'
		})
		.when('/roster/grades', {
			templateUrl: '/roster/grades.view.html',
			controller: 'gradesCtrl',
			controllerAs: 'vm'
		})
		.when('/roster/schools', {
			templateUrl: '/roster/schools.view.html',
			controller: 'schoolsCtrl',
			controllerAs: 'vm'
		})
		.when('/roster/districts', {
			templateUrl: '/roster/districts.view.html',
			controller: 'districtsCtrl',
			controllerAs: 'vm'
		})
		.otherwise({redirectTo: '/'});
	$locationProvider.html5Mode(true);	// remove # on url
}

// Add ngRoute as module dependency
// Add configRouter to module, passing thru $routeProvider as dependency
angular
	.module('jkcApp', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap'])
	.config(['$routeProvider', '$locationProvider', configRouter]);

})();