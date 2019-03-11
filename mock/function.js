var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

// return client.Function.queryAllFunctions('sample-proj-2-230121', 'us-central1')
// return client.Function.queryFunction('projects/sample-proj-2-230121/locations/us-central1/functions/function-1')
return client.Function.createFunction('sample-proj-2-230121', 'us-central1', 'function-onemore', {
    "httpsTrigger": {
      "url": "https://us-central1-sample-proj-2-230121.cloudfunctions.net/function-onemore"
    },
    "status": "ACTIVE",
    "entryPoint": "helloWorld",
    "timeout": "60s",
    "availableMemoryMb": 256,
    "serviceAccountEmail": "sample-proj-2-230121@appspot.gserviceaccount.com",
    "updateTime": "2019-03-08T23:18:39Z",
    "versionId": "1",
    "labels": {
      "deployment-tool": "console-cloud"
    },
    "sourceUploadUrl": "https://storage.googleapis.com/gcf-upload-us-central1-a8b4e65f-87bb-4f1d-ab06-c8042a0e348d/bed5b989-fa77-402c-990d-61e3c14390f1.zip?GoogleAccessId=service-1051794553133@gcf-admin-robot.iam.gserviceaccount.com&Expires=1552096040&Signature=sfHw5XnV3RB7BnEo8E89XMmryGvWFm2bXfcIhLrnSbzHGe%2BcPQZFvalrmMTwX%2FlszN3NHLSFR1kOO%2B26S8xzB794YqvYdEDPjh%2BBuqluDLz9mWuShJ1vWcULL2Ncy%2FdWPVJyIfdrv8it8n12WEjBwHGwgtxwVIr9mmtDvxyjWn061bGUh3zY7h2pyM0vcEo1pfE%2BCgL8M2Rk4t2a9AH1YF7kcnDs%2B0idAJJrCYzNcGMRh1S8NVsjI5AcVvkl5ItfvuT4WOHkfk0dYEc2KL4UC7sZtZoXnJ0Vg7%2Fv%2BH1R6yPN9IIbvK4%2BpAjYHfwBpYxQoqIq0lAkp1pbe5QD9X7KJg%3D%3D",
    "runtime": "nodejs6"
})
// return client.Iam.queryLiveServiceAccounts('gprod-gprod-hello-')
// return client.Iam.queryServiceAccount('projects/sample-proj-2-230121/serviceAccounts/gprod-berlioz-main-ctlr-1@sample-proj-2-230121.iam.gserviceaccount.com')
// return client.Iam.createServiceAccount('gprod-gprod-hello-main-web')
// return client.Iam.deleteServiceAccount('projects/sample-proj-2-230121/serviceAccounts/another-service-acc@sample-proj-2-230121.iam.gserviceaccount.com')
// return client.Iam.queryAllServiceAccountKeys('projects/sample-proj-2-230121/serviceAccounts/gprod-gprod-hello-main-web-290@sample-proj-2-230121.iam.gserviceaccount.com')
// return client.Iam.createServiceAccountKey('projects/sample-proj-2-230121/serviceAccounts/gprod-gprod-hello-main-web@sample-proj-2-230121.iam.gserviceaccount.com')
//return client.Iam.deleteServiceAccountKey('projects/sample-proj-2-230121/serviceAccounts/another-service-acc@sample-proj-2-230121.iam.gserviceaccount.com/keys/4d563e87af99d7c6a839e31d395c49828515c882')
    .then(result => {
        // result = result.map(x => x.name);
        // result = result.map(x => x.metadata);
        logger.info('RESULT: ', result);
    })
    .catch(reason => {
        logger.error(reason.code);
        logger.error(reason);
        logger.error("**********************************")
        logger.error(reason.errors.errors)
    })
