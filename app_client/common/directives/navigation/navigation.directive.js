(function(){
	
function navigation(){
	return {
		restrict: 'E',
		templateUrl: '/common/directives/navigation/navigation.template.html',
		controller: 'navigationCtrl as navvm'
	};
}

angular
  .module('jkcApp')
  .directive('navigation', navigation);
})();