angular.module('MainCtrl', ['ngRoute'])
.controller('MainController', function($scope,$timeout,tasks,Task) {
	$scope.tasks = tasks;
	$scope.tagline = 'To the moon and back!';	

	var Ref = Task.flybase();

	Ref.on('added', function( data ){
		$timeout(function() {
			$scope.tasks.push( data.value() );
		});
	});
	Ref.on('changed', function( data ){
		$timeout(function() {
			var snapshot = data.value();
			for( i in $scope.tasks ){
				var task = $scope.tasks[ i ];
				if( task._id == snapshot._id ){
					$scope.tasks[ i ] = snapshot;
				}
			}
		});
	});
	Ref.on('removed', function( data ){
		$timeout(function() {
			var snapshot = data.value();
			for( i in $scope.tasks ){
				var task = $scope.tasks[ i ];
				if( task._id == snapshot._id ){
					$scope.tasks.splice(i, 1);
				}
			}
		});
	});
})
.controller('SingleCtrl', function($scope, $location, task) {
	$scope.task = task;
}).config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
	$routeProvider.when('/', {
		templateUrl: 'home/home.html',
		controller: 'MainController',
		resolve:{
			tasks:function(Task){
				return Task.all();
			},
			login:function( Login ){
				return new Login();
			},
			me:function(User, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					var u = User.getById(token);
					return u;
				}
			}
		}
	}).when('/task/:id', {
		templateUrl: 'home/task.html?a=1',
		controller: 'SingleCtrl',
		resolve:{
			task:function(Task, $route){
				var p = Task.getById($route.current.params.id);
				return p;
			},
			login:function( Login ){
				return new Login();
			},
			me:function(User, Login){
				var login = new Login();
				if( login.isLoggedIn() ){
					var token = login._getToken();
					var u = User.getById(token);
					return u;
				}
			}
		}
	});	
//	$locationProvider.html5Mode(true);
	$routeProvider.otherwise({redirectTo: '/'});
}]);