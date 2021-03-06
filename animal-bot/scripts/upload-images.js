const fs = require('fs');
const request = require('request');
const Q = require('q');
const {Readable} = require('stream');
const {Storage} = require('@google-cloud/storage');

const storage = new Storage({projectId: 'serverless-animal-bot'});
const bucketName = 'serverless-animal-bot-vcm';
const bucket = storage.bucket(bucketName);
const images = require('./images.json');

(async () => {
  const uploads = Object.keys(images).reduce((promises, key, i) => {
    const arr = images[key].filter(i => !/img\.gawkerassets\.com/gi.test(i.url)).map((image, index) => {
      return new Promise((resolve, reject) => {
        let fileName = image.url.replace(/.*?\/\/.*?(?<!\/)\/([^\/]+\.(jpeg|jpg|gif|png)).*$/gi, '$1').replace(/,/gi, '');
        if (image.url.length === fileName.length) fileName = `${key}${Math.random()}.jpg`;
        const filePath = `/${key}/${index}-${fileName}`;
        const file = bucket.file(filePath);
        let delay = i * 15000;
        if (index > 50) delay += 500;
        if (index > 100) delay += 1500;
        if (index > 150) delay += 2500;
        if (index > 200) delay += 3500;
        if (index > 250) delay += 4500;
        setTimeout(() => {
          try {
            request(image.url)
              .pipe(file.createWriteStream())
              .on('error', reject)
              .on('finish', () => {
                console.log(fileName);
                resolve({
                  path: `gs://${bucketName}${filePath}`,
                  tag: key
                });
              });
          } catch (err) {
            reject(err);
          }
        }, delay);
      });
    });
    return promises.concat(arr);
  }, []);

  const files = await Q.allSettled(uploads).then((results) => {
    return results.filter(r => r.state === 'fulfilled').map(r => r.value)
  });

  if (process.env.CREATE_CSV) {
    const filesCsv = files.map(({path, tag}) => `${path},${tag}`).join(`\n`);
    const csv = new Readable();
    csv.push(filesCsv);
    csv.push(null);
    csv.pipe(bucket.file('files.csv').createWriteStream());
  }
})();
