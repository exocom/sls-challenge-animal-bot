const {Google, Bing, Yahoo} = require('images-scraper');
const google = new Google();

const config = {
    num: 20,
    detail: true,
    nightmare: {
        show: true
    }
};

/*
    {
    height: 360,
    thumb_height: 194,
    thumb_url:
     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTldQebKSh6nePflG-5ivzJhKdJIB0cH_XIMZrYGUW0p1Xk-LhyFQ',
    thumb_width: 259,
    type: 'image/jpg',
    url: 'https://i.ytimg.com/vi/Cy15_9LbScQ/hqdefault.jpg',
    width: 480
    }
 */

(async () => {
    const keywords = ['dandy from space dandy', 'qt from space dandy', 'meow from space dandy'];

    // you can also watch on events
    google.on('result', function (item) {
        console.log('out', item);
    });
    const res = await google.list({
        ...config,
        keyword: keywords[0]
    });

    console.log(5
    res
)
    ;


})();
