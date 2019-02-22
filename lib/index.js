const Promise = require('the-promise');
const _ = require('the-lodash');

class GcpSdkClient
{
    constructor(logger, region, credentials)
    {
        this._logger = logger;
        this._region = region;
        this._credentials = credentials;
        this._projectId = this._credentials['project_id'];

        this.logger.info("[constructor] credentials: ", this._credentials);
        this.logger.info("[constructor] projectID: %s", this.projectId);

        this._clients = {};
    }

    get logger() {
        return this._logger;
    }

    get credentials() {
        return this._credentials;
    }

    get projectId() {
        return this._projectId;
    }

    get region() {
        return this._region;
    }

    get Storage() {
        return this._getClient('storage');
    }
    
    get PubSub() {
        return this._getClient('pubsub');
    }

    get Container() {
        return this._getClient('container');
    }

    _getClient(name)
    {
        if (name in this._clients) {
            return this._clients[name];
        }

        const Client = require('./' + name + '-client');
        var client = new Client(this.logger.sublogger(name), this);
        this._clients[name] = client;
        return client;
    }

}

module.exports = GcpSdkClient;