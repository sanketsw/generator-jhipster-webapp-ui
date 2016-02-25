'use strict';

angular.module('<%= angularAppName %>').config(function($stateProvider) {
	$stateProvider
		.state('customView', {
			parent : 'site',
			url : '/customView',
			data : {
				authorities : ['ROLE_USER']
			},
			views : {
				'content@' : {
					templateUrl : 'scripts/app/screens/customView/customView.html',
					controller : 'CustomViewController'
				}
	
			},
			resolve: {
				
			}
		});
});
