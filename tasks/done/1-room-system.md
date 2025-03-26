# Room System

The goal of this task is to create a simple room system that allows users to create and join rooms.

## Requirements

- Users should be able to navigate to a room creation page
- On the room creation page, users should be able to enter a nickname and click a "Create Room" button to create a room
- After creating a room, users should be redirected to a room page with a unique room code
- The room code should be a combination of animals colors and locations <animal>-<color>-<location>
- The room page should show a list of users in the room on the right side in a list
- The room page should have a "share link" button that copies the room url to the clipboard
- When another user navigates to the room url, they should see a "Join Room" button and nickname input that allows them to join the room
- When a user joins the room, they are added to the list of users in the room and the "Join Room" button is no longer displayed
- Use the types in types.tsx as a starting point but feel free to expand or modify them as needed

## Technical Requirements

- Clients should poll the server for updates about the room every 5 seconds and update the UI accordingly
- The room creation pages should be at /new
- The room pages should be at /room/:roomCode

## Out of Scope

- Styles should be minimal and not the focus of this task
- Implementing any of the pomowave features like starting a pomo or joining a pomo. The intention is just to setup and test the lobby system

## Testing

Create a playwright test that tests the following:

- A user can create a room with the nickname "Alice"
- 2 users "Bob" and "Charlie" will access the newly created room url and join the room
- The room page should show "Alice", "Bob", and "Charlie" in the list of users
- The room page should show the room code
- The room page should show a "share link" button that copies the room url to the clipboard
- The room page should show a "Join Room" button and nickname input that allows a new user to join the room if they haven't joined yet
- The room page should not show the "Join Room" button if the user has already joined the room
