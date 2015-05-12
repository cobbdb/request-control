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
var Stats = require('./spy-stat-block.js'),
    log = require('./log.js');

/**
 * @param {Number} opts.throttle Minimum time in milliseconds between successive requests.
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter XMLHttpRequest constructor.
 */
module.exports = function (opts) {
    var oldajax = opts.context.XMLHttpRequest;
    opts.context.rcAjaxStats = opts.context.rcAjaxStats || Stats(opts);
    opts.type = 'AJAX';
    /**
     * @return {XMLHttpRequest}
     */
    return function (args) {
        var req = new oldajax(args),
            oldsend = req.send,
            stats = opts.context.rcAjaxStats;
        req.send = function () {
            var now = Date.now(),
                firstReq = !opts.context.rcLastAjaxReq,
                greenLight = now - opts.context.rcLastAjaxReq > opts.throttle;
            stats.rps.attempted += 1;
            stats.net.attempted += 1;
            if (firstReq || greenLight) {
                stats.rps.made += 1;
                stats.net.made += 1;
                opts.context.rcLastAjaxReq = now;
                log('>>> <Ajax> request allowed', opts.id);
                oldsend.apply(req, arguments);
            } else {
                //log('>>> <Ajax> request blocked!', opts.id);
            }
        };
        req.addEventListener('load', function () {
            stats[req.status] = stats[req.status] || 0;
            stats[req.status] += 1;
        }, false);
        return req;
    };
};

},{"./log.js":6,"./spy-stat-block.js":7}],3:[function(require,module,exports){
(function (global){
var ajaxSpy = require('./ajax-spy.js'),
    imgSpy = require('./image-spy.js'),
    createSpy = require('./create-spy.js'),
    log = require('./log.js');

/**
 * @param {Number} [opts.throttle]
 */
module.exports = function (opts) {
    var spyList = [];
    opts = opts || {};
    function invade(context, id) {
        var i, frame, len;
        context = context || global.self;
        len = context.frames.length;

        // Place spies.
        context.XMLHttpRequest = ajaxSpy({
            throttle: opts.throttle || 200,
            context: context,
            id: id || 'top'
        });
        context.Image = imgSpy({
            throttle: opts.throttle || 200,
            context: context,
            id: id || 'top'
        });
        context.document.createElement = createSpy({
            throttle: opts.throttle || 200,
            context: context,
            id: id || 'top'
        });

        // Invade any iframes as well.
        for (i = 0; i < len; i += 1) {
            try {
                frame = context.frames[i].frameElement;
                if (!frame.contentWindow.rcThrottled) {
                    spyList.push(frame.id);
                }
                invade(frame.contentWindow, frame.id);
            } catch (err) {
                log('Denied access to', frame);
            }
        }
    }

    if (!global.rcThrottled) {
        invade();
        global.setInterval(invade, 5000);
    }

    return spyList;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ajax-spy.js":2,"./create-spy.js":4,"./image-spy.js":5,"./log.js":6}],4:[function(require,module,exports){
var Stats = require('./spy-stat-block.js'),
    log = require('./log.js');

/**
 * @param {Number} opts.throttle Minimum time in milliseconds between successive requests.
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter createElement function.
 */
module.exports = function (opts) {
    var oldcreate = opts.context.document.createElement;
    opts.context.rcCreateStats = opts.context.rcCreateStats || Stats(opts);
    opts.type = 'Create';
    /**
     * @param {String} tagName
     * @return {Element}
     */
    return function (tagName) {
        var now, firstReq, greenLight,
            stats = opts.context.rcCreateStats;
        if (tagName.toLowerCase() === 'object') {
            now = Date.now();
            firstReq = !opts.context.rcLastCreateReq;
            greenLight = now - opts.context.rcLastCreateReq > opts.throttle;
            stats.rps.attempted += 1;
            stats.net.attempted += 1;
            if (firstReq || greenLight) {
                stats.rps.made += 1;
                stats.net.made += 1;
                opts.context.rcLastCreateReq = now;
                log('>>> <Object/SWF> request allowed', opts.id);
                return oldcreate.call(opts.context.document, tagName);
            } else {
                //log('>>> <Object/SWF> request blocked!', opts.id);
                return oldcreate.call(opts.context.document, 'span');
            }
        } else {
            return oldcreate.call(opts.context.document, tagName);
        }
    };
};

},{"./log.js":6,"./spy-stat-block.js":7}],5:[function(require,module,exports){
var Stats = require('./spy-stat-block.js'),
    log = require('./log.js');

/**
 * @param {Number} opts.throttle Minimum time in milliseconds between successive requests.
 * @param {Object} opts.context Window context.
 * @param {String} opts.id ID of the frameElement.
 * @return {Function} Imposter Image constructor.
 */
module.exports = function (opts) {
    var oldimage = opts.context.Image;
    opts.context.rcImageStats = opts.context.rcImageStats || Stats(opts);
    opts.type = 'IMG';
    /**
     * @return {Object} Valid Image instance or empty generic.
     */
    return function (width, height) {
        var now = Date.now(),
            firstReq = !opts.context.rcLastImgReq,
            greenLight = now - opts.context.rcLastImgReq > opts.throttle,
            stats = opts.context.rcImageStats;
        stats.rps.attempted += 1;
        stats.net.attempted += 1;
        if (firstReq || greenLight) {
            stats.rps.made += 1;
            stats.net.made += 1;
            opts.context.rcLastImgReq = now;
            log('>>> <Image> request allowed', opts.id);
            return new oldimage(width, height);
        } else {
            //log('>>> <Image> request blocked!', opts.id);
            return {};
        }
    };
};

},{"./log.js":6,"./spy-stat-block.js":7}],6:[function(require,module,exports){
(function (global){
global.top.rcDebug = true;

module.exports = function () {
    if (global.top.rcDebug) {
        global.console.debug.apply(global.console, arguments);
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
(function (global){
var StatNode = require('./spy-stat-node.js'),
    log = require('./log.js');

/**
 * @param {String} opts.id ID of the frameElement.
 * @param {String} opts.type
 * @param {Boolean} opts.debug True to enable console logging.
 */
module.exports = function (opts) {
    var block = {
        rps: StatNode(),
        net: StatNode()
    };
    if (global.top.rcDebug) {
        global.setInterval(function () {
            if (block.rps.attempted > 0) {
                /*log(
                    'requests/second',
                    opts.id,
                    opts.type,
                    block.rps.toString()
                );*/
            }
            block.rps.made = 0;
            block.rps.attempted = 0;
        }, 1000);
        global.setInterval(function () {
            if (block.net.attempted > 0) {
                log(
                    '\tnet requests',
                    opts.id,
                    opts.type,
                    block.net.toString()
                );
            }
        }, 9000);
    }
    return block;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./log.js":6,"./spy-stat-node.js":8}],8:[function(require,module,exports){
var $ = require('curb');

module.exports = function () {
    return {
        attempted: 0,
        made: 0,
        toString: function () {
            return $('(made/attempted) %s/%s %s%',
                this.made,
                this.attempted,
                (!this.attempted) ? 0 : Math.round(this.made / this.attempted * 100)
            );
        }
    };
};

},{"curb":1}]},{},[3])(3)
});