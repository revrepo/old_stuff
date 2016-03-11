exports.routes = function (map) {
    // map.resources('posts');
    // Generic routes. Add all your routes below this line
    // feel free to remove generic routes
    map.all(':controller/:action');
    map.all(':controller/:action/:id');
    map.post('user/new');
    map.post('user/update');
    map.post('domain/new');
    map.post('domain/update');
};