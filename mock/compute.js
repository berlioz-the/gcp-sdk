var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

var name = "address-test-2";
return client.ComputeGlobalAddress.delete(name)

// return client.ComputeGlobalAddress.query("new-sample-ip-address-gprod-addr-web")
// return client.ComputeGlobalAddress.create(name)
//     .then(operation => {
//         logger.info('OPERATION: ', operation);
//         return client.ComputeGlobalAddress.waitOperation(operation);
//     })
//     .then(() => client.ComputeGlobalAddress.query(name))
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
