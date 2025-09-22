'use strict';


define('forum/topic/reactions', [
	'api',
	'hooks',
	'alerts',
], function (api, hooks, alerts) {
	const Reactions = {};

	Reactions.toggleReaction = function (button, reactionType) {
		const post = button.closest('[data-pid]');
		const pid = post.attr('data-pid');
		const isActive = button.hasClass('reacted');

		const method = isActive ? 'del' : 'put';
		
		api[method](`/posts/${encodeURIComponent(pid)}/reaction`, {
			reaction: reactionType,
		}, function (err, data) {
			if (err) {
				if (!app.user.uid) {
					ajaxify.go('login');
					return;
				}
				return alerts.error(err);
			}
			
			// Toggle visual state
			button.toggleClass('reacted');
			
			// Update reaction count
			if (data && data.count !== undefined) {
				Reactions.updateReactionCount(pid, reactionType, data.count);
			}
			
			// Fire hook for other modules to listen
			hooks.fire('action:post.toggleReaction', {
				pid: pid,
				reaction: reactionType,
				active: method === 'put',
				count: data ? data.count : undefined,
			});
		});
		
		return false;
	};

	Reactions.updateReactionCount = function (pid, reactionType, count) {
		const post = $('[data-pid="' + pid + '"]');
		const countEl = post.find('[component="post/reaction-count"][data-reaction="' + reactionType + '"]');
		
		if (countEl.length) {
			countEl.text(count);
			countEl.toggleClass('hidden', count <= 0);
		}
	};

	return Reactions;
});