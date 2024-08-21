import { streamFromTree } from '@bablr/agast-helpers/tree';

import { printPrettyCSTML as printPrettyCSTMLFromStream } from './stream.js';

export const printPrettyCSTML = (rootNode, options = {}) => {
  // i need a context-aware streamFromTree here to build a stream with linked Tags...?
  return printPrettyCSTMLFromStream(streamFromTree(rootNode), options);
};
