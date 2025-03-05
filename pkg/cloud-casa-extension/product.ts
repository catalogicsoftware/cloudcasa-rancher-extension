import { IPlugin } from '@shell/core/types';

export function init($plugin: IPlugin, store: any) {
  const YOUR_PRODUCT_NAME = 'CloudCasa';
  const BLANK_CLUSTER = '_';

  const styleSheet = document.createElement('style');
  const css = `
    .side-menu .category div a > img {
      display: block;
      width: 42px;
      font-size: 25px;
      margin-left: 1px;
    }
    .theme-dark .side-menu .category div a > img {
      filter: brightness(0) saturate(100%) invert(39%) sepia(90%) saturate(399%) hue-rotate(160deg) brightness(93%) contrast(95%)
    }
    .theme-dark .side-menu .category div a:hover > img, .side-menu .category div a.active-menu-link > img {
      filter:  brightness(0) invert(1);
    }
  `;

  styleSheet.textContent = css;
  document.head.appendChild(styleSheet);

  const { 
    basicType,
    configureType,
    product, 
    virtualType,
    //weightType,
  } = $plugin.DSL(store, YOUR_PRODUCT_NAME);

  product({
    name: `${YOUR_PRODUCT_NAME}`,
    svg: require('./assets/logo.svg'),
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

  /*virtualType({
    name: "Clusters",
    route: {
      name: `${ YOUR_PRODUCT_NAME}`,
    }
  });
  virtualType({
    name: "Backups",
    route: {
      name: `${ YOUR_PRODUCT_NAME }-c-cluster`,
    }
  });
  virtualType({
    name: "Restores",
    route: {
      name: `${ YOUR_PRODUCT_NAME }-c-cluster`,
    }
  });
  virtualType({
    name: "Migration",
    route: {
      name: `${ YOUR_PRODUCT_NAME }-c-cluster`,
    }
  });
  virtualType({
    name: "Replication",
    route: {
      name: `${ YOUR_PRODUCT_NAME }-c-cluster`,
    }
  });
  virtualType({
    name: "Recovery Points",
    route: {
      name: `${ YOUR_PRODUCT_NAME }-c-cluster`,
    }
  });

  basicType("Clusters");
  weightType("Clusters", 100, true)
  
  basicType("Backups");
  weightType("Backups", 99, true)

  basicType("Restores");
  weightType("Restores", 98, true)

  basicType("Migration");
  weightType("Migration", 97, true)

  basicType("Replication");
  weightType("Replication", 96, true)

  basicType("Recovery Points");
  weightType("Recovery Points", 95, true)*/

}
