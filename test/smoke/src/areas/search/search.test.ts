/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as cp from 'child_process';
import { Application } from '../../../../automation';

export function setup() {
	describe('Search', () => {
		after(function () {
			const app = this.app as Application;
			cp.execSync('git checkout .', { cwd: app.workspacePathOrFolder });
			cp.execSync('git reset --hard origin/master', { cwd: app.workspacePathOrFolder });
		});

		it('searches for body & checks for correct result number', async function () {
			const app = this.app as Application;
			await app.workbench.search.openSearchViewlet();
			await app.workbench.search.searchFor('body');

			await app.workbench.search.waitForResultText('16 results in 5 files');
		});

		it('searches only for *.js files & checks for correct result number', async function () {
			const app = this.app as Application;
			await app.workbench.search.searchFor('body');
			await app.workbench.search.showQueryDetails();
			await app.workbench.search.setFilesToIncludeText('*.js');
			await app.workbench.search.submitSearch();

			await app.workbench.search.waitForResultText('4 results in 1 file');
			await app.workbench.search.setFilesToIncludeText('');
			await app.workbench.search.hideQueryDetails();
		});

		it('dismisses result & checks for correct result number', async function () {
			const app = this.app as Application;
			await app.workbench.search.searchFor('body');
			await app.workbench.search.removeFileMatch('app.js');
			await app.workbench.search.waitForResultText('12 results in 4 files');
		});

		it('replaces first search result with a replace term', async function () {
			const app = this.app as Application;

			await app.workbench.search.searchFor('body');
			await app.workbench.search.expandReplace();
			await app.workbench.search.setReplaceText('ydob');
			await app.workbench.search.replaceFileMatch('app.js');
			await app.workbench.search.waitForResultText('12 results in 4 files');

			await app.workbench.search.searchFor('ydob');
			await app.workbench.search.setReplaceText('body');
			await app.workbench.search.replaceFileMatch('app.js');
			await app.workbench.search.waitForNoResultText();
		});
	});

	describe('Quick Open', () => {
		it('quick open search produces correct result', async function () {
			const app = this.app as Application;
			const expectedNames = [
				'.eslintrc.json',
				'tasks.json',
				'app.js',
				'index.js',
				'users.js',
				'package.json',
				'jsconfig.json'
			];

			await app.workbench.quickopen.openQuickOpen('.js');
			await app.workbench.quickopen.waitForQuickOpenElements(names => expectedNames.every(n => names.some(m => n === m)));
			await app.code.dispatchKeybinding('escape');
		});

		it('quick open respects fuzzy matching', async function () {
			const app = this.app as Application;
			const expectedNames = [
				'tasks.json',
				'app.js',
				'package.json'
			];

			await app.workbench.quickopen.openQuickOpen('a.s');
			await app.workbench.quickopen.waitForQuickOpenElements(names => expectedNames.every(n => names.some(m => n === m)));
			await app.code.dispatchKeybinding('escape');
		});
	});
}
