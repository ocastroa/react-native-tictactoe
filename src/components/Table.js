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
		this.new_game = false;

	}

	componentWillUnmount(){
		console.log('unmounting');
	}

	componentDidMount() {
		console.log('did mount on table.js');
		this.props.pubnub.getMessage(this.props.channel, (msg) => {
			console.log(msg);
			let moves = this.state.moves;
			let id = this.ids[msg.message.row_index][msg.message.index];
			console.log(id);
			moves[id] = msg.message.piece;
			console.log(moves[id]);
			
			this.setState({
				moves
			});

			this.updateScores.call(this, moves);
			// this.onMakeMove(msg.message.row_index, msg.message.index)
        });

		// //change
		// this.props.channel.bind('client-make-move', (data) => {
		// 	let moves = this.state.moves;
		// 	let id = this.ids[data.row_index][data.index];
		// 	moves[id] = data.piece;
			
		// 	this.setState({
		// 		moves
		// 	});

		// 	this.updateScores.call(this, moves);
		// });
	}

	updateScores(moves) {
		var pieces = {
			'X': 0,
			'O': 0
		}

		function isInArray(moves, piece, element, index, array){
			console.log('moves[element]: ' + moves[element]);
			return moves[element] && moves[element] == piece;
		}

		this.possible_combinations.forEach((p_row) => {
			if(p_row.every(isInArray.bind(null, moves, 'X'))){
				console.log('point to X');
				this.new_game = true;
				pieces['X'] += 1;
			}else if(p_row.every(isInArray.bind(null, moves, 'O'))){
				console.log('point to O');
				pieces['O'] += 1;
			}
		});

		this.setState({
			x_score: pieces['X'],
			o_score: pieces['O']
		});
		
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
						<Text style={styles.username}>{this.props.username} (x)</Text>
					</View>
					
					<View style={styles.score}>
						<Text style={styles.user_score}>{this.state.o_score}</Text>
						<Text style={styles.username}>{this.props.rival_username} (o)</Text>
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
					onPress={this.onMakeMove.bind(this, row_index, index)} 
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
		// console.log(moves);
		let id = this.ids[row_index][index];

		if(!moves[id]){ // nobody has occupied the space yet
		
			moves[id] = this.props.piece;
			this.setState({
				moves
			});

			this.updateScores.call(this, moves);
			
			//rival has made move
			this.props.pubnub.publish({
				message: {
					row_index: row_index,
					index: index,
					piece: this.props.piece
				},
				channel: this.props.channel
			})
		}

		// alert the room creator if they want to restart the game or call it quits
		// if(this.props.is_room_creator && moves.indexOf('') === -1){
			if(this.props.is_room_creator && this.new_game){
			console.log('alert creator')
			// this.props.pubnub.publish({
			// 	message: {
			// 		restart_game: "restart the game?"0
			// 	},
			// 	channel: this.props.channel
			// })

			Alert.alert(
			  "Restart Game", 
			  "Do you want to restart the game?",
			  [
			    {
			      text: "Nope. Let's call it quits.", 
			      onPress: () => {
					this.props.pubnub.unsubscribe({
						channels : [this.props.channel]
					});
			        this.setState({
								moves: range(9).fill(''),
								x_score: 0,
								o_score: 0
							});
							this.props.endGame();
			      },
			      style: 'cancel'
			    },
			    {
			      text: 'Heck yeah!', 
			      onPress: () => {
							this.setState({
								moves: range(9).fill(''),
								x_score: 0,
								o_score: 0
							});
							this.new_game = false;
			      }  
			    },
			  ],
			  { cancelable: false } 
			);
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

