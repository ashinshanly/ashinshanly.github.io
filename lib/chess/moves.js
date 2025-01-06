export const calculatePossibleMoves = (board, position) => {
    const piece = board[position.y][position.x];
    if (!piece) return [];
  
    const moves = [];
    // Calculate all possible moves for the piece
    // Add logic for each piece type
    return moves;
  };
  
  export const isCheck = (board, kingColor) => {
    // Check if the king is in check
    return false;
  };
  
  export const isCheckmate = (board, kingColor) => {
    // Check if the king is in checkmate
    return false;
  };
  