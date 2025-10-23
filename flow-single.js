#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filePath = process.argv[2];

if (!filePath) {
	console.error('Usage: node flow-single.js <file-path>');
	process.exit(1);
}

// Create a temporary .flowconfig that only includes the specific file
const tempFlowConfig = `
[ignore]
.*

[include]
${path.resolve(filePath)}

[libs]

[lints]

[options]
all=true
`;

// Write temporary config
fs.writeFileSync('.flowconfig.temp', tempFlowConfig);

try {
	// Run flow with the temporary config
	execSync('./node_modules/.bin/flow check --flowconfig-name .flowconfig.temp', {
		stdio: 'inherit',
		cwd: process.cwd(),
	});
} catch (error) {
	// Flow errors are expected, just exit with the error code
	process.exit(error.status || 1);
} finally {
	// Clean up temporary config
	if (fs.existsSync('.flowconfig.temp')) {
		fs.unlinkSync('.flowconfig.temp');
	}
}
