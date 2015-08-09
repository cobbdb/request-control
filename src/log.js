var Lumberjack = require('lumberjackjs'),
    log = Lumberjack(),
    summary = {},
    hash;
module.exports = log;

/**
 * Update summary information.
 * @param {String} id Node id.
 * @param {String} name Type of request.
 * @param {String} net Request summary.
 */
log.update = function (id, name, net) {
    summary[id]  = summary[id] || {};
    summary[id][name] = net;
};

/**
 * ## log.report([types])
 * Print detailed report.
 * @param {String} [types] Any of [all, image, ajax, append].
 * Space delimited.
 */
log.report = function (types) {
    var showImage, showAjax, showAppend, showAll;

    types = types || '';
    showImage = types.indexOf('image') >= 0;
    showAjax = types.indexOf('ajax') >= 0;
    showAppend = types.indexOf('append') >= 0;
    showAll = types.indexOf('all') >= 0;

    // Clear the console.
    global.console.clear();

    // Print summary report.
    global.console.log('\n~~~~~~~~~~~~ SUMMARY ~~~~~~~~~~~~');
    global.console.log(
        global.JSON.stringify(summary, null, 2)
    );
    global.console.log('\n');

    // Print individual reports.
    if (showImage || showAll) {
        global.console.log('\n~~~~~~~~~~~~ IMAGE ~~~~~~~~~~~~');
        global.console.log(
            global.JSON.stringify(log.readback('image'), null, 2)
        );
        global.console.log('\n');
    }
    if (showAjax || showAll) {
        global.console.log('\n~~~~~~~~~~~~ AJAX ~~~~~~~~~~~~');
        global.console.log(
            global.JSON.stringify(log.readback('ajax'), null, 2)
        );
        global.console.log('\n');
    }
    if (showAppend || showAll) {
        global.console.log('\n~~~~~~~~~~~~ APPEND ~~~~~~~~~~~~');
        global.console.log(
            global.JSON.stringify(log.readback('append'), null, 2)
        );
        global.console.log('\n');
    }
};
