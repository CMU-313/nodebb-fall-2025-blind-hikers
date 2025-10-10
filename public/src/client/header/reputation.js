'use strict';

define('forum/header/reputation', [
	'components', 'hooks', 'api',
], function (components, hooks, api) {
	const reputation = {};

	reputation.prepareDOM = function () {
		const reputationToggleEl = $('[component="reputation/dropdown"]');
		reputationToggleEl.on('show.bs.dropdown', async (ev) => {
			await loadReputationData();
		});

		// Load on page init if dropdown is already open
		reputationToggleEl.each((index, el) => {
			const dropdownEl = $(el).parent().find('.dropdown-menu');
			if (dropdownEl.hasClass('show')) {
				loadReputationData();
			}
		});
	};

	async function loadReputationData() {
		try {
			// Use already loaded user data from app.user
			const reputation = app.user.reputation || 0;
			const streak = app.user.streak || 0;
			
			// Update reputation and streak display
			$('[component="reputation/days-active"]').text(reputation);
			$('[component="reputation/current-streak"]').text(streak);
		} catch (err) {
			console.error('Error loading reputation data:', err);
		}
	}

	return reputation;
});
