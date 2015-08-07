var Lumberjack = require('lumberjackjs'),
    log = Lumberjack(),
    hash;
module.exports = log;

/**
 * Print detailed report.
 * @param {String} types
 */
log.report = function (types) {
    var showImage = types.indexOf('image') >= 0,
        showAjax = types.indexOf('ajax') >= 0,
        showAppend = types.indexOf('append') >= 0,
        showAll = types.indexOf('all') >= 0;

    if (showImage || showAll) {
        global.console.log('\n~~~~~~~~~~~~~ IMAGE ~~~~~~~~~~~~');
        global.console.log(
            global.JSON.stringify(log.readback('image'), null, 2)
        );
        global.console.log('\n');
    }
    if (showAjax || showAll) {
        global.console.log('\n~~~~~~~~~~~~~ AJAX ~~~~~~~~~~~~');
        global.console.log(
            global.JSON.stringify(log.readback('ajax'), null, 2)
        );
        global.console.log('\n');
    }
    if (showAppend || showAll) {
        global.console.log('\n~~~~~~~~~~~~~ APPEND ~~~~~~~~~~~~');
        global.console.log(
            global.JSON.stringify(log.readback('append'), null, 2)
        );
        global.console.log('\n');
    }
};

log.on('summary', function (data) {
    global.console.log(data);
});
