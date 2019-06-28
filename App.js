import React, { Component } from 'react';
import PubNubReact from 'pubnub-react';
import {
  StyleSheet,
  View,
  Alert,
  Text,
} from 'react-native';

import Table from './src/components/Table';
import Lobby from './src/components/Lobby';
import shortid  from 'shortid';
import Spinner from 'react-native-spinkit';
console.disableYellowBox = true;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.pubnub = new PubNubReact({
      publishKey: "pub-c-fc3066d1-e616-4a54-902b-1802388fdeaf",
      subscribeKey: "sub-c-ed355780-93bd-11e9-9769-e24cdeae5ee1"
    });

    this.state = {
      username: '',
      piece: 'X',
      rival_username: 'Player 2',
      is_playing: false,
      is_waiting: false,
      is_room_creator: true,
      isDisabled: false
    };

    this.channel = null;
    this.pubnub.init(this);
  }

  componentWillUnmount(){
    this.pubnub.unsubscribe({
      channels : [this.channel]
    });
  }
  
  componentWillMount(){
    this.pubnub.subscribe({
      channels: ['gameLobby'],
      withPresence: true
    });
  }

  componentDidUpdate() {
    // Check if message arrived in the channel
    this.pubnub.getMessage('gameLobby', (msg) => {
      // Start the game when a user has joined the lobby
      if(msg.message.not_room_creator){
          this.pubnub.unsubscribe({
            channels : ['gameLobby']
          }); 
          this.setState({
            is_waiting: false,
            is_playing: true,
            rival_username: msg.message.username
          });  
       } 
     });
    }

  onChangeUsername = (username) => {
    this.setState({username});
  }

  onPressCreateRoom = () => {
    if(this.state.username === ''){
      Alert.alert('Error','Please enter a username');
    }

    else{
      // Random channel name generated
      let roomId = shortid.generate();
      let shorterRoomId = roomId.substring(0,5);
      roomId = shorterRoomId;
      this.channel = 'tictactoe--' + roomId;
      this.pubnub.subscribe({
        channels: [this.channel],
        withPresence: true
      });
  
      // alert the user of the ID that the friend needs to enter 
      Alert.alert(
        'Share this room ID with your friend',
        roomId,
        [
          {text: 'Done'},
        ],
        { cancelable: false }
      );
  
      // show loading state while waiting for someone to join the room
      this.setState({
        is_waiting: true,
        isDisabled: true
      });
  
      this.pubnub.publish({
        message: {
          readyToPlay: true,
        },
        channel: 'gameLobby'
      });  
    }
  }

  endGame = () => {
    this.setState({
      username: '',
      rival_username: '',
      is_playing: false,
      is_waiting: false,
      isDisabled: false
    });

    // Subscribe to gameLobby again on a new game
    this.channel = null;
    this.pubnub.subscribe({
      channels: ['gameLobby'],
      withPresence: true
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.title_container}>
          <Text style={styles.title}>RN Tic-Tac-Toe</Text>
        </View>

        <Spinner 
          style={styles.spinner} 
          isVisible={this.state.is_waiting} 
          size={75} 
          type={"Circle"} 
          color={'rgb(208,33,41)'}
        />

        {
          !this.state.is_playing &&
          <Lobby 
            username={this.state.name} 
            onChangeUsername={this.onChangeUsername}
            onPressCreateRoom={this.onPressCreateRoom} 
            isDisabled={this.state.isDisabled}
          />
        }
      
        {
            this.state.is_playing &&
            <Table 
              pubnub={this.pubnub}
              channel={this.channel} 
              username={this.state.username} 
              piece={this.state.piece}
              rival_username={this.state.rival_username}
              is_room_creator={this.state.is_room_creator}
              endGame={this.endGame}
            />
          }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  spinner: {
    flex: 1,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 50
  },
  title_container: {
    flex: 1,
    marginTop: 15
  },
  title: {
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 30,
    color: 'rgb(208,33,41)'
  },
});
