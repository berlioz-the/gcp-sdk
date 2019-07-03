const Promise = require('the-promise');
const _ = require('the-lodash');
const BaseClient = require('./base-client');
const {google} = require('googleapis');

class ServiceUsageClient extends BaseClient
{
    constructor(logger, parent)
    {
        super(logger, parent);
        this._authClient = google.auth.fromJSON(this.credentials);
        this._authClient.scopes = ['https://www.googleapis.com/auth/cloud-platform'];
    }

    queryAll()
    {
        var parent = `projects/${this.projectId}`;
        return this._performList(
            google.serviceusage("v1beta1").services.list, 
            'services', 
            { parent: parent })
            .then(results => {
                return results;
            });
    }
    
    query(name)
    {
        var fullName = `projects/${this.projectId}/services/${name}`;
        return this._performGet(google.serviceusage("v1").services.get, {
            name: fullName
        });
    }

    enable(name)
    {
        var fullName = `projects/${this.projectId}/services/${name}`;
        return this._performGet(google.serviceusage("v1").services.enable, {
            name: fullName
        });
    }

    disable(name)
    {
        var fullName = `projects/${this.projectId}/services/${name}`;
        return this._performGet(google.serviceusage("v1").services.disable, {
            name: fullName
        });
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
                this.logger.warn("[_performList] ", reason);
                if (reason.code == 404) {
                    return null;
                }
                throw reason;
            });
    }

    _performDelete(action, params)
    {
        return this._performGoogle(action, params)
            .then(result => {
                return result.data;
            })
            .catch(reason => {
                this.logger.warn("[_performDelete] ", reason);
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
        params = _.clone(params);
        // if (!params.name) {
        //     params.name = 'projects/' + this.projectId;
        // }
        params.auth = this._authClient;
        this.logger.verbose("[_performGoogle] ...", params);
        return action(params)
            .then(result => {
                this.logger.verbose("[_performGoogle] Result:", result);
                return result;
            });
    }
}

module.exports = ServiceUsageClient;
