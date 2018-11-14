const Serverless = require('serverless');

function getProcessedInput(plugin) {
  return {
    commands: [plugin],
    options: {stage: undefined, region: undefined}
  };
}

process.env.SLS_DEBUG = 'true';

const serverless = new Serverless();
serverless.init().then(async () => {
  serverless.processedInput = getProcessedInput('webpack');
  await serverless.run();
  serverless.processedInput = getProcessedInput('local-dev-server');
  await serverless.run();
});
