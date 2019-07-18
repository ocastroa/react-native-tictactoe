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
      pressCreateConfirm: false,
      pressJoinConfirm: false
     };
  }

  onHideUnderlayCreateButton = () => {
    this.setState({ pressCreateConfirm: false });
  }

  onShowUnderlayCreateButton = () => {
    this.setState({ pressCreateConfirm: true });
  }

  onHideUnderlayJoinButton = () => {
    this.setState({ pressJoinConfirm: false });
  }

  onShowUnderlayJoinButton = () => {
    this.setState({ pressJoinConfirm: true });
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

        <View style={styles.container}>
          <View style={styles.buttonContainer}>
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={'white'}
              style={
                this.state.pressCreateConfirm
                    ? styles.buttonPressed
                    : styles.buttonNotPressed
              }
                onHideUnderlay={this.onHideUnderlayCreateButton}
                onShowUnderlay={this.onShowUnderlayCreateButton}
                disabled={this.props.isDisabled}
                onPress={this.props.onPressCreateRoom}
              >
                <Text
                  style={
                  this.state.pressCreateConfirm
                      ? styles.cancelPressed
                      : styles.cancelNotPressed
                      }
                  >
                  Create
                </Text>
            </TouchableHighlight>
          </View>

          <View style={styles.buttonBorder}/>
            <View style={styles.buttonContainer}>
                <TouchableHighlight
                activeOpacity={1}
                underlayColor={'white'}
                style={
                  this.state.pressJoinConfirm
                      ? styles.buttonPressed
                      : styles.buttonNotPressed
                }
                  onHideUnderlay={this.onHideUnderlayJoinButton}
                  onShowUnderlay={this.onShowUnderlayJoinButton}
                  onPress={this.props.onPressJoinRoom}
                >
                  <Text
                    style={
                    this.state.pressJoinConfirm
                        ? styles.cancelPressed
                        : styles.cancelNotPressed
                        }
                    >
                    Join
                  </Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content_container: {
    flex: 1,
  },
  input_container: {
    marginBottom: 20,
  },
  container: {
    flexDirection: 'row',
    paddingLeft: 11,
    paddingRight: 11
  },
  buttonContainer: {
    flex: 1,
    textAlign: 'center',
  },
  buttonBorder: {
    borderLeftWidth: 4,
    borderLeftColor: 'white'
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
