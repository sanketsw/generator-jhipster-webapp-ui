
    .factory('<%= method.factory %>', function ($resource, DateUtils) {
        return $resource('api/<%= method.restapiName %>/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET', isArray: true
            },
            'update': { method:'PUT' }
        });
    })
