import { printType } from '@bablr/agast-helpers/print';
import * as sym from './symbols.js';

export const AllowEmpty = (desc, context) => {
  context.addInitializer(function () {
    let emptyables = this.emptyables;

    if (!emptyables) {
      emptyables = this.emptyables = new Set();
    }

    emptyables.add(context.name);
  });
};

export const CoveredBy = (type) => {
  if (!/^[a-zA-Z]+$/.test(printType(type))) throw new Error();
  return (desc, context) => {
    context.addInitializer(function () {
      let covers = this.covers;

      if (!covers) {
        covers = this.covers = new Map();
      }

      let coveredTypes = covers.get(type);

      if (!coveredTypes) {
        coveredTypes = new Set();
        covers.set(type, coveredTypes);
      }

      coveredTypes.add(context.name);
    });
  };
};

export const InjectFrom = (obj) => (_stub, context) => {
  if (!Object.hasOwn(obj, context.name)) {
    throw new Error('Bad injection');
  }

  return obj[context.name];
};

export const Node = (desc, context) => {
  return CoveredBy(sym.node)(desc, context);
};

export const Attributes = (attributes) => (desc, context) => {
  context.addInitializer(function () {
    this.attributes = this.attributes || new Map();
    this.attributes.set(context.name, attributes);
  });
};

export const UnboundAttributes = (attributes) => (desc, context) => {
  context.addInitializer(function () {
    this.unboundAttributes = this.unboundAttributes || new Map();
    this.unboundAttributes.set(context.name, attributes);
  });
};
