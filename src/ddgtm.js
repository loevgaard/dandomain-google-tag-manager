(function () {
    var ddgtm = {
        analyticsEcommerce: function () {
            console.log("Analytics Ecommerce")
        }
    };

    if(!window.ddgtm) {
        window.ddgtm = ddgtm;
    }

    return ddgtm;
}());