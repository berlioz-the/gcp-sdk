const Promise = require('the-promise');
const _ = require('the-lodash');
const ndjson = require('ndjson')

class ResourceAccessor
{
    constructor(parent, apiName, apiVersion, pluralName, kindName)
    {
        this._parent = parent;
        this._logger = parent._logger;
        this._apiName = apiName;
        this._apiVersion = apiVersion;
        this._kindName = kindName;
        this._pluralName = pluralName;
    }

    get logger() {
        return this._logger;
    }

    queryAll(namespace)
    {
        var uriParts = this._makeUriParts(namespace);
        return this._getRequest(uriParts)
            .then(result => {
                return result.items;
            });
    }
    
    watchAll(namespace, cb)
    {
        var uriParts = this._makeUriParts(namespace);
        var stream = this._streamRequest(uriParts, {watch: true})
        stream
            .pipe(ndjson.parse())
            .on('data', (data) => {
                cb(data.type, data.object);
            })
            ;
        return stream;
    }

    query(namespace, name)
    {
        var uriParts = this._makeUriParts(namespace);
        uriParts.push(name)
        return this._getRequest(uriParts)
    }

    create(namespace, body)
    {
        var uriParts = this._makeUriParts(namespace);
        
        var body = this._setupBody(body);
        return this._postRequest(uriParts, {}, body)
    }

    delete(namespace, name)
    {
        var uriParts = this._makeUriParts(namespace);
        uriParts.push(name)
        return this._deleteRequest(uriParts, {})
    }

    update(namespace, name, body)
    {
        var uriParts = this._makeUriParts(namespace);
        uriParts.push(name)
        
        var body = this._setupBody(body);
        return this._putRequest(uriParts, params, body)
    }

    _streamRequest(uriParts, params)
    {
        var url = this._joinUrls(uriParts);
        this.logger.info('[_streamRequest] %s', url);
        return this._parent.request('GET', url, params, null, true);
    }

    _getRequest(uriParts, params)
    {
        var url = this._joinUrls(uriParts);
        this.logger.info('[_getRequest] %s', url);
        return this._parent.request('GET', url, params);
    }

    _postRequest(uriParts, params, body)
    {
        var url = this._joinUrls(uriParts);
        this.logger.info('[_postRequest] %s', url);
        return this._parent.request('POST', url, params, body);
    }

    _deleteRequest(uriParts, params)
    {
        var url = this._joinUrls(uriParts);
        this.logger.info('[_deleteRequest] %s', url);
        return this._parent.request('DELETE', url, params);
    }

    _putRequest(uriParts, params, body)
    {
        var url = this._joinUrls(uriParts);
        this.logger.info('[_putRequest] %s', url);
        return this._parent.request('PUT', url, params, body);
    }

    _setupBody(body)
    {
        var body = _.clone(body);
        body.kind = this._kindName;
        if (this._apiName) {
            body.apiVersion = this._apiName + '/' + this._apiVersion;
        } else {
            body.apiVersion = this._apiVersion;
        }
        return body;
    }

    _joinUrls(uriParts)
    {
        var prefixParts;
        if (_.isNullOrUndefined(this._apiName)) {
            prefixParts = ['', 'api', this._apiVersion];
        } else {
            prefixParts = ['', 'apis', this._apiName, this._apiVersion];
        }
        uriParts = _.concat(prefixParts, uriParts);
        var url = uriParts.join('/');
        return url;
    }

    _makeUriParts(namespace, watch)
    {
        var uriParts = [];
        if (watch) {
            uriParts.push('watch')
        }
        if (namespace) {
            uriParts.push('namespaces')
            uriParts.push(namespace)
        }
        uriParts.push(this._pluralName)
        return uriParts;
    }

}

module.exports = ResourceAccessor;