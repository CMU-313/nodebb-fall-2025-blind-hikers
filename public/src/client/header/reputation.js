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

			// Get user's posts to build activity map using API
			const userslug = app.user.userslug;
			const response = await fetch(`${config.relative_path}/api/user/${userslug}/posts`);
			const data = await response.json();
			
			// Build activity map from posts
			const activityMap = {};
			if (data && data.posts) {
				data.posts.forEach(post => {
					if (post && post.timestamp) {
						const date = new Date(post.timestamp).toISOString().split('T')[0];
						activityMap[date] = (activityMap[date] || 0) + 1;
					}
				});
			}
			
			// Render heatmap
			renderHeatmap(activityMap);
		} catch (err) {
			console.error('Error loading reputation data:', err);
			// Still render empty heatmap even on error
			renderHeatmap({});
		}
	}

	function renderHeatmap(activityMap) {
		const heatmapContainer = $('[component="reputation/heatmap"]');
		heatmapContainer.empty();

		// Create heatmap for the last 365 days
		const today = new Date();
		const oneYearAgo = new Date(today);
		oneYearAgo.setDate(today.getDate() - 365);

		// Generate heatmap HTML
		const heatmapHtml = generateHeatmapHTML(oneYearAgo, today, activityMap);
		heatmapContainer.html(heatmapHtml);
	}

	function generateHeatmapHTML(startDate, endDate, activityMap) {
		const html = [];
		html.push('<div class="heatmap-container" style="overflow-x: auto;">');
		html.push('<div class="heatmap" style="display: flex; gap: 3px; flex-wrap: nowrap;">');

		// Group by weeks
		const weeks = [];
		let currentWeek = [];
		const currentDate = new Date(startDate);

		// Start from the first day of the week
		while (currentDate.getDay() !== 0) {
			currentDate.setDate(currentDate.getDate() - 1);
		}

		while (currentDate <= endDate) {
			const dateStr = currentDate.toISOString().split('T')[0];
			const count = activityMap[dateStr] || 0;
			const hasActivity = count > 0;
			
			currentWeek.push({
				date: dateStr,
				count: count,
				hasActivity: hasActivity,
				day: currentDate.getDay()
			});

			if (currentDate.getDay() === 6) {
				weeks.push(currentWeek);
				currentWeek = [];
			}

			currentDate.setDate(currentDate.getDate() + 1);
		}

		if (currentWeek.length > 0) {
			weeks.push(currentWeek);
		}

		// Render weeks
		weeks.forEach(week => {
			html.push('<div class="heatmap-week" style="display: flex; flex-direction: column; gap: 3px;">');
			
			// Pad the first week if it doesn't start on Sunday
			if (weeks.indexOf(week) === 0) {
				for (let i = 0; i < week[0].day; i++) {
					html.push('<div class="heatmap-day" style="width: 10px; height: 10px; visibility: hidden;"></div>');
				}
			}

			week.forEach(day => {
				const title = `${day.date}: ${day.count} post${day.count !== 1 ? 's' : ''}`;
				const bgColor = day.hasActivity ? '#0d6efd' : '#e0e0e0'; // Blue if has posts, gray if not
				html.push(`<div class="heatmap-day" data-date="${day.date}" data-count="${day.count}" title="${title}" style="width: 10px; height: 10px; background-color: ${bgColor}; border-radius: 50%; cursor: pointer; border: 1px solid #d0d0d0;"></div>`);
			});

			html.push('</div>');
		});

		html.push('</div>');
		
		// Add legend
		html.push('<div class="heatmap-legend mt-2 d-flex gap-1 align-items-center justify-content-end" style="font-size: 11px;">');
		html.push('<span class="text-muted me-1">No posts</span>');
		html.push('<div style="width: 10px; height: 10px; background-color: #e0e0e0; border-radius: 50%; border: 1px solid #d0d0d0;"></div>');
		html.push('<div style="width: 10px; height: 10px; background-color: #0d6efd; border-radius: 50%; border: 1px solid #d0d0d0; margin-left: 8px;"></div>');
		html.push('<span class="text-muted ms-1">Posted</span>');
		html.push('</div>');
		
		html.push('</div>');

		return html.join('');
	}

	return reputation;
});
