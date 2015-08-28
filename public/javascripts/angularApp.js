(function(){
    var app = angular.module('flapperNews', ['ui.router']);

    app.controller('MainController', ['$scope', 'postsCollection', function($scope,postsCollection){
        
        $scope.posts = postsCollection.posts;
        
        $scope.addPost = function(){
            if(!$scope.title || $scope.title === '') { alert('Fill required fields'); return; }

//          this.posts.push
            postsCollection.create({
            title: $scope.title,
            link: $scope.link,
            upvotes: 0,
//            comments: [
//              {author: 'Joe', body: 'Cool post!', upvotes: 0},
//              {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
//            ]
            });
           
            $scope.title = '';
            $scope.link = '';
        };
        
        $scope.upvote = function(post){
            postsCollection.upvote(post);
        };
        
    }]);
    
    app.factory('postsCollection', ['$http', function($http){
        var o = {
            posts:[]
        };
        
        o.create = function(post) {
            return $http.post('/posts', post).success(function(data){
              o.posts.push(data);
            });
        };
        
        o.getAll = function() {
            return $http.get('/posts').success(function(data){
              angular.copy(data, o.posts);
            });
        };
        
        o.upvote = function(post) {
            return $http.put('/posts/' + post._id + '/upvote').success(function(data){
                post.upvotes += 1;
              });
        };


        o.get = function(id) {
            return $http.get('/posts/' + id).then(function(res){
              return res.data;
            });
        };
        
        o.addComment = function(id, comment) {
            return $http.post('/posts/' + id + '/comments', comment);
        };
        
        o.upvoteComment = function(post, comment) {
            return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
              .success(function(data){
                comment.upvotes += 1;
            });
        };
        
        return o;
    }]); 
    
    
    //  app.controller('PostController', ['$scope', '$stateParams', 'postsCollection', function($scope,$stateParams,postsCollection){
    app.controller('PostController', ['$scope', 'postsCollection','postResolve', function($scope,postsCollection,postResolve){
        //$scope.post = postsCollection.posts[$stateParams.id];
        $scope.post = postResolve;
        
        $scope.addComment = function(){
            if ($scope.bodytext === '') {return;}
//            $scope.post.comments.push({
//                body: $scope.bodytext,
//                author: 'user',
//                upvotes:0
//            });

            postsCollection.addComment($scope.post._id,
            {
                body:$scope.bodytext,
                author: 'user',
                upvote:0,
            }).success(function(comment){
               $scope.post.comments.push(comment); 
            });
            $scope.body = '';
        };
        
        $scope.upvote = function(comment){
            postsCollection.upvoteComment(postResolve,comment);
        };
        
    }]);
    
    app.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('home');
        
        $stateProvider
          .state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainController',
            //controllerAs: "main",
            resolve: {
                postPromise: ['postsCollection', function(posts){
                  return posts.getAll();
                }]
            }
          })
          
          .state('posts', {
            url: '/posts/{id}',
            templateUrl: '/posts.html',
            controller: 'PostController',
            resolve: {
                postResolve: ['$stateParams', 'postsCollection', function($stateParams, posts) {
                  return posts.get($stateParams.id);
                }]
            }
          });

          
    });
    
})();
