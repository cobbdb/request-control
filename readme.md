<a href="https://github.com/cobbdb/request-control">
    <img alt="logo" src="http://i.imgur.com/xrtq29k.png" width="300">
</a>

[![Bower version](https://badge.fury.io/bo/request-control.svg)](http://badge.fury.io/bo/request-control) [![NPM version](https://badge.fury.io/js/request-control-js.svg)](http://badge.fury.io/js/request-control-js)

Throttle aggressive 3rd party http requests.

    $ bower install request-control
    $ npm install request-control-js

-------------
As viewability becomes the gold standard in advertising metrics, many vendors are
hungry for related data. Unfortunately, some programatic and remnant creatives
can end up plaguing your site with a relentless flow of http requests - especially
from video ads.

Request Control provides you a throttle to take back control of your site performance
and enforce a speed limit on http requests per second.

***Will this interfere with other site content?***
Definitely not. Throttling does not engage for the top window context by default - this means only your site's iframes will be affected. There is also a (configurable) grace period of 100 requests before the throttle will kick in, meaning your standard site content will be unaffected.

***Won't this interfere with revenue from video remnants?***
Nope! Since this is only a throttle, video metrics will still be reported from video ads - just at a more sane rate. Once the throttle kicks in, only 1 out of every N (configurable) requests per second will be made.

Request Control is intended to throttle malicious reporting - which may make upwards of 10 http requests per second! At roughly 100KB per request this can add up to some *very* expensive site visits for your mobile customers.

### Using the Throttle
To load Request Control on your site, simply include the built script from `dist/reqctrl.min.js` and then start the throttle when you're ready to enforce a request speed limit. Request Control will automatically reapply the throttle when possible in any iframes for you.

You can install the JS global object with `bower install request-control`.
```html
<script src="path/to/reqctrl.min.js"></script>
<script>
    RequestControl();
</script>
```

Request Control is also provided as a CommonJS module with `npm install request-control-js`.
```javascript
var Throttle = require('request-control-js');
Throttle();
```

### Configuration
To better tune the throttle for your site, there are a few options you can customize.

##### throttle
**{Number}** This is the time in milliseconds to enfore between successive http requests.
```javascript
RequestControl({
    throttle: 4000
});
```

##### grace
**{Number}** Number of requests to allow before engaging the throttle.
```javascript
RequestControl({
    grace: 50
});
```

##### top
**{Boolean}** True to throttle the top window as well as iframes.
```javascript
RequestControl({
    top: true
});
```

##### log
**{Boolean}** True to enable logging. Lumberjack logs with [Lumberjack](http://cobbdb.github.io/lumberjack/)
to 4 channels: `summary`, `image`, `ajax`, `append`.
```javascript
RequestControl({
    log: true
});
```

### Debugging your Site
Request Control features logging and DOM element highlighting to help you find those
problem areas on your site. Just open the JavaScript console in your browser
and set the `rcDebug` variable in the **top window**.
```javascript
// Enable basic highlighting and request summary reports.
> rcDebug = true;

// Print a detailed report of network activity.
// Available reports are: image, ajax, append. You can request reports for
// any of these. For example, to get only image and ajax reports:
> RequestControl.log.report('image ajax');
```

### Stopping the Throttle
After the throttle has been started, you can turn it off with the callable that is
returned when you first started the system.
```javascript
// Start the throttle.
var halt = RequestControl();

// Some time later, stop the throttle.
halt();
```

---------
* See: http://cobbdb.github.io/request-control
* See: http://github.com/cobbdb/request-control
* License: MIT
