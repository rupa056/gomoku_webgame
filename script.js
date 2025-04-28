const boardSize = 10;
let board = [];
let currentPlayer = 1;
let gameOver = false;
let youWins = 0;
let friendWins = 0;
let gamesPlayed = 0;
let winningCells = [];

const boardElement = document.getElementById('board');
const youWinsElement = document.getElementById('youWins');
const friendWinsElement = document.getElementById('friendWins');
const gamesPlayedElement = document.getElementById('gamesPlayed');
const winnerMessage = document.getElementById('winnerMessage');
const canvas = document.getElementById('lineCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = boardElement.offsetWidth;
  canvas.height = boardElement.offsetHeight;
  canvas.style.left = boardElement.offsetLeft + 'px';
  canvas.style.top = boardElement.offsetTop + 'px';
}

function createBoard() {
  boardElement.innerHTML = '';
  board = [];
  for (let row = 0; row < boardSize; row++) {
    board[row] = [];
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', handleCellClick);
      boardElement.appendChild(cell);
      board[row][col] = 0;
    }
  }
  resizeCanvas();
}

function handleCellClick(event) {
  if (gameOver) return;

  const row = event.target.dataset.row;
  const col = event.target.dataset.col;

  if (board[row][col] !== 0) return;

  board[row][col] = currentPlayer;
  const circle = document.createElement('div');
  circle.classList.add('circle', currentPlayer === 1 ? 'you' : 'friend');
  event.target.appendChild(circle);

  if (checkWin(row, col)) {
    showWinner(currentPlayer);
    if (currentPlayer === 1) youWins++;
    else friendWins++;
    gamesPlayed++;
    updateScoreboard();
    gameOver = true;
    drawWinningLine();
    return;
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
}

function checkWin(row, col) {
  row = parseInt(row);
  col = parseInt(col);
  winningCells = [[row, col]];

  function count(dirX, dirY) {
    let count = 0;
    let cells = [];
    let r = row + dirX;
    let c = col + dirY;
    while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === currentPlayer) {
      count++;
      cells.push([r, c]);
      r += dirX;
      c += dirY;
    }
    return { count, cells };
  }

  const directions = [
    { x: 0, y: 1 }, { x: 1, y: 0 },
    { x: 1, y: 1 }, { x: 1, y: -1 }
  ];

  for (const dir of directions) {
    let positive = count(dir.x, dir.y);
    let negative = count(-dir.x, -dir.y);
    if (positive.count + negative.count >= 4) {
      winningCells = winningCells.concat(positive.cells, negative.cells);
      return true;
    }
  }
  winningCells = [];
  return false;
}

function updateScoreboard() {
  youWinsElement.textContent = youWins;
  friendWinsElement.textContent = friendWins;
  gamesPlayedElement.textContent = gamesPlayed;
}

function showWinner(player) {
  if (player === 1) {
    winnerMessage.textContent = `🎉 You Win! 🎉`;
  } else {
    winnerMessage.textContent = `🎉 Your Friend Wins! 🎉`;
  }
  winnerMessage.style.display = 'block';

  confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function drawWinningLine() {
  if (winningCells.length < 2) return;
  const first = winningCells[0];
  const last = winningCells[winningCells.length - 1];

  const firstCell = document.querySelector(`.cell[data-row='${first[0]}'][data-col='${first[1]}']`);
  const lastCell = document.querySelector(`.cell[data-row='${last[0]}'][data-col='${last[1]}']`);

  const rect1 = firstCell.getBoundingClientRect();
  const rect2 = lastCell.getBoundingClientRect();
  const boardRect = boardElement.getBoundingClientRect();

  const x1 = rect1.left + rect1.width/2 - boardRect.left;
  const y1 = rect1.top + rect1.height/2 - boardRect.top;
  const x2 = rect2.left + rect2.width/2 - boardRect.left;
  const y2 = rect2.top + rect2.height/2 - boardRect.top;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.stroke();
}

function startGame() {
  gameOver = false;
  currentPlayer = 1;
  winnerMessage.style.display = 'none';
  winningCells = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  createBoard();
}

window.addEventListener('resize', resizeCanvas);

startGame();
