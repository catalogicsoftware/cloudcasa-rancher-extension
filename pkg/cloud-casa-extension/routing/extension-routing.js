import Dashboard from '../pages/index.vue';
import DetailedCluster from '../pages/detailed-cluster.vue';

const BLANK_CLUSTER = '_';
const YOUR_PRODUCT_NAME = 'cloud-casa';

const routes = [
  {
    name: `${YOUR_PRODUCT_NAME}`,
    path: `/${YOUR_PRODUCT_NAME}`,
    component: Dashboard,
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
