$scope.getNumber = function(length, columns) {
            return new Array(parseInt(length / columns + 1, 10));   
        }
        $scope.appliedClass = function(status) {
            if (status) {
                return "bg-success";
            } else {
                return "bg-danger"; 
            }
        }
        