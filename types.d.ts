import type { createLogger } from '~/instances/logger';
import type {
	EnumDeclaration,
	ExportDeclaration,
	FunctionDeclaration,
	Identifier,
	ImportDeclaration,
	InterfaceDeclaration,
	ModuleDeclaration,
	SourceFile,
	Symbol,
	TypeAliasDeclaration,
	VariableDeclaration,
} from 'ts-morph';

declare global {
	var logger: ReturnType<typeof createLogger>;

	interface DeclarationCache {
		types: Map<Symbol, TypeAliasDeclaration>;
		interfaces: Map<Symbol, InterfaceDeclaration>;
		enums: Map<Symbol, EnumDeclaration>;
		variables: Map<Symbol, VariableDeclaration>;
		imports: Map<Symbol, ImportDeclaration | Identifier>;
		functions: Map<Symbol, FunctionDeclaration>;
		modules: Map<Symbol, ModuleDeclaration>;
		files: Map<Symbol, SourceFile>;
		references: Map<Symbol, any>;
		exports: Map<Symbol, ExportDeclaration>;
	}
}


export { };