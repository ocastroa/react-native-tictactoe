# Realtime Tic Tac Toe Game in React Native 

A React Native game that lets players play Tic Tac Toe against each other in this classic childhood game. Any moves the player makes will be seen in realtime by the other player, no matter where they are in the world! [PubNub's React SDK](https://www.pubnub.com/docs/react-native-javascript/pubnub-javascript-sdk) is used to power the realtime infrastructure of the game and to provide a shared connected experience for the players. 

<p align="center">
  <img src="./media/android-ios-game.png " alt="ios/android screenshot of the game" width="410" height="410" />
</p>

## Setup
1) First things first, sign up for a free PubNub account to get your Pub/Sub API keys.
 <a href="https://dashboard.pubnub.com/signup?devrel_gh=React_Native_TicTacToe">
    <img alt="PubNub Signup" src="https://i.imgur.com/og5DDjf.png" width=260 height=97/>
  </a>

2) You need to enable presence to detect the number of people in the game channel, which prevents having more than two people in a game. To do so, go to your [PubNub Admin Dashboard](https://admin.pubnub.com), click on the Demo Project App, or create a new app for this project, and click on Keyset. Scroll down to Application add-ons and toggle the Presence switch to on. Keep the default values the same.

<p align="center">
  <img src="./media/enable-presence.png" alt="Enable Presence add-on" width="450" height="300" />
</p>

3) Clone the repo.
```bash
git clone https://github.com/ocastroa/react-native-tictactoe
```
4) Open the project in your favorite text editor, such as [VS Code](https://code.visualstudio.com/download) or [Notepad++](https://notepad-plus-plus.org/download/v7.6.4.html)

5) Go to App.js and replace 'ENTER_YOUR_PUBLISH_KEY_HERE' and 'ENTER_YOUR_SUBSCRIBE_KEY_HERE' with the keys you got from Step 1.

6) You need to install the dependencies and link them to the app. You can do this by running the script that's in the root directory. Make sure to make the script executable first.
```bash
#dependencies.sh
chmod +x dependencies.sh # Execute the script
./dependencies.sh # Run the script
```

7) Type the following command to run the app in the simulator:
```bash
react-native run-ios
```
 - You can also run the app in the emulator, but make sure to have the emulator opened first:
 ```bash
react-native run-android
```

8) There are two ways to test the app without having to open up another simulator/emulator. You can use PubNub's debug console or a React tic tac toe app:
    1) The debug console is used to create a game channel and the simulator/emulator is used to connect to that game channel. The game starts once both players are connected to the same game channel. Since the debug console was used to create the room, the first move is made in the debug console, followed by the simulator/emulator. The game ends once there is a winner or a draw. To learn how to test the app using the debug console, watch [this video](https://www.youtube.com/watch?v=i0DEuosFV0k).
    2) The React app is already connected to the React Native app and is ready to play. To get started, clone the React App from the repo:
    ```bash
    git clone https://github.com/ocastroa/react-tutorial-tic-tac-toe.git
    ```
    - Once you open the project, go to the file Game.js and in the constructor, add the same Pub/Sub keys you used for the React Native app. After, type the following command in the terminal to install the dependencies:
    ```bash
    npm install
    ```
    - To run the app, type the following in the terminal:
    ```bash
    npm run
    ```
    - The app will open in http://localhost:3000 with an empty table and two input fields. The React app will be used to join a channel (Note: The React app is currently set up to only join channels and not create them) and the simulator/emulator will be used to create a room channel. To see how to test the app using the React app, watch [this video](https://www.youtube.com/watch?v=0W6OqKiP7GM).


## Build Your Own Realtime Tic Tac Toe Game in React Native

To learn more about this project or if you want to build this project from scratch, check out the tutorial (coming soon).

  <a href="https://www.pubnub.com/blog?devrel_gh=React_Native_TicTacToe">
    <img alt="PubNub Blog" src="https://i.imgur.com/aJ927CO.png" width=260 height=98/>
  </a>