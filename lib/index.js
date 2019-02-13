const Promise = require('the-promise');
const _ = require('the-lodash');
const request = require('request-promise');
const container = require('@google-cloud/container');
const jwt = require('jsonwebtoken');
const base64 = require("base-64");

const KubernetesClient = require('./kubernetes-client');

class GcpSdkClient
{
    constructor(logger, region, credentials)
    {
        this._logger = logger;
        this._region = region;
        this._credentials = credentials;
        this._projectId = this._credentials['project_id'];

        this._logger.info("[constructor] credentials: ", this._credentials);
        this._logger.info("[constructor] projectID: %s", this._projectId);

        this._clusterManager =  new container.ClusterManagerClient({
            credentials: this._credentials
        });
    }

    get clusterManager() {
        return this._clusterManager;
    }

    listClusters()
    {
        var params = {
            projectId: this._projectId,
            zone: this._region
        }
        this._logger.info("[listClusters] ", params);
        return this.clusterManager.listClusters(params);
    }

    queryCluster(id)
    {
        var params = {
            projectId: this._projectId,
            zone: this._region,
            clusterId: id
        }
        this._logger.info("[queryCluster] ", params);
        return this.clusterManager.getCluster(params)
            .then(results => {
                return _.head(results);
            })
            .catch(reason => {
                if (reason.code == 5) {
                    // this._logger.warn(reason);
                    return null;
                }
                throw reason;
            });
    }

    connectToRemoteKubernetes(cluster)
    {
        this._logger.silly('[connectToRemoteKubernetes] Cluster: ', cluster);

        return this._loginToK8s()
            .then(result => {
                this._logger.silly('[connectToRemoteKubernetes] LoginResult: ', result);

                var config = {
                    server: 'https://' + cluster.endpoint,
                    caData: base64.decode(cluster.masterAuth.clusterCaCertificate),
                    token: result.access_token
                }
                return new KubernetesClient(this._logger, config);
            });
    }

    _buildK8sToken()
    {
        const TOKEN_DURATION_IN_SECONDS = 3600;
        var issuedAt = Math.floor(Date.now() / 1000);
        var token = jwt.sign(
            {
                'iss': this._credentials.client_email,
                'sub': this._credentials.client_email,
                'aud': 'https://www.googleapis.com/oauth2/v4/token',
                'scope': 'https://www.googleapis.com/auth/cloud-platform',
                'iat': issuedAt,
                'exp': issuedAt + TOKEN_DURATION_IN_SECONDS,
            },
            this._credentials.private_key,
            {
                algorithm: 'RS256',
                header: {
                'kid': this._credentials.private_key_id,
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
        this._logger.silly('[_loginToK8s] request: ', options);
        return request(options)
            .then(result => {
                this._logger.silly('[_loginToK8s] result: ', result);
                return result;
            })
    }

}

module.exports = GcpSdkClient;