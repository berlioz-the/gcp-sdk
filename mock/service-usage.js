var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

// return client.ServiceUsage.queryAll()
// return client.CloudResourceManager.queryProject()
// return client.ServiceUsage.query('zync.googleapis.com')
// return client.ServiceUsage.enable('zync.googleapis.com')
// return client.ServiceUsage.disable('zync.googleapis.com')
return client.ServiceUsage.enable('cloudresourcemanager.googleapis.com')
.then(() => client.CloudResourceManager.queryProject())
// return client.ServiceUsage.disable('cloudresourcemanager.googleapis.com')
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
