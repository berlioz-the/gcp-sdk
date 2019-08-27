const Promise = require('the-promise');
const _ = require('the-lodash');
const BaseClient = require('./base-client');
const {google} = require('googleapis');

class ComputeClient extends BaseClient
{
    constructor(logger, parent)
    {
        super(logger, parent);
        this._authClient = google.auth.fromJSON(this.credentials);
        this._authClient.scopes = ['https://www.googleapis.com/auth/cloud-platform'];
    }

    queryAll()
    {
        return this._performList(google.compute("v1").globalAddresses.list, {
            });
    }

    query(name)
    {
        return this._performGet(google.compute("v1").globalAddresses.get, {
            address: name
            })
    }

    create(name, requestBody)
    {
        var params = {
        }
        if (requestBody) {
            params.requestBody = _.clone(requestBody);
        } else {
            params.requestBody = {};
        }
        params.requestBody.name = name;

        this.logger.info("Creating GlobalAddress %s...", name, params);
        google.compute("v1").addresses.insert
        return this._performUpdate(google.compute("v1").globalAddresses.insert, params)
            .then(result => {
                this.logger.info("GlobalAddress %s is created. ", name, result);
                return result;
            })
    }

    delete(name)
    {
        return this._performUpdate(google.compute("v1").globalAddresses.delete, {
            address: name
            })
    }

    queryOperation(operationObj)
    {
        return this._performGet(google.compute("v1").globalOperations.get, {
            operation: operationObj.id
        })
    }

    waitOperation(operationObj)
    {
        this.logger.info("[waitOperation] %s Status = %s", operationObj.name, operationObj.status);

        if (operationObj.status == 'RUNNING' ||
            operationObj.status == 'PENDING')
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

    // ****

    _performUpdate(action, params)
    {
        return this._performGoogle(action, params)
            .then(result => {
                return result.data;
            })
    }

    _performList(action, dataName, params, results)
    {
        if (!results) {
            results = [];
        }

        return this._performGoogle(action, params)
            .then(result => {
                if (result.data[dataName]) {
                    results = _.concat(results, result.data[dataName]);
                }

                if (result.data.nextPageToken) {
                    params = _.clone(params);
                    params.pageToken = result.data.nextPageToken;
                    return this._performList(action, dataName, params, results);
                }

                return results;
            })
            .catch(reason => {
                this.logger.verbose("[_performList] ", reason);
                if (reason.code == 404) {
                    return null;
                }
                throw reason;
            });
    }

    _performGet(action, params)
    {
        return this._performGoogle(action, params)
            .then(result => {
                if (result.data) {
                    return result.data;
                }
                return null;
            })
            .catch(reason => {
                this.logger.verbose("[_performGet] ", reason);
                if (reason.code == 404) {
                    return null;
                }
                throw reason;
            });
    }

    _performGoogle(action, params)
    {
        params = params || {};
        params = _.clone(params);
        params.project = this.projectId;
        params.auth = this._authClient;
        this.logger.info("[_performGoogle] ...", params);
        return action(params)
            .then(result => {
                this.logger.silly("[_performGoogle] Result:", result);
                return result;
            });
    }
}

module.exports = ComputeClient;
