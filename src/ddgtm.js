(function ($) {
    var debug = true;
    var dataLayerName = 'dataLayer';

    function log(str) {
        if(window.console) {
            console.log(str);
        }
    }

    /**
     * Returns null if product number format is not {product number}-{variant}
     * Returns object with master and variant attributes if the product number format is {product number}-{variant}
     *
     * @param productNumber
     * @returns {*}
     */
    function getProductNumberParts(productNumber) {
        var m = productNumber.match(/^([0-9]+)\-(.*)$/);
        if(!m) {
            return null;
        }

        return {
            'master'    : m[1],
            'variant'   : m[2]
        };
    }
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
            var isProduct = url.match(/\-[0-9]+p\.html/i) != null;
            log("Is Product Page?" + (isProduct ? 'Yes' : 'No'));
            return isProduct;
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
            var isProductList = url.match(/\-[0-9]+(s|c)[0-9]+]\.html/i) != null;
            log("Is Product List Page?" + (isProductList ? 'Yes' : 'No'));
            return isProductList;
        }
    };

    var selectors = {
        pages: {
            product: {
                id: function() {
                    // this is a global variable defined by Dandomain
                    return window.ProductVariantMasterID;
                },
                name: function() {
                    return $('span[itemprop="name"]:first').text();
                },
                price: function() {
                    return $('span[itemprop="price"]:first').text();
                },
                brand: function() {
                    return $('span[itemprop="brand"]:first').text();
                },
                category: function() {
                    return "";
                },
                variant: function() {
                    var variant = window.ProductNumber.replace(window.ProductVariantMasterID, "");
                    if(variant) {
                        variant = variant.replace(/^\-/, "");
                    }
                    return variant;
                },
                list: function() {
                    return "";
                }
            },
            productList: {
                currencyCode: function() {
                    return "";
                },
                products: {
                    container: function() {
                        $(".ProductList_Custom_UL li");
                    },
                    id: function() {
                        return $(this).find('input[name="ProductID"]').val();
                    },
                    name: function() {
                        return $(this).find(".name").text();
                    },
                    price: function() {
                        return $(this).find(".price").text();
                    },
                    brand: function() {
                        return "";
                    },
                    category: function() {
                        return "";
                    },
                    variant: function() {
                        return "";
                    },
                    list: function() {
                        return "Category";
                    }
                }
            },
            purchase: {
                transactionId: function() {
                    return "";
                },
                affiliation: function() {
                    return "";
                },
                revenue: function() {
                    return "";
                },
                tax: function() {
                    return "";
                },
                shipping: function() {
                    return "";
                },
                coupon: function() {
                    return "";
                },
                products: {
                    container: function() {
                        return $(".BasketLine_OrderStep4");
                    },
                    // this method will return the master's product number per default
                    // this presumes you use the default Dandomain product number scheme
                    // which is "{product number}-{variant}"
                    id: function() {
                        return $(this).find('td:eq(2)').text();
                    },
                    name: function() {
                        return $(this).find('td:eq(4)').text();
                    },
                    price: function() {
                        return $(this).find('td:eq(6)').text();
                    },
                    brand: function() {
                        return "";
                    },
                    category: function() {
                        return "";
                    },
                    variant: function() {
                        return "";
                    },
                    quantity: function() {
                        return $(this).find('td:eq(0)').text();
                    }
                }
            }
        }
    };

    var dataLayerObject = {};

    var ddgtm = {
        analyticsEcommerce: function () {
            var id, name, price, brand, category, variant, list, currencyCode, position;

            if(page.isProduct()) {
                id          = selectors.pages.product.id.call();
                name        = selectors.pages.product.name.call();
                price       = selectors.pages.product.price.call();
                brand       = selectors.pages.product.brand.call();
                category    = selectors.pages.product.category.call();
                variant     = selectors.pages.product.variant.call();
                list        = selectors.pages.product.list.call();

                dataLayerObject.ecommerce = {
                    'detail': {
                        'actionField': { 'list': list },
                        'products': [{
                            'id':       id,
                            'name':     name,
                            'price':    price,
                            'brand':    brand,
                            'category': category,
                            'variant':  variant
                        }]
                    }
                };
            }
            if(page.isProductList()) {
                currencyCode = selectors.pages.productList.currencyCode.call();

                dataLayerObject.ecommerce = {
                    'currencyCode': selectors.pages.productList.currencyCode.call(),
                    'impressions': []
                };

                var $products = selectors.pages.productList.products.container.call();
                $products.each(function(i) {
                    id          = selectors.pages.productList.products.id.call(this);
                    name        = selectors.pages.productList.products.name.call(this);
                    price       = selectors.pages.productList.products.price.call(this);
                    brand       = selectors.pages.productList.products.brand.call(this);
                    category    = selectors.pages.productList.products.category.call(this);
                    variant     = selectors.pages.productList.products.variant.call(this);
                    list        = selectors.pages.productList.products.list.call(this);
                    position    = i + 1;

                    dataLayerObject.ecommerce.impressions.push({
                        'id':       id,
                        'name':     name,
                        'price':    price,
                        'brand':    brand,
                        'category': category,
                        'variant':  variant,
                        'list':     list,
                        'position': position
                    });
                });
            }
        },
        populateDataLayer: function(eventName) {
            if(!eventName) {
                eventName = 'ddgtm';
            }
            dataLayerObject.event = eventName;

            log("Pushing data layer:");
            log(dataLayerObject);
            window[dataLayerName].push(dataLayerObject);
        },
        setDataLayerName: function(name) {
            dataLayerName = name;
        },
        setSelector: function(val) {
            selectors = val;
        },
        debug: function(toggle) {
            debug = toggle;
        }
    };

    if(!window.ddgtm) {
        window.ddgtm = ddgtm;
    }
}(jQuery));