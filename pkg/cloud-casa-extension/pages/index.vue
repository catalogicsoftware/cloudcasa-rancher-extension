<script>
import { MANAGEMENT } from '@shell/config/types';
import Loading from '@shell/components/Loading';

import ClusterListView from "../components/ClusterListView.vue"

export default {
  components: {
    Loading,
    ClusterListView,
  }
}
</script>
<template>
  <ClusterListView />
</template>
