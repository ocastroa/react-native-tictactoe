import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight
} from 'react-native';

export default class Lobby extends Component {
  constructor() {
    super();
    this.state = {
        pressStatus: false,
     };
  }

  onHideUnderlay = () => {
    this.setState({ pressStatus: false });
  }

  onShowUnderlay = () => {
    this.setState({ pressStatus: true });
  }

  render() {
    return (        
      <View style={styles.content_container}>
        <View style={styles.input_container}>
          <TextInput
            style={styles.text_input}
            onChangeText={this.props.onChangeUsername}
            placeholder={" Enter your username"}
            maxLength={15}
            value={this.props.username}
          />
        </View>

        <View style={styles.button_container}>
          <TouchableHighlight
              activeOpacity={1}
              underlayColor={'white'}
              style={
                this.state.pressStatus
                    ? styles.buttonPressed
                    : styles.buttonNotPressed
              }
                onHideUnderlay={this.onHideUnderlay}
                onShowUnderlay={this.onShowUnderlay}
                disabled={this.props.isDisabled}
                onPress={this.props.onPressCreateRoom}
              >
                <Text
                  style={
                  this.state.pressStatus
                      ? styles.cancelPressed
                      : styles.cancelNotPressed
                      }
                  >
                  Create Room
                </Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content_container: {
    flex: 1
  },
  input_container: {
    marginBottom: 20,
  },
  button_container: {
    alignItems: 'center'
  },
  text_input: {
    backgroundColor: '#FFF',
    height: 40,
    borderColor: '#CCC', 
    borderWidth: 1
  },
  buttonPressed:{
    borderColor: 'rgb(208,33,41)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5
  },
  buttonNotPressed: {
    backgroundColor: 'rgb(208,33,41)',
    borderColor: 'rgb(208,33,41)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5
  },
  cancelPressed:{
    color: 'rgb(208,33,41)',
    fontSize: 16,
    textAlign: 'center',
    alignItems: 'center',
  },
  cancelNotPressed: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    alignItems: 'center',
  },
});
