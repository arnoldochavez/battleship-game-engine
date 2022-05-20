const game = new BGE.Game();

console.log(`╔════════════════════════════════════════╗
║                   __/___               ║
║             _____/______|              ║
║     _______/_____\\_______\\_____        ║
║     \\              < < <       |       ║
║~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~║
║   WELCOME TO BATTLESHIP GAME ENGINE    ║
║            CONSOLE EDITION             ║
╠════════════════════════════════════════╣
║    Invoke help() for instructions      ║
╚════════════════════════════════════════╝`);

function help() {
  console.clear();
  console.log(`startGame()                       Starts and resets the game
startTurn()                       Starts the turn and place all left pieces randomly
stats()                           Shows the stats of the game
place(type, x, y, orientation)    Places a piece in the desired position and orientation
                                    type        = Can be "Destroyer", "Cruiser" or "Battleship"
                                    x           = Position x on the grid
                                    y           = Position y on the grid
                                    orientation = Can be "horizontal" or "h", "vertical" or "v"
shoot(x, y)                       Shoots at the desired position
                                    x           = Position x on the grid
                                    y           = Position y on the grid
board()                           Prints the player board`);
}

game.onGameover = (winner) => {
  console.clear();
  game.playerBoard.print();
  if (winner == 1) {
    console.log(`========================
THE PLAYER IS THE WINNER
========================`);
  }
  else if (winner == 2) {
    console.log(`==========================
THE COMPUTER IS THE WINNER
==========================`);
  }
  console.log('Invoke "gameStart()" to play again');
}

function startGame() {
  game.startGame();
  console.clear();
  _placeMsg();
}

function startTurn() {
  console.clear();
  try {
    game.startTurn();
    game.playerBoard.print();
    console.log('Player turn');
    console.log('Invoke "shoot(x, y)"');
  } catch (e) {
    if (e == BGE.Error.NOT_IN_GAMESTATE) {
      console.log('You can not invoke this right now');
    }
    else {
      throw e;
    }
  }
}

function stats() {
  let log = 'Stats\n';
  for (let key in game.stats) {
    log += `  ${key} = ${game.stats[key]}\n`;
  }
  console.clear();
  console.log(log);
}

function place(type, x, y, orientation) {
  console.clear();
  try {
    let result = game.place(game.playerBoard, type, x, y, orientation);
    _placeMsg();
    if (!result) {
      console.log('This place is invalid or already occupied');
    }
  } catch (e) {
    if (e == BGE.Error.PIECE_TYPE_INVALID) {
      console.log('Invalid piece');
    }
    else if (e == BGE.Error.NO_PIECE_AVAIBLE) {
      _placeMsg();
      console.log('No more of those pieces to place');
    }
    else if (e == BGE.Error.OUT_OF_BOUNDS) {
      console.log('Position out of the grid');
    }
    else if (e == BGE.Error.NOT_IN_GAMESTATE) {
      console.log('Can not place pieces in this moment');
    }
    else {
      throw e;
    }
  }
}

function shoot(x, y) {
  console.clear();
  let playerShootResult, computerShootResult;
  try {
    playerShootResult = game.shoot(x, y);
  }
  catch (e) {
    if (e == BGE.Error.ALREADY_SHOOT) {
      game.playerBoard.print();
      console.log('That position has been already shoot');
    }
    else if (e == BGE.Error.OUT_OF_BOUNDS) {
      game.playerBoard.print();
      console.log('The position is out of bounds');
    }
    else if (e == BGE.Error.NOT_IN_GAMESTATE) {
      console.log('You can not invoke this right now');
    }
    else {
      throw e;
    }
    return;
  }
  if (game.gameState == game.GameState.GameOver) {
    return
  }
  computerShootResult = game.computerShoot();
  if (game.gameState == game.GameState.GameOver) {
    return
  }
  game.playerBoard.print();
  console.log('Player shoot at: x = ' + x + ' | y = ' + y + ' | ' + (playerShootResult ? 'Hit' : 'Miss'));
  console.log('Enemy shoot at: x = ' + computerShootResult.x + ' | y = ' + computerShootResult.y + ' | ' + (computerShootResult.result ? 'Hit' : 'Miss'));
}

function board() {
  console.clear();
  game.playerBoard.print();
}

function _placeMsg() {  
  game.playerBoard.print('p');
  console.log('Place the ships using "place(type, x, y, orientation)" or "startTurn()" to place randomly');
  if (game.playerBoard.piecesAvailable.length == 0) {
    console.log('No more pieces left invoke "startGame()" again to start playing');
  }
  else {
    let log = 'Pieces available:\n';
    log += '---------------------\n';
    log += 'Piece          | Size\n';
    log += '---------------------\n';
    for (let i=0; i<game.playerBoard.piecesAvailable.length; i++) {
      let piece = game.playerBoard.piecesAvailable[i];
      log += piece + (' ').repeat(15 - piece.length) + '| ' + game.playerBoard.PieceType[piece] + '\n';
    }
    console.log(log);
  }
}