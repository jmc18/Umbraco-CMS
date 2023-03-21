// Load all .d.ts files from the dist/libs folder
// and replace all imports from @umbraco-cms/backoffice with relative imports
// Example: import { Foo } from '@umbraco-cms/backoffice/element' -> import { Foo } from './element'
// This is needed because the d.ts files are not in the same folder as the source files
// and the absolute paths are not valid when the d.ts files are copied to the dist folder
// This is only used when building the d.ts files
//
// Usage: node utils/transform-dts.js
//
// Note: This script is not used in the build process, it is only used to transform the d.ts files
//       when the d.ts files are copied to the dist folder

import { readdirSync, readFileSync, writeFileSync, cpSync, mkdirSync, lstatSync } from 'fs';

const srcDir = './libs';
const inputDir = './dist/libs';
const outputDir = '../Umbraco.Cms.StaticAssets/wwwroot/umbraco/backoffice/libs';

// Copy package.json
cpSync(`${srcDir}/package.json`, `${inputDir}/package.json`, { recursive: true });

const libs = readdirSync(inputDir);

// Create output folder
try {
	mkdirSync(outputDir, {recursive: true});
} catch {}

// Transform all .d.ts files and copy all other files to the output folder
libs.forEach(lib => {

	console.log(`Transforming ${lib}`);

	const dtsFile = `${inputDir}/${lib}`;

	let code = readFileSync(dtsFile, 'utf8');

	// Replace all absolute imports with relative imports
	if (lib.endsWith('.d.ts')) {
		code = code.replace(/from '(@umbraco-cms\/backoffice\/[^']+)'/g, (match, p1) => {
			return `from './${p1.split('/').pop()}'`;
		});
	}

	writeFileSync(dtsFile, code, 'utf8');

	cpSync(dtsFile, `${outputDir}/${lib}`, { recursive: true });

});
