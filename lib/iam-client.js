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

    createServiceAccount(name)
    {
        var params = {
            resource: {
                accountId: name,
                serviceAccount: {
                    displayName: name
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
    
    queryAllServiceAccounts()
    {
        return this._performList(google.iam("v1").projects.serviceAccounts.list, 'accounts', {});
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
