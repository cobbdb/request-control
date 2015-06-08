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
                log('>>> <Ajax> request allowed', opts.id);
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

},{"./log.js":6,"./marker.js":7,"./request-gate.js":8,"./stat-set.js":10}],3:[function(require,module,exports){
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
        if (asText.indexOf('http') >= 0) {
            if (gate.check()) {
                log('>>> <DomAppend> request allowed', opts.id);
                return oldappend.call(this, child);
            } else {
                mark(opts.id);
                return child;
            }
        } else {
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
},{"./log.js":6,"./marker.js":7,"./request-gate.js":8,"./stat-set.js":10}],4:[function(require,module,exports){
(function (global){
/**
 * # Request Control
 * ### ***Throttle aggressive 3rd party http requests***
 */

var ajaxSpy = require('./ajax-spy.js'),
    imgSpy = require('./image-spy.js'),
    appendSpy = require('./append-spy.js'),
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
 * @return {Function} Callable to stop the system.
 */
module.exports = function (opts) {
    opts = opts || {};
    opts.grace = opts.grace || 500;
    opts.throttle = opts.throttle || 800;

    function invade(context, id) {
        var i, frame, len, spyConf;

        context = context || global.self;
        spyConf = {
            context: context,
            id: id || 'top',
            grace: opts.grace,
            throttle: opts.throttle
        };

        // Place spies.
        if (!id && opts.top) {
            context.XMLHttpRequest = ajaxSpy(spyConf);
            context.Image = imgSpy(spyConf);
            context.Element.prototype.appendChild = appendSpy(spyConf);
        }

        // Invade any iframes as well.
        len = context.frames.length;
        for (i = 0; i < len; i += 1) {
            try {
                frame = context.frames[i];
                invade(frame, frame.frameElement.id);
            } catch (err) {
                if (global.top.rcDebug === 2) {
                    log('Denied access to', frame, err);
                }
            }
        }
    }

    // Run and reapply every 10sec to catch new frames.
    if (!hash) {
        invade();
        hash = global.setInterval(invade, 10000);
    }

    /**
     * ## halt()
     * Stops RequestControl from invading new frames.
     */
    return function () {
        // Stop the heartbeat.
        global.clearInterval(hash);

        // >>> ToDo: Kill existing spies.
    };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ajax-spy.js":2,"./append-spy.js":3,"./image-spy.js":5,"./log.js":6}],5:[function(require,module,exports){
var Stats = require('./stat-set.js'),
    log = require('./log.js'),
    RequestGate = require('./request-gate.js'),
    mark = require('./marker.js');

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
     * @return {Object} Valid Image instance or empty generic.
     */
    function spy(width, height) {
        if (gate.check()) {
            log('>>> <Image> request allowed', opts.id);
            return new oldimage(width, height);
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

},{"./log.js":6,"./marker.js":7,"./request-gate.js":8,"./stat-set.js":10}],6:[function(require,module,exports){
(function (global){
module.exports = function () {
    if (global.top.rcDebug) {
        global.console.debug.apply(global.console, arguments);
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
},{"./stat-set.js":10}],9:[function(require,module,exports){
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
},{"curb":1}],10:[function(require,module,exports){
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
                log(
                    '\tnet requests',
                    id,
                    name,
                    block.net.toString()
                );
            }
        }
    }, 9000);
    return block;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./log.js":6,"./stat-node.js":9,"curb":1}]},{},[4])(4)
});