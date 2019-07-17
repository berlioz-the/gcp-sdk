var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var Promise = require('the-promise');
// var credentials = require('./credentials.json');
var credentials = require('./johnbalvin-credentials.json');

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

function waitOperation(name)
{
    return client.ServiceUsage.isOperationCompleted(name) 
        .then(isFinished => {
            console.log(`>>>>> ${name} IS FINISHED = ${isFinished}`);
            if (!isFinished) {
                return Promise.timeout(100)
                    .then(() => waitOperation(name));
            }
        })
}


// return client.ServiceUsage.queryAll()
// return client.CloudResourceManager.queryProject()
return client.ServiceUsage.query('cloudresourcemanager.googleapis.com')
// return client.ServiceUsage.enable('zync.googleapis.com')
// return client.ServiceUsage.enable('cloudresourcemanager.googleapis.com')
// return client.ServiceUsage.disable('container.googleapis.com')
// return client.ServiceUsage.disable('containerregistry.googleapis.com')
// return client.ServiceUsage.disable('cloudresourcemanager.googleapis.com')
// return client.ServiceUsage.enable('cloudresourcemanager.googleapis.com')
.then(result => {
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
    console.log(result);
    // return waitOperation(result.name);
})

// return client.ServiceUsage.getOperation('operations/acf.5c816650-ca81-4a32-a2a2-a90dfb46172e')


// .then(() => client.CloudResourceManager.queryProject())
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
