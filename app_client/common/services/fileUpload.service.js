(function(){

function fileUpload($http){
	this.uploadFileToUrl = function(file, uploadUrl){
		var fd = new FormData();
		fd.append('file', file);
		
		return $http.post(uploadUrl, fd, {
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined}
			})
			.then(function(res){
				return res.data;
			});
	};
}

angular
	.module('jkcApp')
	.service('fileUpload', fileUpload);
})();