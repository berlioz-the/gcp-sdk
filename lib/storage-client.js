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
        this.logger.info("Creating Bucket %s...", name, metadata);
        return this._client.createBucket(name, metadata)
            .then(result => {
                var storage = result[0].metadata;
                this.logger.info("Bucket %s is created. ", name, storage);
                return storage;
            })
    }

    deleteBucket(name)
    {
        this.logger.info("Deleting Bucket %s...", name);
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

    uploadLocalFile(bucketName, remotePath, localFilePath, options)
    {
        if (options) {
            options = _.clone(options);
        } else {
            options = {};
        }
        options.destination = remotePath;
        this.logger.info("Uploading to Bucket %s :: %s... ", bucketName, remotePath, options);
        var bucket = this._client.bucket(bucketName);
        return bucket.upload(localFilePath, options)
            .then(result => {
                var fileInfo = result[1]
                this.logger.info("Uploading of %s completed.", fileInfo.id);
                return fileInfo;
            });
    }

    fileExists(bucketName, remotePath)
    {
        this.logger.info("Checking File exists Bucket %s :: %s... ", bucketName, remotePath);
        var bucket = this._client.bucket(bucketName);
        var file = bucket.file(remotePath);
        return file.exists()
            .then(result => {
                var exists = result[0]
                return exists;
            });
    }

    getBucketPolicy(name)
    {
        var bucket = this._client.bucket(name);
        return this._getPolicy(bucket);
    }

    setBucketPolicy(name, bindings)
    {
        var bucket = this._client.bucket(name);
        return this._setPolicy(bucket, bindings);
    }

    copyFile(srcBucketName, srcPath, destBucketName, destPath)
    {
        this.logger.info("Copying %s :: %s to %s :: %s... ", srcBucketName, srcPath, destBucketName, destPath);
        var srcBucket = this._client.bucket(srcBucketName);
        var srcFile = srcBucket.file(srcPath);

        var destBucket = this._client.bucket(destBucketName);
        var destFile = destBucket.file(destPath);
        
        return srcFile.copy(destFile)
            .then(result => {
                return result;
            });
    }

    copyDirectory(srcBucketName, srcDir, destBucketName, destDir)
    {
        this.logger.info("Copying %s :: %s to %s :: %s... ", srcBucketName, srcDir, destBucketName, destDir);
        var srcBucket = this._client.bucket(srcBucketName);
        var destBucket = this._client.bucket(destBucketName);
        return srcBucket.getFiles({
                prefix: srcDir
            })
            .then(result =>  {
                var srcFiles = result[0];
                // for(var x of srcFiles) {
                //     for(var y of src)
                //     this.logger.info('[copyDirectory] %s...', x[0].name);
                // }
                return Promise.serial(srcFiles, srcFile => {
                    var destFilePath = destDir + '/' + _.last(srcFile.name.split('/'))
                    var destFile = destBucket.file(destFilePath)
                    this.logger.info('[copyDirectory] copying %s to %s ...', srcFile.name, destFile.name);
                    return srcFile.copy(destFile);
                })
            })
            .then(() => { return null;})
    }
}

module.exports = StorageClient;
