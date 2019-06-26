import React, { Component } from 'react';

// import PropTypes from 'prop-types';

import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Alert
} from 'react-native';

import range from 'lodash.range';

export default class Table extends Component {

	constructor(props) {
		super(props);
	
		this.generateRows = this.generateRows.bind(this);
		this.generateBlocks = this.generateBlocks.bind(this);
	
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
			range(3).fill(''),
			range(3).fill(''),
			range(3).fill('')
		];
	
		this.state = {
			moves: range(9).fill(''),
			x_score: 0,
			o_score: 0,
		}
		this.turn = 'X';
		this.game_over = false;
	}

	componentWillUnmount(){
		console.log('unmounting');
	}

	componentDidMount() {
		console.log('did mount on table.js');
		this.props.pubnub.getMessage(this.props.channel, (msg) => {
			console.log(msg);
			if(!msg.message.room_creator && (msg.message.turn != msg.message.piece)){
				let moves = this.state.moves;
				let id = this.ids[msg.message.row_index][msg.message.index];
				console.log(id);
				moves[id] = msg.message.piece;
				console.log(moves[id]);
				
				this.setState({
					moves
				});

				this.updateScores.call(this, moves);
				this.turn = 'X';
			}
		});
	}

	new_game = () => {
		console.log(this.props.is_room_creator);
		if(this.props.is_room_creator && this.game_over){
			console.log('alert creator')

			Alert.alert(
			  "Game Over!", 
			  "Do you want to play another game?",
			  [
			    {
			      text: "Nah", 
			      onPress: () => {
					this.props.pubnub.unsubscribe({
						channels : [this.props.channel]
					});
			        this.setState({
								moves: range(9).fill(''),
								x_score: 0,
								o_score: 0
							});
							this.turn = 'X';
							this.props.endGame();
			      },
			      style: 'cancel'
			    },
			    {
			      text: 'Yea', 
			      onPress: () => {
							this.setState({
								moves: range(9).fill('')
							});
							this.turn = 'X';
							this.game_over = false;
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
	
		if(winner === 'X'){
			console.log('winner is X');
			pieces['X'] += 1;
			console.log(pieces['X']);
			this.setState({
				x_score: pieces['X']
			});
		}
		else{
			console.log('point to O');
			pieces['O'] += 1;
			console.log(pieces['O']);
			this.setState({
				o_score: pieces['O']
			});
		}
		this.game_over = true;
		this.new_game();	
	}

	updateScores(moves) {
		for (let i = 0; i < this.possible_combinations.length; i++) {
			const [a, b, c] = this.possible_combinations[i];
			if (moves[a] && moves[a] === moves[b] && moves[a] === moves[c]) {
				console.log(moves[a]);
				this.determineWinner(moves[a]);	
				break;
			}
			console.log('no winner');
		}
	}

	render() {
		return (
			<View style={styles.board_container}>
				<View style={styles.board}>
					{this.generateRows()}
				</View>

				<View style={styles.scores_container}>
					<View style={styles.score}>
						<Text style={styles.user_score}>{this.state.x_score}</Text>
						<Text style={styles.username}>{this.props.username} (X)</Text>
					</View>
					
					<View style={styles.score}>
						<Text style={styles.user_score}>{this.state.o_score}</Text>
						<Text style={styles.username}>{this.props.rival_username} (O)</Text>
					</View>
				</View>				
			</View>
		);
	}

	generateRows() {
		return this.rows.map((row, index) => {
			return (
				<View style={styles.row} key={index}>
					{this.generateBlocks(row, index)}
				</View>
			);
		});
	}

	generateBlocks(row, row_index) {
		return row.map((block, index) => {
			let id = this.ids[row_index][index];
			return (
				<TouchableHighlight 
					key={index} 
					onPress={
						this.onMakeMove.bind(this, row_index, index)
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

	onMakeMove(row_index, index) {
		let moves = this.state.moves;
		let id = this.ids[row_index][index];

		if(!moves[id] && (this.turn === this.props.piece)){ // nobody has occupied the space yet
			moves[id] = this.props.piece;
			this.setState({
				moves
			});

			this.updateScores.call(this, moves);
			this.turn = (this.turn === 'X') ? 'O' : 'X';
			console.log(this.turn);
			
			//rival has made move
			this.props.pubnub.publish({
				message: {
					row_index: row_index,
					index: index,
					piece: this.props.piece,
					room_creator: this.props.is_room_creator,
					turn: this.turn
				},
				channel: this.props.channel
			});
		}
	}
}

const styles = StyleSheet.create({
	board_container: {
		flex: 9
	},
	board: {
		flex: 7,
		flexDirection: 'column'
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
		fontWeight: 'bold'
	},
	scores_container: {
		flex: 2,
		flexDirection: 'row',
		alignItems: 'center'
	},
	score: {
		flex: 1,
		alignItems: 'center'
	},
	user_score: {
		fontSize: 25,
		fontWeight: 'bold'
	},
	username: {
		fontSize: 20
	}
});

