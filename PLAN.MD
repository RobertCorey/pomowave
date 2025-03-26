POMOWAVE

Pomowave is an app for users to do pomos together. A user can create a room and send the room code to friends. Friends can join the room and do pomos together. The host that created the rooms can start pomos, then all the users will be notified and have the opportunity to join the pomo.

## Room Creation

- User can create a room by clicking the "Create Room" button
- User will be redirected to the room page with a room code
- The room code should be a combination of animals colors and locations <animal>-<color>-<location>
- The room code should be unique
- The room code should be case insensitive

## Room Joining

- User can join a room by entering the room code in the input field and clicking the "Join Room" button
- User can join a room by entering in the room url

## Room Page

- The room page will show a list of users in the room on the right side in a list
- the list should show the user's nickname and the number of pomos they have completed
- List of users should be sorted by pomos

## User Authentication

- Users will be asked to add a nickname when they join a room
- Nicknames don't need to be unique the app will append a random 6 digit number to the nickname to make it unique
- nicknames will be displayed as <nickname>#<random number>
- users can also pick from 16 animal emoji avatars when authenticating
- users only exist in the room they are in, there are no global users

## Starting a Pomo

- The host can start a pomo by clicking the "Start Pomo" button
- All users in the room will be notified that a pomo has started with a dialog and a countdown timer
- Users can join the pomo by clicking the "Join Pomo" button

## Pomo Timer

- After a pomo starts the app will display a 25 minute countdown timer
