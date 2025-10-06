'use strict';

const { CronJob } = require('cron');

module.exports = function (User) {
	const db = require('../database');
	const plugins = require('../plugins');
	const activitypub = require('../activitypub');

	// Runs daily shortly after midnight UTC and resets streaks for users
	// whose last recorded streak day is older than yesterday (i.e. they broke
	// the consecutive-day posting streak by not posting yesterday).
	new CronJob('5 0 * * *', async () => {
		try {
			const now = Date.now();
			const oneDay = 24 * 60 * 60 * 1000;
			// Start of yesterday in UTC
			const yesterdayStart = new Date(new Date(now - oneDay).toISOString().slice(0, 10)).getTime();

			// Get all local user uids
			const uids = await db.getSortedSetRevRange('users:joindate', 0, -1);
			if (!uids || !uids.length) {
				return;
			}

			// Filter numeric (local) uids and map to integers
			const numericUids = uids.filter(uid => Number.isFinite(parseInt(uid, 10))).map(uid => parseInt(uid, 10));
			if (!numericUids.length) {
				return;
			}

			// Fetch streak fields in batches to avoid huge requests if many users exist
			const batchSize = 500;
			const slices = [];
			for (let i = 0; i < numericUids.length; i += batchSize) {
				slices.push(numericUids.slice(i, i + batchSize));
			}

			// Fetch all batches in parallel
			const usersDataBatches = await Promise.all(slices.map(slice => User.getUsersFields(slice, ['uid', 'streak', 'streakLastDay'])));

			// Prepare bulk update promises
			const bulkPromises = usersDataBatches.map((usersData) => {
				const updates = [];
				usersData.forEach((u) => {
					if (!u || !u.uid) return;
					const currentStreak = parseInt(u.streak, 10) || 0;
					const lastDay = parseInt(u.streakLastDay, 10) || 0;

					if (currentStreak > 0 && lastDay < yesterdayStart) {
						const key = `user${activitypub.helpers.isUri(u.uid) ? 'Remote' : ''}:${u.uid}`;
						updates.push([key, { streak: 0, streakLastDay: 0 }]);
					}
				});

				if (updates.length) {
					return db.setObjectBulk(updates);
				}
				return Promise.resolve();
			});

			await Promise.all(bulkPromises);
		} catch (err) {
			// Don't let a cron failure crash the process. Offer a plugin hook for logging/monitoring.
			plugins.hooks.fire('action:user.streakCronError', { error: err }).catch(() => {});
		}
	}, null, true);
};
