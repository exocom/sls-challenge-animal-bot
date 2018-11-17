const {writeFile} = require('fs');
const {promisify} = require('util');
const {Google, Bing, Yahoo} = require('images-scraper');
const google = new Google();
const bing = new Bing();
const yahoo = new Yahoo();

const fs = {
  writeFile: promisify(writeFile)
}

const config = {
  num: 100,
  detail: true,
  nightmare: {
    show: false
  }
};

(async () => {
  const keywords = ['dandy', 'qt', 'meow'];

  const images = await keywords.reduce(async (promise, keyword) => {
    return promise.then(async (data) => {
      const options = {...config, keyword: keyword + ' from space dandy'};

      const googleRes = google.list(options);
      const bingRes = bing.list(options);
      const yahooRes = yahoo.list(options);

      process.stdout.write(keyword);
      const outputInterval = setInterval(() => {
        process.stdout.write('.');
      }, 200);

      const resultSet = await Promise.all([googleRes, bingRes, yahooRes]);
      process.stdout.write('\n');
      clearInterval(outputInterval);
      data[keyword] = resultSet.reduce((arr, result) => arr.concat(result), []);
      return data;
    });
  }, new Promise((resolve) => resolve({})));

  await fs.writeFile('images.json', JSON.stringify(images));
  console.log('Image File created: images.json');
})();
