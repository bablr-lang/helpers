export * from '@bablr/boot-helpers/decorators';

export const UnboundAttributes = (attributes) => (desc, context) => {
  context.addInitializer(function () {
    this.unboundAttributes = this.unboundAttributes || new Map();
    this.unboundAttributes.set(context.name, attributes);
  });
};
