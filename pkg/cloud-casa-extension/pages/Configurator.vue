<script>
import { defineComponent } from 'vue';
import SimpleBox from '@shell/components/SimpleBox';
import LabeledInput from '@shell/components/form/LabeledInput';

export default defineComponent({
  layout: 'plain', /*This is going to be deprecated in the future, when it breaks
  try looking at change log or reaching out to Alexandre Alves. Reference this
  GitHub issue: https://github.com/rancher/dashboard/issues/12980*/
  components: {
    SimpleBox,
    LabeledInput
  },
  data() {
    return {
      ccApiKey: ''
    }
  }
})
</script>
<template>
  <div class="flex-box">
    <div class="flex-item">
      <SimpleBox class="simplebox-centering">
        <img src="https://cloudcasa.io/assets/logo-white-1.png" />
        <h1>Welcome to the CloudCasa Extension!</h1>
        <h3>In order to get started you will need a CloudCasa API Key. To set 
          that up follow 
          <a href="https://docs.cloudcasa.io/help/apikeys.html">this guide</a>.
        </h3>
      </SimpleBox>
    </div>
    <div class="flex-item">
      <SimpleBox class="simplebox-centering">
         <LabeledInput type="text" v-model:value="ccApiKey">
            <template #label>CloudCasa API Key</template>
        </LabeledInput>
      </SimpleBox>
    </div>
  </div>
</template>
<style>
  .flex-box{
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  .flex-item{
    flex: 1;
  }

  .simplebox-centering{
    text-align: center;
    height: 93vh;
    margin: 1rem;
    display: flex; 
    align-items: center;
    justify-content: center;
  }
</style>
