<script>

import { defineComponent } from 'vue';
import ClusterListView from "./../components/ClusterListView.vue"

export default defineComponent({
  layout: 'plain', /*This is going to be deprecated in the future, when it breaks
  try looking at change log or reaching out to Alexandre Alves. Reference this
  GitHub issue: https://github.com/rancher/dashboard/issues/12980*/

  components: {
    ClusterListView,
  }
})
</script>
<template>
  <ClusterListView />
</template>
