const path = require('path');
const {StandaloneLocalDevServer} = require('@kalarrs/serverless-local-dev-server/src/StandaloneLocalDevServer');

const serverlesslocalServer = new StandaloneLocalDevServer({
  projectPath: path.join(__dirname, '../'),
  configOverride: {
    plugins: []
  }
});
serverlesslocalServer.start();
