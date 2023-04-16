import { cli } from 'cleye';

const args = cli({
  name: 'generate-typings',
  parameters: [
    '<root>',
    '<api>',
    '[extras...]'
  ],
  flags: {
    unused: {
      type: Boolean,
      description: 'Avoids adding interfaces/type aliases without any references in the project.',
      default: 'false'
    }
  }
});

export default args;