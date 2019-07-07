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

function applyClusterAdminBinding(k8s)
{
    var body = {
        metadata: {
            name: 'berlioz:robot-cluster-admin-binding'
        },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'ClusterRole',
          name: 'cluster-admin',
        },
        subjects: [{
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'User',
            name: 'berlioz-robot@berlioz-demo-fire.iam.gserviceaccount.com'
        }]
    };
    return k8s.ClusterRoleBinding.create(null, body)
        .then(result => {
            logger.info("CREATED: ", result);
        });
}

function applyBerliozControllerRole(k8s)
{
    var body = {
        metadata: {
            name: 'berlioz:berlioz:main-ctlr'
        },
        rules: [
            {
                apiGroups: [""],
                resources: ["nodes"],
                verbs: ["get", "list", "watch"]
            },
            {
                apiGroups: [""],
                resources: ["pods"],
                verbs: ["get", "list", "watch"]
            },
            {
                apiGroups: ["berlioz.cloud"],
                resources: ["services"],
                verbs: ["get", "list", "watch"]
            }
        ]
    };
    return k8s.ClusterRole.create(null, body)
        .then(result => {
            logger.info("CREATED: ", result);
        });
}


// return client.Container.queryCluster('test-uswest1c')
return connectToK8s('gprod-uswest1c')
// return createCluster('nother-zibil')
    .then(k8s => {
        // return k8s.Namespace.delete(null, "zzz")
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
