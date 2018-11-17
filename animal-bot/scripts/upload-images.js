const fs = require('fs');
const request = require('request');
const Q = require('q');
const {Readable} = require('stream');
const {Storage} = require('@google-cloud/storage');

const storage = new Storage({projectId: 'serverless-animal-bot'});
const bucket = 'serverless-animal-bot-vcm';
const myBucket = storage.bucket(bucket);
const images = require('./images.json');

(async () => {
  const uploads = Object.keys(images).reduce((promises, key) => {
    const arr = images[key].filter(i => !/img\.gawkerassets\.com/gi.test(i.url)).map((image, index) => {
      return new Promise((resolve, reject) => {
        let fileName = image.url.replace(/.*?\/\/.*?(?<!\/)\/([^\/]+\.(jpeg|jpg|gif|png)).*$/gi, '$1').replace(',', '');
        if (image.url.length === fileName.length) fileName = `${key}${Math.random()}.jpg`;
        const filePath = `/${key}/${index}-${fileName}`;
        const file = myBucket.file(filePath);

        request(image.url)
          .pipe(file.createWriteStream())
          .on('error', reject)
          .on('finish', () => {
            console.log(fileName);
            resolve({
              path: `gs://${bucket}${filePath}`,
              tag: key
            });
          });
      });
    });
    return promises.concat(arr);
  }, []);

  const files = await Q.allSettled(uploads).then((results) => {
    return results.filter(r => r.state === 'fulfilled').map(r => r.value)
  });
  const filesCsv = files.map(({path, tag}) => `${path},${tag}`).join(`\n`);
  const csv = new Readable();
  csv.push(filesCsv);
  csv.push(null);
  csv.pipe(myBucket.file('files.csv').createWriteStream());
})();
