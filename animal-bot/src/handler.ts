import {Rekognition} from 'aws-sdk';
import {readFile} from 'fs';
import {promisify} from 'util';
import path = require('path');
import {Readable} from 'stream';
import {ScheduleEventHandler, ApiGatewayHandler, LambdaUtil} from '../../libs/lambda-util/lambda-util';
import {deserialize, plainToClass} from 'class-transformer';
import {Storage} from '@google-cloud/storage';
import moment = require('moment');
import request = require('request-promise');
import {v1beta1} from '@google-cloud/automl';
import Twitter = require('twitter');

const automl = v1beta1;
const projectId = 'serverless-animal-bot';
const computeRegion = 'us-central1';
const modelId = 'ICN52505916782813180';
const predictionServiceClient = new automl.PredictionServiceClient();
const modelFullId = predictionServiceClient.modelPath(projectId, computeRegion, modelId);
const scoreThreshold = .8;
const minConfidence = 70;

const storage = new Storage();
const bucketName = 'serverless-animal-bot-vcm';
const bucket = storage.bucket(bucketName);
const fileName = 'files.csv';
const gsFileNameRegExp = new RegExp(`^gs:\/\/${bucketName}\/`);

const fs = {
  readFile: promisify(readFile)
};
const rekognition = new Rekognition({region: 'us-west-2'});
const lambdaUtil = new LambdaUtil();

const twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

const google = async (imageBuffer) => {
  const payload = {image: {imageBytes: imageBuffer}};
  const [response] = await predictionServiceClient.predict({
    name: modelFullId,
    payload,
    params: {score_threshold: scoreThreshold}
  });
  let rareAliens: Array<{ name: string; woolong: number; }> = [];
  let alohaOeCrewMembers: Array<{ name: string; }> = [];
  let mainCharacters: Array<{ name: string; }> = [];

  // TODO : check if any of the matched are rare, crew member, or main characters.
  response.payload.forEach(result => {
    console.log(`Predicted class name: ${result.displayName}`);
    console.log(`Predicted class score: ${result.classification.score}`);
  });

  return {
    rareAliens,
    alohaOeCrewMembers,
    mainCharacters
  }
};

const aws = async (imageBuffer) => {
  const params = {
    Image: {Bytes: imageBuffer},
    MaxLabels: 10,
    MinConfidence: minConfidence
  };
  const result = await rekognition.detectLabels(params).promise();

  const isAnimal = result.Labels.find(l => l.Name === 'Animal');
  const label = result.Labels.find(l => {
    return !!l.Parents.find(p => p.Name === 'Invertebrate'
      || p.Name === 'Mammal' || p.Name === 'Bird' || p.Name === 'Amphibian'
      || p.Name === 'Reptile' || p.Name === 'Fish')
  });

  return {
    isAnimal,
    label
  };
};

const pollRate = 15;

export const detectRareAlien: ScheduleEventHandler = async (event, context) => {
  const startAt = moment().subtract(pollRate, 'minutes');
  const tweets = await twitterClient.get('statuses/mentions_timeline');
  const tweetsWithImage = tweets.filter(tweet => {
    const createdAt = moment(tweet.createdAt);
    return createdAt > startAt && tweet.text.indexOf('image?') > -1 && tweet.entities.media.length
  });

  tweetsWithImage.map(async tweet => {
    let message = '';
    for(const media of tweet.entities.media) {
      const imgBytes = await request(media.media_url,{ encoding: null });
      const [awsResult, googleResult] = await Promise.all([aws(imgBytes), google(imgBytes)]);

      if (awsResult.isAnimal && awsResult.label) {
        const message = `I don't know but QT says "It's an ordinary ${awsResult.label.Name}."`;
        console.log(message);
      }
    }
    const tweeted = await twitterClient.post('statuses/update', {
      status: `@${tweet.user.screen_name} ${message}`,
      in_reply_to_status_id: tweet.id_str
    });
    console.log(tweeted);
    return tweeted;
  });

  await Promise.all(tweetsWithImage);
};

class ImagesCsvMappingsRequestQueryStringParameters {
  private _limit: number = 50;
  private _skip: number = 0;

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

type mappingState = 'TRAIN' | 'TEST' | 'VALIDATION';

interface CsvMapping {
  id: number | null,
  state: mappingState | null,
  gsPath: string;
  tags: Array<string>;
  url?: string;
}

export const getImagesCsvMappings: ApiGatewayHandler = async (event, context) => {
  const {skip, limit} = plainToClass<ImagesCsvMappingsRequestQueryStringParameters, object>(ImagesCsvMappingsRequestQueryStringParameters, event.queryStringParameters, {excludePrefixes: ['_']});
  if (typeof limit === 'string' || typeof skip === 'string') {
    const errors = [{
      type: 'Validation',
      message: 'Invalid Skip or Limit'
    }];
    return lambdaUtil.apiResponseJson({statusCode: 400, body: {errors}});
  }

  const file = bucket.file(fileName);
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

  const csvMappings: Array<CsvMapping> = csv.trim()
    .split(/\r?\n/)
    .slice(skip, skip + limit)
    .map((csvLine, index) => {
      const id = index + skip + 1;
      if (/^[TV].*?,gs:/.test(csvLine)) {
        const [state, gsPath, ...tags] = csvLine.split(',');
        return {
          id,
          state: state as mappingState,
          gsPath,
          tags
        };
      }
      if (/^gs:/.test(csvLine)) {
        const [gsPath, ...tags] = csvLine.split(',');
        return {
          id,
          state: null,
          gsPath,
          tags
        };
      }
      return {
        id,
        state: null,
        gsPath: null,
        tags: null
      };
    });

  try {
    for (let csvMapping of csvMappings) {
      if (!(csvMapping && csvMapping.gsPath)) continue;
      const [url] = await bucket.file(csvMapping.gsPath.replace(gsFileNameRegExp, '')).getSignedUrl({
        action: 'read',
        expires: moment().add(1, 'day').valueOf()
      });
      csvMapping.url = url;
    }
  } catch (e) {
    console.log(e);
  }
  return lambdaUtil.apiResponseJson({statusCode: 200, body: {data: csvMappings}});
};

class UpdateImagesCsvMappingRequestQueryStringParameters {
  private _csvMappingId: number | null = null;

  set csvMappingId(value: number | string) {
    this._csvMappingId = typeof value === 'string' ? parseInt(value) : value;
  }

  get csvMappingId(): number | string {
    return this._csvMappingId;
  }
}

class UpdateImagesCsvMappingRequestBody {
  private _tags: Array<string>;
  private _id: number | null = null;

  set id(value: number | string) {
    this._id = typeof value === 'string' ? parseInt(value) : value;
  }

  get id(): number | string {
    return this._id;
  }

  state: mappingState;
  gsPath: string;

  set tags(value: Array<string> | null) {
    this._tags = value || [];
  }

  get tags() {
    return this._tags;
  }
}

export const updateImagesCsvMapping: ApiGatewayHandler = async (event, context) => {
  const {csvMappingId} = plainToClass<UpdateImagesCsvMappingRequestQueryStringParameters, object>(UpdateImagesCsvMappingRequestQueryStringParameters, event.pathParameters, {excludePrefixes: ['_']});
  const {id, state, gsPath, tags} = deserialize(UpdateImagesCsvMappingRequestBody, event.body, {excludePrefixes: ['_']});

  if (csvMappingId !== id || csvMappingId === null) {
    const errors = [{
      type: 'Validation',
      message: 'Invalid Id: The id in the path parameters doesn\'t not match the id on the request body.'
    }];
    return lambdaUtil.apiResponseJson({statusCode: 400, body: {errors}});
  }

  const file = bucket.file(fileName);
  const stream = file.createReadStream();
  const csv = await new Promise<string>((resolve, reject) => {
    let csv = '';
    stream.on('data', (chunk) => {
      csv += chunk.toString() || '';
    });
    stream.on('finish', () => {
      resolve(csv);
    });
    stream.on('error', (err) => {
      reject(err);
    });
  });

  const csvLineNumber = id as number - 1;
  const csvLine = `${state},${gsPath},${tags.join(',')}`;
  const csvLineRegExp = new RegExp(`^.*?${escapeRegExp(gsPath)}.*?$`);

  const csvLines = csv.split(/\r?\n/);
  if (!csvLineRegExp.test(csvLines[csvLineNumber])) {
    const errors = [{
      type: 'Validation',
      message: 'Invalid Id / GS path combo: The id and gsPath did not match the existing record.'
    }];
    return lambdaUtil.apiResponseJson({statusCode: 400, body: {errors}});
  }

  csvLines[csvLineNumber] = csvLine;
  const updatedCsv = csvLines.join('\r\n');

  await new Promise<string>((resolve, reject) => {
    const stream = new Readable();
    stream._read = () => {
    }; // redundant? see update below
    stream.push(updatedCsv);
    stream.push(null);
    stream.pipe(file.createWriteStream())
      .on('error', reject)
      .on('finish', resolve);
  });

  const [url] = await bucket.file(gsPath.replace(gsFileNameRegExp, '')).getSignedUrl({
    action: 'read',
    expires: moment().add(1, 'day').valueOf()
  });
  const csvMapping: CsvMapping = {
    id: id as number | null,
    state,
    gsPath,
    tags,
    url
  };

  return lambdaUtil.apiResponseJson({statusCode: 200, body: {data: csvMapping}});
};
