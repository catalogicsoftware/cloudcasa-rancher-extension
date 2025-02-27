const config = require('@rancher/shell/vue.config'); // eslint-disable-line @typescript-eslint/no-var-requires
const configHelper = require('@rancher/shell/vue-config-helper.js');

module.exports = config(__dirname, {
  excludes: [],
  //proxies: { 'rhn/manager': configHelper.proxyOpts('api.cloudcasa.io') }
});
