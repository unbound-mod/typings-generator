import type { JSDocableNode } from 'ts-morph';

function isPrivate(node: JSDocableNode) {
	const docs = node.getJsDocs();

	for (const doc of docs) {
		const tags = doc.getTags();

		if (tags.some(r => r.getTagName() === 'private')) {
			return false;
		}
	}

	return true;
}

export default isPrivate;