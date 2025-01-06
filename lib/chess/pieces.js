export const PIECES = {
    KING: 'k',
    QUEEN: 'q',
    ROOK: 'r',
    BISHOP: 'b',
    KNIGHT: 'n',
    PAWN: 'p'
  };
  
  export const getPieceColor = (piece) => {
    if (!piece) return null;
    return piece.toLowerCase() === piece ? 'black' : 'white';
  };
  
  export const getPieceType = (piece) => {
    return piece.toLowerCase();
  };
  