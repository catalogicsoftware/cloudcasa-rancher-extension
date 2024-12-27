<script>
export default {
  props: {
    installState: Number,
  },
}
</script>
<template>
  <div v-if="installState === 0" class="custom-badge gray">
    Not Found
  </div>
  <div v-if="installState === 1" class="custom-badge gray">
    Not Paired
  </div>
  <div v-if="installState === 2" class="installing-text">
    Installing...
  </div>
  <div v-if="installState === 3" class="custom-badge green">
    Active
  </div>
  <div v-if="installState === 4" class="custom-badge red">
    Failed
  </div>
</template>
<style scoped>
  .custom-badge{
    padding: 2px 10px 3px 10px;
    border-width: 1px;
    border-style: solid;
    border-radius: 20px;
    display: inline-block;
  }

  .custom-badge.green{
    border-color: var(--active-green);
    color: var(--active-green);
  }

  .custom-badge.gray{
    border-color: var(--neutral-gray);
    color: var(--neutral-gray);
  }

  .custom-badge.red{
    border-color: var(--failure-red);
    color: var(--failure-red);
  }
  
  .installing-text{
    color: #B6B6C2;
  }
</style>
