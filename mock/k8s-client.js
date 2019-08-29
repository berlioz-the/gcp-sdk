var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var _ = require('the-lodash');
var credentials = require('./credentials.json');
var GcpSdkClient = require("../index");
var client = new GcpSdkClient(logger, 'us-west1-c', credentials);

function connectToK8s(name)
{
    return Promise.resolve(client.Container.queryCluster(name))
        .then(clusterObj => {
            if (!clusterObj) {
                throw new Error("CLUSTER NOT FOUND");
            }
            logger.info("CLUSTER: ", clusterObj);
            return client.Container.connectToRemoteKubernetes(clusterObj);
        })
}

function createCluster(name)
{
    return Promise.resolve(client.Container.createCluster(name))
        .then(operationObj => {
            logger.info('****** CLUSTER CREATE RESULT:', operationObj);
            // return client.Container.waitOperation(operationObj);
            return client.Container.queryCluster(name)
        })
        .then(clusterObj => {
            logger.info('********** NEW CLUSTER:', clusterObj);
        })
}

// return client.Container.queryCluster('gprod-uswest1c')
return connectToK8s('gprod-uswest1c')
// return createCluster('gprod-uswest1c')
    .then(k8s => {
        // logger.info('**********MY CLUSTER:', k8s);
        return k8s.Namespace.queryAll()
    //     return Promise.resolve()
    //         .then(() => applyClusterAdminBinding(k8s))
    //         .then(() => applyBerliozControllerRole(k8s))
    })
    .then(result => {
        logger.info('RESULT: ', result);
    })
    .catch(reason => {
        logger.error("**********************************")
        logger.error(reason.code);
        logger.error(reason.error);
        logger.error(_.keys(reason));
        logger.error(reason);
        logger.error("**********************************")
        if (reason.errors) {
            logger.error(reason.errors.errors)
        }
    })
