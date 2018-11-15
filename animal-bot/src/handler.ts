import {Rekognition} from 'aws-sdk';
import {readFile} from 'fs';
import {promisify} from 'util';
import path = require('path');

const fs = {
  readFile: promisify(readFile)
};
const rekognition = new Rekognition({region: 'us-west-2'});

export const detectRareAlien = async (event, context) => {
  const catBuffer = await fs.readFile(path.join(__dirname, 'cat.jpeg'));

  const params = {
    Image: {
      Bytes: catBuffer, // new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
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

