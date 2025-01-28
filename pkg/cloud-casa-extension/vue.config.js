module.exports = require('./.shell/pkg/vue.config')(__dirname, {
  proxies: { 'rhn/manager': configHelper.proxyOpts('api.cloudcasa.io') }
});
