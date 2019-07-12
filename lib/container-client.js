const Promise = require('the-promise');
const _ = require('the-lodash');
const container = require('@google-cloud/container');

const request = require('request-promise');
const jwt = require('jsonwebtoken');
const base64 = require("base-64");

const BaseClient = require('./base-client');
const KubernetesClient = require('./kubernetes-client');

class ContainerClient extends BaseClient
{
    constructor(logger, parent)
    {
        super(logger, parent);
        this._client =  new container.ClusterManagerClient({
            credentials: this.credentials
        });
    }

    listClusters()
    {
        var params = {
            parent: `projects/${this.projectId}/locations/${this.sourceRegion}`
        }
        this.logger.info("[listClusters] ", params);
        return this._client.listClusters(params);
    }

    createCluster(name, clusterObj)
    {
        if (!clusterObj) {
            clusterObj = {}
        }
        clusterObj.name = name;

        var defaultNodePoolConfig = {
            diskSizeGb: 100,
            diskType: 'pd-standard',
            imageType: 'COS',
            machineType: 'n1-standard-1',
            metadata: {
                'disable-legacy-endpoints': 'true'
            },
            oauthScopes: [
                'https://www.googleapis.com/auth/devstorage.read_only',
                'https://www.googleapis.com/auth/logging.write',
                'https://www.googleapis.com/auth/monitoring',
                'https://www.googleapis.com/auth/servicecontrol',
                'https://www.googleapis.com/auth/service.management.readonly',
                'https://www.googleapis.com/auth/trace.append'
            ],
            serviceAccount: 'default'
        } 

        if (!clusterObj.nodePools) {
            clusterObj.nodePools = [];
        }
        if (clusterObj.nodePools.length == 0) {
            var nodePool = {
                config: _.cloneDeep(defaultNodePoolConfig),
                initialNodeCount: 3,
                name: 'default-pool'
            }
            clusterObj.nodePools.push(nodePool);
        }

        var params = {
            parent: `projects/${this.projectId}/locations/${this.sourceRegion}`,
            cluster: clusterObj
        }
        this.logger.info("[createCluster] ", params);
        return this._client.createCluster(params)
            .then(results => {
                return _.head(results);
            })
    }

    deleteCluster(name)
    {
        var params = {
            name: `projects/${this.projectId}/locations/${this.sourceRegion}/clusters/${name}`
        }
        this.logger.info("[deleteCluster] ", params);
        return this._client.deleteCluster(params)
            .then(results => {
                return _.head(results);
            })
            .catch(reason => {
                if (reason.code == 5) {
                    // this.logger.warn(reason);
                    return null;
                }
                throw reason;
            });
    }

    queryCluster(id)
    {
        var params = {
            name: `projects/${this.projectId}/locations/${this.sourceRegion}/clusters/${id}`
        }
        this.logger.info("[queryCluster] ", params);
        return this._client.getCluster(params)
            .then(results => {
                return _.head(results);
            })
            .catch(reason => {
                if (reason.code == 5) {
                    // this.logger.warn(reason);
                    return null;
                }
                throw reason;
            });
    }

    queryOperation(operationObj)
    {
        var name = `projects/${this.projectId}/locations/${operationObj.zone}/operations/${operationObj.name}`
        var params = {
            name: name
        }
        this.logger.info("[queryOperation] ", params);
        return this._client.getOperation(params)
            .then(results => {
                return _.head(results);
            })
            .catch(reason => {
                // if (reason.code == 5) {
                //     // this.logger.warn(reason);
                //     return null;
                // }
                throw reason;
            });
    }

    waitOperation(operationObj)
    {
        this.logger.info("[waitOperation] %s Status = %s", operationObj.name, operationObj.status);

        if (operationObj.status == 'RUNNING' ||
            operationObj.status == 'PROVISIONING')
        {
            return Promise.timeout(5000)
                .then(() => this.queryOperation(operationObj))
                .then(newOperationObj => this.waitOperation(newOperationObj));
        }
        else
        {
            return Promise.resolve();
        }

    }

    connectToRemoteKubernetes(cluster)
    {
        this.logger.silly('[connectToRemoteKubernetes] Cluster: ', cluster);

        return this._loginToK8s()
            .then(result => {
                this.logger.silly('[connectToRemoteKubernetes] LoginResult: ', result);

                var config = {
                    server: 'https://' + cluster.endpoint,
                    caData: base64.decode(cluster.masterAuth.clusterCaCertificate),
                    token: result.access_token
                }
                return new KubernetesClient(this.logger, config);
            });
    }

    _buildK8sToken()
    {
        const TOKEN_DURATION_IN_SECONDS = 3600;
        var issuedAt = Math.floor(Date.now() / 1000);
        var token = jwt.sign(
            {
                'iss': this.credentials.client_email,
                'sub': this.credentials.client_email,
                'aud': 'https://www.googleapis.com/oauth2/v4/token',
                'scope': 'https://www.googleapis.com/auth/cloud-platform',
                'iat': issuedAt,
                'exp': issuedAt + TOKEN_DURATION_IN_SECONDS,
            },
            this.credentials.private_key,
            {
                algorithm: 'RS256',
                header: {
                'kid': this.credentials.private_key_id,
                'typ': 'JWT',
                'alg': 'RS256',
                },
            }
        );
        return token;
    }

    _loginToK8s()
    {
        var token = this._buildK8sToken();

        const options = {
            url: 'https://www.googleapis.com/oauth2/v4/token',
            method: 'POST',
            form: {
              'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
              'assertion': token
            },
            json: true
        };
        this.logger.silly('[_loginToK8s] request: ', options);
        return request(options)
            .then(result => {
                this.logger.silly('[_loginToK8s] result: ', result);
                return result;
            })
    }

}

module.exports = ContainerClient;
