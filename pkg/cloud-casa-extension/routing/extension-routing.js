import Dashboard from '../pages/index.vue';

const BLANK_CLUSTER = '_';
const YOUR_PRODUCT_NAME = 'cloud-casa';

const routes = [
  {
    name: `${YOUR_PRODUCT_NAME}`,
    path: `/${YOUR_PRODUCT_NAME}`,
    component: Dashboard,
    nav: false,
    meta: {
      product: YOUR_PRODUCT_NAME,
      pkg: YOUR_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
    },
  },
];

export default routes;
