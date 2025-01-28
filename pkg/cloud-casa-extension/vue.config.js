module.exports = require('./.shell/pkg/vue.config')(__dirname, {
  proxies: { 'rhn/manager': configuHelper.proxyOpts('api.cloudcasa.io') }
});
