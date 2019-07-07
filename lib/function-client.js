const Promise = require('the-promise');
const _ = require('the-lodash');
const BaseClient = require('./base-client');
const {google} = require('googleapis');
// const {GoogleAuth} = require('google-auth-library');

const REGION_MAPPING = {
    'us-central1': 'us-central1',
    'us-east1': 'us-east1',
    'us-east4': 'us-east1',
    'us-west1': 'us-central1',
    'us-west2': 'us-central1'
}

class FunctionClient extends BaseClient
{
    constructor(logger, parent)
    {
        super(logger, parent);
        this._authClient = google.auth.fromJSON(this.credentials);
        this._authClient.scopes = ['https://www.googleapis.com/auth/cloud-platform'];
    }

    get location()
    {
        return REGION_MAPPING[this.region];
    }

    queryAllFunctions(prefix)
    {
        var parent = `projects/${this.projectId}/locations/${this.location}`;
        if (prefix) {
            prefix = parent + '/functions/' + prefix;
        }
        return this._performList(
            google.cloudfunctions("v1").projects.locations.functions.list,
            'functions',
            { parent: parent })
            .then(results => {
                if (prefix) {
                    return results.filter(x => x.name.startsWith(prefix));
                }
                return results;
            })
            .catch(reason => {
                return this._checkReason(reason);
            })
            ;
    }

    queryFunction(name)
    {
        return this._performGet(google.cloudfunctions("v1").projects.locations.functions.get, {
                name: name
            });
    }

    createFunction(name, config)
    {
        if (!config) {
            config = {};
        } else {
            config = _.clone(config);
        }
        config.name = `projects/${this.projectId}/locations/${this.location}/functions/${name}`;

        var params = {
            location: `projects/${this.projectId}/locations/${this.location}`,
            requestBody: config
        }

        this.logger.info("Creating CloudFunction %s...", name, config);
        return this._performUpdate(google.cloudfunctions("v1").projects.locations.functions.create, params)
            .then(result => {
                this.logger.info("CloudFunction %s is created. ", name, result);
                return result;
            })
    }

    deleteFunction(name)
    {
        this.logger.info("Deleting Function %s...", name);
        return this._performDelete(google.cloudfunctions("v1").projects.locations.functions.delete, {
                name: name
            })
            .then(result => {
                this.logger.info("Function %s is deleted. ", name);
                return result;
            });
    }

    updateFunction(name, config)
    {
        this.logger.info("Updating Function %s...", name, config);
        return this._performUpdate(google.cloudfunctions("v1").projects.locations.functions.patch, {
                name: name,
                requestBody: config
            })
            .then(result => {
                this.logger.info("Function %s is updated. ", name);
                return result;
            });
    }

    getOperationStatus(name)
    {
        // this.logger.info("Updating Function %s...", name, config);
        return this._performGet(google.cloudfunctions("v1").operations.get, {
                name: name
            });
            // .then(result => {
            //     this.logger.info("Function %s is updated. ", name);
            //     var data = result; //.metadata.request;
            //     return data;
            // });
    }

    waitForOperation(operation)
    {
        this.logger.info("Waiting Function %s... ", operation.metadata.request.name, operation);
        if (operation.done) {
            return operation.response;
        }
        return Promise.timeout(5000)
            .then(() => this.getOperationStatus(operation.name))
            .then(result => this.waitForOperation(result));
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

module.exports = FunctionClient;
