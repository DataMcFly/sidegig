angular.module('UserCtrl', ['ngRoute', 'flybaseResourceHttp', 'loginMcFly'])
/* Controllers */
.controller('AccountCtrl', function($scope, $location, toaster, login, me) {
	$scope.showform = false;
	$scope.profile = {}; 
	
	if( !login.isLoggedIn() ){
		$scope.showform = false;
		$location.path('/login');
	}
	var token = login._getToken();
	$scope.profile = me;
/*
	login.getUser( token ).then( function( user ) {
		$scope.profile = user;
	}, function(err) {
		$scope.err = err;
	});
*/
	$scope.showform = true;

	$scope.logout = function() {
		login.logout();
		toaster.pop('success', "Logged out successfully");
		$location.path('/login');
	};
})
.controller('LogoutCtrl', function($scope, $q, $location, toaster, login) {
		login.logout();
		toaster.pop('success', "Logged out successfully");
		$location.path('/login');
//		$window.location.href = 'index.html';
})
.controller('LoginCtrl', function($scope, $q, $location, toaster, login) {
	$scope.email = null;
	$scope.pass = null;
	$scope.confirm = null;
	$scope.createMode = false;
	$scope.err = "";

	$scope.login = function() {
		$scope.err = null;
		login.login($scope.email, $scope.pass).then(function(/* user */) {
			$location.path('/dashboard');
		}, function(err) {
			toaster.pop('error', err);
		});
	};
		
	function assertValidAccountProps() {
		if( !$scope.email ) {
			toaster.pop('error', 'Please enter an email address');
		}else if( !$scope.pass || !$scope.confirm ) {
			toaster.pop('error', 'Please enter a password');
		} else if( $scope.createMode && $scope.pass !== $scope.confirm ) {
			toaster.pop('error', 'Passwords do not match');
		}
		return !$scope.err;
	}
	
	function errMessage(err) {
		return angular.isObject(err) && err.code? err.code : err + '';
	}
})
.controller('RegisterCtrl', function($scope, $q, $location, toaster, login) {
	$scope.email = null;
	$scope.pass = null;
	$scope.confirm = null;
	$scope.createMode = true;
	$scope.err = "";

	$scope.createAccount = function() {
		$scope.err = null;
		if( assertValidAccountProps() ) {
			login.createAccount($scope.email, $scope.pass).then(function(/* user */) {
				toaster.pop('success', 'Please login');
				$location.path('/login');
			}, function(err) {
				toaster.pop('error', err);
			});
		}
	};
	
	function assertValidAccountProps() {
		if( !$scope.email ) {
			toaster.pop('error', 'Please enter an email address');
		}else if( !$scope.pass || !$scope.confirm ) {
			toaster.pop('error', 'Please enter a password');
		} else if( $scope.createMode && $scope.pass !== $scope.confirm ) {
			toaster.pop('error', 'Passwords do not match');
		}
		return !$scope.err;
	}
	
	function errMessage(err) {
		return angular.isObject(err) && err.code? err.code : err + '';
	}
})
.controller('AccountFormCtrl', function($scope, $location, $window, me, User, Login) {
	$scope.showform = false;
	$scope.user = me;
	
	var login = new Login();
	if( !login.isLoggedIn() ){
		console.log("bye");
		$location.path('/login');
	}

	$scope.token = login._getToken();
	$scope.showform = true;

	$scope.userCopy = angular.copy( $scope.user );

	$scope.save = function(){
		$scope.user.$saveOrUpdate().then(function(returnData){
			$location.path('/account/edit');
		}, function(error) {
			throw new Error('Sth went wrong...');
		});
	};

	$scope.remove = function() {
		$scope.user.$remove(function() {
			$location.path('/account/edit');
		}, function() {
			throw new Error('Sth went wrong...');
		});
	};

	$scope.hasChanges = function(){
		return !angular.equals($scope.user, $scope.userCopy);
	};
})
.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
	$routeProvider.when('/login', {
		templateUrl: 'account/login.html',
		controller: 'LoginCtrl',
		resolve:{
			login:function( Login ){
				return new Login();
			}
		}
	}).when('/register', {
		templateUrl: 'account/register.html',
		controller: 'RegisterCtrl',
		resolve:{
			login:function( Login ){
				return new Login();
			}
		}
	}).when('/account', {
		templateUrl: 'account/account.html',
		controller: 'AccountCtrl',
		resolve:{
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
	}).when('/account/edit', {
		templateUrl: 'account/form.html',
		controller: 'AccountFormCtrl',
		resolve:{
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
	}).when('/logout', {
		templateUrl: 'account/account.html',
		controller: 'LogoutCtrl',
		resolve:{
			login:function( Login ){
				return new Login();
			}
		}
	});	
}]);