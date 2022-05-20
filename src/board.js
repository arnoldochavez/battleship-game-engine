import Error from './error.js';
/**
 * The board class.
 *
 * @class
 * @classdesc Store, manipulate and display the primary and tracking grids.
 */
class Board {

  /**
   * Create a new board.
   *
   * @param {number} size Size of both grids (primary and tracking)
   */
  constructor(size) {

    /**
     * Enum for the state of a cell in the grid. 
     * 
     * @public
     * @type {Object.<string, number>}
     */
    this.CellState = {
      Empty: 0,
      PieceMiddleHorizontal: 1,
      PieceMiddleVertical: 2,
      PieceLeft: 3,
      PieceRight: 4,
      PieceTop: 5,
      PieceBottom: 6,
      Miss: 7,
      Hit: 8
    };

    /**
     * Dictionary of piece types and his length.
     * 
     * @public
     * @type {Object.<string, number>}
     */
    this.PieceType = {
      Destroyer: 2,
      Cruiser: 3,
      Submarine: 3,
      Battleship: 4,
      Carrier: 5
    };

    /**
     * Size of both grids. 
     * 
     * @public
     * @type {number}
     */
    this.size = size;

    /**
     * Primary grid, stores the ships.
     *
     * @public
     * @type {Array.<Array.<number>>}
     */
    this.primaryGrid = [];

    /**
     * Tracking grid, stores the attacking marks.
     *
     * @public
     * @type {Array.<Array.<number>>}
     */
    this.trackingGrid = [];

    /**
     * Pieces available to place.
     * 
     * @public
     * @type {Array.<string, number>}
     */
    this.piecesAvailable = [];

    for (let i = 0; i < this.size; i++) {
      this.primaryGrid.push([]);
      this.trackingGrid.push([]);
      for (let j = 0; j < this.size; j++) {
        this.primaryGrid[i].push(0);
        this.trackingGrid[i].push(0);
      }
    }
  }

  /**
   * Initializates/resets the board.
   * 
   * @public
   * @type {void}
   */
  init() {
    this.piecesAvailable = [
      'Destroyer',
      'Cruiser',
      'Submarine',
      'Battleship',
      'Carrier'
    ];

    for (let yy = 0; yy < this.size; yy++) {
      for (let xx = 0; xx < this.size; xx++) {
        this.primaryGrid[yy][xx] = this.CellState.Empty;
        this.trackingGrid[yy][xx] = this.CellState.Empty;
      }
    }
  }

  /**
   * Prints the board into the console.
   * 
   * @public
   * @param {string} [grid=] Can be "tracking" or "t", "primary" or "p", or empty for both
   * @type {void}
   */
  print(grid = '') {
    switch (grid) {
      case 'tracking': case 't':
        this._printTrackingGrid();
        break;
      case 'primary': case 'p':
        this._printPrimaryGrid();
        break;
      default:
        this._printTrackingGrid();
        this._printPrimaryGrid();
    }
  }

  /**
   * Place a piece on the primary board
   * 
   * @public
   * @param {string} type Type of ship, can be Destroyer, Cruiser and Batttleship
   * @param {number} x Position X of the piece
   * @param {number} y Position Y of the piece
   * @param {string} orientation Can be "horizontal" or "h", or "vertical" or "v"
   * @returns {boolean} Returns true if the piece was placed successfully
   */
  placePiece(type, x, y, orientation) {
    if (!this.PieceType[type]) {
      throw Error.PIECE_TYPE_INVALID;
    }
    let pieceIndex = this.piecesAvailable.indexOf(type);
    if (pieceIndex == -1) {
      throw Error.NO_PIECE_AVAIBLE;
    }
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
      throw Error.OUT_OF_BOUNDS;
    }
    let pieceLength = this.PieceType[type];
    let offset = Math.ceil(pieceLength / 2) - 1;
    if (orientation == 'horizontal' || orientation == 'h') {
      x = Math.max(Math.min(x, this.size - (pieceLength - offset)), offset);
      y = Math.max(Math.min(y, this.size - 1), 0);
      if (x - offset >= 0 && x + (pieceLength - offset) <= this.size) {
        for (let i = 0; i < pieceLength; i++) {
          if (this._isCellOccupied(x - offset + i, y)) {
            return false;
          }
        }
        for (let i = 0; i < pieceLength; i++) {
          if (i == 0) {
            this.primaryGrid[y][x - offset + i] = this.CellState.PieceLeft;
          }
          else if (i == pieceLength - 1) {
            this.primaryGrid[y][x - offset + i] = this.CellState.PieceRight;
          }
          else {
            this.primaryGrid[y][x - offset + i] = this.CellState.PieceMiddleHorizontal;
          }
        }
        this.piecesAvailable.splice(pieceIndex, 1);
        return true;
      }
    }
    else if (orientation == 'vertical' || orientation == 'v') {
      x = Math.max(Math.min(x, this.size - 1), 0);
      y = Math.max(Math.min(y, this.size - (pieceLength - offset)), offset);
      if (y - offset >= 0 && y + (pieceLength - offset) <= this.size) {
        for (let i = 0; i < pieceLength; i++) {
          if (this._isCellOccupied(x, y - offset + i)) {
            return false;
          }
        }
        for (let i = 0; i < pieceLength; i++) {
          if (i == 0) {
            this.primaryGrid[y - offset + i][x] = this.CellState.PieceTop;
          }
          else if (i == pieceLength - 1) {
            this.primaryGrid[y - offset + i][x] = this.CellState.PieceBottom;
          }
          else {
            this.primaryGrid[y - offset + i][x] = this.CellState.PieceMiddleVertical;
          }
        }
        this.piecesAvailable.splice(pieceIndex, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Shoots to a cell in the desired board.
   * 
   * @public
   * @param {string} type Type of ship, can be Destroyer, Cruiser and Batttleship
   * @param {number} x Position X of the piece
   * @param {number} y Position Y of the piece
   * @returns {boolean} Returns true if the shoot hit a piece
   */
  shoot(board, x, y) {
    if (board._isCellBeenShoot(x, y)) {
      throw Error.ALREADY_SHOOT;
    }
    if (!board._isCellOccupied(x, y)) {
      this.trackingGrid[y][x] = this.CellState.Miss;
      board.primaryGrid[y][x] = this.CellState.Miss;
      return false;
    }
    this.trackingGrid[y][x] = this.CellState.Hit;
    board.primaryGrid[y][x] = this.CellState.Hit;
    return true;
  }

  /**
   * Get all the alives pieces on the board.
   * 
   * @returns {number} Returns the number of alive pieces
   */
  getAlives() {
    let alives = 0;
    for (let yy = 0; yy < this.size; yy++) {
      for (let xx = 0; xx < this.size; xx++) {
        if (this._isCellOccupied(xx, yy)) {
          alives += 1;
        }
      }
    }
    return alives;
  }

  /**
   * Checks if a cell is occupied.
   *  
   * @private
   * @returns {boolean} Returns true if the cell is occupied
   */
  _isCellOccupied(x, y) {
    return (
      this.primaryGrid[y][x] == this.CellState.PieceMiddleHorizontal ||
      this.primaryGrid[y][x] == this.CellState.PieceMiddleVertical ||
      this.primaryGrid[y][x] == this.CellState.PieceLeft ||
      this.primaryGrid[y][x] == this.CellState.PieceRight ||
      this.primaryGrid[y][x] == this.CellState.PieceTop ||
      this.primaryGrid[y][x] == this.CellState.PieceBottom
    )
  }

  /**
   * Checks if a cell has been shoot.
   *  
   * @private
   * @returns {boolean} Returns true if the cell has been shoot
   */
  _isCellBeenShoot(x, y) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
      throw Error.OUT_OF_BOUNDS;
    }
    return (
      this.primaryGrid[y][x] == this.CellState.Hit ||
      this.primaryGrid[y][x] == this.CellState.Miss
    );
  }

  /**
   * Prints the primary grid into the console.
   *  
   * @private
   * @type {void}
   */
  _printPrimaryGrid() {
    this._printGrid(this.primaryGrid, 'SHIPS', 'bottom');
  }

  /**
   * Prints the tracking grid into the console.
   *  
   * @private
   * @type {void}
   */
  _printTrackingGrid() {
    this._printGrid(this.trackingGrid, 'TRACKING', 'top');
  }

  /**
   * Prints a grid into the console.
   *  
   * @private
   * @param {Array<Array<string>>} grid Grid that will be printed in the console
   * @param {string} [tag] Tag to use in the grid
   * @param {string} [tagPosition=top] Position of the tag, can be 'top' or 'bottom'
   * @type {void}
   */
  _printGrid(grid, tag, tagPosition) {
    let gridStr = '';
    if (tag != '' && (tagPosition == '' || tagPosition == 'top')) {
      gridStr += (' ').repeat(this.size - Math.ceil(tag.length / 2) + 4) + tag + (' ').repeat(this.size - Math.floor(tag.length / 2));
      gridStr += '\n';
      gridStr += '    '
      for (let xx = 0; xx < this.size; xx++) {
        gridStr += xx + ' ';
      }
      gridStr += '\n';
    }
    for (let yy = 0; yy < this.size; yy++) {
      if (yy == 0) {
        gridStr += '  ╔' + ('═').repeat((this.size * 2) + 1) + '╗\n'
      }
      for (let xx = 0; xx < this.size; xx++) {
        if (xx == 0) {
          gridStr += yy + ' ║ '
        }
        gridStr += this._cellToChar(grid[yy][xx]) + ' ';
        if (xx == this.size - 1) {
          gridStr += '║'
        }
      }
      gridStr += '\n';
      if (yy == this.size - 1) {
        gridStr += '  ╚' + ('═').repeat((this.size * 2) + 1) + '╝'
      }
    }
    if (tag != '' && (tagPosition == 'bottom')) {
      gridStr += '\n';
      gridStr += '    '
      for (let xx = 0; xx < this.size; xx++) {
        gridStr += xx + ' ';
      }
      gridStr += '\n';
      gridStr += (' ').repeat(this.size - Math.ceil(tag.length / 2) + 4) + tag + (' ').repeat(this.size - Math.floor(tag.length / 2));
    }
    console.log(gridStr);
  }

  /**
   * Converts the cell value to a character.
   * 
   * @private
   * @param {number} cellState The cell state
   * @returns {string} Returns the character representing the cell
   */
  _cellToChar(cellState) {
    switch (cellState) {
      case this.CellState.Empty:
        return ' ';
      case this.CellState.PieceMiddleHorizontal:
        return '■';
      case this.CellState.PieceMiddleVertical:
        return '■';
      case this.CellState.PieceLeft:
        return '◄';
      case this.CellState.PieceRight:
        return '►';
      case this.CellState.PieceTop:
        return '▲';
      case this.CellState.PieceBottom:
        return '▼';
      case this.CellState.Miss:
        return '·';
      case this.CellState.Hit:
        return 'x';
      default:
        return '?';
    }
  }

}

export default Board;