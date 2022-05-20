import Error from './error.js';
import Board from './board.js';

/**
 * The game class.
 * 
 * @class
 * @classdesc All the game logic.
 */
class Game {

  constructor() {
    /**
     * Enum of the game states.
     * 
     * @public
     * @type {Object.<string, number>}
     */
    this.GameState = {
      Waiting: 0,
      GameStart: 1,
      PlayerTurn: 2,
      ComputerTurn: 3,
      GameOver: 4
    };

    /**
     * Stats of the game
     * 
     * @public
     * @type {Object.<string, number>}
     */
    this.stats = {};

    /**
     * The current game state.
     *  
     * @public
     * @type {number}
     */
    this.gameState = this.GameState.Waiting;

    /**
     * Player board.
     * 
     * @public
     * @type {Board}
     */
    this.playerBoard = new Board(8);

    /**
     * Computer board.
     * 
     * @public
     * @type {Board}
     */
    this.computerBoard = new Board(8);

    /**
     * The winner of the game, 0 whe no one has win yet, 1 for player and 2 for the computer
     */
    this.gameWinner = 0;

    /**
     * Callback to use when the game is over
     * 
     * @public
     * @type {function}
     */
    this.onGameover;
  }

  /**
   * Starts the game.
   * 
   * @returns {Array<Array<int>>} Array representation of player ships
   */
  startGame() {
    this.stats = {
      turns: 0,
      alives: 0,
      hits: 0,
      misses: 0
    };
    this.gameWinner = 0;
    this.gameState = this.GameState.GameStart;
    this.playerBoard.init();
    this.computerBoard.init();
    this.placeRandom(this.computerBoard);
    return this.playerBoard.primaryGrid;
  }

  /**
   * Starts the turn and place all the left pieces randomly.
   * 
   * @returns {Array<Array<int>>} Array representation of player ships
   */
  startTurn() {
    if (this.gameState != this.GameState.GameStart) {
      throw Error.NOT_IN_GAMESTATE;
    }
    this.placeRandom(this.playerBoard);
    this.placeRandom(this.computerBoard);
    this.stats.alives = this.playerBoard.getAlives();
    this.gameState = this.GameState.PlayerTurn;
    return this.playerBoard.primaryGrid;
  }

  /**
   * Places a piece on the board.
   * 
   * @returns {boolean} Returns true if placed successfully 
   */
  place(board, type, x, y, orientation) {
    if (this.gameState != this.GameState.GameStart) {
      throw Error.NOT_IN_GAMESTATE;
    }
    try {
      return board.placePiece(type, x, y, orientation);
    }
    catch (e) {
      throw e;
    }
  }

  /**
   * Randomly places the available pieces on the board.
   * 
   * @type {void}
   */
  placeRandom(board) {
    if (this.gameState != this.GameState.GameStart) {
      throw Error.NOT_IN_GAMESTATE;
    }
    while (board.piecesAvailable.length > 0) {
      let orientation = Math.round(Math.random()) ? 'h' : 'v';
      let xx = Math.floor(Math.random() * 8) % 8;
      let yy = Math.floor(Math.random() * 8) % 8;
      board.placePiece(board.piecesAvailable[0], xx, yy, orientation);
    }
  }

  /**
   * Shoots at the desired location and returns true if hit.
   * 
   * @param {number} x X position to shoot
   * @param {number} y Y position to shoot
   * @type {void} 
   */
  shoot(x, y) {
    if (this.gameState != this.GameState.PlayerTurn) {
      throw Error.NOT_IN_GAMESTATE;
    }
    try {
      let hit = this.playerBoard.shoot(this.computerBoard, x, y);
      this.gameState = this.GameState.ComputerTurn;
      if (hit) {
        this.stats.hits += 1;
        if (this.computerBoard.getAlives() <= 0) {
          this.gameWinner = 1;
          this.gameState = this.GameState.GameOver;
          if (this.onGameover && typeof this.onGameover === 'function') {
            this.onGameover(this.gameWinner);
          }
        }
      }
      else {
        this.stats.misses += 1;
      }
      return hit;
    }
    catch (e) {
      throw e;
    }
  }

  /**
   * Makes the computer shoot at a random location.
   * 
   * @returns {Object.<string, number>} Returns a dictionary with the position and result of the shoot
   */
  computerShoot() {
    if (this.gameState != this.GameState.ComputerTurn) {
      throw Error.NOT_IN_GAMESTATE;
    }
    let i = 0;
    while (true) {
      try {
        let xx = Math.floor(Math.random() * 8) % 8;
        let yy = Math.floor(Math.random() * 8) % 8;
        let hit = this.computerBoard.shoot(this.playerBoard, xx, yy);
        this.gameState = this.GameState.PlayerTurn;
        this.stats.turns += 1;
        this.stats.alives = this.playerBoard.getAlives();
        if (hit) {          
          if (this.stats.alives <= 0) {
            this.gameWinner = 2;
            this.gameState = this.GameState.GameOver;
            if (this.onGameover && typeof this.onGameover === 'function') {
              this.onGameover(this.gameWinner);
            }
          }
        }
        return {
          x: xx,
          y: yy,
          result: hit
        }
      } catch (e) {
        i++;
      }
    }
  }

  /**
   * Get the number of pieces alives.
   * 
   * @param{Board} The board to look at
   * @returns{number} Returns the number of pieces alives.
   */
  getAlives(board) {
    if (
      this.gameState != this.GameState.PlayerTurn ||
      this.gameState != this.GameState.ComputerTurn
      ) {
      throw Error.NOT_IN_GAMESTATE;
    }
    return board.getAlives();
  }

}

export default Game;