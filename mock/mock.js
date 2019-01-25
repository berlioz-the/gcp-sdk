var logger = require('the-logger').setup('gcp-sdk',
    {
        enableFile: false,
        pretty: true
    });
logger.level = 'silly';

var credentials = require('./credentials.json');

var GcpSdkClient = require("../index");

var client = new GcpSdkClient(logger, 'us-central1-a', credentials);

return client.queryCluster('standard-cluster-1')
    .then(cluster => {
        return client.connectToRemoteKubernetes(cluster);
    })
    .then(k8sClient => {
        // return k8sClient.BerliozService.update('default', 'kukuku', {
        //     metadata: {
        //         name: 'kukuku',
        //         "resourceVersion": "4278267"
        //     },
        //     spec: {
        //         another: 'lalala'
        //     }
        // });
        // return k8sClient.ServiceAccount.queryAll("default");
        // return k8sClient.Namespace.query(null, "default");

        // return k8sClient.BerliozService.delete('default', 'kukuku');
        // return k8sClient.CustomResourceDefinition.queryAll();
        // return k8sClient.PriorityClass.queryAll();
        return k8sClient.Pod.queryAll();
        // return k8sClient.Node.queryAll();
        return k8sClient.Deployment.queryAll('default');
        return k8sClient.BerliozService.queryAll('default');
        return k8sClient.DaemonSet.queryAll('default');
        // return k8sClient.DaemonSet.query('default', 'gg-hello-infra-berlioz-agent');
        // return k8sClient.DaemonSet.delete('default', 'gg-hello-infra-kuku');
        return k8sClient.DaemonSet.update('default', "gg-hello-infra-kuku", {
            metadata: {
                "name": "gg-hello-infra-kuku",
                "labels": {
                  "berlioz_managed": "true",
                  "cluster": "hello",
                  "deployment": "gg",
                  "name": "gg-hello-infra-kuku",
                  "sector": "infra",
                  "service": "kuku"
                }
            },
            spec: {
                "selector": {
                  "matchLabels": {
                    "name": "gg-hello-infra-kuku"
                  }
                },
                "template": {
                  "metadata": {
                    "labels": {
                      "name": "gg-hello-infra-kuku"
                    }
                  },
                  "spec": {
                    "volumes": [
                      {
                        "name": "var-run-docker-sock",
                        "hostPath": {
                          "path": "/var/run/docker.sock",
                          "type": ""
                        }
                      }
                    ],
                    "containers": [
                      {
                        "name": "gg-hello-infra-kuku",
                        "image": "berliozcloud/agent",
                        "ports": [
                          {
                            "hostPort": 55555,
                            "containerPort": 55555,
                            "protocol": "TCP"
                          },
                          {
                            "hostPort": 55556,
                            "containerPort": 55556,
                            "protocol": "TCP"
                          }
                        ],
                        "env": [
                          {
                            "name": "BERLIOZ_TASK_ID",
                            "valueFrom": {
                              "fieldRef": {
                                "apiVersion": "v1",
                                "fieldPath": "metadata.uid"
                              }
                            }
                          },
                          {
                            "name": "BERLIOZ_IDENTITY",
                            "valueFrom": {
                              "fieldRef": {
                                "apiVersion": "v1",
                                "fieldPath": "metadata.name"
                              }
                            }
                          },
                          {
                            "name": "BERLIOZ_ADDRESS",
                            "valueFrom": {
                              "fieldRef": {
                                "apiVersion": "v1",
                                "fieldPath": "status.podIP"
                              }
                            }
                          },
                          {
                            "name": "BERLIOZ_INSTANCE_ID",
                            "valueFrom": {
                              "fieldRef": {
                                "apiVersion": "v1",
                                "fieldPath": "spec.nodeName"
                              }
                            }
                          },
                          {
                            "name": "BERLIOZ_HOST_IP",
                            "valueFrom": {
                              "fieldRef": {
                                "apiVersion": "v1",
                                "fieldPath": "status.hostIP"
                              }
                            }
                          },
                          {
                            "name": "BERLIOZ_AGENT_PATH",
                            "value": "http://0.0.0.0:55555/abcd"
                          },
                          {
                            "name": "BERLIOZ_LISTEN_ADDRESS",
                            "value": "0.0.0.0"
                          },
                          {
                            "name": "BERLIOZ_INFRA",
                            "value": "k8s"
                          },
                          {
                            "name": "BERLIOZ_REGION",
                            "value": "us-central1-a"
                          },
                          {
                            "name": "BERLIOZ_CLUSTER",
                            "value": "hello"
                          },
                          {
                            "name": "BERLIOZ_SECTOR",
                            "value": "infra"
                          },
                          {
                            "name": "BERLIOZ_SERVICE",
                            "value": "berlioz_agent"
                          },
                          {
                            "name": "BERLIOZ_LISTEN_PORT_WS",
                            "value": "55555"
                          },
                          {
                            "name": "BERLIOZ_PROVIDED_PORT_WS",
                            "value": "55555"
                          },
                          {
                            "name": "BERLIOZ_LISTEN_PORT_MON",
                            "value": "55556"
                          },
                          {
                            "name": "BERLIOZ_PROVIDED_PORT_MON",
                            "value": "55556"
                          }
                        ],
                        "resources": {
                          "limits": {
                            "memory": "100Mi"
                          },
                          "requests": {
                            "cpu": "53m",
                            "memory": "100Mi"
                          }
                        },
                        "volumeMounts": [
                          {
                            "name": "var-run-docker-sock",
                            "mountPath": "/var/run/docker.sock"
                          }
                        ],
                      }
                    ]
                  }
                }
            }
        });
        // return client.listNamespacedPriorityClasses('default')
    })
    .then(result => {
        var names = result;
        // var names = result.map(x => x.metadata.name);
        logger.info('POD NAMES: ', names);
    })
    .then(result => {
        logger.info('RESULT: ', result);
    })
    .catch(reason => {
        logger.error(reason);
    })