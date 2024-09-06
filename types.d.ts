import {
	InterfaceDeclaration,
	TypeAliasDeclaration,
	type ClassDeclaration,
	FunctionDeclaration,
	VariableDeclaration,
	ExportDeclaration,
	ImportDeclaration,
	ModuleDeclaration,
	EnumDeclaration,
	Identifier,
	SourceFile,
	Symbol,
	Node,
} from 'ts-morph';
import type { createLogger } from '~/instances/logger';

declare global {
	var logger: ReturnType<typeof createLogger>;
	var moduleMap: Map<string, ModuleEntry>;

	interface ModuleEntry {
		path: string;
		name: string;
		sourceFile: SourceFile;
		referencedFiles: Set<string>;
		imports: Map<string, Node>;
		exported: Map<string, Node>;
	}

	interface DeclarationCache {
		types: Map<Symbol, TypeAliasDeclaration>;
		interfaces: Map<Symbol, InterfaceDeclaration>;
		enums: Map<Symbol, EnumDeclaration>;
		variables: Map<Symbol, VariableDeclaration>;
		imports: Map<string, ImportDeclaration | Identifier>;
		functions: Map<Symbol, FunctionDeclaration>;
		modules: Map<Symbol, ModuleDeclaration>;
		classes: Map<Symbol, ClassDeclaration>;
		files: Map<Symbol, SourceFile>;
		references: Map<Symbol, any>;
		exports: Map<Symbol, ExportDeclaration>;
	}
}


export { };