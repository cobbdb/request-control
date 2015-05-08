var throttle = 5;

function makeImage(frameWindow, id) {
    var oldimage = frameWindow.Image;
    frameWindow.isImgThrottled = true;
    frameWindow.timeOfLastRequest = Date.now();
    frameWindow.imgReqs = {
        rps: {
            attempted: 0,
            made: 0
        },
        net: {
            attempted: 0,
            made: 0
        },
        allowance: 0
    };
    setInterval(function () {
        var made = frameWindow.imgReqs.rps.made,
            attempted = frameWindow.imgReqs.rps.attempted;
        if (attempted > 0) {
            console.log(
                '\t<<<Image>>>',
                'requests/second',
                id,
                '(made/attempted)',
                Math.floor(made),
                Math.floor(attempted),
                Math.round(made / attempted * 100) + '%'
            );
        }
        frameWindow.imgReqs.rps.made = 0;
        frameWindow.imgReqs.rps.attempted = 0;
    }, 1000);
    setInterval(function () {
        var made = frameWindow.imgReqs.net.made,
            attempted = frameWindow.imgReqs.net.attempted;
        if (attempted > 0) {
            console.log(
                '\t\t<<<Image>>>',
                'net requests',
                id,
                '(made/attempted)',
                Math.floor(made),
                Math.floor(attempted),
                (attempted === 0) ? '0%' : Math.round(made / attempted * 100) + '%'
            );
        }
    }, 10000);
    return function (width, height) {
        var image, oldsend, now;
        frameWindow.imgReqs.allowance += 1;
        frameWindow.imgReqs.rps.attempted += 1;
        frameWindow.imgReqs.net.attempted += 1;
        if (frameWindow.imgReqs.allowance < throttle) {
            frameWindow.timeOfLastRequest = Date.now();
            image = new oldimage(width, height);
            frameWindow.imgReqs.rps.made += 1;
            frameWindow.imgReqs.net.made += 1;
        } else {
            console.log('>>> <Image> request blocked!', id);
            now = Date.now();
            if (now - frameWindow.timeOfLastRequest > 1000) {
                console.log('*** Resetting <image> req count', id);
                frameWindow.imgReqs.allowance = 0;
            }
        }
        return image;
    };
}

var spyList = spyList || [];
function ImageSpy(parentWindow) {
    var i, frame, len;
    parentWindow = parentWindow || self;
    len = parentWindow.frames.length;
    for (i = 0; i < len; i += 1) {
        try {
            frame = parentWindow.frames[i].frameElement;
            if (!frame.contentWindow.isImgThrottled) {
                frame.contentWindow.Image = makeImage(frame.contentWindow, frame.id);
                spyList.push(frame.id);
            }
            ImageSpy(frame.contentWindow);
        } catch (err) {}
    }
}
ImageSpy();
