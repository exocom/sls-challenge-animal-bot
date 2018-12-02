import {S3Handler} from "../../libs/lambda-util/node_modules/@types/aws-lambda";
import {S3} from 'aws-sdk';
import * as ffmpeg from 'fluent-ffmpeg';
import * as chokidar from 'chokidar';
import {Storage} from '@google-cloud/storage';
import {createReadStream, unlink} from "fs";
import {promisify} from "util";

const storage = new Storage({projectId: 'serverless-animal-bot'});
const bucketName = 'serverless-animal-bot-vcm';
const bucket = storage.bucket(bucketName);

const s3 = new S3();
const fs = {
  unlink: promisify(unlink)
};


export const createScreenshots: S3Handler = async (event, context) => {
  const watcher = chokidar.watch('/tmp')
    .on('add', filePath => {
      const file = bucket.file(filePath);
      createReadStream(filePath)
        .pipe(file.createWriteStream())
        .on('error', () => {
        })
        .on('finish', async () => {
          await fs.unlink(filePath);
        });
    });

  for (const record of event.Records) {
    const stream = s3.getObject({
      Bucket: record.s3.bucket.name,
      Key: record.s3.object.key
    }).createReadStream();
    const command = ffmpeg(stream)
      .on('end', function () {
        console.log('Screenshots taken');
        watcher.close();
      })
      .screenshots({
        count: 480,
        folder: '/tmp'
      });
  }


};
