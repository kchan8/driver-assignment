(function(){
function homeCtrl (){
	var vm = this;
	vm.header = {
		title: 'Home || JKC'
	};
}

angular
  .module('jkcApp')
  .controller('homeCtrl', homeCtrl);
})();