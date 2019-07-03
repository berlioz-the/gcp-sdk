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
}

module.exports = BaseClient;