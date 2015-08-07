(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.RequestControl = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function () {
    var i,
        str = arguments[0],
        len = arguments.length;
    for (i = 1; i < len; i += 1) {
        str = str.replace(/%s/, arguments[i]);
    }
    return str;
};

},{}],2:[function(require,module,exports){
(function (global){
/**
 * # Lumberjack
 * Set `localStorage.lumberjack` to `on` to enable logging.
 * @param {Boolean} enabled True to force logging regardless of
 * the localStorage setting.
 * @return {Object} A new Lumberjack.
 * @see GitHub-Page http://github.com/cobbdb/lumberjack
 */
module.exports = function (enabled) {
    var log,
        record = {},
        cbQueue = {},
        master = [],
        ls = global.localStorage || {};

    /**
     * ## log(channel, data)
     * Record a log entry for an channel.
     * @param {String} channel A string describing this channel.
     * @param {String|Object|Number|Boolean} data Some data to log.
     */
    log = function (channel, data) {
        var i, len, channel, entry;
        var channelValid = typeof channel === 'string';
        var dataType = typeof data;
        var dataValid = dataType !== 'undefined' && dataType !== 'function';
        if (ls.lumberjack !== 'on' && !enabled) {
            // Do nothing unless enabled.
            return;
        }
        if (channelValid && dataValid) {
            /**
             * All log entries take the form of:
             * ```javascript
             *  {
             *      time: // timestamp when entry was logged
             *      data: // the logged data
             *      channel: // channel of entry
             *      id: // id of entry in master record
             *  }
             * ```
             */
            entry = {
                time: new Date(),
                data: data,
                channel: channel,
                id: master.length
            };
            // Record the channel.
            record[channel] = record[channel] || []
            record[channel].push(entry);
            master.push(entry);

            // Perform any attached callbacks.
            cbQueue[channel] = cbQueue[channel] || [];
            len = cbQueue[channel].length;
            for (i = 0; i < len; i += 1) {
                cbQueue[channel][i](data);
            }
        } else {
            throw Error('Lumberjack Error: log(channel, data) requires an channel {String} and a payload {String|Object|Number|Boolean}.');
        }
    };

    /**
     * ## log.clear([channel])
     * Clear all data from a the log.
     * @param {String} [channel] Name of a channel.
     */
    log.clear = function (channel) {
        if (channel) {
            record[channel] = [];
        } else {
            record = {};
            master = [];
        }
    };

    /**
     * ## log.readback(channel, [pretty])
     * Fetch the log of an channel.
     * @param {String} channel A string describing this channel.
     * @param {Boolean} [pretty] True to create a formatted string result.
     * @return {Array|String} This channel's current record.
     */
    log.readback = function (channel, pretty) {
        var channelValid = typeof channel === 'string';
        if (channelValid) {
            if (pretty) {
                return JSON.stringify(record[channel], null, 4);
            }
            return record[channel] || [];
        }
        throw Error('log.readback(channel, pretty) requires an channel {String}.');
    };

    /**
     * ## log.readback.master([pretty])
     * Get a full readback of all channels' entries.
     * @param {Boolean} [pretty] True to create a formatted string result.
     * @return {Array|String} This log's master record.
     */
    log.readback.master = function (pretty) {
        if (pretty) {
            return JSON.stringify(master, null, 4);
        }
        return master;
    };

    /**
     * ## log.readback.channels([pretty])
     * Fetch list of log channels currently in use.
     * @param {Boolean} [pretty] True to create a formatted string result.
     * @return {Array|String} This log's set of used channels.
     */
    log.readback.channels = function (pretty) {
        var keys = Object.keys(record);
        if (pretty) {
            return JSON.stringify(keys);
        }
        return keys;
    };

    /**
     * ## log.flush([channel])
     * Flush all logs from a single channel or from the entire
     * system if no channel name is provided.
     * @param {String} [channel] Optional name of channel to flush.
     * @return {Array}
     */
    log.flush = function (channel) {
        var logs;
        if (channel) {
            logs = record[channel];
            record[channel] = [];
        } else {
            record = {};
            master = [];
            logs = [];
        }
        return logs;
    };

    /**
     * ## log.on(channel, cb)
     * Attach a callback to run anytime a channel is logged to.
     * @param {String} channel A string describing this channel.
     * @param {Function} cb The callback.
     */
    log.on = function (channel, cb) {
        var channelValid = typeof channel === 'string';
        var cbValid = typeof cb === 'function';
        if (channelValid && cbValid) {
            cbQueue[channel] = cbQueue[channel] || [];
            cbQueue[channel].push(cb);
        } else {
            throw Error('log.on(channel, cb) requires an channel {String} and a callback {Function}.');
        }
    };

    /**
     * ## log.off(channel)
     * Disable side-effects for a given channel.
     * @param {String} channel A string describing this channel.
     */
    log.off = function (channel) {
        var channelValid = typeof channel === 'string';
        if (channelValid) {
            cbQueue[channel] = [];
        } else {
            throw Error('log.off(channel) requires an channel {String}.');
        }
    };

    /**
     * ## log.enable()
     * Activate logging regardless of previous settings.
     */
    log.enable = function () {
        enabled = true;
    };

    /**
     * ## log.disable()
     * Force logging off.
     */
    log.disable = function () {
        enabled = false;
    };

    return log;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
var Stats = require('./stat-set.js'),
    log = require('./log.js'),
    RequestGate = require('./request-gate.js'),
    mark = require('./marker.js');

/**
 * # Ajax Spy
 * @param {Number} opts.throttle
 * @param {Number} opts.grace
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter XMLHttpRequest constructor.
 */
module.exports = function (opts) {
    var oldajax = opts.context.XMLHttpRequest,
        gate = RequestGate('AJAX', opts);

    /**
     * @return {XMLHttpRequest}
     */
    function spy(args) {
        var req = new oldajax(args),
            oldsend = req.send;
        req.send = function () {
            if (gate.check()) {
                log('ajax', {
                    msg: 'request allowed',
                    id: opts.id
                });
                oldsend.apply(req, arguments);
            } else {
                mark(opts.id);
            }
        };
        return req;
    }
    spy.rcSpy = true;

    if (oldajax.rcSpy) {
        // Return self if already a RequestControl spy.
        return oldajax;
    } else {
        // Otherwise, return the new spy.
        return spy;
    }
};

},{"./log.js":9,"./marker.js":10,"./request-gate.js":11,"./stat-set.js":13}],4:[function(require,module,exports){
(function (global){
var Stats = require('./stat-set.js'),
    log = require('./log.js'),
    harness = global.document.createElement('div'),
    RequestGate = require('./request-gate.js'),
    mark = require('./marker.js');

/**
 * @param {Number} opts.throttle
 * @param {Number} opts.grace
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter appendChild function.
 */
module.exports = function (opts) {
    var oldappend = opts.context.Element.prototype.appendChild,
        gate = RequestGate('DomAppend', opts);

    /**
     * @param {Element} child
     * @return {Element} The appended child.
     */
    function spy(child) {
        var asText;
        harness.innerHTML = '';
        oldappend.call(harness, child);
        asText = harness.innerHTML;
        if (asText.indexOf('//') >= 0) {
            if (gate.check()) {
                log('append', {
                    msg: 'request allowed',
                    id: opts.id,
                    text: asText
                });
                return oldappend.call(this, child);
            } else {
                mark(opts.id);
                return child;
            }
        } else {
            log('append', {
                msg: 'non-request append allowed',
                id: opts.id
            });
            return oldappend.call(this, child);
        }
    }
    spy.rcSpy = true;

    if (oldappend.rcSpy) {
        // Return self if already a RequestControl spy.
        return oldappend;
    } else {
        // Otherwise, return the new spy.
        return spy;
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./log.js":9,"./marker.js":10,"./request-gate.js":11,"./stat-set.js":13}],5:[function(require,module,exports){
(function (global){
/**
 * # Request Control
 * ### ***Throttle aggressive 3rd party http requests***
 */

var ajaxSpy = require('./ajax-spy.js'),
    imgSpy = require('./image-spy.js'),
    appendSpy = require('./append-spy.js'),
    createSpy = require('./create-spy.js'),
    log = require('./log.js'),
    hash;

/**
 * ## RequestControl([opts])
 * Starts the system.
 * @param {Number} [opts.grace] Defaults to 50. Number of requests to ignore
 * before activating the request throttle.
 * @param {Number} [opts.throttle] Defaults to 800. Minimum time in
 * milliseconds between successive requests. Only applies after grace period.
 * @param {Boolean} [opts.top] True to throttle the top window as well
 * as iframes.
 * @param {Boolean} [opts.log] True to enable system logging.
 * @return {Function} Callable to stop the system.
 */
module.exports = function (opts) {
    opts = opts || {};
    opts.grace = opts.grace || 100;
    opts.throttle = opts.throttle || 800;

    function invade(context, id) {
        var i, frame, len, spyConf;
        context = context || global.self;

        if (opts.log || global.top.rcDebug) {
            log.enable();
        }

        spyConf = {
            context: context,
            id: id || 'top',
            grace: opts.grace,
            throttle: opts.throttle
        };

        // Place spies.
        if (id || (!id && opts.top)) {
            context.XMLHttpRequest = ajaxSpy(spyConf);
            context.Image = imgSpy(spyConf);
            context.document.createElement = createSpy(spyConf);
            context.Element.prototype.appendChild = appendSpy(spyConf);
        }

        // Invade any iframes as well.
        len = context.frames.length;
        for (i = 0; i < len; i += 1) {
            try {
                frame = context.frames[i];
                invade(frame, frame.frameElement.id);
            } catch (err) {}
        }
    }

    // Run and reapply every 10sec to catch new frames.
    if (!hash) {
        invade();
        hash = global.setInterval(invade, 500);
    }

    /**
     * ## halt()
     * Stops RequestControl from invading new frames.
     */
    return function () {
        // Stop the heartbeat.
        global.clearInterval(hash);
    };
};

/**
 * Expose the system logger.
 */
module.exports.log = log;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ajax-spy.js":3,"./append-spy.js":4,"./create-spy.js":6,"./image-spy.js":7,"./log.js":9}],6:[function(require,module,exports){
var Stats = require('./stat-set.js'),
    log = require('./log.js'),
    RequestGate = require('./request-gate.js'),
    mark = require('./marker.js'),
    NewImage = require('./image.js');

/**
 * @param {Number} opts.throttle
 * @param {Number} opts.grace
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter createElement function.
 */
module.exports = function (opts) {
    var oldcreate = opts.context.document.createElement,
        gate = RequestGate('Image', opts);

    /**
     * @param {String} tagName
     * @return {DOM Node}
     */
    function spy(tagName) {
        if (tagName === 'img') {
            if (gate.check()) {
                return NewImage(opts.context);
            } else {
                mark(opts.id);
                return oldcreate.call(opts.context.document, 'span');
            }
        }
        return oldcreate.call(opts.context.document, tagName);
    }
    spy.rcSpy = true;

    if (oldcreate.rcSpy) {
        // Return self if already a RequestControl spy.
        return oldcreate;
    } else {
        // Otherwise, return the new spy.
        return spy;
    }
};

},{"./image.js":8,"./log.js":9,"./marker.js":10,"./request-gate.js":11,"./stat-set.js":13}],7:[function(require,module,exports){
var Stats = require('./stat-set.js'),
    log = require('./log.js'),
    RequestGate = require('./request-gate.js'),
    mark = require('./marker.js'),
    NewImage = require('./image.js');

/**
 * @param {Number} opts.throttle
 * @param {Number} opts.grace
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter Image constructor.
 */
module.exports = function (opts) {
    var oldimage = opts.context.Image,
        gate = RequestGate('Image', opts);

    /**
     * @param {Number} [width]
     * @param {Number} [height]
     * @return {Object} Valid image Node or empty generic.
     */
    function spy(width, height) {
        if (gate.check()) {
            return NewImage(opts.context);
        } else {
            mark(opts.id);
            return {};
        }
    }
    spy.rcSpy = true;

    if (oldimage.rcSpy) {
        // Return self if already a RequestControl spy.
        return oldimage;
    } else {
        // Otherwise, return the new spy.
        return spy;
    }
};

},{"./image.js":8,"./log.js":9,"./marker.js":10,"./request-gate.js":11,"./stat-set.js":13}],8:[function(require,module,exports){
(function (global){
var log = require('./log.js'),
    oldCreate = global.document.createElement;

function make(tagName, ctx) {
    return oldCreate.call(ctx.document, tagName);
}

/**
 * Create a new wrapped image Node.
 * @param {Window} ctx
 */
module.exports = function (ctx) {
    var husk = make('span', ctx),
        img = make('img', ctx);
    husk.appendChild(img);

    global.Object.defineProperty(husk, 'src', {
        get: function () {
            return img.src;
        },
        set: function (url) {
            log('image', {
                msg: 'Fetching image',
                src: url
            });
            img.src = url;
        }
    });

    return husk;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./log.js":9}],9:[function(require,module,exports){
(function (global){
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lumberjackjs":2}],10:[function(require,module,exports){
(function (global){
var cache = {};

/**
 * # Marker
 * Outlines any element with a red border.
 * @param {String} id Element ID.
 */
module.exports = function (id) {
    var el;
    if (global.top.rcDebug) {
        if (!(id in cache)) {
            el = global.top.document.getElementById(id);
            if (el) {
                el.style.border = '4px solid red';
            }
        }
        cache[id] = true;
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function (global){
var StatSet = require('./stat-set.js');

/**
 * @param {String} name Unique identifier for this gate.
 * @param {Number} opts.throttle
 * @param {Number} opts.grace
 * @param {Window} [opts.context]
 * @return {Object}
 */
module.exports = function (name, opts) {
    var context = opts.context || global.self;

    context.rcStats = context.rcStats || {};
    context.rcStats[name] = context.rcStats[name] || StatSet(name, opts.id);
    context.rcLast = context.rcLast || {};
    context.rcLast[name] = context.rcLast[name] || 0;

    return {
        /**
         * @return {Boolean}
         */
        check: function () {
            var now = global.Date.now(),
                firstReq = !context.rcLast[name],
                greenLight = now - context.rcLast[name] > opts.throttle,
                free = this.stats.net.made < opts.grace;
            this.stats.count.attempted();

            if (free || firstReq || greenLight) {
                this.close();
                this.stats.count.made();
                return true;
            }
            return false;
        },
        close: function () {
            context.rcLast[name] = global.Date.now();
        },
        open: function () {
            context.rcLast[name] = 0;
        },
        stats: context.rcStats[name]
    };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./stat-set.js":13}],12:[function(require,module,exports){
(function (global){
var $ = require('curb');

module.exports = function () {
    return {
        attempted: 0,
        made: 0,
        toString: function () {
            return $('(made/attempted) %s/%s %s%',
                this.made,
                this.attempted,
                (!this.attempted) ? 0 : global.Math.round(this.made / this.attempted * 100)
            );
        }
    };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"curb":1}],13:[function(require,module,exports){
(function (global){
var $ = require('curb'),
    StatNode = require('./stat-node.js'),
    log = require('./log.js');

/**
 * @param {String} name
 * @param {String} id Element id of parent frame.
 * @return {Object}
 */
module.exports = function (name, id) {
    var block = {
            rps: StatNode(),
            net: StatNode(),
            count: {
                made: function () {
                    block.rps.made += 1;
                    block.net.made += 1;
                },
                attempted: function () {
                    block.rps.attempted += 1;
                    block.net.attempted += 1;
                }
            }
        },
        rpsLastMade = 0,
        rpsLastAttempted = 0;
    global.setInterval(function () {
        // Update rps counter.
        block.rps.made = block.net.made - rpsLastMade;
        block.rps.attempted = block.net.attempted - rpsLastAttempted;
        rpsLastMade = block.net.made;
        rpsLastAttempted = block.net.attempted;
    }, 1000);
    global.setInterval(function () {
        if (global.top.rcDebug) {
            if (block.net.attempted > 0) {
                log('summary', {
                    msg: 'Net requests',
                    id: id,
                    name: name,
                    net: block.net.toString()
                });
            }
        }
    }, 9000);
    return block;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./log.js":9,"./stat-node.js":12,"curb":1}]},{},[5])(5)
});