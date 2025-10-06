'use strict';

const assert = require('assert');

const topics = require('../../src/topics');
const user = require('../../src/user');
const categories = require('../../src/categories');
const cron = require('cron');

describe('User posting streaks', () => {
	let uid;
	let cid;
	const oneDay = 24 * 60 * 60 * 1000;
	// choose deterministic past dates so timestamps are <= Date.now()
	const day1 = Date.UTC(2025, 9, 1); // 2025-10-01 UTC
	const day2 = day1 + oneDay;
	const day4 = day1 + (3 * oneDay);

	before(async () => {
		uid = await user.create({ username: 'streaktester' });
		({ cid } = await categories.create({ name: 'Streak Category', description: 'For streak tests' }));
	});

	it('should set streak to 1 on first post', async () => {
		await topics.post({ uid, cid, title: 'streak topic 1', content: 'first post', timestamp: day1 + 1000 });
		const streak = await user.getUserField(uid, 'streak');
		const streakLastDay = await user.getUserField(uid, 'streakLastDay');
		assert.strictEqual(parseInt(streak, 10), 1);
		assert.strictEqual(parseInt(streakLastDay, 10), day1);
	});

	it('should not increment streak when posting again the same day', async () => {
		await topics.post({ uid, cid, title: 'streak topic 2', content: 'second post same day', timestamp: day1 + 5000 });
		const streak = await user.getUserField(uid, 'streak');
		const streakLastDay = await user.getUserField(uid, 'streakLastDay');
		assert.strictEqual(parseInt(streak, 10), 1);
		assert.strictEqual(parseInt(streakLastDay, 10), day1);
	});

	it('should increment streak when posting on consecutive day', async () => {
		await topics.post({ uid, cid, title: 'streak topic 3', content: 'third post next day', timestamp: day2 + 2000 });
		const streak = await user.getUserField(uid, 'streak');
		const streakLastDay = await user.getUserField(uid, 'streakLastDay');
		assert.strictEqual(parseInt(streak, 10), 2);
		assert.strictEqual(parseInt(streakLastDay, 10), day2);
	});

	it('should reset streak after a gap of more than one day', async () => {
		await topics.post({ uid, cid, title: 'streak topic 4', content: 'post after gap', timestamp: day4 + 3000 });
		const streak = await user.getUserField(uid, 'streak');
		const streakLastDay = await user.getUserField(uid, 'streakLastDay');
		assert.strictEqual(parseInt(streak, 10), 1);
		assert.strictEqual(parseInt(streakLastDay, 10), day4);
	});

	it('cronjob should reset stale streaks to 0', async () => {
		const uid2 = await user.create({ username: 'streakcronuser' });
		// set a streak that is older than yesterday
		await user.setUserFields(uid2, { streak: 5, streakLastDay: day1 });

		// Monkey-patch cron.CronJob to capture the scheduled callback
		const OriginalCronJob = cron.CronJob;
		let capturedOnTick = null;
		cron.CronJob = function (cronTime, onTick, onComplete, start) {
			capturedOnTick = onTick;
			// return a minimal mock with start/stop so module init doesn't break
			return { start: () => {}, stop: () => {} };
		};

		// Require and initialize the streaks module (it will use our mocked CronJob)
		require('../../src/user/streaks')(user);

		// Ensure we captured the callback and run it
		if (!capturedOnTick) {
			// restore CronJob and fail the test
			cron.CronJob = OriginalCronJob;
			throw new Error('Failed to capture CronJob callback');
		}

		// Invoke the cron callback (it is async)
		await capturedOnTick();

		// restore original CronJob implementation
		cron.CronJob = OriginalCronJob;

		const newStreak = await user.getUserField(uid2, 'streak');
		const newStreakLastDay = await user.getUserField(uid2, 'streakLastDay');
		assert.strictEqual(parseInt(newStreak, 10), 0);
		assert.strictEqual(parseInt(newStreakLastDay, 10), 0);
	});
});
