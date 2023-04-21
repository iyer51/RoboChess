const socket = io.connect('http://<your_pi_ip_address>:5000');

socket.on('connect', function() {
  console.log('Connected to server');
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

socket.on('update', function(boardState) {
  const squares = document.querySelectorAll('.square');
  for (let i = 0; i < squares.length; i++) {
    if (boardState[i] === 0) {
      squares[i].removeAttribute('data-piece');
    } else {
      squares[i].setAttribute('data-piece', boardState[i]);
    }
  }
});

let selectedSquare = null;

const deselectSquare = () => {
  if (selectedSquare) {
    selectedSquare.classList.remove('selected');
    selectedSquare = null;
  }
};

let lastMove = null;

const handleClick = (event) => {
  const square = event.target;

  if (!selectedSquare && square.hasAttribute('data-piece')) {
    selectedSquare = square;
    square.classList.add('selected');
  } else if (selectedSquare === square) {
    deselectSquare();
  } else if (selectedSquare && (!square.hasAttribute('data-piece') || square.getAttribute('data-piece') === '')) {
    // Move selected piece to target square
    square.setAttribute('data-piece', selectedSquare.getAttribute('data-piece'));
    selectedSquare.removeAttribute('data-piece');
    deselectSquare();

    const fromIndex = Array.from(selectedSquare.parentElement.children).indexOf(selectedSquare);
    const toIndex = Array.from(square.parentElement.children).indexOf(square);

    // Calculate coordinates of selected piece and target square
    const x1 = fromIndex % 5 + 1;
    const y1 = Math.floor(fromIndex / 5) + 1;
    const x2 = toIndex % 5 + 1;
    const y2 = Math.floor(toIndex / 5) + 1;

    const moveData = { pick: fromIndex, place: toIndex };
  fetch('/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(moveData)
  }).then(response => console.log(response));
  } else if (selectedSquare && square.hasAttribute('data-piece')) {
    // Check if selected piece can capture opponent's piece on target square
    const selectedPiece = selectedSquare.getAttribute('data-piece');
    const opponentPiece = square.getAttribute('data-piece');
    if (selectedPiece && opponentPiece && selectedPiece !== opponentPiece) {
      // Remove opponent's piece from the board
      const opponentPieceType = opponentPiece.charAt(1);
      const opponentPieceColor = opponentPiece.charAt(0);
      const opponentPieceSquare = document.querySelector(`[data-piece="${opponentPiece}"]`);
      if (opponentPieceSquare && opponentPieceColor === 'w') {
        opponentPieceSquare.removeAttribute('data-piece');
      }
      // Move selected piece to target square
      square.setAttribute('data-piece', selectedSquare.getAttribute('data-piece'));
      selectedSquare.removeAttribute('data-piece');

      // Calculate coordinates of selected piece and target square
      const fromIndex = Array.from(selectedSquare.parentElement.children).indexOf(selectedSquare);
      const toIndex = Array.from(square.parentElement.children).indexOf(square);
      const x1 = fromIndex % 5 + 1;
      const y1 = Math.floor(fromIndex / 5) + 1;
      const x2 = toIndex % 5 + 1;
      const y2 = Math.floor(toIndex / 5) + 1;

      const moveData = `${x1},${y1},${x2},${y2}`;
      fetch('/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moveData)
      }).then(response => console.log(response));
    }
    deselectSquare();
  }
};



const squares = document.querySelectorAll('.square');
squares.forEach((square) => {
  square.addEventListener('click', handleClick);
});

let previousBoardState = null;

socket.on('update_board', function (moveData) {
  const [x1, y1, x2, y2] = moveData.split(',');
  const fromIndex = (y1 - 1) * 5 + (x1 - 1);
  const toIndex = (y2 - 1) * 5 + (x2 - 1);
  const fromSquare = squares[fromIndex];
  const toSquare = squares[toIndex];
  const piece = fromSquare.getAttribute('data-piece');
  toSquare.setAttribute('data-piece', piece);
  fromSquare.removeAttribute('data-piece');
});

  // If we got here, no pieces were moved
  previousBoardState = boardState;
});
