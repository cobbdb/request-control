var BaseClass = require('baseclassjs'),
    $ = require('curb'),
    statNode = require('./spy-stat-node.js'),
    log = require('./log.js');

/**
 * @param {String} opts.id ID of the frameElement.
 * @param {Boolean} opts.debug True to enable console logging.
 */
module.exports = function (opts) {
    var block = {
        rps: statNode(),
        net: statNode()
    };
    if (global.top.rcDebug) {
        global.setInterval(function () {
            log(
                'requests/second',
                opts.id,
                block.rps.toString()
            );
            block.rps.made = 0;
            block.rps.attempted = 0;
        }, 1000);
        global.setInterval(function () {
            log(
                'net requests',
                opts.id,
                block.rps.toString()
            );
        }, 10000);
    }
    return block;
};
