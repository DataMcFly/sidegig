angular.module('SideGigApp.directives', [])
.directive('appVersion', ['version', function(version) {
	return function(scope, elm) {
		elm.text(version);
	};
}])
/**
* A directive that shows elements only when user is logged in.
*/
.directive('ngShowAuth', ['Login', '$timeout', function (Login, $timeout) {
	var isLoggedIn;
	var login = new Login();
	login.watch(function(user) {
		isLoggedIn = !!user;
	});
	return {
		restrict: 'A',
		link: function(scope, el) {
			el.addClass('ng-cloak'); // hide until we process it
			function update() {
				// sometimes if ngCloak exists on same element, they argue, so make sure that
				// this one always runs last for reliability
				$timeout(function () {
					el.toggleClass('ng-cloak', !isLoggedIn);
				}, 0);
			}
			update();
			login.watch(update, scope);
		}
	};
}])
/**
* A directive that shows elements only when user is logged out.
*/
.directive('ngHideAuth', ['Login', '$timeout', function (Login, $timeout) {
	var isLoggedIn;
	var login = new Login();

	login.watch(function(user) {
		isLoggedIn = !!user;
	});
	return {
		restrict: 'A',
		link: function(scope, el) {
			function update() {
				el.addClass('ng-cloak'); // hide until we process it
				$timeout(function () {
					el.toggleClass('ng-cloak', isLoggedIn !== false);
				}, 0);
			}
			
			update();
			login.watch(update, scope);
		}
	};
}])
.directive('gravatar', ['User', '$timeout', function(User, $timeout) {
	return {
		restrict: 'AE',
		replace: true,
		scope: {
			name: '@',
			height: '@',
			width: '@',
			userId: '@',
			class: '@'
		},
		link: function(scope, el, attr) {
			function update(){
				$timeout(function () {
					User.query({"_id":scope.userId}).then(function( user ){
						if( typeof user[0] !== 'undefined' ){
							scope.userId = md5( user[0].email );
						}
					});
					scope.defaultImage = 'wavatar';
				}, 0);
			}
			update();
		},
		template: '<img alt="{{ name }}" height="{{ height }}"  width="{{ width }}" class="{{class}}" src="https://secure.gravatar.com/avatar/{{ userId }}.jpg?s={{ width }}&d={{ defaultImage }}">'
	};
}])
.directive('renderHtml', ['$compile', function ($compile) {
	return {
		restrict: 'E', scope: {
			html: '='
		},
		link: function postLink(scope, element, attrs) {
			function appendHtml() {
				if(scope.html) {
					var newElement = angular.element(scope.html);
					$compile(newElement)(scope);
					element.append(newElement);
				}
			}
			scope.$watch(function() { return scope.html }, appendHtml);
		}
	};
}])
.filter('unsafe', function($sce) {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
});	