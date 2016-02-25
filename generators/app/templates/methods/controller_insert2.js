
        $scope.<%= method.enumerationMethodName %> = function(id) {
            return <%= method.factory %>.get({id: id});
        };
        