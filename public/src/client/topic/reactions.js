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
		}, function (err) {
			if (err) {
				if (!app.user.uid) {
					ajaxify.go('login');
					return;
				}
				return alerts.error(err);
			}
			// Toggle visual state
			button.toggleClass('reacted');
			
			// Fire hook for other modules to listen
			hooks.fire('action:post.toggleReaction', {
				pid: pid,
				reaction: reactionType,
				active: method === 'put',
			});
		});
		
		return false;
	};

	return Reactions;
});