var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

// return client.Sql.queryAllInstances('gprod-func-uscentral1-')
// return client.Sql.queryInstance('my-primary-db-2-ldfajsldkfjlke')
return client.Sql.queryRunningInstanceOperations('gprod-func-uscentral1-main-inventory-jnevmyhrbj')
// return client.Sql.queryInstanceOperations('my-primary-db-2-ldfajsldkfjlke')
// return client.Sql.createInstance('my-primary-db-2-asdfasdfeerw', {
//     settings: {
//         tier: 'db-n1-standard-1'
//     }
// })
// return client.Sql.updateInstance('my-primary-db-2-ldfajsldkfjlke', {
//     settings: {
//         settingsVersion: '9',
//         tier: 'db-n1-standard-1'
//     }
// })
// return client.Sql.deleteInstance('my-primary-db-2-ldfajsldkfjlke')
// return client.Sql.importSql('gprod-func-uscentral1-main-inventory-ptgzaaxtqa', 'sys', 'gs://sample-proj-2-230121-imagestore-func/func/database-sql-zzz/init.sql')
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
