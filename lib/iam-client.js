const Promise = require('the-promise');
const _ = require('the-lodash');
const BaseClient = require('./base-client');
const {google} = require('googleapis');
const {GoogleAuth} = require('google-auth-library');

class IamClient extends BaseClient
{
    constructor(logger, parent)
    {
        super(logger, parent);
        this._authClient = google.auth.fromJSON(this.credentials);
        this._authClient.scopes = ['https://www.googleapis.com/auth/cloud-platform'];
    }

    createServiceAccount(name, displayName)
    {
        if (!displayName) {
            displayName = name;
        }
        var params = {
            resource: {
                accountId: name,
                serviceAccount: {
                    displayName: displayName
                }
            }
        }
        this.logger.info("Creating ServiceAccount %s...", name, params);
        return this._performUpdate(google.iam("v1").projects.serviceAccounts.create, params)
            .then(result => {
                this.logger.info("ServiceAccount %s is created. ", name, result);
                return result;
            })
    }

    deleteServiceAccount(name)
    {
        var params = {
            name: name
        }
        this.logger.info("Deleting ServiceAccount %s...", name, params);
        return this._performUpdate(google.iam("v1").projects.serviceAccounts.delete, params)
            .then(result => {
                this.logger.info("ServiceAccount %s is deleted. ", name, result);
                return result;
            })
    }

    queryAllServiceAccounts(prefix)
    {
        return this._performList(google.iam("v1").projects.serviceAccounts.list, 'accounts', {})
            .then(results => {
                if (prefix) {
                    return results.filter(x => x.email.startsWith(prefix));
                }
                return results;
            });
    }

    queryServiceAccount(name)
    {
        return this._performGet(google.iam("v1").projects.serviceAccounts.get, {
                name: name
            })
    }

    queryLiveServiceAccounts(prefix)
    {
        return this.queryAllServiceAccounts(prefix)
            .then(results => {
                var filtered = [];
                return Promise.serial(results, x => {
                    return this.queryAllServiceAccountKeys(x.name)
                        .then(keys => {
                            if (keys != null) {
                                filtered.push(x);
                            }
                        })
                })
                .then(() => filtered)
            })
    }

    createServiceAccountKey(name)
    {
        var params = {
            name: name,
            privateKeyType: 'TYPE_GOOGLE_CREDENTIALS_FILE'
            // ,
            // keyAlgorithm: 'TYPE_UNSPECIFIED'
        }
        this.logger.info("Creating ServiceAccount Key %s...", name, params);
        return this._performUpdate(google.iam("v1").projects.serviceAccounts.keys.create, params)
            .then(result => {
                this.logger.info("ServiceAccount Key %s is created. ", name, result);
                return result;
            })
    }

    queryAllServiceAccountKeys(saName)
    {
        return this._performList(google.iam("v1").projects.serviceAccounts.keys.list, 'keys', {
            name: saName,
            keyTypes: 'USER_MANAGED'
        });
    }

    deleteServiceAccountKey(name)
    {
        var params = {
            name: name
        }
        this.logger.info("Deleting ServiceAccountKey %s...", name, params);
        return this._performUpdate(google.iam("v1").projects.serviceAccounts.keys.delete, params)
            .then(result => {
                this.logger.info("ServiceAccountKey %s is deleted. ", name, result);
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
                if (!result.data[dataName]) {
                    return results;
                }
                results = _.concat(results, result.data[dataName]);

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
        params = _.clone(params);
        if (!params.name) {
            params.name = 'projects/' + this.projectId;
        }
        params.auth = this._authClient;
        this.logger.silly("[_performGoogle] ...", params);
        return action(params)
            .then(result => {
                this.logger.silly("[_performGoogle] Result:", result);
                return result;
            });
    }
}

module.exports = IamClient;
