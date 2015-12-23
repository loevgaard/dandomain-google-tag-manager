(function ($) {
    var dataLayerName = 'dataLayer';
    var page = {
        /**
         * Matches a product page (i.e. 1231p.html)
         *
         * @param url
         * @returns boolean
         */
        isProduct: function (url) {
            if(!url) {
                url = location.href;
            }
            return url.match(/\-[0-9]+p\.html/i) != null;
        },
        /**
         * A product list is either a category page (c1.html) or a category page with sub categories (s1.html)
         *
         * @param url
         * @returns boolean
         */
        isProductList: function (url) {
            if(!url) {
                url = location.href;
            }
            return url.match(/\-[0-9]+(s|c)[0-9]+]\.html/i) != null;
        }
    };

    var selectors = {
        pages: {
            product: {
                id:         "",
                name:       "",
                price:      "",
                brand:      "",
                category:   "",
                variant:    "",
                list:       ""
            }
        }
    };

    var dataLayerObject = {};

    var ddgtm = {
        analyticsEcommerce: function () {
            if(page.isProduct()) {
                dataLayerObject.ecommerce = {
                    'detail': {
                        'actionField': {'list': $(selectors.pages.product.list).text()},
                        'products': [{
                            'id': $(selectors.pages.product.id).text(),
                            'name': $(selectors.pages.product.name).text(),
                            'price': $(selectors.pages.product.price).text(),
                            'brand': $(selectors.pages.product.brand).text(),
                            'category': $(selectors.pages.product.category).text(),
                            'variant': $(selectors.pages.product.variant).text()
                        }]
                    }
                };
            }
        },
        populateDataLayer: function(eventName) {
            if(!eventName) {
                eventName = 'ddgtm';
            }
            dataLayerObject.event = eventName;

            console.log("Pushing data layer:");
            console.log(dataLayerObject);
            window[dataLayerName].push(dataLayerObject);
        },
        setDataLayerName: function(name) {
            dataLayerName = name;
        },
        setSelector: function(val) {
            selectors = val;
        }
    };

    if(!window.ddgtm) {
        window.ddgtm = ddgtm;
    }
}(jQuery));