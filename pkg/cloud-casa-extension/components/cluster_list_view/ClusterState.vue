<script>
import { BadgeState } from '@components/BadgeState';

export default {
  props: {
    installState: Number,
  },
  components: {
    BadgeState,
  },
}
</script>
<template>
  <BadgeState v-if="installState === 0" color="bg-disabled" label="Not Found" />
  <BadgeState v-if="installState === 1" color="bg-disabled" label="Not Paired" />
  <div v-if="installState === 2" class="installing-text">
    Installing...
  </div>
  <BadgeState v-if="installState === 3" color="bg-success" label="Active" />
  <BadgeState v-if="installState === 4" color="bg-error" label="Failed" />
</template>
<style scoped>
  .bg-disabled{
    border-color: var(--disabled-text);
    color: var(--disabled-text);
    background: transparent !important;
  }
  
  .bg-error{
    border-color: var(--error);
    color: var(--error);
    background: transparent !important;
  }

  .installing-text{
    color: var(--disabled-text);
  }
</style>
