/*
We usually place controllers in their own associated folders, but sometimes we have controllers that have no set route, meaning they are used throughout the site so we place them here instead.
*/
angular.module('OtherCtrl', ['ngRoute'])
.controller('NavController', function($scope, $location, $route, toaster, User, Login) {
	$scope.currentUser = {};
	$scope.token = null;

	var login = new Login();
	function update() {
		$timeout(function () {
			if( login.isLoggedIn() ){
				$scope.token = login._getToken();
				User.query({"_id":$scope.token},{"limit":1}).then(function( user ){
					$scope.currentUser = user[0];
					$scope.currentUser.gravatar = 'https://secure.gravatar.com/avatar/' + md5($scope.currentUser.email) + '.jpg?s=30&d=wavatar';
				});
			}
		}, 0);
	}
	update();
	login.watch(update, $scope);
	
})
.controller('TaskController', function($scope, $location, toaster, Task, Usertask, Login, User) {
	$scope.currentUser = {};
	$scope.token = null;

	var login = new Login();
	if( login.isLoggedIn() ){
		$scope.token = login._getToken();
		User.query({"_id":$scope.token},{"limit":1}).then(function( user ){
			$scope.currentUser = user[0];
		});
	};

	$scope.createTask = function() {
		$scope.task.status = 'open';
		$scope.task.gravatar = $scope.currentUser.gravatar;
		$scope.task.name = $scope.currentUser.name;
		$scope.task.poster = $scope.currentUser._id;

		$scope.nuTask = new Task();
		$scope.nuTask.status = $scope.task.status;
		$scope.nuTask.gravatar = $scope.task.gravatar;
		$scope.nuTask.name = $scope.task.name;
		$scope.nuTask.poster = $scope.task.poster;
		$scope.nuTask.title = $scope.task.title;
		$scope.nuTask.datetime = 'Flybase.ServerValue.TIMESTAMP';
		$scope.nuTask.description = $scope.task.description;
		$scope.nuTask.total = $scope.task.total;

		$scope.nuTask.$save().then(function(newTask) {
			$scope.usertask = new Usertask();
			$scope.usertask.userId = $scope.currentUser._id;
			$scope.usertask.datetime = 'Flybase.ServerValue.TIMESTAMP';
			$scope.usertask.taskId = newTask._id;
			$scope.usertask.type = "1";
			$scope.usertask.title = newTask.title;
			$scope.usertask.$save();

			$scope.nuTask = {};
			$scope.task = {title: '', description: '', total: '', status: 'open', gravatar: '', name: '', poster: ''};
			$location.path('/browse/' + newTask._id);
		});
	};

	$scope.editTask = function(task) {
		Task.query({"_id":task._id},{"limit":1}).then(function( nuTask ){
			nuTask = nuTask[0];
			nuTask.title = task.title;
			nuTask.description = task.description;
			nuTask.total = task.total;
			nuTask.$saveOrUpdate().then(function(returnData){
				toaster.pop('success', "Task is updated.");			
			});
		});
	};
})
.controller('AuthController', function($scope, $location, $route, toaster, User, Login) {
	$scope.user = {};
	$scope.token = null;
	$scope.email = '';
	$scope.oldPass = '';
	$scope.newPass = '';

	var login = new Login();
	if( login.isLoggedIn() ){
		$scope.token = login._getToken();
		User.query({"_id":$scope.token},{"limit":1}).then(function( user ){
			$scope.user = user[0];
			$scope.email = $scope.user.email;
		});
	};

	$scope.changePassword = function(oldPass, newPass) {
		if( $scope.user.password == oldPass ){
			$scope.user.password = newPass;
			delete $scope.user.oldPass;
			delete $scope.user.newPass;
			$scope.user.$saveOrUpdate().then(function(returnData){
				toaster.pop('success', "Password changed successfully");
			});
		}else{
			errMessage(err); 
		}
	};
		
	function errMessage(err) {
		var msg = "Unknown Error...";
		if(err && err.code) {
			switch (err.code) {
				case "EMAIL_TAKEN": 
					msg = "This email has been taken"; break;          
				case "INVALID_EMAIL": 
					msg = "Invalid email"; break;          
				case "NETWORK_ERROR": 
					msg = "Network error"; break;          
				case "INVALID_PASSWORD": 
					msg = "Invalid password"; break;          
				case "INVALID_USER":
					msg = "Invalid user"; break;                  
			} 
		}   
		
		toaster.pop('error', msg);
	};
});