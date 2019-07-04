const Promise = require('the-promise');
const _ = require('the-lodash');
const request = require('request-promise');

class BaseClient
{
    constructor(logger, parent)
    {
        this._logger = logger;
        this._parent = parent;
    }

    get credentials() {
        return this._parent.credentials;
    }

    get projectId() {
        return this._parent.projectId;
    }

    get sourceRegion() {
        return this._parent.sourceRegion;
    }

    get region() {
        return this._parent.region;
    }

    get zone() {
        return this._parent.zone;
    }

    get logger() {
        return this._logger;
    }

    getProjectNumber() {
        return this._parent.getProjectNumber();
    }

    _massagePolicy(result)
    {
        return result[0].bindings;
    }

    _getPolicy(target)
    {
        return target.iam.getPolicy()
            .then(result => this._massagePolicy(result))
            .catch(reason => {
                if (reason.code == 5) {
                    return null;
                }
                throw reason;
            })
    }

    _setPolicy(target, bindings)
    {
        var policy = {
            bindings: bindings
        }
        return target.iam.setPolicy(policy)
            .then(result => this._massagePolicy(result))
    }

    _fetchCredentials()
    {
        return this._authClient.authorize();
    }

    _makeRequest(options)
    {
        var options = _.clone(options);
        options.json = true;
        return Promise.resolve(this._fetchCredentials())
            .then(cred => {
                options.headers = {
                    'Authorization': `${cred.token_type} ${cred.access_token}`
                }
                return request(options);
            });
    }

    _checkReason(reason)
    {
        if (reason.code == 7) {
            if(reason.details.indexOf('API has not been used') > -1) {
                throw new APINotEnabledError(reason.details);
            }
        }
        if (reason.code == 403) {
            if (reason.errors)
            {
                var error = _.head(reason.errors);
                if (error) {
                    var msg = error.message;
                    if (msg) {
                        if(msg.indexOf('API has not been used') > -1) {
                            throw new APINotEnabledError(msg);
                        }
                    }
                }
            }
        }
        throw reason;
    }
}

class APINotEnabledError extends Error
{
    constructor (message)
    {
        super()
        Error.captureStackTrace( this, this.constructor )
        this.name = 'APINotEnabledError'
        this.message = message
        this.isApiNotEnabled = true;
    }
}

module.exports = BaseClient;
