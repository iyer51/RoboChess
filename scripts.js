

//socket.on('update', function(boardState) {
  //const squares = document.querySelectorAll('.square');
  //const boardStateArray = boardState.split(',').map(Number);
  //console.log(boardState)
  //for (i = 0; i < 5; i++){
    //if(boardState[i] == 0){
    //const fromSquare1 = squares[i+5];
    //const toSquare1 = squares[i+10];
    //console.log(i+5);
    //console.log(i+10);
  //}
  //const piece = fromSquare1.getAttribute('data-piece');
  //toSquare1.setAttribute('data-piece', piece);
  //fromSquare1.removeAttribute('data-piece');
//}
//});


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
  
  if(!square.parentElement){
    console.log('clicked element has no parent');
    return;
  }

  if (!selectedSquare && square.hasAttribute('data-piece')) {
    selectedSquare = square;
    square.classList.add('selected');
  } else if (selectedSquare === square) {
    deselectSquare();
  } else if (selectedSquare && (!square.hasAttribute('data-piece') || square.getAttribute('data-piece') === '')) {
    // Move selected piece to target square
    square.setAttribute('data-piece', selectedSquare.getAttribute('data-piece'));
    selectedSquare.removeAttribute('data-piece');
    
    
    const fromIndex = selectedSquare ? Array.from(selectedSquare.parentElement.children).indexOf(selectedSquare) : -1;
    const toIndex = Array.from(square.parentElement.children).indexOf(square);
    deselectSquare();
    // Calculate coordinates of selected piece and target square
    const y1 = fromIndex % 5 + 1;
    const x1 = Math.floor(fromIndex / 5) + 1;
    const y2 = toIndex % 5 + 1;
    const x2 = Math.floor(toIndex / 5) + 1;

    const moveData = { pick: fromIndex, place: toIndex };
    fetch('http://128.46.96.239:5000/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moveData)
  }).then(response => console.log(fromIndex));
    
  
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

      const fromIndex = Array.from(selectedSquare.parentElement.children).indexOf(selectedSquare);    
      const toIndex = Array.from(square.parentElement.children).indexOf(square);
      const y1 = fromIndex % 5 + 1;
      const x1 = Math.floor(fromIndex / 5) + 1;
      const y2 = toIndex % 5 + 1;
      const x2 = Math.floor(toIndex / 5) + 1;

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


