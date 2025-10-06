'use strict';
const assert = require('assert');

const db = require('../mocks/databasemock');
const topics = require('../../src/topics');
const user = require('../../src/user');
const categories = require('../../src/categories');
const streakJob = require('../../src/user/streaks');

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
		// create new user with old streak
		const uid2 = await user.create({ username: 'streakcronuser' });
		await user.setUserFields(uid2, { streak: 5, streakLastDay: day1 });
		await db.sortedSetAdd('users:joindate', Date.now(), uid2);

		const activitypub = require('../../src/activitypub');
		activitypub.helpers.isUri = () => false;

		// call cronjob
		streakJob(user);
		const job = streakJob._getJob();
		assert(job, 'CronJob instance should be available');
		await job.fireOnTick();

		// give event loop a tick to finish async DB writes
		await new Promise(resolve => setTimeout(resolve, 50));

		const refreshed = await db.getObject(`user:${uid2}`);
		assert.strictEqual(parseInt(refreshed.streak, 10), 0);
		assert.strictEqual(parseInt(refreshed.streakLastDay, 10), 0);
	});
});