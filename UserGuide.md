<!-- In this file, provide a detailed outline of how to use and user test your new feature(s)
You should also provide a link/description of where your added automated tests can be found, along with a description of what is being tested and why you believe the tests are sufficient for covering the changes that you have made -->

# User Guide to Testing NodeBB

## Emoji Reactions
This feature allows users to react to posts with emojis, to supplement the upvote/downvote system. Users can react with 3 emojis, and the running count of previous reactions is tracked. 

Test File: test/posts.js
### Automated Testing
CLI Test Command: npm test -- --grep "Post Reactions"
### User Testing

### Test Coverage
Automated tests cover basic operations such as adding reactions, removing reactions, checking if a user has reacted to a post, and accurate running counts for each reaction.

## Posting Anonymously
This feature allows users to create posts anonymously, so their name is not public. When creating a post, users can designate their post to be anonymous, and their name is replaced with "Anonymous". 

Test File: test/post.js
### Automated Testing
CLI Test Command: npm run test -- test/posts.js
### User Testing
### Test Coverage

## Posting Streak Counter
This feature allows users to record the number of consecutive days they post, to track their posting habits. Streaks increase when users post in consecutive days, and break when users miss posting on a day. 

Test File: test/posts/streaks.js
### Automated Testing
CLI Test Command: npm run test -- test/posts/streaks.js
### User Testing
To manually test streak functionality will need to span over multiple days, due to streaks being incremented when posts are made on consecutive days. Manual testing will involve posting on consecutive days to check for accurate increases in streaks, not posting on a day to ensure that the streak is reset to 0, and posting again on a new day to test that the streak correctly restarts at 1. 
### Test Coverage
Tests cover starting a streak, increasing a streak only on a new day, and resetting a streak after posting on a non-consecutive day. In addition, tests ensure that streaks automatically reset to 0 when a day is missed from a scheduled cron-job function. These tests accurately check for all cases that streaks can be altered by a user, as well as by automated processes. By validating both user-triggered updates and time-based resets to streaks, the tests cover all logic paths created by the streak functionality. 