console.clear('New session start...')
let c = false;
iceBtn.onclick = ice;
function ice(e) {
    if (c) return;
    c = true;
    
    document.querySelector('canvas').addEventListener('click', function (e) {
        let x = ~~(e.offsetX / 64);
        let y = ~~(e.offsetY / 64);
        let slot = board.slots[y][x];
        // debugger
        emptySlot(slot);
        selected = {};
        board.findAllMoves();
        draw(board);
    }, {once: true});
    // console.log(1)
    let style = document.createElement('style');
    style.innerText = 
    `body {
        background: rgb(2,0,36);
        background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(4,248,246,1) 50%, rgba(0,212,255,1) 100%);
    }`;
    document.body.append(style);
    setTimeout(() => style.remove(), 3000)
}
class History {
    constructor () {
        this.set = [];
        this.future = [];
        this.index = -1;
        this.isUndo = false;
        this.notes = [];
        this.futureNotes = []
    }
    notations (str) {
        this.futureNotes = []
        this.notes.push(str)
    }
    add (string) {
        this.future = [];
        this.set.push(string);
        // this.turn = +!this.turn
        // if (this.set.length > 1 && this.set.length-1 != this.index) {
        //     // debugger
        //     if (this.index == 0) {
        //         this.set = [this.set[0]];
        //     }
        //     else 
        //         this.set = this.set.slice(0, this.index);
        //     this.set.push(string);
        //     this.isUndo = false;
        //     // this.index++;
        //     // console.log(this.set.length, this.index, turn)
        // } else {
        //     this.set.push(string);
        // }
        // // console.table(this.set)
        // this.index++;
        // // debugger
        // // this.turn = this.index % 2;
    }
    undo () {
        if (this.set.length == 0 || this.set.length == 1) return;
        this.future.push(this.set.pop());
        this.futureNotes.push(this.notes.pop())
        // this.turn = +!this.turn
        // if (this.index < 0) {
        //     if (this.set.length > 0)
        //         this.index = 0;
        //     else if (this.set.length == 0) this.index = -1;
        //     return;
        // };
        // this.index--;
        // // debugger
        let c = this.set[this.set.length-1];
        // // console.log(c)
        // this.isUndo = true;
        return c;
    }
    forward () {
        if (this.future.length == 0) return;
        this.set.push(this.future.pop());
        this.notes.push(this.futureNotes.pop())
        // this.turn = +!this.turn
        // if (this.index >= this.set.length-1) {
        //     this.index = this.set.length - 1;
        //     return;
        // };
        // this.index++;
        // let c = this.set[this.index] || this.set[0];
        let c = this.set[this.set.length-1];
        return c;
    }
}
String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index|0) + replacement + this.substr(+index|0 + replacement.length);
}
function findPiece(coordinates) {
    return slots[coordinates[0]][coordinates[1]];
}
let emptyArray = [];
let history = new History();
let slots = []
let flipTop = false;
let flipWhite = false;
let flipBlack = false;
let flipBoard = false;
let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let highlights = [];
let selected = {};
let turn = 0;
let isWhiteChecked = false;
let isBlackChecked = false;
let isMate = false;
let whiteKingCantGo = new Set();
let blackKingCantGo = new Set();
let isCheck = false;
let check = {};

let PAWN = 10
let ROOK = 50
let KNIGHT = 30
let BISHOP = 30
let QUEEN = 90
let KING = 900

canvas.width = 512;
canvas.height = 512;

for (let row in [...Array(8).keys()]) {
    let y = [];
    let n = 0;
    if (row % 2 == 0) n = 1;
    for (let col in [...Array(8).keys()]) {
        let x = {
            row: row,
            col: col,
        };
        y.push(x);
        n = +!n
    }
    slots.push(y);
}