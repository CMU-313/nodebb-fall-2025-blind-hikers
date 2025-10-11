<!-- In this file, provide a detailed outline of how to use and user test your new feature(s)
You should also provide a link/description of where your added automated tests can be found, along with a description of what is being tested and why you believe the tests are sufficient for covering the changes that you have made -->

# User Guide to Testing NodeBB

## Emoji Reactions
This feature allows users to react to posts with emojis, to supplement the upvote/downvote system. Users can react with 3 emojis, and the running count of previous reactions is tracked. 
### Automated Testing
Test File: test/posts.js (lines 1346 - 1450)

CLI Test Command: npm test -- --grep "Post Reactions"
### User Testing
Testing the emoji reactions on the NodeBB website requires navigating to a post, and hovering over the bottom portion of the post until a bar with various icons appear. On the bar, test functionality of the three emoji reactions by clicking on them to select and deselect, and watch as their respective counters update accordingly. Each emoji icon should also display a brief description of the emoji when hovering over the icon. 
### Test Coverage
Automated tests cover basic operations such as adding reactions, removing reactions, checking if a user has reacted to a post, and accurate running counts for each reaction. Tests also account for users potentially reacting with invalid reaction types, and ensuring that reaction data is included when post data is retrieved. These tests comprehensively cover all actions and logic paths that users can take when interacting with emoji reactions, including edge cases and integration with existing NodeBB APIs. 

## Posting Anonymously
This feature allows users to create posts anonymously, so their name is not public. When creating a post, users can designate their post to be anonymous, and their name is replaced with "Anonymous". 

### Automated Testing
Test File: test/post.js (lines 1271 - 1345)

CLI Test Command: npm test — —grep “Anonymous Posts”
### User Testing
To test the anonymous posting functionality, navigate to creating a new post. On the bar with text options, there is a checkbox labeled with "Anonymous". Publishing a post with this box checked will create an anonymous post, with the author as "Anonymous". Leaving the box unchecked will allow the author's name to be visible when the post is published. Post teasers, previews, and topic lists also show "Anonymous", and the user's profile icon is replaced with a gray "A" avatar. 
### Test Coverage
The test suite covers a variety of functionality relating to this feature. It includes creating anonymous posts and replies, accurately anonymizing user data when requesting, and ensuring changes are persisted in the database. In addition, tests check that non-designated posts correctly show author information, as a regression check. These tests cover all cases for users creating and interacting with an anonymous post, and functionality was later verified manually with curl commands and browser console logs. 

## Posting Streak Counter
This feature allows users to record the number of consecutive days they post, to track their posting habits. Streaks increase when users post in consecutive days, and break when users miss posting on a day. 

### Automated Testing
Test File: test/posts/streaks.js

CLI Test Command: npm run test -- test/posts/streaks.js
### User Testing
To manually test streak functionality will need to span over multiple days, due to streaks being incremented when posts are made on consecutive days. Manual testing will involve posting on consecutive days to check for accurate increases in streaks, not posting on a day to ensure that the streak is reset to 0, and posting again on a new day to test that the streak correctly restarts at 1. 
### Test Coverage
Tests cover starting a streak, increasing a streak only on a new day, and resetting a streak after posting on a non-consecutive day. In addition, tests ensure that streaks automatically reset to 0 when a day is missed from a scheduled cron-job function. These tests accurately check for all cases that streaks can be altered by a user, as well as by automated processes. By validating both user-triggered updates and time-based resets to streaks, the tests cover all logic paths created by the streak functionality. 