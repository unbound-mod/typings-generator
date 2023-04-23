import { cli } from 'cleye';

const args = cli({
  name: 'generate-typings',
  parameters: [
    '<root>',
    '<api>'
  ]
});

export default args;