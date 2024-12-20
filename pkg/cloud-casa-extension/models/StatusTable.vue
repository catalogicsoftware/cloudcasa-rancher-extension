<script>
  export default {
    props: {
      id: String,
      installState: Number, //1 = Not Paired, 2 = Installing, 3 = Active, 4 = Failed
      lastUpdated: String,
    },
  }
</script>
