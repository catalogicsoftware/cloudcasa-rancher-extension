const config = require('@rancher/shell/vue.config');
const configHelper = require('@rancher/shell/vue-config-helper.js');

module.exports = require('./.shell/pkg/vue.config')(__dirname, {
  excludes: [],
  proxies: { 'rhn/manager': configHelper.proxyOpts('api.cloudcasa.io') }
});
