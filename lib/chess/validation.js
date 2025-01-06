import { getPieceColor, getPieceType } from './pieces';

export const isValidMove = (board, start, end, piece) => {
  const pieceType = getPieceType(piece);
  const pieceColor = getPieceColor(piece);
  
  // Basic validation
  if (start.x === end.x && start.y === end.y) return false;
  if (end.x < 0 || end.x > 7 || end.y < 0 || end.y > 7) return false;
  
  const targetPiece = board[end.y][end.x];
  if (targetPiece && getPieceColor(targetPiece) === pieceColor) return false;

  // Piece-specific movement validation
  switch(pieceType) {
    case 'p': return validatePawnMove(board, start, end, pieceColor);
    case 'r': return validateRookMove(board, start, end);
    case 'n': return validateKnightMove(board, start, end);
    case 'b': return validateBishopMove(board, start, end);
    case 'q': return validateQueenMove(board, start, end);
    case 'k': return validateKingMove(board, start, end);
    default: return false;
  }
};

// Add specific validation functions for each piece type
