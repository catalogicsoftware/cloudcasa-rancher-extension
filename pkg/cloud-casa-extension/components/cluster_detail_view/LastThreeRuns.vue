<script>
export default {
  layout: 'plain',
  name: 'job-status-view',
  props: {
    jobs: Array,
  },
  computed: {
    getJobs(){
      let newJobs = new Array();

      if (this.jobs == undefined){
        newJobs.push(new Object, new Object, new Object);  
        return newJobs;
      }

      for (let i = 0; i < 3; i++){
        if (this.jobs[i] == undefined) {
          newJobs.push(new Object);
        }else{
          newJobs.push(this.jobs[i]);
        }
      }

      return newJobs;
    }
  }
}
</script>
<template>
  <div v-for="(job, index) in getJobs" :key="index">
    <div 
      v-if="job.state == 'COMPLETED'" 
      class="status-dot green-dot"
      :title="job.message"
    ></div>
    <div 
      v-else-if="job.state == 'SKIPPED' || job.state == 'PENDING' || 
      job.state == 'RUNNING' || job.state == 'PARTIAL'" 
      class="status-dot yellow-dot"
      :title="job.message"
    >
    </div>
    <div 
      v-else-if="job.state == 'FAILED'" 
      class="status-dot red-dot"
      :title="job.message"
    >
    </div>
    <div 
      v-else 
      class="status-dot empty-dot"
      title="Job has not occured"
    >
    </div>
  </div>
</template>
<style scoped>
  .status-dot:empty{
    float: left;
    display: block;
    margin-left: 8px; 

    height: 1.1rem;
    width: 1.1rem;
    
    border-radius: 1.1rem;
    border-style: solid;
    border-width: 1px;
  }

  .empty-dot{
    border-color: #DCDEE7;
  }

  .green-dot{
    background-color: #5D995D;
    border-color: #5D995D;
  }

  .yellow-dot{
    background-color: #D3B73C;
    border-color: #D3B73C;
  }

  .red-dot{
    background-color: #F64747;
    border-color: #F64747;
  }
</style>
