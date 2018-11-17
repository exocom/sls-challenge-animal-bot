const fs = require('fs');
const request = require('request');
const {Storage} = require('@google-cloud/storage');

const storage = new Storage({projectId: 'serverless-animal-bot'});
const myBucket = storage.bucket('serverless-animal-bot-vcm');
const images = require('./images.json');

(async () => {
  const uploads = Object.keys(images).reduce((promises, key) => {
    const arr = images[key].map((image, index) => {
      return new Promise((resolve, reject) => {
        let fileName = image.url.replace(/.*?\/\/.*?(?<!\/)\/([^\/]+\.(jpeg|jpg|gif|png)).*$/gi, '$1');
        if (image.url.length === fileName.length) fileName = `${key}${Math.random()}.jpg`;
        const file = myBucket.file(`/${key}/${index}-${fileName}`);
        request(image.url)
          .pipe(file.createWriteStream())
          .on('error', reject)
          .on('finish', () => {
            console.log(fileName);
            resolve();
          });
      });
    });
    return promises.concat(arr);
  }, []);
  await Promise.all(uploads);
})();
