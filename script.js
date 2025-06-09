// Gameboard Module
const Gameboard = (() => {
  let board = ["", "", "", "", "", "", "", "", ""];

  const getBoard = () => board;

  const setMark = (index, marker) => {
    if (board[index] === "") {
      board[index] = marker;
      return true;
    }
    return false;
  };

  const reset = () => {
    board = ["", "", "", "", "", "", "", "", ""];
  };

  return { getBoard, setMark, reset };
})();

// Player Factory
const Player = (name, marker, isAI = false) => {
  return { name, marker, isAI };
};

// Game Controller Module with Minimax AI
const GameController = (() => {
  let player1, player2, currentPlayer, isOver = false;

  const startGame = (name1, name2, vsAI = false) => {
    player1 = Player(name1 || "Player 1", "X");
    player2 = vsAI ? Player(name2 || "Computer", "O", true) : Player(name2 || "Player 2", "O");
    currentPlayer = player1;
    isOver = false;
    Gameboard.reset();
    DisplayController.render();
    DisplayController.setMessage(`${currentPlayer.name}'s Turn`);
    if (currentPlayer.isAI) aiMove();
  };

  const playTurn = (index) => {
    if (isOver || !Gameboard.setMark(index, currentPlayer.marker)) return;

    DisplayController.render();

    if (checkWinner(currentPlayer.marker)) {
      DisplayController.setMessage(`${currentPlayer.name} Wins!`);
      isOver = true;
      return;
    }

    if (Gameboard.getBoard().every(cell => cell !== "")) {
      DisplayController.setMessage("It's a Tie!");
      isOver = true;
      return;
    }

    currentPlayer = currentPlayer === player1 ? player2 : player1;
    DisplayController.setMessage(`${currentPlayer.name}'s Turn`);

    if (currentPlayer.isAI && !isOver) {
      setTimeout(aiMove, 500);
    }
  };

  const aiMove = () => {
    const bestMove = getBestMove();
    playTurn(bestMove);
  };

  const getBestMove = () => {
    const board = Gameboard.getBoard().slice();

    const minimax = (newBoard, depth, isMaximizing) => {
      const winner = evaluate(newBoard);
      if (winner !== null) return winner;

      const emptySpots = newBoard.map((val, idx) => val === "" ? idx : null).filter(i => i !== null);
      if (isMaximizing) {
        let bestScore = -Infinity;
        let bestIndex = null;
        for (let index of emptySpots) {
          newBoard[index] = player2.marker;
          let score = minimax(newBoard, depth + 1, false);
          newBoard[index] = "";
          if (score > bestScore) {
            bestScore = score;
            bestIndex = index;
          }
        }
        return depth === 0 ? bestIndex : bestScore;
      } else {
        let bestScore = Infinity;
        for (let index of emptySpots) {
          newBoard[index] = player1.marker;
          let score = minimax(newBoard, depth + 1, true);
          newBoard[index] = "";
          if (score < bestScore) {
            bestScore = score;
          }
        }
        return bestScore;
      }
    };

    return minimax(board, 0, true);
  };

  const evaluate = (board) => {
    const winConditions = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];

    for (let [a,b,c] of winConditions) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        if (board[a] === player2.marker) return 10;
        if (board[a] === player1.marker) return -10;
      }
    }

    if (board.every(cell => cell !== "")) return 0;
    return null;
  };

  const checkWinner = (marker) => {
    const b = Gameboard.getBoard();
    const winConditions = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    return winConditions.some(combo => combo.every(i => b[i] === marker));
  };

  const restart = () => {
    if (!player1 || !player2) return;
    startGame(player1.name, player2.name, player2.isAI);
  };

  return { startGame, playTurn, restart };
})();

// Display Controller Module
const DisplayController = (() => {
  const boardContainer = document.getElementById("gameboard");
  const messageEl = document.getElementById("message");

  const render = () => {
    boardContainer.innerHTML = "";
    Gameboard.getBoard().forEach((mark, index) => {
      const square = document.createElement("div");
      square.classList.add("square");
      square.textContent = mark;
      square.addEventListener("click", () => GameController.playTurn(index));
      boardContainer.appendChild(square);
    });
  };

  const setMessage = (msg) => {
    messageEl.textContent = msg;
  };

  return { render, setMessage };
})();

// Event Listeners
document.getElementById("start").addEventListener("click", () => {
  const name1 = document.getElementById("player1").value;
  const name2 = document.getElementById("player2").value;
  const vsAI = name2.trim().toLowerCase() === "ai" || name2.trim().toLowerCase() === "computer";
  GameController.startGame(name1, name2, vsAI);
});

document.getElementById("restart").addEventListener("click", () => {
  GameController.restart();
});
