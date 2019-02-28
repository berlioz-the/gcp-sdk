var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

//return client.Iam.queryAllServiceAccounts()
// return client.Iam.createServiceAccount('another-service-acc')
// return client.Iam.deleteServiceAccount('projects/sample-proj-2-230121/serviceAccounts/another-service-acc@sample-proj-2-230121.iam.gserviceaccount.com')
return client.Iam.queryAllServiceAccountKeys('projects/sample-proj-2-230121/serviceAccounts/another-service-acc@sample-proj-2-230121.iam.gserviceaccount.com')
// return client.Iam.createServiceAccountKey('projects/sample-proj-2-230121/serviceAccounts/another-service-acc@sample-proj-2-230121.iam.gserviceaccount.com')
//return client.Iam.deleteServiceAccountKey('projects/sample-proj-2-230121/serviceAccounts/another-service-acc@sample-proj-2-230121.iam.gserviceaccount.com/keys/4d563e87af99d7c6a839e31d395c49828515c882')
    .then(result => {
        // result = result.map(x => x.name);
        // result = result.map(x => x.metadata);
        logger.info('RESULT: ', result);
    })
    .catch(reason => {
        logger.error(reason);
    })