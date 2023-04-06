let selectedSquare = null;

const deselectSquare = () => {
  if (selectedSquare) {
    selectedSquare.classList.remove('selected');
    selectedSquare = null;
  }
};

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
    } else if (selectedSquare && square.hasAttribute('data-piece')) {
      // Check if selected piece can capture opponent's piece on target square
      const selectedPiece = selectedSquare.getAttribute('data-piece');
      const opponentPiece = square.getAttribute('data-piece');
      if (selectedPiece && opponentPiece && selectedPiece !== opponentPiece) {
        // Remove opponent's piece from the board
        square.removeAttribute('data-piece');
        // TODO: Add logic to remove opponent's piece from the game
        // Move selected piece to target square
        square.setAttribute('data-piece', selectedSquare.getAttribute('data-piece'));
        selectedSquare.removeAttribute('data-piece');
      }
      deselectSquare();
    }
  };

const squares = document.querySelectorAll('.square');
squares.forEach((square) => {
  square.addEventListener('click', handleClick);
});

