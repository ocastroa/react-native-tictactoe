import React, { Component } from 'react';
import PubNubReact from 'pubnub-react';
import {
  Platform,
  StyleSheet,
  View,
  Alert,
  Text,
  TextInput,
  Button
} from 'react-native';

import Table from './src/components/Table';
import Lobby from './src/components/Lobby';
// // import Board from './Board';
import prompt from 'react-native-prompt-android';
console.disableYellowBox = true;
import shortid  from 'shortid';

let room_id = 0;

export default class App extends Component {

  constructor(props) {
    super(props);
    this.pubnub = new PubNubReact({
      publishKey: "pub-c-fc3066d1-e616-4a54-902b-1802388fdeaf",
      subscribeKey: "sub-c-ed355780-93bd-11e9-9769-e24cdeae5ee1"
    });
    this.state = {
      username: 'Oscar',
      piece: '',
      rival_username: '',
      is_playing: false,
      is_waiting: false,
      is_room_creator: false
    };

    this.channel = null;
    this.pubnub.init(this);
  }

  componentWillUnmount(){
    console.log('unmounting');
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
    this.pubnub.getMessage('gameLobby', (msg) => {
      console.log(msg);
      if(msg.message.is_room_creator){
        console.log('waiting for game to start');
        console.log(this.state.is_playing);
      }
      else if(msg.message.not_room_creator){
         console.log('starting game');
          console.log(this.state.is_playing);
      
          this.pubnub.unsubscribe({
            channels : ['gameLobby']
          }); 
          console.log("unsub");
          this.setState({
            is_waiting: false,
            is_playing: true,
            rival_username: 'john'
            // rival_username: data.username
          });  
          console.log(this.state.is_playing);          
       } 
     });
    }
    // this.pubnub.getMessage(this.channel, (msg) => {
    //   if(msg.message.readyToPlay){
    //     let presenceUsers = 0;
    //     this.pubnub.hereNow({
    //       includeUUIDs: true,
    //       includeState: true
    //   }).then((response) => { 
    //       console.log(response) 
    //       presenceUsers = response.totalOccupancy;
    //       console.log('presence users ' + presenceUsers);
    //       if(presenceUsers < 2){
    //         //room creator
    //         console.log("waiting for oponent");
    //       }
    //       else if(presenceUsers === 2){
    //         console.log('2 ppl');

    //         this.setState({
    //           is_waiting: false,
    //           is_playing: true,
    //           rival_username: 'john'
    //           // rival_username: data.username
    //         });
    //       }
    //       else if(presenceUsers > 2){
    //         console.log("lobby full");
    //         this.setState({
    //           is_waiting: false,
    //           is_playing: true,
    //           rival_username: 'john'
    //           // rival_username: data.username
    //         });
    //       }
    //     }).catch((error) => { 
    //         console.log(error) 
    //     });  

    //   }
    // });
    // if(this.state.is_waiting){
        // this.updateUserCount();
      // }
  // }


  joinRoom = (room_id) => {
    this.channel = 'tictactoe--' + room_id;
    this.pubnub.subscribe({
      channels: [this.channel],
      withPresence: true
    });

    console.log('joined room ' + this.channel);
    this.setState({
      piece: 'O',
      // show_prompt: false,
      is_waiting: true
    });  
    
    this.pubnub.publish({
      message: {
        readyToPlay: true,
        not_room_creator: true
      },
      channel: 'gameLobby'
    });
  }
 
  onPressCreateRoom = () => {
    room_id = shortid.generate();
    let strTemp = room_id.substring(0,4);
    room_id = strTemp;
    // room_id = "yeet"
    this.channel = 'tictactoe--' + room_id;
    console.log(this.channel);
    this.pubnub.subscribe({
      channels: [this.channel],
      withPresence: true
    });

    // alert the user of the ID that the friend needs to enter 
    Alert.alert(
      'Share this room ID to your friend',
      room_id,
      [
        {text: 'Done'},
      ],
      { cancelable: false }
    );

    // show loading state while waiting for someone to join the room
    this.setState({
      piece: 'X', // room creator is always X
      is_waiting: true,
      is_room_creator: true
    });

    this.pubnub.publish({
      message: {
        readyToPlay: true,
        is_room_creator: true
      },
      channel: 'gameLobby'
    });
  }

  onPressJoinRoom = () => {
    if (Platform.OS === "android" || Platform.OS === "ios" ) {
      prompt(
        'Enter the room name',
        '',
        [
         {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         {text: 'OK', onPress: (value) =>  this.joinRoom(value) },
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

  endGame = () => {
    this.setState({
      username: '',
      piece: '',
      rival_username: '',
      is_playing: false,
      is_waiting: false,
      is_room_creator: false
    });

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

        {
          !this.state.is_playing &&
          <Lobby 
            username={this.state.name} 
            onPressCreateRoom={this.onPressCreateRoom} 
            onPressJoinRoom={this.onPressJoinRoom}
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
// {"row_index":1,"index":0,"piece":"X"}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
  title_container: {
    flex: 1,
  },
  title: {
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 30
  },
  input_container: {
    justifyContent: 'center',
    marginBottom: 20
  },
  button_container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  text_input: {
    backgroundColor: '#FFF',
    height: 40,
    borderColor: '#CCC', 
    borderWidth: 1
  },
  button: {
    flex: 1
  }
});