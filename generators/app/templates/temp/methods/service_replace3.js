
    .factory('SessionPresenters', function ($resource, DateUtils) {
        return $resource('api/session.presneters/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET', isArray: true
            },
            'update': { method:'PUT' }
        });
    })
