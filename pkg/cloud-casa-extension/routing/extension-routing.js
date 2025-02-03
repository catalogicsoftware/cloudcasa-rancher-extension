import Index from '../pages/index.vue';
import ClusterList from '../pages/ClusterList.vue';
import Configurator from '../pages/Configurator.vue';
import DetailedCluster from '../pages/DetailedCluster.vue';

const BLANK_CLUSTER = '_';
const YOUR_PRODUCT_NAME = 'cloud-casa';

const routes = [
  {
    name: `${YOUR_PRODUCT_NAME}`,
    path: `/${YOUR_PRODUCT_NAME}`,
    component: Index,
    meta: {
      product: YOUR_PRODUCT_NAME,
      pkg: YOUR_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
    },
  },
  {
    name: `${YOUR_PRODUCT_NAME}-c-dashboard`,
    path: `/${YOUR_PRODUCT_NAME}/dashboard`,
    component: ClusterList,
    meta: {
      product: YOUR_PRODUCT_NAME,
      pkg: YOUR_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
    },
  },
  {
    name: `${YOUR_PRODUCT_NAME}-c-configurator`,
    path: `/${YOUR_PRODUCT_NAME}/configurator`,
    component: Configurator,
    meta: {
      product: YOUR_PRODUCT_NAME,
      pkg: YOUR_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
    },
  },
  {
    name: `${YOUR_PRODUCT_NAME}-c-cluster`,
    path: `/${YOUR_PRODUCT_NAME}/c/:cluster`,
    component: DetailedCluster,
    meta: {
      product: YOUR_PRODUCT_NAME,
      pkg: YOUR_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
    },
  },
];

export default routes;
