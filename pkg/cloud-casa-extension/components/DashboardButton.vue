<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'

export default {
  props: {
    dashboardLink: String,
  },
  components: {
    FontAwesomeIcon,
  },
  setup() {
    return {
      faArrowUpRightFromSquare
    }
  },
}
</script>
<template>
  <a 
    v-bind:href="dashboardLink"
    target="_Blank"
    class="btn role-primary" 
    label="Open CloudCasa"
   >
    My Dashboard <FontAwesomeIcon :icon="faArrowUpRightFromSquare" />
  </a>
</template>
<style scoped>
  svg {
    margin-left: 10px;
  }
  a{
    font-size: 20px;
  }
</style>
