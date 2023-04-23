export default function createModule({ span, entries, name }: { entries: any[], span?: any, name: string; }) {
  return `
declare module '${name}' {
    ${entries.length === 0 ? 'export {}; // Empty module' : ''}
    ${entries.join('\n')}
}
`;

  return {
    type: 'TsModuleDeclaration',
    span,
    declare: true,
    global: false,
    id: {
      value: name,
      type: 'StringLiteral',
      raw: `'${name}'`,
      span: {
        start: 0,
        end: 0,
      }
    },
    body: {
      type: 'TsModuleBlock',
      span: span,
      body: entries
    }
  };
}
