var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

var newBucketMeta = {
    "location": "US-CENTRAL1",
    "storageClass": "REGIONAL",
    "labels": {
      "berlioz_cluster": "hello"
    }
  }

//   return client.Storage.copyFile('sample-proj-2-230121-imagestore-func', 'func/database-func-main-inventory/sha256:3e64b5cfa7c1640d92a67d937c6a2ef79a7ff1e1133b66bea7b1e254fc294fef/init.sql', 'sample-proj-2-230121_gprod_func_us-central1_init_inventory', '/init.z')
// return client.Storage.copyDirectory('sample-proj-2-230121-imagestore-func', 'func/database-func-main-inventory/sha256:3e64b5cfa7c1640d92a67d937c6a2ef79a7ff1e1133b66bea7b1e254fc294fef', 'sample-proj-2-230121_gprod_func_us-central1_init_inventory', '/')
// return client.Storage.uploadLocalFile('sample-proj-2-230121-imagestore-func', '/zzz/bbb/ddd.jpg', 'd:\\berlioz.png', {
// })
// return client.Storage.fileExists('sample-proj-2-230121-imagestore-func', '/zzz/bbb/ddd.jpg')
// return client.Storage.getBucketPolicy('sample-proj-2-230121_gprod_hello_us-central1_main_users')
// return client.Storage.setBucketPolicy('sample-proj-2-230121_gprod_hello_us-central1_main_users',  [
//     {
//       "members": [
//         "serviceAccount:gprod-gprod-hello-main-web-4@sample-proj-2-230121.iam.gserviceaccount.com"
//       ],
//       "role": "roles/storage.objectAdmin"
//     },
//     {
//       "role": "roles/storage.legacyBucketOwner",
//       "members": [
//         "projectEditor:sample-proj-2-230121",
//         "projectOwner:sample-proj-2-230121"
//       ]
//     },
//     {
//       "role": "roles/storage.legacyBucketReader",
//       "members": [
//         "projectViewer:sample-proj-2-230121"
//       ]
//     }

//   ]
// )
// return client.Storage.emptyBucket('sample-proj-2-230121_gprod_func_us-central1_init_inventory')
return client.Storage.queryAllBuckets()
// return client.Storage.queryBucket('dsample-proj-2-230121-gprod-aaa-bbb-ccc-ddd-eee-11')
// return client.Storage.createBucket('sample-proj-2-230121_localhomepc_hello_us-central1_main_users', newBucketMeta)
// return client.Storage.deleteBucket('sample-proj-2-230121_localhomepc_hello_us-central1_main_users')
    .then(result => {
        // result = result.map(x => x.name);
        // result = result.map(x => x.metadata);
        logger.info('RESULT: ', result);
    })
    .catch(reason => {
        logger.error(reason);
    })