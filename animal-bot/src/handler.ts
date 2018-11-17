import {Rekognition} from 'aws-sdk';
import {readFile} from 'fs';
import {promisify} from 'util';
import path = require('path');
import {ApiGatewayHandler, LambdaUtil} from '../../libs/lambda-util/lambda-util';
import {plainToClass} from 'class-transformer';
import {Storage} from '@google-cloud/storage';
import moment = require('moment');


const storage = new Storage();
const bucket = storage.bucket('serverless-animal-bot-vcm');

const fs = {
  readFile: promisify(readFile)
};
const rekognition = new Rekognition({region: 'us-west-2'});
const lambdaUtil = new LambdaUtil();

export const detectRareAlien = async (event, context) => {
  const catBuffer = await fs.readFile(path.join(__dirname, 'cat.jpeg'));

  const params = {
    Image: {
      Bytes: catBuffer // new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
    },
    MaxLabels: 5,
    MinConfidence: 80
  };
  const result = await rekognition.detectLabels(params).promise();

  const isAnimal = result.Labels.find(l => l.Name === 'Animal');
  const label = result.Labels.find(l => {
    return !!l.Parents.find(p => p.Name === 'Invertebrate'
      || p.Name === 'Mammal' || p.Name === 'Bird' || p.Name === 'Amphibian'
      || p.Name === 'Reptile' || p.Name === 'Fish')
  });
  if (isAnimal && label) {
    const message = `I don't know but QT says "It's an ordinary ${label.Name}."`;
    console.log(message);
  }

};

class ImagesCsvMappingsRequestQueryStringParameters {
  private _limit: number = 50;
  private _skip: number = 50;

  set limit(value: number | string) {
    this._limit = typeof value === 'string' ? parseInt(value) : value;
  }

  get limit(): number | string {
    return this._limit <= 1000 ? this._limit : 1000;
  }

  set skip(value: number | string) {
    this._skip = typeof value === 'string' ? parseInt(value) : value;
  };

  get skip() {
    return this._skip || 0;
  };
}

interface CsvMapping {
  gsPath: string;
  tags: string;
  url?: string;
}

export const getImagesCsvMappings: ApiGatewayHandler = async (event, context) => {
  const queryStringParameters = plainToClass(ImagesCsvMappingsRequestQueryStringParameters, event.queryStringParameters, {excludePrefixes: ['_']});
  const {skip, limit} = queryStringParameters;
  if (typeof limit === 'string' || typeof skip === 'string') throw new Error('invalid limit or skip');

  const file = bucket.file('files.csv');
  const stream = file.createReadStream();

  const csv = await new Promise<string>((resolve, reject) => {
    let csv = '';

    stream.on('data', (chunk) => {
      csv += chunk.toString();
      const lineCount = (csv.match(/\n/gi) || []).length;
      if (lineCount >= skip + limit) {
        stream.destroy();
        resolve(csv)
      }
    });

    stream.on('finish', () => {
      resolve(csv);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });


  const files: Array<CsvMapping> = csv.split(`\n`).slice(skip, skip + limit).map(l => {
    const [gsPath, tags] = l.split(',');
    return {
      gsPath,
      tags
    };
  });

  for (let file of files) {
    const [url] = await bucket.file('files.csv').getSignedUrl({
      action: 'read',
      expires: moment().add(1, 'day').valueOf()
    });
    file.url = url;
  }
  return lambdaUtil.apiResponseJson({statusCode: 200, body: {data: files}});
};

