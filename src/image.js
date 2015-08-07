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
