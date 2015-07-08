'use strict';

( function (self) {
	if ( (typeof console !== 'undefined') && (typeof console.warn === 'function') ){
		var warn = window.console.warn;
		self['ಠ_ಠ'] = Function.prototype.bind.call(warn, console);
		window.console.warn = undefined;
	} else{
		self['ಠ_ಠ'] = function () {}
	}
}( typeof window !== 'undefined'? window : typeof global !== 'undefined' ? global : self ) );

// Declare app level module which depends on filters, and services
angular.module('SideGigApp', [
	'SideGigApp.config',
	'SideGigApp.models',
	'toaster',
	'angularMoment',
	'SideGigApp.directives',
	"OtherCtrl",
	"UserCtrl",
	'MainCtrl', 
	'TaskCtrl'
]);

String.prototype.toHex = function() {
    var buffer = forge.util.createBuffer(this.toString());
    return buffer.toHex();
}

String.prototype.toSHA1 = function() {
    var md = forge.md.sha1.create();
    md.update(this);
    return md.digest().toHex();
}

function timeConverter(UNIX_timestamp){
	var a = new Date(UNIX_timestamp*1000);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = date + ',' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
	return time;
}