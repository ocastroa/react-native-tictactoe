import React, { Component } from 'react';
import PubNubReact from 'pubnub-react';
import {
  Platform,
  StyleSheet,
  View,
  Alert,
  Text,
} from 'react-native';

import Table from './src/components/Table';
import Lobby from './src/components/Lobby';
import shortid  from 'shortid';
import Spinner from 'react-native-spinkit';
import prompt from 'react-native-prompt-android';
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
      piece: '',
      x_username: 'Player 1',
      o_username: 'Player 2',
      is_playing: false,
      is_waiting: false,
      is_room_creator: false,
      isDisabled: false
    };

    this.channel = null;
    this.pubnub.init(this);
  }

  componentWillUnmount(){
    this.pubnub.unsubscribe({
      channels : ['gameLobby', this.channel]
    });
  }
  
  componentWillMount(){
    this.pubnub.subscribe({
      channels: ['gameLobby'],
      withPresence: true
    });

    this.pubnub.getMessage('gameLobby', (msg) => {
      // Start the game when a user has joined the lobby
      console.log(msg);
      console.log(msg.message.is_room_creator);
      console.log(this.state.is_room_creator);
      if(msg.message.is_room_creator){
        if(msg.message.is_room_creator != this.state.is_room_creator){
          console.log('hi');
          this.setState({
            x_username: msg.message.username
          })
        }        
      }

      else if(msg.message.not_room_creator){
        console.log(msg.message.not_room_creator);
        if(msg.message.not_room_creator === this.state.is_room_creator){
          console.log('setting rival name');
          this.pubnub.unsubscribe({
            channels : ['gameLobby']
          }); 
          this.setState({
            is_waiting: false,
            is_playing: true,
            x_username: this.state.username,
            o_username: msg.message.username
          });  
        }
        else{
          console.log('not setting rival name');
          this.pubnub.unsubscribe({
            channels : ['gameLobby']
          }); 
          this.setState({
            is_waiting: false,
            is_playing: true,
            o_username: this.state.username
          });  
         } 
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
        piece: 'X',
        is_room_creator: true,
        is_waiting: true,
        isDisabled: true
      });
  
      this.pubnub.publish({
        message: {
          is_room_creator: true,
          username: this.state.username
        },
        channel: 'gameLobby'
      });  
    }
  }

  joinRoom = (room_id) => {
    this.channel = 'tictactoe--' + room_id;

    // Check that lobby is not full
    this.pubnub.hereNow({
      channels: [this.channel], 
    }).then((response) => { 
        console.log(response);
        if(response.totalOccupancy < 2){
          console.log(response.totalOccupancy);
          this.pubnub.subscribe({
            channels: [this.channel],
            withPresence: true
          });
          
          console.log('joined room ' + this.channel);
          this.setState({
            piece: 'O',
            is_waiting: true
          });  
          
          this.pubnub.publish({
            message: {
              readyToPlay: true,
              not_room_creator: true,
              username: this.state.username
            },
            channel: 'gameLobby'
          });
        } 
        else{
          Alert.alert('Lobby full','Please enter another room name');
        }
    }).catch((error) => { 
        console.log(error)
    });
  }

  onPressJoinRoom = () => {
    if(this.state.username === ''){
      Alert.alert('Error','Please enter a username');
    }
    else{
      if (Platform.OS === "android" || Platform.OS === "ios" ) {
        prompt(
          'Enter the room name',
          '',
          [
           {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           {text: 'OK', onPress: (value) =>  
           (value === '') ? '' : this.joinRoom(value) },
          ],
          {
              type: 'default',
              cancelable: false,
              defaultValue: '',
              placeholder: ''
            }
        );      
      }  
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
            onPressJoinRoom={this.onPressJoinRoom}
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
              x_username={this.state.x_username}
              o_username={this.state.o_username}
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
