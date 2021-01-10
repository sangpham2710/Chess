"use strict";
class Board {
    constructor(newGame = true) {
        this.whitePieces = [];
        this.blackPieces = [];
        this.whiteTurn = true;
        this.columnOfPawnFirstMovedTwoSquares = -1;
        this.state = "";
        this.isPromoting = false;
        if (newGame) this.setupNewBoard();
    }
    clone() {
        let tmpBoard = new Board(false);
        for (let i = 0; i < this.whitePieces.length; ++i) {
            tmpBoard.whitePieces.push(this.whitePieces[i].clone());
        }
        for (let i = 0; i < this.blackPieces.length; ++i) {
            tmpBoard.blackPieces.push(this.blackPieces[i].clone());
        }
        tmpBoard.whiteTurn = this.whiteTurn;
        tmpBoard.columnOfPawnFirstMovedTwoSquares = this.columnOfPawnFirstMovedTwoSquares;
        tmpBoard.state = this.state;
        tmpBoard.isPromoting = this.isPromoting;
        return tmpBoard;
    }
    getPromotingPiece() {
        if (this.whiteTurn) {
            for (let i = 0; i < this.whitePieces.length; ++i) {
                if (this.whitePieces[i].constructor.name === "Pawn" && this.whitePieces[i].matPos.x === 0) {
                    return this.whitePieces[i];
                }
            }
        } else {
            for (let i = 0; i < this.blackPieces.length; ++i) {
                if (this.blackPieces[i].constructor.name === "Pawn" && this.blackPieces[i].matPos.x === 7) {
                    return this.blackPieces[i];
                }
            }
        }
    }
    checkPromotion(piece) {
        if (piece.constructor.name === "Pawn") {
            if (this.whiteTurn) {
                if (piece.matPos.x === 0) return true;
            } else {
                if (piece.matPos.x === 7) return true;
            }
        }
        return false;
    }
    setupNewBoard() {
        for (let i = 0; i < 8; ++i) this.whitePieces.push(new Pawn(6, i, true));
        this.whitePieces.push(new Rook(7, 0, true, false));
        this.whitePieces.push(new Rook(7, 7, true, true));
        this.whitePieces.push(new Knight(7, 1, true));
        this.whitePieces.push(new Knight(7, 6, true));
        this.whitePieces.push(new Bishop(7, 2, true));
        this.whitePieces.push(new Bishop(7, 5, true));
        this.whitePieces.push(new Queen(7, 3, true));
        this.whitePieces.push(new King(7, 4, true));
        for (let i = 0; i < 8; ++i) this.blackPieces.push(new Pawn(1, i, false));
        this.blackPieces.push(new Rook(0, 0, false, false));
        this.blackPieces.push(new Rook(0, 7, false, true));
        this.blackPieces.push(new Knight(0, 1, false));
        this.blackPieces.push(new Knight(0, 6, false));
        this.blackPieces.push(new Bishop(0, 2, false));
        this.blackPieces.push(new Bishop(0, 5, false));
        this.blackPieces.push(new Queen(0, 3, false));
        this.blackPieces.push(new King(0, 4, false));
    }
    getNewBoard(r, c, u, v) {
        let board = this.clone();
        let piece = board.getPieceAt(r, c);
        if (board.isInside(u, v) && !piece.isSamePos(u, v) && piece.canMove(board, u, v)) {
            board.resetPawnMoved();
            piece.move(board, u, v);
            return board;
        } else return null;
    }
    generatesAllPossibleMoves() {
        let moves = [];
        if (this.whiteTurn) {
            for (let i = 0; i < this.whitePieces.length; ++i) {
                for (let r = 0; r < 8; ++r) for (let c = 0; c < 8; ++c) {
                    if (this.isMoveable(this.whitePieces[i], r, c)) {
                        let tmpBoard = this.getNewBoard(this.whitePieces[i].matPos.x, this.whitePieces[i].matPos.y, r, c);
                        moves.push(tmpBoard);
                    }
                }
            }
        } else {
            for (let i = 0; i < this.blackPieces.length; ++i) {
                for (let r = 0; r < 8; ++r) for (let c = 0; c < 8; ++c) {
                    if (this.isMoveable(this.blackPieces[i], r, c)) {
                        let tmpBoard = this.getNewBoard(this.blackPieces[i].matPos.x, this.blackPieces[i].matPos.y, r, c);
                        moves.push(tmpBoard);
                    }
                }
            }
        }
        return moves;
    }
    display() {
        for (let i = 0; i < this.whitePieces.length; ++i) {
            if (!this.whitePieces[i].moving) this.whitePieces[i].display();
        }
        for (let i = 0; i < this.blackPieces.length; ++i) {
            if (!this.blackPieces[i].moving) this.blackPieces[i].display();
        }
        if (movingPiece != null) movingPiece.display();
    }
    resetPawnMoved() {
        if (this.whiteTurn) {
            for (let i = 0; i < this.whitePieces.length; ++i) {
                if (this.whitePieces[i].constructor.name === "Pawn") {
                    if (this.whitePieces[i].columnOfPawnFirstMovedTwoSquares > 0) this.whitePieces[i].columnOfPawnFirstMovedTwoSquares = -1;
                }
            }
        } else {
            for (let i = 0; i < this.blackPieces.length; ++i) {
                if (this.blackPieces[i].constructor.name === "Pawn") {
                    if (this.blackPieces[i].columnOfPawnFirstMovedTwoSquares > 0) this.blackPieces[i].columnOfPawnFirstMovedTwoSquares = -1;
                }
            }
        }
    }
    isInside(r, c) {
        return 0 <= r && r < 8 && 0 <= c && c < 8;
    }
    isEmpty(r, c) {
        return this.getPieceAt(r, c) === null;
    }
    isFree(r, c) {
        return this.isEmpty(r, c) || (!this.isEmpty(r, c) && this.getPieceAt(r, c).white !== this.whiteTurn);
    }
    isAlly(r, c) {
        return !this.isEmpty(r, c) && this.getPieceAt(r, c).white === this.whiteTurn;
    }
    isEnemy(r, c) {
        return !this.isEmpty(r, c) && this.getPieceAt(r, c).white !== this.whiteTurn;
    }
    isSafe(r, c) { // return true if cell (r, c) is safe for the board's turn
        let newBoard = this.clone();
        if (newBoard.whiteTurn) {
            let king = newBoard.whitePieces.find((tmp) => tmp.constructor.name === "King");
            king.move(newBoard, r, c);
            newBoard.whiteTurn = !newBoard.whiteTurn;
            for (let i = 0; i < newBoard.blackPieces.length; ++i) {
                if (newBoard.blackPieces[i].canMove(newBoard, r, c, true)) return false;
            }
            return true;
        } else {
            let king = newBoard.blackPieces.find((tmp) => tmp.constructor.name === "King");
            king.move(newBoard, r, c);
            newBoard.whiteTurn = !newBoard.whiteTurn;
            for (let i = 0; i < newBoard.whitePieces.length; ++i) {
                if (newBoard.whitePieces[i].canMove(newBoard, r, c, true)) return false;
            }
            return true;
        }
    }
    isMoveable(p, r, c) {
        let board = this.clone();
        let piece = board.getPieceAt(p.matPos.x, p.matPos.y);
        if (board.isInside(r, c) && !piece.isSamePos(r, c) && piece.canMove(board, r, c)) {
            board.resetPawnMoved();
            piece.move(board, r, c);
            if (this.whiteTurn) {
                let king = board.whitePieces.find((tmp) => tmp.constructor.name === "King");
                if (board.isSafe(king.matPos.x, king.matPos.y)) return true;
                else return false;
            } else {
                let king = board.blackPieces.find((tmp) => tmp.constructor.name === "King");
                if (board.isSafe(king.matPos.x, king.matPos.y)) return true;
                else return false;
            }
        }
        return false;
    }
    checkMate() {
        let moves = this.generatesAllPossibleMoves();
        if (this.whiteTurn) {
            let king = this.whitePieces.find((tmp) => tmp.constructor.name === "King");
            if (this.isSafe(king.matPos.x, king.matPos.y)) return false;
            if (moves.length === 0) return true;
            else return false;
        } else {
            let king = this.blackPieces.find((tmp) => tmp.constructor.name === "King");
            if (this.isSafe(king.matPos.x, king.matPos.y)) return false;
            if (moves.length === 0) return true;
            else return false;
        }
    }
    staleMate() {
        let moves = this.generatesAllPossibleMoves();
        if (this.whiteTurn) {
            let king = this.whitePieces.find((tmp) => tmp.constructor.name === "King");
            if (!this.isSafe(king.matPos.x, king.matPos.y)) return false;
            if (moves.length === 0) return true;
            else return false;
        } else {
            let king = this.blackPieces.find((tmp) => tmp.constructor.name === "King");
            if (!this.isSafe(king.matPos.x, king.matPos.y)) return false;
            if (moves.length === 0) return true;
            else return false;
        }
    }
    getPieceAt(r, c) {
        if (!this.isInside(r, c)) return null;
        for (let i = 0; i < this.whitePieces.length; ++i) {
            if (this.whitePieces[i].matPos.x === r && this.whitePieces[i].matPos.y === c)
                return this.whitePieces[i];
        }
        for (let i = 0; i < this.blackPieces.length; ++i) {
            if (this.blackPieces[i].matPos.x === r && this.blackPieces[i].matPos.y === c)
                return this.blackPieces[i];
        }
        return null;
    }
    removePiece(tmpPiece) {
        if (tmpPiece.constructor.name === "Rook") {
            if (this.whiteTurn) {
                let king = board.blackPieces.find((tmp) => tmp.constructor.name === "King");
                if (tmpPiece.isKingSide) king.canCastleKingSide = false;
                else king.canCastleQueenSide = false;
            } else {
                let king = board.whitePieces.find((tmp) => tmp.constructor.name === "King");
                if (tmpPiece.isKingSide) king.canCastleKingSide = false;
                else king.canCastleQueenSide = false;
            }
        }
        if (tmpPiece.white) this.whitePieces.splice(this.whitePieces.findIndex((tmp) => tmp === tmpPiece), 1);
        else this.blackPieces.splice(this.blackPieces.findIndex((tmp) => tmp === tmpPiece), 1);
    }
}