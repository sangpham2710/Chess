"use strict";
class Piece {
    constructor(r, c, white) {
        this.matPos = createVector(r, c);
        this.pxPos = createVector(c * D, r * D);
        this.white = white;
        this.sprite = null;
        this.moving = false;
    }
    display() {
        if (this.moving) {
            imageMode(CENTER);
            image(this.sprite, mouseX, mouseY, D * 1.2, D * 1.2);
        } else {
            imageMode(CORNER);
            image(this.sprite, this.matPos.y * D, this.matPos.x * D, D, D);
        }
    }
    isSamePos(r, c) {
        return this.matPos.x === r && this.matPos.y === c;
    }
    canMoveTowards(board, r, c) {
        if (!board.isInside(r, c)) return false;
        if (this.isSamePos(r, c)) return true;
        if (r === this.matPos.x) { // horizontal
            let d = (c - this.matPos.y) / abs(c - this.matPos.y);
            let u = this.matPos.x;
            for (let v = this.matPos.y + d; v !== c; v += d) {
                if (!board.isEmpty(u, v)) return false;
            }
            return true;
        } else if (c === this.matPos.y) { // vertical
            let d = (r - this.matPos.x) / abs(r - this.matPos.x);
            let v = this.matPos.y;
            for (let u = this.matPos.x + d; u !== r; u += d) {
                if (!board.isEmpty(u, v)) return false;
            }
            return true;
        } else { // diagonal
            if (abs(r - this.matPos.x) !== abs(c - this.matPos.y)) return false;
            let dr = (r - this.matPos.x) / abs(r - this.matPos.x);
            let dc = (c - this.matPos.y) / abs(c - this.matPos.y);
            for (
                let u = this.matPos.x + dr, v = this.matPos.y + dc;
                u !== r || v !== c; 
                u += dr, v += dc
                ) {
                if (!board.isEmpty(u, v)) return false;
            }
            return true;
        }
    }
}

class Pawn extends Piece {
    constructor(r, c, white) {
        super(r, c, white);
        if (white) this.sprite = pieces[5];
        else this.sprite = pieces[11];
        // moved = 0 if hasn't been moved
        // moved = 1 or moved = 2 if moved one or two squares in first move
        // moved = -1 if this is not the first move anymore
        this.moved = 0;
    }
    clone() {
        let tmpPiece = new Pawn(this.matPos.x, this.matPos.y, this.white);
        tmpPiece.moved = this.moved;
        return tmpPiece;
    }
    move(board, r, c) {
        // check capturing
        if (board.whiteTurn) {
            if (board.columnOfPawnFirstMovedTwoSquares === c && r === 2 && this.matPos.x === 3 && abs(c - this.matPos.y) === 1) { // en passant
                board.removePiece(board.getPieceAt(3, c));
            }
        } else {
            if (board.columnOfPawnFirstMovedTwoSquares === c && r === 5 && this.matPos.x === 4 && abs(c - this.matPos.y) === 1) { // en passant
                board.removePiece(board.getPieceAt(4, c));
            }
        }
        if (!board.isEmpty(r, c)) {
            board.removePiece(board.getPieceAt(r, c));
            this.moved = -1;
        } else {
            if (this.moved === 0) {
                this.moved = abs(r - this.matPos.x) + abs(c - this.matPos.y);
            } else this.moved = -1;
        }
        board.columnOfPawnFirstMovedTwoSquares = (this.moved === 2 ? c : -1);
        this.matPos = createVector(r, c);
        this.pxPos = createVector(c * D, r * D);
    }
    canMove(board, r, c, captureOnly = false) {
        if (captureOnly) {
            if (this.white) {
                if (abs(c - this.matPos.y) === 1) { // capture
                    if (r === this.matPos.x - 1) return true;
                }
                return false;
            } else {
                if (abs(c - this.matPos.y) === 1) { // capture
                    if (r === this.matPos.x + 1) return true;
                }
                return false;
            }
        }
        if (this.white) { // white
            if (board.columnOfPawnFirstMovedTwoSquares === c && r === 2 && this.matPos.x === 3 && abs(c - this.matPos.y) === 1) { // en passant
                return true;
            }
            if (abs(c - this.matPos.y) > 1) return false;
            if (abs(c - this.matPos.y) === 1) { // capture
                if (r === this.matPos.x - 1 && board.isEnemy(r, c)) return true;
                else return false;
            } else if (this.moved === 0) {
                if (r === this.matPos.x - 2 && board.isEmpty(r + 1, c) && board.isEmpty(r, c)) return true;
                else if (r === this.matPos.x - 1 && board.isEmpty(r, c)) return true;
                else return false;
            } else {
                if (r === this.matPos.x - 1 && board.isEmpty(r, c)) return true;
                else return false;
            }
        } else { // black
            if (board.columnOfPawnFirstMovedTwoSquares === c && r === 5 && this.matPos.x === 4 && abs(c - this.matPos.y) === 1) { // en passant
                return true;
            }
            if (abs(c - this.matPos.y) > 1) return false;
            if (abs(c - this.matPos.y) === 1) { // capture
                if (r === this.matPos.x + 1 && board.isEnemy(r, c)) return true;
                else return false;
            } else if (this.moved === 0) {
                if (r === this.matPos.x + 2 && board.isEmpty(r - 1, c) && board.isEmpty(r, c)) return true;
                else if (r === this.matPos.x + 1 && board.isEmpty(r, c)) return true;
                else return false;
            } else {
                if (r === this.matPos.x + 1 && board.isEmpty(r, c)) return true;
                else return false;
            }
        }
    }
}

class Rook extends Piece {
    constructor(r, c, white, isKingSide) {
        super(r, c, white);
        if (white) this.sprite = pieces[4];
        else this.sprite = pieces[10];
        this.isKingSide = isKingSide;
    }
    clone() {
        let tmpPiece = new Rook(this.matPos.x, this.matPos.y, this.white);
        tmpPiece.isKingSide = this.isKingSide;
        return tmpPiece;
    }
    move(board, r, c) {
        if (!board.isEmpty(r, c)) board.removePiece(board.getPieceAt(r, c));
        this.matPos = createVector(r, c);
        this.pxPos = createVector(c * D, r * D);
        if (this.white) {
            let king = board.whitePieces.find((tmp) => tmp.constructor.name === "King");
            if (this.isKingSide) king.canCastleKingSide = false;
            else king.canCastleQueenSide = false;
        } else {
            let king = board.blackPieces.find((tmp) => tmp.constructor.name === "King");
            if (this.isKingSide) king.canCastleKingSide = false;
            else king.canCastleQueenSide = false;
        }
    }
    canMove(board, r, c) {
        if (r !== this.matPos.x && c !== this.matPos.y) return false;
        if (this.canMoveTowards(board, r, c) && board.isFree(r, c)) return true;
        else return false;
    }
}

class Bishop extends Piece {
    constructor(r, c, white) {
        super(r, c, white);
        if (white) this.sprite = pieces[2];
        else this.sprite = pieces[8];
    }
    clone() {
        let tmpPiece = new Bishop(this.matPos.x, this.matPos.y, this.white);
        return tmpPiece;
    }
    move(board, r, c) {
        if (!board.isEmpty(r, c)) board.removePiece(board.getPieceAt(r, c));
        this.matPos = createVector(r, c);
        this.pxPos = createVector(c * D, r * D);
    }
    canMove(board, r, c) {
        if (abs(r - this.matPos.x) !== abs(c - this.matPos.y)) return false;
        if (this.canMoveTowards(board, r, c) && board.isFree(r, c)) return true;
        else return false;
    }
}

class Queen extends Piece {
    constructor(r, c, white) {
        super(r, c, white);
        if (white) this.sprite = pieces[1];
        else this.sprite = pieces[7];
    }
    clone() {
        let tmpPiece = new Queen(this.matPos.x, this.matPos.y, this.white);
        return tmpPiece;
    }
    move(board, r, c) {
        if (!board.isEmpty(r, c)) {
            board.removePiece(board.getPieceAt(r, c));
        }
        this.matPos = createVector(r, c);
        this.pxPos = createVector(c * D, r * D);
    }
    canMove(board, r, c) {
        if (this.canMoveTowards(board, r, c) && board.isFree(r, c)) return true;
        else return false;
    }
}

class Knight extends Piece {
    constructor(r, c, white) {
        super(r, c, white);
        if (white) this.sprite = pieces[3];
        else this.sprite = pieces[9];
    }
    clone() {
        let tmpPiece = new Knight(this.matPos.x, this.matPos.y, this.white);
        return tmpPiece;
    }
    move(board, r, c) {
        if (!board.isEmpty(r, c)) board.removePiece(board.getPieceAt(r, c));
        this.matPos = createVector(r, c);
        this.pxPos = createVector(c * D, r * D);
    }
    canMove(board, r, c) {
        if (r !== this.matPos.x && 
            c !== this.matPos.y && 
            abs(r - this.matPos.x) + abs(c - this.matPos.y) === 3 && 
            board.isFree(r, c)) return true;
        else return false;
    }
}

class King extends Piece {
    constructor(r, c, white) {
        super(r, c, white);
        if (white) this.sprite = pieces[0];
        else this.sprite = pieces[6];
        this.canCastleKingSide = true;
        this.canCastleQueenSide = true;
    }
    clone() {
        let tmpPiece = new King(this.matPos.x, this.matPos.y, this.white);
        tmpPiece.canCastleKingSide = this.canCastleKingSide;
        tmpPiece.canCastleQueenSide = this.canCastleQueenSide;
        return tmpPiece;
    }
    move(board, r, c) {
        if (abs(c - this.matPos.y) === 2) {
            if (board.whiteTurn) {
                if (r === 7 && c === 6) {
                    board.getPieceAt(7, 7).move(board, 7, 5);
                } else if (r === 7 && c === 2) {
                    board.getPieceAt(7, 0).move(board, 7, 3);
                }
            } else {
                if (r === 0 && c === 6) {
                    board.getPieceAt(0, 7).move(board, 0, 5);
                } else if (r === 0 && c === 2) {
                    board.getPieceAt(0, 0).move(board, 0, 3);
                }
            }
        } else if (!board.isEmpty(r, c)) board.removePiece(board.getPieceAt(r, c));
        this.canCastleKingSide = false;
        this.canCastleQueenSide = false;
        this.matPos = createVector(r, c);
        this.pxPos = createVector(c * D, r * D);
    }
    
    canMove(board, r, c, captureOnly = false) {
        if (captureOnly) {
            if (board.isEnemy(r, c) && abs(r - this.matPos.x) <= 1 && abs(c - this.matPos.y) <= 1) return true;
            return false;
        }
        if (this.white) {
            if (r === 7 && c === 6) {
                if (this.canCastleKingSide && board.isSafe(7, 4) && (board.isEmpty(7, 5) && board.isSafe(7, 5)) && (board.isEmpty(7, 6) && board.isSafe(7, 6))) {
                    return true;
                }
            } else if (r === 7 && c === 2) {
                if (this.canCastleQueenSide && board.isSafe(7, 4) && (board.isEmpty(7, 3) && board.isSafe(7, 3)) && (board.isEmpty(7, 2) && board.isSafe(7, 2)) && board.isEmpty(7, 1)) {
                    return true;
                }
            }
        } else {
            if (r === 0 && c === 6) {
                if (this.canCastleKingSide && board.isSafe(0, 4) && (board.isEmpty(0, 5) && board.isSafe(0, 5)) && (board.isEmpty(0, 6) && board.isSafe(0, 6))) {
                    return true;
                }
            } else if (r === 0 && c === 2) {
                if (this.canCastleQueenSide && board.isSafe(0, 4) && (board.isEmpty(0, 3) && board.isSafe(0, 3)) && (board.isEmpty(0, 2) && board.isSafe(0, 2)) && board.isEmpty(0, 1)) {
                    return true;
                }
            }
        }
        if (abs(r - this.matPos.x) > 1 || abs(c - this.matPos.y) > 1) return false;
        if (board.isFree(r, c) && board.isSafe(r, c)) return true;
        return false;
    }
}