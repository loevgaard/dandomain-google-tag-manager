(function ($) {
    var debug = true;
    var dataLayerName = 'dataLayer';

    function log(str) {
        debug && window.console && window.console.log(str);
    }

    var config = {
        "decimalPoint":         ",",
        "thousandsSeparator":   "."
    };

    var page = {
        /**
         * Matches a product page (i.e. 1231p.html)
         *
         * @param url
         * @returns boolean
         */
        isProduct: function (url) {
            if(!url) {
                url = window.CurrencyReturnUrl;
            }
            var isProduct = url.match(/\-[0-9]+p\.html/i) != null;
            log("Is Product Page? " + (isProduct ? 'Yes' : 'No'));
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
                url = window.CurrencyReturnUrl;
            }
            var isProductList = url.match(/\-[0-9]+(s|c)[0-9]+\.html/i) != null;
            log("Is Product List Page? " + (isProductList ? 'Yes' : 'No'));
            return isProductList;
        },
        /**
         * @param url
         * @returns boolean
         */
        isPurchase: function (url) {
            if(!url) {
                url = window.CurrencyReturnUrl;
            }
            var isPurchase = url.match(/\/shop\/order4\.html/i) != null;
            log("Is Purchase Page? " + (isPurchase ? 'Yes' : 'No'));
            return isPurchase;
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
                    return $('span[itemprop="price"]:first').text().replace(config.thousandsSeparator, "").replace(config.decimalPoint, ".");
                },
                brand: function() {
                    return $('span[itemprop="brand"]:first').text();
                },
                category: function() {
                    return $("#ddgtm-category").text();
                },
                variant: function() {
                    /**
                     * A typical script block by Dandomain could look like this
                     *
                     * var ProductNumber = '45687983143-26/28';
                     * var ProductVariantMasterID = '45687983143';
                     *
                     * Below we remove the ProductVariantMasterID from ProductNumber
                     * and left trim dashes (-) afterwards
                     * this leaves the '26/28', which is the variant
                     */
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
                        return $(".ProductList_Custom_UL li");
                    },
                    id: function() {
                        return ddgtm.parseProductNumber($(this).find('input[name="ProductID"]').val()).master;
                    },
                    name: function() {
                        return $(this).find(".name").text();
                    },
                    price: function() {
                        return $(this).find(".price").text().replace(config.thousandsSeparator, "").replace(config.decimalPoint, ".");
                    },
                    brand: function() {
                        return $(this).find(".brand").text();
                    },
                    category: function() {
                        var brand       = $(this).find(".brand").text();
                        var category    = $("h1:first").text();

                        if(brand == category) {
                            return "";
                        }

                        return category;
                    },
                    variant: function() {
                        return ddgtm.parseProductNumber($(this).find('input[name="ProductID"]').val()).variant;
                    },
                    list: function() {
                        return "Category";
                    }
                }
            },
            purchase: {
                transactionId: function() {
                    return $("#ddgtm-order-id").text();
                },
                affiliation: function() {
                    return this.toString();
                },
                revenue: function() {
                    return $("#ddgtm-revenue").text();
                },
                tax: function() {
                    var revenue         = parseFloat($("#ddgtm-revenue").text());
                    var revenueExclVat  = parseFloat($("#ddgtm-revenue-excl-vat").text());
                    return (revenue - revenueExclVat).toFixed(2);
                },
                shipping: function() {
                    return $("#ddgtm-shipping").text().replace(config.thousandsSeparator, "").replace(config.decimalPoint, ".");
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
                        return ddgtm.parseProductNumber($(this).find('td:eq(2)').text()).master;
                    },
                    name: function() {
                        return $(this).find('td:eq(4)').text();
                    },
                    price: function() {
                        return $(this).find('td:eq(6)').text().replace(config.thousandsSeparator, "").replace(config.decimalPoint, ".");
                    },
                    brand: function() {
                        return "";
                    },
                    category: function() {
                        return "";
                    },
                    variant: function() {
                        return ddgtm.parseProductNumber($(this).find('td:eq(2)').text()).variant;
                    },
                    quantity: function() {
                        return $(this).find('td:eq(0)').text();
                    },
                    coupon: function() {
                        return "";
                    }
                }
            }
        }
    };

    var dataLayerObject = {};

    var ddgtm = {
        analyticsEcommerce: function (options) {
            options = $.extend({
                "affiliation": "Webshop"
            }, options);

            var id, name, price, brand, category, variant, list, currencyCode, position, transactionId, affiliation,
                revenue, tax, shipping, quantity, coupon, $products;

            if(page.isProduct()) {
                dataLayerObject.ecommerce = {
                    'detail': {
                        'actionField': { 'list': selectors.pages.product.list.call() },
                        'products': [{
                            'id':       selectors.pages.product.id.call(),
                            'name':     selectors.pages.product.name.call(),
                            'price':    selectors.pages.product.price.call(),
                            'brand':    selectors.pages.product.brand.call(),
                            'category': selectors.pages.product.category.call(),
                            'variant':  selectors.pages.product.variant.call()
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

                $products = selectors.pages.productList.products.container.call();
                $products.each(function(i) {
                    dataLayerObject.ecommerce.impressions.push({
                        'id':       selectors.pages.productList.products.id.call(this),
                        'name':     selectors.pages.productList.products.name.call(this),
                        'price':    selectors.pages.productList.products.price.call(this),
                        'brand':    selectors.pages.productList.products.brand.call(this),
                        'category': selectors.pages.productList.products.category.call(this),
                        'variant':  selectors.pages.productList.products.variant.call(this),
                        'list':     selectors.pages.productList.products.list.call(this),
                        'position': i + 1
                    });
                });
            }
            if(page.isPurchase()) {
                dataLayerObject.ecommerce = {
                    'purchase': {
                        'actionField': {
                            'id':           selectors.pages.purchase.transactionId.call(),
                            'affiliation':  selectors.pages.purchase.affiliation.call(options.affiliation),
                            'revenue':      selectors.pages.purchase.revenue.call(),
                            'tax':          selectors.pages.purchase.tax.call(),
                            'shipping':     selectors.pages.purchase.shipping.call(),
                            'coupon':       selectors.pages.purchase.coupon.call()
                        },
                        'products': []
                    }
                }

                $products = selectors.pages.purchase.products.container.call();
                $products.each(function(i) {
                    dataLayerObject.ecommerce.purchase.products.push({
                        'id':       selectors.pages.purchase.products.id.call(this),
                        'name':     selectors.pages.purchase.products.name.call(this),
                        'price':    selectors.pages.purchase.products.price.call(this),
                        'brand':    selectors.pages.purchase.products.brand.call(this),
                        'category': selectors.pages.purchase.products.category.call(this),
                        'variant':  selectors.pages.purchase.products.variant.call(this),
                        'quantity': selectors.pages.purchase.products.quantity.call(this),
                        'coupon':   selectors.pages.purchase.products.coupon.call(this)
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
        /**
         * Returns null if product number format is not {product number}-{variant}
         * Returns object with master and variant attributes if the product number format is {product number}-{variant}
         *
         * @param productNumber
         * @returns {*}
         */
        parseProductNumber: function(productNumber) {
            var obj = {
                'master'    : productNumber,
                'variant'   : ''
            };

            var m = productNumber.match(/^([0-9]+)(\-(.*))?$/);
            if(!m) {
                return obj;
            }

            if(m[1] != undefined) {
                obj.master = m[1];
            }
            if(m[3] != undefined) {
                obj.variant = m[3];
            }

            return obj;
        },
        setDataLayerName: function(name) {
            dataLayerName = name;
        },
        setSelector: function(val) {
            selectors = val;
        },
        setConfig: function(c) {
            $.extend(true, config, c);
        },
        debug: function(toggle) {
            debug = toggle;
        }
    };

    if(!window.ddgtm) {
        window.ddgtm = ddgtm;
    }
}(jQuery));