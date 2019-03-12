var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

// return client.Function.queryAllFunctions('sample-proj-2-230121', 'us-central1', 'projects/sample-proj-2-230121/locations/us-central1/functions/hello-')
return client.Function.queryFunction('projects/sample-proj-2-230121/locations/us-central1/functions/hello-world')
// return client.Function.deleteFunction('projects/sample-proj-2-230121/locations/us-central1/functions/function-hello')
// return client.Function.createFunction('sample-proj-2-230121', 'us-central1', 'hello-world', {
//     "httpsTrigger": {
//       "url": "https://us-central1-sample-proj-2-230121.cloudfunctions.net/hello-world"
//     },
//     "status": "ACTIVE",
//     "entryPoint": "handler",
//     "timeout": "60s",
//     "availableMemoryMb": 256,
//     // "serviceAccountEmail": "sample-proj-2-230121@appspot.gserviceaccount.com",
//     "versionId": "1",
//     "labels": {
//         'berlioz-cluster': 'hello'
//     },
//     "sourceArchiveUrl": "gs://sample-proj-2-230121-imagestore-func/func/lambda-func-main-hello/sha256:c432de6022e725e767e6ac80263d79f0f428df23a62afa100162081e4b0df8f8",
//     "runtime": "nodejs6"
// })
// return client.Function.updateFunction('projects/sample-proj-2-230121/locations/us-central1/functions/hello-world', {
//     "httpsTrigger": {
//       "url": "https://us-central1-sample-proj-2-230121.cloudfunctions.net/hello-world"
//     },
//     "status": "ACTIVE",
//     "entryPoint": "handler",
//     "timeout": "60s",
//     "availableMemoryMb": 512,
//     // "serviceAccountEmail": "sample-proj-2-230121@appspot.gserviceaccount.com",
//     "versionId": "1",
//     "labels": {
//         'berlioz-cluster': 'hello'
//     },
//     "sourceArchiveUrl": "gs://sample-proj-2-230121-imagestore-func/func/lambda-func-main-hello/sha256:c432de6022e725e767e6ac80263d79f0f428df23a62afa100162081e4b0df8f8",
//     "runtime": "nodejs6"
// })
    .then(result => {
        // result = result.map(x => x.name);
        // result = result.map(x => x.metadata);
        logger.info('RESULT: ', result);
    })
    .catch(reason => {
        logger.error(reason.code);
        logger.error(reason);
        logger.error("**********************************")
        logger.error(reason.errors.errors)
    })
