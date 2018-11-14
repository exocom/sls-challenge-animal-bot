const {Invoke} = require('@kalarrs/serverless-local-dev-server/src/Invoke');
const invoke = new Invoke();

invoke({
  function: 'handler',
  event: require('./event')
});
