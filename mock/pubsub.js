var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');

var GcpSdkClient = require("../index");

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

var requestMsg = {
    "topic": "projects/rubentest/topics/localHomePC_hello_us-central1_main_jobs",
    "messages": [
        {
            "data": Buffer.from("world")
        }
    ]
};

const PubSub = require('@google-cloud/pubsub');
var publisherClient = new PubSub.v1.PublisherClient({credentials: credentials});
logger.info('REQUEST: ', requestMsg);

return publisherClient.publish(requestMsg)
// return client.PubSub.queryAllTopics('projects/sample-proj-2-230121/topics/prod-')
// return client.PubSub.queryTopic('prod-jobszzz')
// return client.PubSub.createTopic('prod-jobs')
// return client.PubSub.deleteTopic('jobs')
    .then(result => {
        logger.info('RESULT: ', result);
    })
    .catch(reason => {
        logger.error(reason);
    })
