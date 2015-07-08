angular.module('TaskCtrl', ['ngRoute', 'flybaseResourceHttp', 'loginMcFly'])
/* Controllers */
.controller('DashboardCtrl', function($scope, $rootScope, $timeout, $location, $route, tasks, me, login,Task,Usertask) {
	if( !login.isLoggedIn() ){
		$location.path('/login');
	}

	$scope.taskRunner = [];
	$scope.taskPoster = [];
	$scope.numPoster = 0;
	$scope.numRunner = 0;
	var uid = login._getToken();
	Usertask.query({"userId":uid}).then(function( tasks ){
		for(var i = 0; i < tasks.length; i++) {
			tasks[i].type ? $scope.taskPoster.push( tasks[i] ) : $scope.taskRunner.push( tasks[i] );
		}
		$scope.numPoster = $scope.taskPoster.length;
		$scope.numRunner = $scope.taskRunner.length;
	});
})
.controller('TaskListCtrl', function($scope, $rootScope, $timeout, $route, $location, $route, toaster, currenttask, tasks, me, login, User, Task,  Comment, Usertask, Offer, Notification) {
	$scope.searchTask = '';		
	$scope.selectedTask = {};
	$scope.tasks = tasks;//Task.all({ sort: {status: 1} });
	$scope.loggedIn = false;
	if( login.isLoggedIn() ){
		$scope.loggedIn = true;
	}

	$scope.me = me;
	$scope.signedIn = loggedIn;

	$scope.listMode = true;
	
	if( currenttask !== null ){
		$scope.listMode = false;
		setSelectedTask( currenttask );	
	}
	
	$scope.alreadyOffered = 0;
	$scope.offers = {};
	$scope.offer = {};
	$scope.comments = {};
	$scope.content = '';
	$scope.alreadyOffered = false;
	$scope.block = false;

/*
	$scope.getUserHash = function( userId ){
		User.query({"_id":userId}).then(function( user ){
			return md5( user[0].email );
		});
	}
*/

	function setSelectedTask(task) {
		$scope.selectedTask = task;
		
		if( login.isLoggedIn() ){

			Offer.query({"taskId":task._id}).then(function( offers ){
		        $scope.offers = offers;
		    });
			Comment.query({"taskId":task._id}).then(function( comments ){
		        $scope.comments = comments;
		    });
		}
	};

	var Ref = Task.flybase();
/*
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
*/
//	offers....
	$scope.makeOffer = function() {
		nuOffer = new Offer();
		nuOffer.total = $scope.total;
		nuOffer.user = $scope.me._id;
		nuOffer.name = $scope.me.name;
		nuOffer.gravatar = $scope.me.gravatar;
		nuOffer.taskId = $scope.selectedTask._id;
		
		nuOffer.$save().then(function(newData) {
			toaster.pop('success', "Your offer has been placed.");
			$scope.alreadyOffered = true;
			$scope.total = '';
			$scope.block = true;			
			Offer.query({"taskId":$scope.selectedTask._id}).then(function( offers ){
		        $scope.offers = offers;
			});
		});			
	};
	
	$scope.isOfferred = function(taskId) {
		Offer.query({"taskId":taskId}).then(function( offers ){
			offers.forEach( function(offer){
				if( $scope.me._id == offer.user ){
					return true;
				}
			});
	    });
	    return false;
	};

	$scope.isMaker = function(offer) {
		return ($scope.me && $scope.me._id === offer.user);
	};
	$scope.isOfferMaker = $scope.isMaker;

	$scope.getOffer = function(taskId, offerId) {
//		return $firebase(ref.child('offers').child(taskId).child(offerId));
	};

	$scope.cancelOffer = function(offerId) {
		Offer.query({"_id":offerId},{"limit":1}).then(function( offer ){
			offer = offer[0];
			offer.$remove(function() {
				toaster.pop('success', "Your offer has been cancelled.");
				$scope.alreadyOffered = false;
				$scope.block = false;
				$location.path('/browse/'+$scope.selectedTask._id);
			}, function() {
				throw new Error('Sth went wrong...');
			});
		});
	};

	$scope.getTask = function( taskId ){
		Task.query({"_id":taskId},{"limit":1}).then(function( task ){
			task = task[0];
			return task;
		});
		return {};
	};

	$scope.acceptOffer = function(offerId, runnerId) {
		toaster.pop('success', "Offer is accepted successfully!");
		var taskId = $scope.selectedTask._id;

		Task.query({"_id":$scope.selectedTask._id},{"limit":1}).then(function( nuTask ){
			nuTask = nuTask[0];
			nuTask.status = "assigned";
			nuTask.runner = runnerId;
			nuTask.$saveOrUpdate().then(function(returnData){
				usertask = new Usertask();
				usertask.userId = runnerId;
				usertask.datetime = 'Flybase.ServerValue.TIMESTAMP';
				usertask.taskId = $scope.selectedTask._id;
				usertask.type = "0";
				usertask.title = $scope.selectedTask.title;
				usertask.$save();
				
				Offer.query({"_id":offerId},{"limit":1}).then(function( offer ){
					offer = offer[0];
					offer.accepted="1";
					offer.$saveOrUpdate().then(function(returnData){
						$scope.notifyRunner( $scope.selectedTask._id, runnerId );
					});
				});
			});
		});
	};
	$scope.notifyRunner = function(taskId, runnerId) {
		User.query({"_id":runnerId},{"limit":1}).then(function( user ){
			runner = user[0];

			nuNotify = new Notification();
			nuNotify.taskId = taskId;
			nuNotify.email = runner.email;
			nuNotify.name = runner.name;
			nuNotify.$save().then(function(newData) {
				$route.reload();
//				$location.path('/browse/' + taskId);
			});
		});
	};

//	add comment
	$scope.addComment = function(task){
		nuComment = new Comment();
		nuComment.datetime = 'Flybase.ServerValue.TIMESTAMP';
		nuComment.content = $scope.content;
		nuComment.taskId = task._id;
		nuComment.gravatar = $scope.me.gravatar;
		nuComment.name = $scope.me.name;
		nuComment.poster = $scope.me._id;

		nuComment.$save().then(function(newData) {
			toaster.pop('success', "Comment has been posted");
//			$route.reload();
			$scope.content = '';
			//	reload the comments...
			Comment.query({"taskId":task._id}).then(function( comments ){
		        $scope.comments = comments;
			});
		});
	};

//	various functions to check different status...	
	$scope.isAssignee = function(task) {
		return ($scope.me && $scope.me._id === task.runner);	
	};
	
	$scope.isCompleted = function(task) {
		return task.status === "completed";
	};

	$scope.isTaskCreator = function( task ){
		return ($scope.me && $scope.me._id === task.poster);
	};
	$scope.isCreator = $scope.isTaskCreator;
	
	$scope.isOpen = function(task) {
		return task.status === "open";
	};
	
	$scope.completeTask = function( taskId ){
		Task.query({"_id":taskId},{"limit":1}).then(function( task ){
			task = task[0];
			task.status = "completed";
			task.$saveOrUpdate().then(function(returnData){
				toaster.pop('success', "Task is updated.");			
			});
		});
	};

	$scope.cancelTask = function( taskId ){
		Task.query({"_id":taskId},{"limit":1}).then(function( task ){
			task = task[0];
			task.$remove(function() {
				$location.path('/dashboard');
			}, function() {
				throw new Error('Sth went wrong...');
			});
		});			
	};

})
.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
	$routeProvider.when('/dashboard', {
		templateUrl: 'task/dashboard.html?a=1',
		controller: 'DashboardCtrl',
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
	})
	.when('/browse', {
		templateUrl: 'task/browse.html?a=1',
		controller: 'TaskListCtrl',
		resolve:{
			currenttask: function(){
				return null;
			},
			tasks:function(Task){
				return Task.query({	"status":{'$not':'completed'}	});
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
	}).when('/browse/:taskId', {
		templateUrl: 'task/browse.html?a=1',
		controller: 'TaskListCtrl',
		resolve:{
			currenttask:function(Task, $route){
				return Task.getById($route.current.params.taskId);
			},
			tasks:function(Task){
				return Task.query({	"status":{'$not':'completed'} });
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
}]);