import { IPlugin } from '@shell/core/types';

export function init($plugin: IPlugin, store: any) {
  const YOUR_PRODUCT_NAME = 'cloud-casa';
  const BLANK_CLUSTER = '_';

  const { product } = $plugin.DSL(store, YOUR_PRODUCT_NAME);

  product({
    icon: 'monitoring',
    inStore: 'management',
    weight: 100,
    showClusterSwitcher: false,
    to: {
      name: `${YOUR_PRODUCT_NAME}`,
      path: `/${YOUR_PRODUCT_NAME}`,
      params: {
        product: YOUR_PRODUCT_NAME,
        pkg: YOUR_PRODUCT_NAME,
        cluster: BLANK_CLUSTER,
      },
    },
  });
}
