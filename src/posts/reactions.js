'use strict';

const db = require('../database');
const plugins = require('../plugins');

module.exports = function (Posts) {
	const reactionsInProgress = {};

	Posts.reaction = async function (pid, uid, reactionType) {
		if (!reactionType || !['thumbs-up', 'heart', 'smile'].includes(reactionType)) {
			throw new Error('[[error:invalid-reaction-type]]');
		}

		if (reactionInProgress(pid, uid, reactionType)) {
			throw new Error('[[error:already-reacting-to-this-post]]');
		}
		putReactionInProgress(pid, uid, reactionType);

		try {
			return await toggleReaction(pid, uid, reactionType);
		} finally {
			clearReactionProgress(pid, uid, reactionType);
		}
	};

	Posts.hasReacted = async function (pid, uid, reactionType) {
		if (parseInt(uid, 10) <= 0) {
			return false;
		}
		return await db.isSetMember(`pid:${pid}:reaction:${reactionType}`, uid);
	};

	Posts.getReactionsByPids = async function (pids, uid) {
		const reactionTypes = ['thumbs-up', 'heart', 'smile'];
		const result = {};
		
		// Get all reaction data in parallel to avoid await in loop
		const reactionPromises = [];
		for (const pid of pids) {
			for (const reactionType of reactionTypes) {
				reactionPromises.push({
					pid,
					reactionType,
					count: db.setCount(`pid:${pid}:reaction:${reactionType}`),
					hasReacted: uid ? db.isSetMember(`pid:${pid}:reaction:${reactionType}`, uid) : Promise.resolve(false),
				});
			}
		}
		
		const reactions = await Promise.all(reactionPromises.map(async promise => ({
			pid: promise.pid,
			reactionType: promise.reactionType,
			count: await promise.count,
			hasReacted: await promise.hasReacted,
		})));
		
		// Organize results
		for (const pid of pids) {
			result[pid] = {};
		}
		
		for (const reaction of reactions) {
			result[reaction.pid][reaction.reactionType] = {
				count: reaction.count,
				hasReacted: reaction.hasReacted,
			};
		}
		
		return result;
	};

	function reactionInProgress(pid, uid, reactionType) {
		const key = `${uid}:${reactionType}`;
		return Array.isArray(reactionsInProgress[key]) && reactionsInProgress[key].includes(String(pid));
	}

	function putReactionInProgress(pid, uid, reactionType) {
		const key = `${uid}:${reactionType}`;
		reactionsInProgress[key] = reactionsInProgress[key] || [];
		reactionsInProgress[key].push(String(pid));
	}

	function clearReactionProgress(pid, uid, reactionType) {
		const key = `${uid}:${reactionType}`;
		if (Array.isArray(reactionsInProgress[key])) {
			const index = reactionsInProgress[key].indexOf(String(pid));
			if (index !== -1) {
				reactionsInProgress[key].splice(index, 1);
			}
		}
	}

	async function toggleReaction(pid, uid, reactionType) {
		const hasReacted = await Posts.hasReacted(pid, uid, reactionType);
		const postData = await Posts.getPostFields(pid, ['pid', 'uid', 'tid']);
		
		if (hasReacted) {
			// Remove reaction
			await db.setRemove(`pid:${pid}:reaction:${reactionType}`, uid);
			await fireReactionHook(postData, uid, reactionType, false);
		} else {
			// Add reaction
			await db.setAdd(`pid:${pid}:reaction:${reactionType}`, uid);
			await fireReactionHook(postData, uid, reactionType, true);
		}

		// Get updated counts
		const count = await db.setCount(`pid:${pid}:reaction:${reactionType}`);
		
		return {
			post: postData,
			reaction: reactionType,
			count: count,
			hasReacted: !hasReacted,
		};
	}

	async function fireReactionHook(postData, uid, reactionType, active) {
		const hook = active ? 'reaction' : 'unreaction';
		plugins.hooks.fire(`action:post.${hook}`, {
			pid: postData.pid,
			uid: uid,
			owner: postData.uid,
			reaction: reactionType,
		});
	}
};
