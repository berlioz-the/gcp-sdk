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
        // return k8s.HorizontalPodAutoscaler.queryAll('gprod');
        // return k8s.HorizontalPodAutoscaler.create('gprod', 
        //      {
        //     "metadata": {
        //         "name": "gprod-addr-main-web",
        //         "labels": {
        //             "name": "gprod-addr-main-web",
        //             "berlioz_managed": "true",
        //             "cluster": "addr",
        //             "sector": "main",
        //             "service": "web",
        //             "deployment": "gprod"
        //         }
        //     },
        //     "spec": {
        //         minReplicas: 1,
        //         maxReplicas: 10,
        //         "metrics": [
        //             {
        //                 "type": "Resource",
        //                 "resource": {
        //                     "name": "cpu",
        //                     "targetAverageUtilization": 33
        //                 }
        //             }
        //         ],
        //         "scaleTargetRef": {
        //             "kind": "Deployment",
        //             "name": "gprod-addr-main-web"
        //         }
        //     }
        // });
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
