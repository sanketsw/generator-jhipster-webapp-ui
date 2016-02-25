
    .factory('PlateElements', function ($resource, DateUtils) {
        return $resource('api/plate.elements/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET', isArray: true
            },
            'update': { method:'PUT' }
        });
    })
