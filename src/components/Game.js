import React, { Component } from 'react';
import {
StyleSheet,
Text,
View,
TouchableHighlight,
Alert
} from 'react-native';

import range from 'lodash';
const _ = range;

export default class Game extends Component {

constructor(props) {
  super(props);	
  this.possible_combinations = [
    [0, 3, 6],
    [1, 4, 7],
    [0, 1, 2],
    [3, 4, 5],
    [2, 5, 8],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  this.ids = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8]
  ];

  this.rows = [
    _.range(3).fill(''),
    _.range(3).fill(''),
    _.range(3).fill(''),
  ];

  this.state = {
    moves: _.range(9).fill(''),
    x_score: 0,
    o_score: 0,
  }
  this.turn = 'X';
  this.game_over = false;
  this.count = 0;
}

  componentDidMount() {
    // Listen for messages in the channel
    this.props.pubnub.getMessage(this.props.channel, (msg) => {
      // Add the other player's move to the table
      if(msg.message.turn === this.props.piece){
        let moves = this.state.moves;
        let id = this.ids[msg.message.row][msg.message.col];

        moves[id] = msg.message.piece;
        
        this.setState({
          moves
        });

        this.turn = msg.message.turn;
        this.updateScores.call(this, moves);
      }

      else if(msg.message.reset){
        this.setState({
          moves: _.range(9).fill('')
        });
        this.turn = 'X';
        this.game_over = false;
        this.count = 0;
      }

      else if(msg.message.gameOver){
        this.props.pubnub.unsubscribe({
          channels : [this.props.channel]
        });
        this.props.endGame();
      }
    }); 
  }

  newGame = () => {
    // Show this alert if the player is not the room creator
    if((this.props.is_room_creator === false) && this.game_over){
      Alert.alert('Game Over','Waiting to start a new round...');
      this.turn = 'X'; // Set turn to X so Player O can't make a move
    }
    // Show this alert to the room creator
    else if(this.props.is_room_creator && this.game_over){
      Alert.alert(
        "Game Over!", 
        "Do you want to play another round?",
        [
          {
            text: "Nah", 
            onPress: () => {
              this.props.pubnub.publish({
                message: {
                  gameOver: true
                },
                channel: this.props.channel
              });	
            },
            style: 'cancel'
          },
          {
            text: 'Yea', 
            onPress: () => {
              this.props.pubnub.publish({
                message: {
                  reset: true
                },
                channel: this.props.channel
              });
            }  
          },
        ],
        { cancelable: false } 
      );
    }
  }

	determineWinner = (winner) => {
		var pieces = {
			'X': this.state.x_score,
			'O': this.state.o_score
		}
	
		// Update score for the winner
		if(winner === 'X'){
			pieces['X'] += 1;
			this.setState({
				x_score: pieces['X']
			});
		}
		else{
			pieces['O'] += 1;
			this.setState({
				o_score: pieces['O']
			});
		}
		// End the game once there is a winner
		this.game_over = true;
		this.newGame();	
	}

	updateScores = (moves) => {
		for (let i = 0; i < this.possible_combinations.length; i++) {
			const [a, b, c] = this.possible_combinations[i];
			if (moves[a] && moves[a] === moves[b] && moves[a] === moves[c]) {
				this.determineWinner(moves[a]);	
				break;
			}
    }
    
    this.count++;
    // Check if the game ends in a draw
    if(this.count === 9){
      this.game_over = true;
      this.newGame();
    }
	}

	onMakeMove(row_index, col_index) {
		let moves = this.state.moves;
		let id = this.ids[row_index][col_index];

    // the square is empty
		if(!moves[id] && (this.turn === this.props.piece)){ 
			moves[id] = this.props.piece;
			
			this.setState({
				moves
			});

      // Change the turn so the next player can make a move
			this.turn = (this.turn === 'X') ? 'O' : 'X';
			
			//rival has made move
			this.props.pubnub.publish({
				message: {
					row: row_index,
					col: col_index,
					piece: this.props.piece,
					is_room_creator: this.props.is_room_creator,
					turn: this.turn
				},
				channel: this.props.channel
      });
			this.updateScores.call(this, moves);
		}
	}

	generateRows = () => {
		return this.rows.map((row, col_index) => {
			return (
				<View style={styles.row} key={col_index}>
					{this.generateBlocks(row, col_index)}
				</View>
			);
		});
	}

	generateBlocks = (row, row_index) => {
		return row.map((block, col_index) => {
			let id = this.ids[row_index][col_index];
			return (
				<TouchableHighlight 
					key={col_index} 
					onPress={
						this.onMakeMove.bind(this, row_index, col_index)
					} 
					underlayColor={"#CCC"} 
					style={styles.block}>

					<Text style={styles.block_text}>
						{
							this.state.moves[id]
						}
					</Text>
				
				</TouchableHighlight>	
			);
		});
	}

	render() {
		return (
			<View style={styles.table_container}>
				<View style={styles.table}>
					{this.generateRows()}
				</View>

				<View style={styles.scores_container}>
					<View style={styles.score}>
						<Text style={styles.user_score}>{this.state.x_score}</Text>
						<Text style={styles.username}>{this.props.x_username} (X)</Text>
					</View>
					
					<View style={styles.score}>
						<Text style={styles.user_score}>{this.state.o_score}</Text>
						<Text style={styles.username}>{this.props.o_username} (O)</Text>
					</View>
				</View>				
			</View>
		);
	}
}

const styles = StyleSheet.create({
	table_container: {
		flex: 9
	},
	table: {
		flex: 7,
		flexDirection: 'column',
		color: 'black'
	},
	row: {
		flex: 1,
		flexDirection: 'row',
		borderBottomWidth: 1,
	},
	block: {
		flex: 1,
		borderRightWidth: 1,
		borderColor: '#000',
		alignItems: 'center',
		justifyContent: 'center'
	},
	block_text: {
		fontSize: 30,
		fontWeight: 'bold',
		color: 'black'
	},
	scores_container: {
		flex: 2,
		flexDirection: 'row',
		alignItems: 'center'
	},
	score: {
		flex: 1,
		alignItems: 'center',
	},
	user_score: {
		fontSize: 25,
		fontWeight: 'bold',
		color: 'black'
	},
	username: {
		fontSize: 20,
		color: 'black'
	}
});
