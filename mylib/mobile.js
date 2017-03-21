/**
 * Created by shrek.zhou on 12/10/14.
 */
(function (window, angular, undefined) {
    'use strict';
    angular.module('tw.services').provider('mobileService', [function MobileService() {
        var matchMedia = {
            rules: {
                print: "print",
                screen: "screen",
                phone: "(max-width: 680px)",
                tablet: "(min-width: 681px) and (max-width: 768px)",
                desktop: "(min-width: 769px) and (max-width: 1024px)",
                largeDesktop: "(min-width: 1025px)",
                portrait: "(orientation: portrait)",
                landscape: "(orientation: landscape)"
            }
        };
        this.updateRule = function (key, value) {
            matchMedia.rules[key] = value;
        };
        this.$get = ['$window', '$rootScope', function ($window, $rootScope) {
            var mobileService = {};

            function isMatchMediaSupported() {
                return angular.isDefined($window.matchMedia) && angular.isDefined($window.matchMedia('all').addListener);
            }

            function init() {
                var supportsMatchMedia = isMatchMediaSupported();
                if (supportsMatchMedia) {
                    angular.forEach(matchMedia.rules, function (rule, ruleName) {
                        var mediaQueryList = $window.matchMedia(rule);
                        mediaQueryList.addListener(function (queryList) {
                            $rootScope.$apply(function () {
                                $rootScope.$emit('tw.devices.matchedMediaChanged', queryList);
                            });
                        })
                    });
                }
            }

            mobileService.is = function (query) {
                if (isMatchMediaSupported) {
                    return $window.matchMedia(query).matches;
                }
                //TODO: better error handling here.
                throw "Media query is not supported!";
            };

            mobileService.isPhone = function () {
                return mobileService.is(matchMedia.rules.phone);
            };
            /**
             * Same as isPhone
             */
            mobileService.isMobile = function () {
                return mobileService.is(matchMedia.rules.phone);
            };
            mobileService.isTablet = function () {
                return mobileService.is(matchMedia.rules.tablet);
            };
            mobileService.isDesktop = function () {
                return mobileService.is(matchMedia.rules.desktop);
            };
            mobileService.isLargeDesktop = function () {
                return mobileService.is(matchMedia.rules.largeDesktop);
            };
            mobileService.isPortrait = function () {
                return mobileService.is(matchMedia.rules.portrait);
            };
            mobileService.isLandscape = function () {
                return mobileService.is(matchMedia.rules.landscape);
            };
            init();
            return mobileService;
        }];
    }])
}(window, window.angular));