import type { FormatCodeSettings } from 'ts-morph';
import { SemicolonPreference } from 'typescript';
import Utilities from '~/projects/utilities';
import Global from '~/projects/global';
import API from '~/projects/api';

export { default as Utilities } from './utilities';
export { default as Unbound } from './unbound';
export { default as Global } from './global';
export { default as API } from './api';

const formatSettings: FormatCodeSettings = {
	baseIndentSize: 0,
	tabSize: 2,
	convertTabsToSpaces: false,
	semicolons: SemicolonPreference.Insert,
	insertSpaceAfterCommaDelimiter: true,
	insertSpaceAfterConstructor: false,
	insertSpaceAfterFunctionKeywordForAnonymousFunctions: true,
	insertSpaceAfterKeywordsInControlFlowStatements: true,
	insertSpaceAfterOpeningAndBeforeClosingEmptyBraces: true,
	insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
	insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
	insertSpaceBeforeAndAfterBinaryOperators: true,
	insertSpaceBeforeFunctionParenthesis: false,
};

export function saveAll() {
	Utilities.file.formatText(formatSettings);
	Utilities.file.organizeImports();
	Utilities.file.save();

	Global.file.formatText(formatSettings);
	Global.file.organizeImports();
	Global.file.save();

	API.file.formatText(formatSettings);
	API.file.organizeImports();
	API.file.save();
}