const Promise = require('the-promise');
const _ = require('the-lodash');
const fs = require('fs');
const request = require('request-promise');
const requestOrig = require('request');

const ResourceAccessor = require('./resource-accessor');

class KuberenetesClient
{
    constructor(logger, config)
    {
        this._logger = logger;
        this._config = config;
        this._resourceClients = {};
        this.setupResourceClient('Deployment', 'apps', 'v1', 'deployments');
        this.setupResourceClient('DaemonSet', 'apps', 'v1', 'daemonsets');
        this.setupResourceClient('CustomResourceDefinition', 'apiextensions.k8s.io', 'v1beta1', 'customresourcedefinitions');
        this.setupResourceClient('PriorityClass', 'scheduling.k8s.io', 'v1beta1', 'priorityclasses');
        this.setupResourceClient('Pod', null, 'v1', 'pods');
        this.setupResourceClient('Node', null, 'v1', 'nodes');

        this.setupResourceClient('BerliozService', 'berlioz.cloud', 'v1', 'services');
    }

    get logger() {
        return this._logger;
    }

    get Deployment() {
        return this.getClient('Deployment');
    }

    get DaemonSet() {
        return this.getClient('DaemonSet');
    }

    get CustomResourceDefinition() {
        return this.getClient('CustomResourceDefinition');
    }

    get PriorityClass() {
        return this.getClient('PriorityClass');
    }

    get Node() {
        return this.getClient('Node');
    }

    get Pod() {
        return this.getClient('Pod');
    }

    get BerliozService() {
        return this.getClient('BerliozService');
    }

    setupResourceClient(kindName, apiName, apiVersion, pluralName)
    {
        this._resourceClients[kindName] = new ResourceAccessor(this, apiName, apiVersion, pluralName, kindName);
    }

    getClient(name)
    {
        if (name in this._resourceClients) {
            return this._resourceClients[name];
        }
        throw new Error('Resource client ' + name + ' not present.');
    }

    request(method, url, params, body, useStream)
    {
        this._logger.info('[request] %s => %s...', method, url);
        var options = {
            method: method,
            uri: this._config.server + url,
            ca: this._config.caData,
            headers: {
                'Authorization': 'Bearer ' + this._config.token
            },
            json: true
        };
        if (params) {
            options.qs = params;
        }
        if (body) {
            options.body = body;
        }
        if (useStream) {
            var result = requestOrig(options);
            return result;
        }

        this._logger.info('[request] Begin', options);
        return request(options)
            .then(result => {
                return result;
            })
            .catch(reason => {
                this._logger.error('[request] Failed: ', options, reason);
                throw reason;
            });
    }

    static connectFromPod(logger)
    {
        var k8sConfig = {
            server: 'https://' + process.env.KUBERNETES_SERVICE_HOST + ':' + process.env.KUBERNETES_SERVICE_PORT_HTTPS,
            token: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8'),
            caData: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt', 'utf8')
        };
        var client = new KubernetesClient(logger, k8sConfig);
        return client;
    }
}

module.exports = KuberenetesClient;