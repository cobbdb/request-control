function dorequest(url, sigel) {
    var req = new XMLHttpRequest(),
        logit = function () {
            [].unshift.call(arguments, sigel);
            //console.log.apply(console, arguments);
        };
    req.open('GET', url, false);
    req.addEventListener('load', function (event) {
        logit(
            'request returned with status',
            req.status
        );
    }, false);
    try {
        req.send();
    } catch (err) {
        logit(
            'error occurred:',
            err.name
        );
    }
}
