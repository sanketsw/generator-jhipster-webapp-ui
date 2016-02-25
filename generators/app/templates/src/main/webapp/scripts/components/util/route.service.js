'use strict';

angular.module('<%= angularAppName %>')
    .factory('RouterTracker', function RouterTracker($rootScope) {
	      var routeHistory = [];
	      var service = {
	        getRouteHistory: getRouteHistory
	      };
	
	      $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
	    	  routeHistory = [];
	    	  routeHistory.push({route: from, routeParams: fromParams});
	      });
	
	      function getRouteHistory() {
	        return routeHistory;
	      }

	      return service;    	
    });

