var routeHistory = RouterTracker.getRouteHistory();
                    	$state.go(routeHistory[0].route.name, null, { reload: true });