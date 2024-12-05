<script>
import SortableTable from '@shell/components/SortableTable';
import { MANAGEMENT } from '@shell/config/types';
import axios from "axios"

export default {
  components: {
    SortableTable,
  },
  data() {
    return {
      tableHeaders: [
        {
          name: 'name',
          label: 'Name',
          value: 'id',
          width: '30%',
        },
        {
          name: 'hasCloudCasa',
          label: 'CloudCasa Installed?',
          value: 'hasCloudCasa',
          width: '30%',
        },
        {
          name: 'serviceStatus',
          label: 'CloudCasa Service Status',
          value: 'serviceStatus',
          width: '30%',
        },
        {
          name: 'install',
          label: 'Install',
          width: '9%',
        }
        //Do uninstall as well
      ],
      cloudCasaData: [],
      clusters: [],
      clusterData: [],
      tempConfigFile: `
        apiVersion: v1
        items:
        - apiVersion: v1
          kind: Namespace
          metadata:
            creationTimestamp: null
            labels:
              component: kubeagent-backup-helper
            name: cloudcasa-io
          spec: {}
        - apiVersion: v1
          kind: ServiceAccount
          metadata:
            creationTimestamp: null
            labels:
              component: kubeagent-backup-helper
            name: cloudcasa-io
            namespace: cloudcasa-io
        - apiVersion: rbac.authorization.k8s.io/v1
          kind: ClusterRoleBinding
          metadata:
            creationTimestamp: null
            labels:
              component: kubeagent-backup-helper
            name: cloudcasa-io
          roleRef:
            apiGroup: rbac.authorization.k8s.io
            kind: ClusterRole
            name: cluster-admin
          subjects:
          - kind: ServiceAccount
            name: cloudcasa-io
            namespace: cloudcasa-io
        - apiVersion: apps/v1
          kind: Deployment
          metadata:
            labels:
              component: cloudcasa-kubeagent-manager
            name: cloudcasa-kubeagent-manager
            namespace: cloudcasa-io
          spec:
            replicas: 1
            selector:
              matchLabels:
                app: cloudcasa-kubeagent-manager
            strategy:
              type: Recreate
            template:
              metadata:
                labels:
                  app: cloudcasa-kubeagent-manager
              spec:
                containers:
                - args:
                  - /usr/local/bin/kubeagentmanager
                  - --server_addr
                  - agent.cloudcasa.io:443
                  - --tls
                  - 'true'
                  - --skip_tls_verification
                  - 'false'
                  env:
                  - name: MY_POD_NAME
                    valueFrom:
                      fieldRef:
                        fieldPath: metadata.name
                  - name: AMDS_CLUSTER_ID
                    value: 6750c0f4506740f21045a5f2
                  - name: KUBEMOVER_IMAGE
                    value: catalogicsoftware/amds-kagent:3.1.0-prod.354
                  - name: DEPLOYMENT_PLATFORM
                    value: yaml
                  image: catalogicsoftware/amds-kagent:3.1.0-prod.354
                  name: kubeagentmanager
                  resources:
                    limits:
                      cpu: 500m
                      memory: 128Mi
                    requests:
                      cpu: 250m
                      memory: 64Mi
                  volumeMounts:
                  - mountPath: /scratch
                    name: scratch
                restartPolicy: Always
                serviceAccountName: cloudcasa-io
                terminationGracePeriodSeconds: 0
                volumes:
                - emptyDir: {}
                  name: scratch
        kind: List
      `
    };
  },
  async mounted() {
    console.log()
    let clusterData = await this.getClusters();

    //Add a check to cloud casa to check for backup errors?
    for (let i = 0; i < clusterData.length; i++) { 
      let hasCloudCasa = false;
      let status = "Not Installed";
      let clusterServiceData = await this.getClusterData(clusterData[i].id);

      for (let f = 0; f < clusterServiceData.data.length; f++) {
        if (clusterServiceData.data[f].metadata.namespace == "cloudcasa-io") {
          hasCloudCasa = true;
          status = clusterServiceData.data[f].metadata.state.name
          break;
        }
      }
      
      this.cloudCasaData.push({
        id: clusterData[i].id,
        hasCloudCasa: hasCloudCasa,
        serviceStatus: status, 
      });
    }

    return this.cloudCasaData;
  },
  methods: {
    //Need to update methods to listen to changes, right now only page refresh 
    //gets new data.
    async getClusters() {
      return await this.$store.dispatch(`management/findAll`, {
        type: MANAGEMENT.CLUSTER,
      });
    },
    async getClusterData(cluster) {
      return await this.$store.dispatch('cluster/request', {
        url: `/k8s/clusters/` + cluster + `/v1/services`,
      });
    },
    async createClusterOnCC(clusterName){
      //Adding loading indicator in UI
      //Need error handling on all calls here
      //Need to split these up into seperate awaits/chain them
      const cloudCasaResponse = await axios.post(
        'https://api.cloudcasa.io/api/v1/kubeclusters',
        {
          "name": clusterName,
          "description": "Created for testing purposes",
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Authorization': process.env.VUE_APP_CLOUDCASA_API_KEY,
          }
        }
      );
      console.log(cloudCasaResponse.data.status.agentURL);
      return await fetch(cloudCasaResponse.data.status.agentURL).then(
        response=> response.text()
      ).then(data => {
          return this.$store.dispatch('management/request', {
            url: `/v1/management.cattle.io.clusters/` + clusterName + '?action=apply',
            method: 'POST',
            data: {
              defaultNamespace: "default",
              yaml: data,
            }
          });
        }
      );
    },
  },
}
</script>
<template>
  <SimpleBox>
    <div class="header">
      <div class="section sub-header">
        <h1>Clusters</h1>
      </div>
      <div class="section actions">
        <a 
          href="https://home.cloudcasa.io/dashboard" 
          class="btn role-primary" 
          label="Open CloudCasa"
         >
          CloudCasa Dashboard
        </a>
      </div>
    </div>
    <div v-if="this.cloudCasaData != undefined">
      <SortableTable
        :rows="this.cloudCasaData"
        :headers="tableHeaders"
        :search="false"
        :table-actions="false"
        :row-actions="false"
      >
        <template #cell:name="{ row }">
          {{ row.id }}
        </template>
        <template #cell:hasCloudCasa="{ row }">
          <div v-if="row.hasCloudCasa === true">
            <i class="icon-checkmark" />
          </div>
          <div v-if="row.hasCloudCasa === false">
            <i class="icon-x" />
          </div>
        </template>
        <template #cell:serviceStatus="{ row }">
          {{ row.serviceStatus[0].toUpperCase() + row.serviceStatus.slice(1) }}
        </template>
        <template #cell:install="{ row }">
          <button 
            v-bind="{disabled: row.hasCloudCasa != true ? null : true}"

            class="btn role-primary" 
            @click="createClusterOnCC(row.id)"
           >
            Install
          </button>
        </template>
      </SortableTable>
    </div>
  </SimpleBox>
</template>
<style>
  .header{
    display: flex;
    margin-bottom: 1rem;
    .section{
      width: 50%;
    }
  }
  .sub-header h1{
    float: left;
  }

  .actions a{
    float:right;
  } 
</style>
