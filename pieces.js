function isPromotion(slot) {
    // debugger
    if (slot.type != 'pawn') return;
    if (slot.color == 0 && slot.row == 0 || slot.color == 1 && slot.row == 7) {
        slot.type = 'queen';
        slot.value = QUEEN;
        return 'Promotion'
    }
}
class Piece {
    constructor (letter, row, col) {
        this.row = row+'';
        this.col = col+'';
        this.identify(letter);
    }
    identify(letter) {
        let l = letter.toLowerCase()
        if (!/[rRaAnNbBqQfFkKpP]/.test(l)) return;

        this.isPiece = true;
        this.canGo = new Set();
        if (letter == letter.toLowerCase()) {
            this.color = 0;
        } else this.color = 1;
        if (l == 'r') {
            this.type = 'rook';
            this.value = ROOK;
            this.moved = false;
        }
        else if (l == 'a') {
            this.value = BISHOP;
            this.type = 'alfil';
        }
        else if (l == 'f') {
            this.value = BISHOP;
            this.type = 'ferz';
        }
        else if (l == 'n') {
            this.value = KNIGHT;
            this.type = 'knight';
        }
        else if (l == 'b') {
            this.value = BISHOP;
            this.type = 'bishop';
        }
        else if (l == 'q') {
            this.value = QUEEN;
            this.type = 'queen';
        }
        else if (l == 'k') {
            this.type = 'king';
            this.value = KING;
            this.moved = false;
        }
        else if (l == 'p') {
            this.value = PAWN;
            this.type = 'pawn';
            isPromotion(this)
        }
        
    }
}