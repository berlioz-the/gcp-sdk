const Promise = require('the-promise');
const _ = require('the-lodash');
const BaseClient = require('./base-client');
const {PubSub} = require('@google-cloud/pubsub');

class PubSubClient extends BaseClient
{
    constructor(logger, parent)
    {
        super(logger, parent);
        this._client = new PubSub({
            credentials: this.credentials,
            projectId: this.projectId
        });
    }

    queryAllTopics(prefix)
    {
        var query = {
            autoPaginate: true
        }
        return this._client.getTopics(query)
            .then(result => {
                var items = result[0].map(x => x.metadata);
                if (prefix) {
                    items = items.filter(x => x.name.startsWith(prefix));
                }
                return items;
            })
    }

    queryTopic(name)
    {
        var topic = this._client.topic(name);
        return topic.get()
            .then(result => {
                return result[0].metadata;
            })
            .catch(reason => {
                if (reason.code == 404 || reason.code == 5) {
                    return;
                }
                throw reason;
            })
    }

    createTopic(name, options)
    {
        return this._client.createTopic(name, options)
            .then(result => {
                this.logger.info("PubSub Topic %s is created. ", name, result);
                return result[0].metadata;
            })
    }

    deleteTopic(name)
    {
        var topic = this._client.topic(name);
        return topic.delete()
            .then(result => {
                this.logger.info("PubSub topic %s is deleted. ", name);
            })
            .catch(reason => {
                if (reason.code == 404 || reason.code == 5) {
                    return;
                }
                throw reason;
            })
    }
}

module.exports = PubSubClient;