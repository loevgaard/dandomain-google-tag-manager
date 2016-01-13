# A Javascript Library for Google Tag Manager on Dandomain
Dandomain is a Danish hosting provider who also hosts one of the biggest Danish webshop systems, [Dandomain Webshop](https://www.dandomain.dk/webshop/overblik).

On Dandomain we can't manipulate server side code so we can't populate the dataLayer variable before the DOM loads.

This library makes the process of integrating the Dandomain Webshop with Google Tag Manager a bit easier.

It consists of several "modules" or methods that will eventually populate the data layer with relevant values.

## Implementation
### Product Numbers
The library presumes that you use the default Dandomain product numbering scheme which is `[number]-[variant]` where `[number]` matches the regexp `[0-9]+` and `[variant]` matches the regexp `.*`. If you use another scheme, you have to implement the method `ddgtm.parseProductNumber()`.

### Google Analytics Enhanced Ecommerce
To implement [Google Analytics Enhanced Ecommerce](https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce) features, use this code

```html
...

<script>
$(function() {
    ddgtm.analyticsEcommerce();
    ddgtm.populateDataLayer();
});
</script>
</body>
```

This will fire an Google Tag Manager event named `ddgtm` which you can use to fire your tags within Google Tag Manager.

#### Checkout Success
Insert the following tags on the checkout success page (Design > Tekster/knapper > Bestil step 4 (Ordrebekræftelse))

```html
<!-- ddgtm tracking variables -->
<div id="ddgtm-order-id" style="display:none">[[OrderID]]</div>
<div id="ddgtm-revenue" style="display:none">[[AdWordsSubTotalInclVAT]]</div>
<div id="ddgtm-revenue-excl-vat" style="display:none">[[AdWordsSubTotalExclVAT]]</div>
<div id="ddgtm-shipping" style="display:none">[[ShippingFeeInclVAT]]</div>
<div id="ddgtm-currency" style="display:none">[[SubTotalInclVAT]]</div>
```

![ddgtm checkout success parameters](doc/images/ddgtm-checkout-success.png)

#### Product Template
Insert the following tags on the product template

```html
<div style="display:none">[[Manufactors]]</div>
<div id="ddgtm-category" style="display:none">[[ProdCatName]]</div>
```

#### Product List Template
Insert the following tags on the product list template

```html
<div style="display:none" class="brand">[[Manufactors]]</div>
```

### AdWords Dynamic Remarketing
[AdWords Dynamic Remarketing](https://support.google.com/tagmanager/answer/6106009?hl=en)