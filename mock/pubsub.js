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


return client.PubSub.queryAllSubscriptions('projects/sample-proj-2-230121/subscriptions/gprod_img_us-')//'gprod_hello_us-central1_main_jobs')
// return client.PubSub.querySubscription('zzgprod_img_us-central1_main_jobs_hello_main_web')
// return client.PubSub.createSubscription('lalala2', 'projects/sample-proj-2-230121/topics/gprod_img_us-central1_main_jobs')
// return client.PubSub.deleteSubscription('lalala')

// return client.PubSub.getTopicPolicy('gprod_hello_us-central1_main_jobs')
// return client.PubSub.setTopicPolicy('gprod_hello_us-central1_main_jobs',  [
//     {
//       "members": [
//         "serviceAccount:gprod-gprod-hello-main-web-4@sample-proj-2-230121.iam.gserviceaccount.com"
//       ],
//       "role": "roles/pubsub.publisher"
//     },
//     {
//         "members": [
//           "serviceAccount:gprod-gprod-hello-main-web-4@sample-proj-2-230121.iam.gserviceaccount.com"
//         ],
//         "role": "roles/pubsub.subscriber"
//     }
//   ]
// )

// const PubSub = require('@google-cloud/pubsub');
// var publisherClient = new PubSub.v1.PublisherClient({credentials: credentials});
// logger.info('REQUEST: ', requestMsg);
// return publisherClient.publish(requestMsg)
// return client.PubSub.queryAllTopics('projects/sample-proj-2-230121/topics/prod-')
// return client.PubSub.queryTopic('gprod_hello_us-central1_main_jobs')
// return client.PubSub.createTopic('prod-jobs')
// return client.PubSub.deleteTopic('jobs')
    .then(result => {
        logger.info('RESULT: ', result);
    })
    .catch(reason => {
        logger.error(reason);
    })
