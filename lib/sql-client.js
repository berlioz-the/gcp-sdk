const Promise = require('the-promise');
const _ = require('the-lodash');
const BaseClient = require('./base-client');
const {google} = require('googleapis');
// const {GoogleAuth} = require('google-auth-library');

// https://cloud.google.com/sql/docs/mysql/admin-api/v1beta4/instances
class SQLClient extends BaseClient
{
    constructor(logger, parent)
    {
        super(logger, parent);
        this._authClient = google.auth.fromJSON(this.credentials);
        this._authClient.scopes = ['https://www.googleapis.com/auth/cloud-platform'];
    }

    queryAllInstances(prefix)
    {
        return this._performList(
            google.sqladmin("v1beta4").instances.list,
            'items')
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

    queryInstance(name)
    {
        return this._performGet(
            google.sqladmin("v1beta4").instances.get, {
                instance: name
            });
    }

    createInstance(name, config)
    {
        if (!config) {
            config = {};
        } else {
            config = _.clone(config);
        }
        config.name = name;

        this.logger.info("Creating SQL Instance %s...", name, config);
        return this._performUpdate(google.sqladmin("v1beta4").instances.insert, {
                resource: config
            })
            .then(result => {
                this.logger.info("SQL Instance %s is created. ", name, result);
                return this.queryInstance(result.targetId);
            })
    }

    deleteInstance(name)
    {
        this.logger.info("Deleting SQL Instance %s...", name);
        return this._performDelete(google.sqladmin("v1beta4").instances.delete, {
                instance: name
            })
            .then(result => {
                this.logger.info("SQL Instance %s is deleted. ", name);
                return result;
            });
    }

    updateInstance(name, config)
    {
        this.logger.info("Updating SQL Instance %s...", name, config);
        return this._performUpdate(google.sqladmin("v1beta4").instances.update, {
                instance: name,
                resource: config
            })
            .then(result => {
                this.logger.info("SQL Instance %s is updated. ", name);
                return result;
            });
    }

    queryInstanceOperations(name)
    {
        return this._performList(
            google.sqladmin("v1beta4").operations.list,
            'items', {
                instance: name
            })
            .then(results => {
                return results;
            });
    }

    queryRunningInstanceOperations(name)
    {
        return this.queryInstanceOperations(name)
            .then(results => {
                return results.filter(x => x.status == 'RUNNING');
            });
    }

    importSql(name, database, url)
    {
        this.logger.info("Importing %s to %s. ", url, name);

        return this._performUpdate(google.sqladmin("v1beta4").instances.import, {
            instance: name,
            resource: {
                importContext: {
                    kind: 'sql#importContext',
                    fileType: 'sql',
                    database: database,
                    uri: url
                }
            }
        })
        .then(result => {
            this.logger.info("SQL %s import is completed. Result:", name, result);
            return result;
        })
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
        if (!params) {
            params = {}
        } else {
            params = _.clone(params);
        }
        params.project = this.projectId;
        params.auth = this._authClient;
        this.logger.info("[_performGoogle] ...", params);
        return action(params)
            .then(result => {
                this.logger.info("[_performGoogle] Result:", result);
                return result;
            });
    }
}

module.exports = SQLClient;
