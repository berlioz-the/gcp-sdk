var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

var newBucketMeta = {
    location: 'us-central1',
    regional: true
}

return client.Storage.queryAllBuckets('dsample-proj-2-230121-gprod-')
// return client.Storage.queryBucket('dsample-proj-2-230121-gprod-aaa-bbb-ccc-ddd-eee-11')
// return client.Storage.createBucket('dsample-proj-2-230121-gprod-aaa-bbb-ccc-ddd-eee-11', newBucketMeta)
// return client.Storage.deleteBucket('dsample-proj-2-230121-gprod-aaa-bbb-ccc-ddd-eee-11')
    .then(result => {
        // result = result.map(x => x.name);
        // result = result.map(x => x.metadata);
        logger.info('RESULT: ', result);
    })
    .catch(reason => {
        logger.error(reason);
    })