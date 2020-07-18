# Tweetdev API
A Twitter alike API that I created while studying TDD.

## Routes

**/users**

|Method|Route|Info|Require Authentication|
|--|--|--|--|
| GET |/users/:id|Retrieve a user|Yes|
| POST |/users|Create a new user|No|
| PUT |/users/:id|Update an existing user|Yes|
| POST |/users/:toFollowId/follow|Follow a user|Yes|
| DELETE |/users/:toUnfollowId/unfollow|Unfollow a user|Yes|
\
**/sessions**
|Method|Route|Info|Require Authentication|
|--|--|--|--|
| POST |/sessions|Authenticate a user|No|
\
**/tweets**
|Method|Route|Info|Require Authentication|
|--|--|--|--|
| GET |/tweets/:id|Retrieve a tweet|Yes|
| POST |/tweets|Create a new tweet|Yes|
| DELETE |/tweets|Delete an existing tweet|Yes|
\
**/feed**
|Method|Route|Info|Require Authentication|
|--|--|--|--|
| GET |/tweets|Retrieve user feed|Yes|
| GET |/tweets/:id|Retrieve specific user tweets|Yes|

## How to run
Execute:

    git clone https://github.com/sirvaizard/tweetdev.git

Edit **.env.example** with valid inputs, and rename it to **.env**.
Then:

    yarn dev
  or

    npm run dev

