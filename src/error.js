/**
 * Dictionary of all the errors
 * 
 * @typedef Error
 * @property {number} OK No error
 * @property {number} FAILED Generic error
 * @property {number} PIECE_TYPE_INVALID The type of piece is invalid
 * @property {number} NO_PIECE_AVAIBLE There are no more available pieces
 * @property {number} OUT_OF_BOUNDS Out of bounds
 * @property {number} ALREADY_SHOOT The cell as already been shoot
 * @property {number} NOT_IN_GAMESTATE Not in the required gamestate
 */
const Error = {
  OK:                   0,
  FAILED:               1,
  PIECE_TYPE_INVALID:   2,
  NO_PIECE_AVAIBLE:       3,
  OUT_OF_BOUNDS:        4,
  ALREADY_SHOOT:        5,
  NOT_IN_GAMESTATE:     6
}

export default Error;