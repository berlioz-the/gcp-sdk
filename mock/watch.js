var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

return client.queryCluster('standard-cluster-1')
    .then(cluster => {
        return client.connectToRemoteKubernetes(cluster);
    })
    .then(k8sClient => {
        return k8sClient.Pod.watchAll('default', (action, pod) => {
            logger.info("%s :: %s => %s", action, pod.metadata.name, pod.status.phase)
        });
    })
    // .then(result => {
    //     var names = result.map(x => x.metadata.name);
    //     logger.info('POD NAMES: ', names);
    // })
    .then(result => {
        logger.info('END RESULT: ', result);
    })
    .catch(reason => {
        logger.error(reason);
    })