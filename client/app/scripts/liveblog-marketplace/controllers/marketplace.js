liveblogMarketplace
    .controller('MarketplaceController', 
        ['$scope', 'Store', 'MarketplaceActions', 'MarketplaceReducers', '$route',
        function($scope, Store, MarketplaceActions, MarketplaceReducers, $route) {
            var filters = {}

            if ($route.current.params.hasOwnProperty('filters'))
                filters = JSON.parse($route.current.params.filters);

            $scope.states = [
                'Marketers',
                'Producers'
            ];

            $scope.activeState = $scope.states[0];

            $scope.switchTab = function(state) {
                $scope.activeState = state;
            };

            $scope.togglePanel = function() {
                MarketplaceActions.togglePanel(!$scope.searchPanel);
            };

            $scope.emptyMarketer = function() {
                return !$scope.filters || !$scope.filters.hasOwnProperty('marketer._id');
            };

            $scope.openEmbedModal = MarketplaceActions.openEmbedModal;

            $scope.store = new Store(MarketplaceReducers, {
                currentBlog: {},
                currentMarketer: {},
                blogs: { _items: [] },
                marketers: { _items: [] },
                filters: filters,
                searchPanel: true,
                embedModal: false
            });

            $scope.store.connect(function(state) {
                $scope.blogs = state.blogs;
                $scope.searchPanel = state.searchPanel;
                $scope.embedModal = state.embedModal;
                $scope.filters = state.filters;
                $scope.currentMarketer = state.currentMarketer;

                $route.updateParams({
                    filters: JSON.stringify(state.filters)
                });
            });

            MarketplaceActions.getBlogs(filters);
            MarketplaceActions.getMarketers();
        }]);
