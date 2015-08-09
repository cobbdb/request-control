var log = require('./log.js'),
    oldCreate = global.document.createElement;

function make(tagName, ctx) {
    return oldCreate.call(ctx.document, tagName);
}

/**
 * Create a new wrapped image Node.
 * @param {Window} ctx Window context to use.
 * @param {String} id Node id.
 */
module.exports = function (ctx, id) {
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
                src: url,
                id: id
            });
            img.src = url;
        }
    });

    return husk;
};
