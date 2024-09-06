function createCache() {
	const cache: DeclarationCache = {
		references: new Map(),
		interfaces: new Map(),
		functions: new Map(),
		variables: new Map(),
		modules: new Map(),
		imports: new Map(),
		exports: new Map(),
		types: new Map(),
		enums: new Map(),
		files: new Map(),
		classes: new Map(),
	};

	return cache;
}

export default createCache;