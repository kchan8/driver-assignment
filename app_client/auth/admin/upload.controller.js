(function(){
// view: https://codepen.io/Sebus059/pen/MwMQbP 
// one reference:
// http://www.encodedna.com/angularjs/tutorial/angularjs-file-upload-using-http-post-formdata-webapi.htm
function customChange($parse){
	return {
		restrict: 'A',
		link: function (scope, element, attrs){
			// option 1
			// https://gist.github.com/CMCDragonkai/6282750 method #4
//			var onChangeFunc = scope.$eval(attrs.customChange)
			// bind deprecated, use on, execute the function specified in the attribute value
//			element.on('change', onChangeFunc)
			// option 2
//			element.on('change', function(){
//				scope.$eval(attrs.customChange)()
//			})
			// option 3
			var model = $parse(attrs.customChange);
			var modelSetter = model.assign;
			element.on('change', function(){
				scope.$apply(function(){
					modelSetter(scope, element[0].files[0]);
				});
			});
		}
	};
}

// fileUpload is service (controller -> service)
function uploadCtrl ($scope, fileUpload){
	$scope.upload = function(){
		var uploadUrl;
		if ($scope.student_file !== undefined){			
			console.log('Filename: ' + $scope.student_file.name);
			uploadUrl = "/api/upload/student_file";
			fileUpload.uploadFileToUrl($scope.student_file, uploadUrl)
				.then(function(res){
					console.log('File uploaded: ' + JSON.stringify(res));
				});
		}
		if ($scope.worker_file !== undefined){
			console.log('Filename: ' + $scope.worker_file.name);
			uploadUrl = "/api/upload/worker_file";
			fileUpload.uploadFileToUrl($scope.worker_file, uploadUrl)
				.then(function(res){
					console.log('File uploaded: ' + JSON.stringify(res));
				});
		}
		if ($scope.pickup_file !== undefined){
			console.log('Filename: ' + $scope.pickup_file.name);
			uploadUrl = "/api/upload/pickup_file";
			fileUpload.uploadFileToUrl($scope.pickup_file, uploadUrl)
				.then(function(res){
					console.log('File uploaded: ' + JSON.stringify(res));
				});
		}
	};
}

angular
	.module('jkcApp')
	.controller('uploadCtrl', uploadCtrl)
	.directive('customChange', customChange);

})();