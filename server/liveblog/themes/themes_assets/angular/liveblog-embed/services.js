var CONSENT_KEY = '__lb_consent_key__';
var CONSENT_LIFE_DAYS = 365;

(function(angular) {
    'use strict';

    angular.module('liveblog-embed')
        .factory('fixProtocol', ['config', function(config){
            return function(text) {
                var absoluteProtocol = RegExp(/http(s)?:\/\//ig);
                config.api_host.replace(absoluteProtocol, '//');
                text.replace(absoluteProtocol, '//')
                return text.replace(absoluteProtocol, '//')
            };
        }])
        .provider('asset', [ '$injector', function ($injector) {
            this.templateUrl = function(path) {
                var config = $injector.get('config'),
                    simplifiedPath = $injector.has('assets_simplified_path')
                            && $injector.get('assets_simplified_path'),
                    ret = path;
                /**
                 * `assets_simplified_path` constant is added
                 * to keep backwards compatibility for old themes.
                 */
                if(config.debug && config.templates && config.templates[path]) {
                    return config.templates[path];
                }
                if(!config.debug && simplifiedPath) {
                    return ret;
                }
                if (!/^(https?:\/\/|\/\/)/.test(path)) {
                    ret = config.assets_root +'/' + ret;
                }
                ret = ret.replace(/[^\/]+\/+\.\.\//g, '/')
                         .replace(/\.\//g, '')
                         .replace(/(\w)\/\/(\w)/g, '$1/$2');
                return ret;
            };

            this.imageUrl = this.templateUrl;

            this.$get = function() {
                return this;
            };
        }])
        .service('ConsentManager', ['$rootScope', 'Storage', function ($rootScope, Storage) {

            this.start = function() {
                window.addEventListener('message', this.handleEnhancerMessage, false);
                window.parent.postMessage({type: 'init_consent'}, '*');
            }

            this.handleEnhancerMessage = function(event) {
                var type = event.data.type;

                if (type)
                    console.log('Received msg in iframe', event.data); // eslint-disable-line

                switch (type) {
                    case 'sync-consent-given':
                        Storage.write(CONSENT_KEY, event.data.data, CONSENT_LIFE_DAYS);
                        $rootScope.$apply();
                        break;
                    default:
                        break;
                }
            }

            this.isConsentGiven = function() {
                return Storage.read(CONSENT_KEY) === 'Y';
            }

            this.acceptConsent = function() {
                Storage.write(CONSENT_KEY, 'Y', CONSENT_LIFE_DAYS);
                window.parent.postMessage({type: 'accept_consent'}, '*');
            }
        }])
        .service('Storage', function() {
            this.read = function(name) {
                var itemStr = localStorage.getItem(name);

                // if the item doesn't exist, return null
                if (!itemStr)
                    return null;

                var item = JSON.parse(itemStr);
                var now = new Date();

                // compare the expiry time of the item with the current time
                if (now.getTime() > item.expiry) {
                    // If the item is expired, delete the item from storage
                    // and return null
                    localStorage.removeItem(name);
                    return null;
                }

                return item.value;
            };

            this.write = function(name, value, days) {
                var date = new Date();

                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

                // `item` is an object which contains the original value
                // as well as the time when it's supposed to expire
                var item = {
                    value: value,
                    expiry: date.getTime(),
                };

                localStorage.setItem(name, JSON.stringify(item));
            };
        });
})(angular);