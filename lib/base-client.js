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

}

module.exports = BaseClient;