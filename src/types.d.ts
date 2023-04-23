import { ModuleItem } from '@swc/core';

declare global {
  interface Visitor {
    parent: ModuleItem & ModuleItem[];
    node: any & ModuleItem;
    dir: string;

    store: {
      variables: Map<string, any>,
      exports: Map<string, any>;
      types: Map<string, any>;
    };
    parentStore: any;
  }
}
