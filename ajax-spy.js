function AjaxSpy(id) {
    var frame = document.getElementById(id),
        oldajax = frame.contentWindow.XMLHttpRequest;
    frame.contentWindow.XMLHttpRequest = function (args) {
        console.log(
            '> Spying on XMLHttpRequest object of: ',
            id
        );
        return new oldajax(args);
    };
}
