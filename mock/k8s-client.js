var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');
var GcpSdkClient = require("../index");
var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

function connectToK8s()
{
    return Promise.resolve(client.Container.queryCluster('gprod-uscentral1a'))
        .then(clusterObj => {
            if (!clusterObj) {
                throw new Error("CLUSTER NOT FOUND");
            }
            return client.Container.connectToRemoteKubernetes(clusterObj);
        })
}

return connectToK8s() 
    .then(k8s => {
        return k8s.PodAutoscaler.queryAll('gprod');
    })
    .then(result => {
        logger.info('RESULT: ', result);
    })
    .catch(reason => {
        logger.error(reason.code);
        logger.error(reason);
        logger.error("**********************************")
        logger.error(reason.errors.errors)
    })
