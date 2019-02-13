var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);


var sampleLogger = logger.sublogger("Sample");

return client.queryCluster('gg')
    .then(cluster => {
        return client.connectToRemoteKubernetes(cluster);
    })
    .then(k8sClient => {
        return k8sClient.Pod.watchAll(null, (action, obj) => {
            sampleLogger.info("%s :: %s => ", action, obj.metadata.name)
            // sampleLogger.info("%s :: %s => ", action, obj.metadata.name, obj)
        });
    })
    // .then(result => {
    //     var names = result.map(x => x.metadata.name);
    //     logger.info('POD NAMES: ', names);
    // })
    .then(result => {
        sampleLogger.info('END RESULT: ', result);
    })
    .catch(reason => {
        sampleLogger.error(reason);
    })