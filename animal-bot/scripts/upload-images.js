const fs = require('fs');
const request = require('request');
const {Storage} = require('@google-cloud/storage');
// Creates a client
const storage = new Storage({
  projectId: 'serverless-animal-bot',
});
const myBucket = storage.bucket('serverless-animal-bot-vcs');

const file = myBucket.file('my-file.jpg');

// request('https://vignette.wikia.nocookie.net/space-dandy/images/5/53/Dandy_portal.jpeg')
//   .pipe(fs.createWriteStream('my-file.jpg'))
fs.createReadStream('my-file.jpg')
  .pipe(file.createWriteStream())
  .on('error', function(err) {
    console.log(err);
  })
  .on('finish', function() {
    // The file upload is complete.
    console.log('Complete!');
  });


