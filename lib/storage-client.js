const Promise = require('the-promise');
const _ = require('the-lodash');
const BaseClient = require('./base-client');
const {Storage} = require('@google-cloud/storage');

class StorageClient extends BaseClient
{
    constructor(logger, parent)
    {
        super(logger, parent);
        this._client = new Storage({
            credentials: this.credentials,
            projectId: this.projectId
        });
    }

    queryAllBuckets(prefix)
    {
        var query = {
            autoPaginate: true
        }
        return this._client.getBuckets()
            .then(result => {
                var items = result[0].map(x => x.metadata);
                if (prefix) {
                    items = items.filter(x => x.name.startsWith(prefix));
                }
                return items;
            })
    }

    queryBucket(name)
    {
        var bucket = this._client.bucket(name);
        return bucket.get()
            .then(result => {
                return result[0].metadata;
            })
            .catch(reason => {
                if (reason.code == 404 || reason.code == 400) {
                    return;
                }
                throw reason;
            })
    }

    createBucket(name, metadata)
    {
        return this._client.createBucket(name, metadata)
            .then(result => {
                this.logger.info("Bucket %s is created. ", name, result);
                return result[0].metadata;
            })
    }

    deleteBucket(name)
    {
        var bucket = this._client.bucket(name);
        return bucket.delete()
            .then(result => {
                this.logger.info("Bucket %s is deleted. ", name);
            })
            .catch(reason => {
                if (reason.code == 404) {
                    return;
                }
                throw reason;
            })
    }
}

module.exports = StorageClient;
