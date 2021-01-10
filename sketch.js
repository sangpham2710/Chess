"use strict";
let L;
let D;
let pieces = [];
let board;
let movingPiece = null;
let boards = [];
let movesList = [];
let move;
let stockfish = new Worker("node_modules/stockfish/src/stockfish.js");
let stockfishDepth = 20;
let whiteAI = false;
let enableAI = true;
let waitingAI = false;
let bothAI = false;

function preload() {
    for (let i = 0; i < 12; ++i) {
        if (i < 10) pieces.push(loadImage("assets/0" + String(i) + ".png"));
        else pieces.push(loadImage("assets/" + String(i) + ".png"));
    }
}

function goBack() {
    if (enableAI && !bothAI) {
        if (boards.length > 1) {
            boards.pop();
            board = boards[boards.length - 1].clone();
            movesList.pop();
            boards.pop();
            board = boards[boards.length - 1].clone();
            movesList.pop();
        }
        return;
    }
    if (boards.length > 1) {
        boards.pop();
        board = boards[boards.length - 1].clone();
        movesList.pop();
    }
}

let goBackButton;
let para;

function prep() {
    // html stuff
    goBackButton = createButton("<<<");
    goBackButton.mousePressed(goBack);
    // stockfish
    stockfish.onmessage = function(e) {
        let res = e.data;
        // console.log(e.data);
        let id = res.indexOf("bestmove");
        if (id != -1) {
            let move = res.split(' ')[1];
            let oldr = 8 - (move.charCodeAt(1) - '0'.charCodeAt(0));
            let oldc = move.charCodeAt(0) - 'a'.charCodeAt(0);
            let r = 8 - (move.charCodeAt(3) - '0'.charCodeAt(0));
            let c = move.charCodeAt(2) - 'a'.charCodeAt(0);
            if (move.length == 4) {
                board.resetPawnMoved();
                board.getPieceAt(oldr, oldc).move(board, r, c);
                board.whiteTurn = !board.whiteTurn;
            } else {
                let ch = move.charAt(4);
                board.resetPawnMoved();
                board.removePiece(board.getPieceAt(oldr, oldc));
                if (ch == 'q') {
                    if (board.whiteTurn) board.whitePieces.push(new Queen(r, c, board.whiteTurn));
                    else board.blackPieces.push(new Queen(r, c, board.whiteTurn));
                }
                if (ch == 'n') {
                    if (board.whiteTurn) board.whitePieces.push(new Knight(r, c, board.whiteTurn));
                    else board.blackPieces.push(new Knight(r, c, board.whiteTurn));
                }
                if (ch == 'r') {
                    if (board.whiteTurn) board.whitePieces.push(new Rook(r, c, board.whiteTurn));
                    else board.blackPieces.push(new Rook(r, c, board.whiteTurn));
                }
                if (ch == 'b') {
                    if (board.whiteTurn) board.whitePieces.push(new Bishop(r, c, board.whiteTurn));
                    else board.blackPieces.push(new Bishop(r, c, board.whiteTurn));
                }
                board.whiteTurn = !board.whiteTurn;
            }
            waitingAI = false;
            board.state = move;
            movesList.push(board.state);
            if (board.checkMate()) {
                board.state = "check mate";
            } else if (board.staleMate()) {
                board.state = "stale mate";
            }
            boards.push(board.clone());
        }
    };
}

function setup() {
    prep();
    smooth();
    board = new Board();
    boards.push(board.clone());
}

// row -> Y
// col -> X

function displayGrid() {
    push();
    rectMode(CORNER);
    // noStroke();
    strokeWeight(2);
    for (let r = 0; r < 9; ++r) for (let c = 0; c < 9; ++c) {
        if (r < 8 && c < 8) {
            if ((r + c) % 2) fill(181, 136, 99);
            else fill(240, 217, 181);
        } else if (r === 8 && c === 8) {
            if (board.whiteTurn) fill(255);
            else fill(0);
        } else {
            if (2 <= c && c <= 5 && board.isPromoting) {
                let mr = floor(mouseY / D);
                let mc = floor(mouseX / D);
                if (mr === 8 && mc === c) {
                    fill(0, 255, 0);
                } else {
                    fill(170, 170, 170);
                }
            } else {
                fill(170, 170, 170);
            }
        }
        rect(c * D, r * D, D, D);
    }
    pop();
}

function displayCoordinates() {
    push();
    fill(0);
    textStyle(BOLD);
    for (let r = 0; r < 8; ++r) {
        textSize(D / 2);
        textAlign(CENTER, CENTER);
        text(String.fromCharCode('0'.charCodeAt(0) + r + 1), 8.5 * D, (7.5 - r) * D);
    }
    for (let c = 0; c < 8; ++c) {
        if (board.isPromoting) {
            if (c < 2 || c > 5) {
                textSize(D / 2);
                textAlign(CENTER, CENTER);
                text(String.fromCharCode('A'.charCodeAt(0) + c), (0.5 + c) * D, 8.5 * D);
            } else {
                let Q = new Queen(8, 2, board.whiteTurn);
                let N = new Knight(8, 3, board.whiteTurn);
                let R = new Rook(8, 4, board.whiteTurn);
                let B = new Bishop(8, 5, board.whiteTurn);
                Q.display();
                N.display();
                R.display();
                B.display();
            }
        } else {
            textSize(D / 2);
            textAlign(CENTER, CENTER);
            text(String.fromCharCode('A'.charCodeAt(0) + c), (0.5 + c) * D, 8.5 * D);
        }
    }
    if (board.whiteTurn) fill(0);
    else fill(255);
    textSize(D / 5.5);
    textAlign(CENTER, CENTER);
    text(board.state, 8.5 * D, 8.25 * D);
    pop();
}

function draw() {
    L = Math.min(windowHeight, windowWidth) * 0.95;
    D = L / 9;
    goBackButton.position(8 * D + 8, D * 8.5 + 8);
    goBackButton.size(D, D / 2);
    goBackButton.style("font-size: " + D / 2.5 + "px");
    resizeCanvas(L + 2, L + 2);
    background(255);
    displayGrid();
    displayCoordinates();
    if (enableAI) AImoves();
    board.display();
}

function AImoves() {
    if (bothAI || board.whiteTurn === whiteAI) {
        if (waitingAI === false) {
            waitingAI = true;
            stockfish.postMessage("position startpos moves " + movesList.join(" "));
            stockfish.postMessage("go depth " + stockfishDepth.toString());
        }
    }
}

function mousePressed() {
    if (mouseButton != LEFT) return;
    let r = floor(mouseY / D);
    let c = floor(mouseX / D);
    if (board.isPromoting) {
        if (r === 8 && 2 <= c && c <= 5) {
            let tmpPiece = board.getPromotingPiece();
            let u = tmpPiece.matPos.x;
            let v = tmpPiece.matPos.y;
            board.removePiece(tmpPiece);
            if (c === 2) { // Q
                if (board.whiteTurn) board.whitePieces.push(new Queen(u, v, board.whiteTurn));
                else board.blackPieces.push(new Queen(u, v, board.whiteTurn));
                board.state += 'q';
            }
            if (c == 3) { // N
                if (board.whiteTurn) board.whitePieces.push(new Knight(u, v, board.whiteTurn));
                else board.blackPieces.push(new Knight(u, v, board.whiteTurn));
                board.state += 'n';
            }
            if (c === 4) { // R
                if (board.whiteTurn) board.whitePieces.push(new Rook(u, v, board.whiteTurn));
                else board.blackPieces.push(new Rook(u, v, board.whiteTurn));
                board.state += 'r';
            }
            if (c == 5) { // B
                if (board.whiteTurn) board.whitePieces.push(new Bishop(u, v, board.whiteTurn));
                else board.blackPieces.push(new Bishop(u, v, board.whiteTurn));
                board.state += 'b';
            }
            movesList.push(board.state);
            board.isPromoting = false;
            board.whiteTurn = !board.whiteTurn;
            if (board.checkMate()) {
                board.state = "check mate";
            } else if (board.staleMate()) {
                board.state = "stale mate";
            }
            boards.push(board.clone());
        }
        return;
    }
    movingPiece = board.getPieceAt(r, c);
    if (movingPiece !== null && movingPiece.white === board.whiteTurn) {
        movingPiece.moving = true;
    } else {
        movingPiece = null;
    }
}

function toUCINotation(r, c) {
    return String.fromCharCode('a'.charCodeAt(0) + c) + String.fromCharCode('0'.charCodeAt(0) + 8 - r);
}

function mouseReleased() {
    if (movingPiece === null) return;
    let r = floor(mouseY / D);
    let c = floor(mouseX / D);
    // if the new pos is inside and is not the same as its old pos
    if (board.isMoveable(movingPiece, r, c)) {
        let oldr = movingPiece.matPos.x;
        let oldc = movingPiece.matPos.y;
        board.resetPawnMoved();
        movingPiece.move(board, r, c);
        if (board.checkPromotion(movingPiece)) {
            board.isPromoting = true;
            movingPiece.moving = false;
            movingPiece = null;
            board.state = toUCINotation(oldr, oldc) + toUCINotation(r, c);
            return;
        } else {
            board.whiteTurn = !board.whiteTurn;
        }
        movingPiece.moving = false;
        board.state = toUCINotation(oldr, oldc) + toUCINotation(r, c);
        movesList.push(board.state);
        if (board.checkMate()) {
            board.state = "check mate";
        } else if (board.staleMate()) {
            board.state = "stale mate";
        }
        boards.push(board.clone());
        movingPiece = null;
    } else {
        movingPiece.moving = false;
        movingPiece = null;
    }
}