'use strict';
/*added by jhipster-webapp-ui module*/
angular.module('<%= angularAppName %>')
    .controller('CustomViewController', function ($scope, Principal, $state) {
    	
        Principal.identity().then(function(account) {
            $scope.account = account;
            $scope.isAuthenticated = Principal.isAuthenticated;
        });
    });
