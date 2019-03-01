const Promise = require('the-promise');
const _ = require('the-lodash');

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

    get region() {
        return this._parent.region;
    }

    get logger() {
        return this._logger;
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
}

module.exports = BaseClient;