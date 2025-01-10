<script>

import { defineComponent } from 'vue';
import ClusterListView from "./../components/ClusterListView.vue"

export default defineComponent({
  layout: 'plain', /*This is going to be deprecated in the future, when it breaks
  try looking at change log or reaching out to Alexandre Alves*/

  components: {
    ClusterListView,
  }
})
</script>
<template>
  <ClusterListView />
</template>
