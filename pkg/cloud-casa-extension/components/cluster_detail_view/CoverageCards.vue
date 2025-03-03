<script>
import PercentageBar from '@shell/components/PercentageBar';

export default{
  layout: 'plain',
  name:  'coverage-card-component',
  components: {
    PercentageBar,
  },
  props: {
    clusterCloudCasaData: Object,
  },
  computed: {
    jobSuccess(){
      if (this.clusterCloudCasaData != undefined) {
        return {
          "total": this.clusterCloudCasaData.metrics.total_num_backup_jobs,
          "complete": this.clusterCloudCasaData.metrics.total_num_successful_backup_jobs,
          "percentage": this.clusterCloudCasaData.metrics.backup_job_success_percentage,
        }
      }

      return {
        "total": 0,
        "complete": 0,
        "percentage": 0,
      }
    },
    pvBackupCoverage(){
      if (this.clusterCloudCasaData != undefined) {
        return {
          "total": this.clusterCloudCasaData.metrics.total_num_pvcs,
          "complete": this.clusterCloudCasaData.metrics.total_num_offload_pvcs,
          "percentage": this.clusterCloudCasaData.metrics.eligible_pvc_offload_coverage_percentage,
        }
      }

      return {
        "total": 0,
        "complete": 0,
        "percentage": 0,
      }
    },
    pvSnapshotCoverage(){
      if (this.clusterCloudCasaData != undefined) {
        return {
          "total": this.clusterCloudCasaData.metrics.total_num_pvcs,
          "complete": this.clusterCloudCasaData.metrics.total_num_snapshot_pvcs,
          "percentage": this.clusterCloudCasaData.metrics.eligible_pvc_snapshot_coverage_percentage,
        }
      }

      return {
        "total": 0,
        "complete": 0,
        "percentage": 0,
      }
    },
    /*safelockCoverage(){
      return {
        "total": this.clusterCloudCasaData.metrics.total_num_safelock_recovery_points,
        "complete": this.clusterCloudCasaData.metrics.,
        "percentage": this.clusterCloudCasaData.metrics.safelock_coverage_percentage,
      }
    },*/
  }
}
</script>
<template>
  <div class="card-container">
    <div class="card">
      <h1>Backup Job Success</h1>
      <br />
      <div class="card-data-container">
        <div class="card-percentage">
          <h4 class="light-gray">{{jobSuccess.percentage}}%</h4>
        </div>
        <div class="card-points">
          <h4 class="light-gray">
            {{jobSuccess.complete}}/{{jobSuccess.total}}
          </h4>
        </div>
        <br />
      </div>
      <br />
      <PercentageBar 
        :modelValue="this.jobSuccess.percentage" 
        preferred-direction="MORE"
      />
    </div>
    <div class="card">
      <h1>PV Backup Coverage</h1>
      <br />
      <div class="card-data-container">
        <div class="card-percentage">
          <h4 class="light-gray">{{pvBackupCoverage.percentage}}%</h4>
        </div>
        <div class="card-points">
          <h4 class="light-gray">
            {{pvBackupCoverage.complete}}/{{pvBackupCoverage.total}}
          </h4>
        </div>
        <br />
      </div>
      <br />
      <PercentageBar 
        :modelValue="this.pvBackupCoverage.percentage" 
        preferred-direction="MORE"
      />
    </div>
    <div class="card">
      <h1>PV Snapshot Coverage</h1>
      <br />
      <div class="card-data-container">
        <div class="card-percentage">
          <h4 class="light-gray">{{pvSnapshotCoverage.percentage}}%</h4>
        </div>
        <div class="card-points">
          <h4 class="light-gray">
            {{pvSnapshotCoverage.complete}}/{{pvSnapshotCoverage.total}}
          </h4>
        </div>
        <br />
      </div>
      <br />
      <PercentageBar 
        :modelValue="this.pvSnapshotCoverage.percentage" 
        preferred-direction="MORE"
      />
    </div>
    <!--<div class="card">
      <h1>Safelock Coverage</h1>
      <br />
      <div class="card-data-container">
        <div class="card-percentage">
          <h4 class="light-gray">55%</h4>
        </div>
        <div class="card-points">
          <h4 class="light-gray">55/100</h4>
        </div>
        <br />
      </div>
      <br />
      <PercentageBar :modelValue="55" />
    </div>-->
  </div>
</template>
<style scoped>
  .card-container{
    width: 100%;
    display: flex;
    margin: 0px !important;
    padding: 0px !important;
  }

  .card{
    margin-right: 20px;
    float: left;
    width: 33%;
    padding: 20px;
    border-width: 1px;
    border-color: gray;
    border-style: solid;
  }

  .card:last-child{
    margin-right: 0px !important;
  }

  .card-data-container{
    width: 100%;
  }

  .card-percentage{
    float: left;
  }

  .card-points{
    float: right;
  }
</style>
