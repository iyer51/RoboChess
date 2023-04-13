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

socket.on('update_board', function (boardState) {
  if (!previousBoardState) {
    previousBoardState = boardState;
    return;
  }

  for (let i = 0; i < 25; i++) {
    if (boardState[i] === 1 && previousBoardState[i] === 0) {
      // A piece was moved to this square
      const toSquare = squares[i];
      const fromIndex = previousBoardState.indexOf(1);
      const fromSquare = squares[fromIndex];
      const piece = fromSquare.getAttribute('data-piece');
      toSquare.setAttribute('data-piece', piece);
      fromSquare.removeAttribute('data-piece');

      previousBoardState = boardState;
      return;
    }
  }

  // If we got here, no pieces were moved
  previousBoardState = boardState;
});
