class Board {
    constructor (string, isVirtual, modern, turn) {
        this.default = `
        RNBQKBNR/
        PPPPPPPP/
        ********/
        ********/
        ********/
        ********/
        pppppppp/
        rnbqkbnr
        `;
        this.chaturanga = `
            RNAKFANR/
            PPPPPPPP/
            ********/
            ********/
            ********/
            ********/
            pppppppp/
            rnakfanr
        `;
        this.modern = modern || true;
        if (string == 'chaturanga') {
            string = this.chaturanga;
            this.modern = false;
            this.isChaturanga = true;
        }
        this.string = string;
        this.isVirtual = isVirtual
        this.pinns = new Set();
        this.turn = turn || 0;
        this.isCheck = false;
        this.check = {};
        this.isMate = false;
        this.idDraw = false;
        this.isCastleing = false;
        this.enPassant = null;
        // if (!isVirtual)
        this.blackPieces = new Set();
        this.whitePieces = new Set();
        this.blackKingCantGo = new Set();
        this.whiteKingCantGo = new Set();
        this.history = new History();
        try {
        this.slots = Object.create(slots);
        }
        catch (err) {
            console.log(err)
            debugger;
            console.log(this.slots)
        }
        if (string)
            this.parse(string);
        else this.reset();
        this.history.add(this.stringify())
    }
    undo () {
        // let n = this.history.index;
        let c = this.history.undo();
        if (c) {
            this.parse(c)
            this.findAllMoves();
            this.turn = (this.history.set.length-1) % 2;
            draw(this)

        }
        // console.log(this.slots[0][0])
        // if (n != this.history.index)
    }
    forward () {
        // let n = this.history.index;
        let c = this.history.forward();
        if (c) {
            this.parse(c)
            // if (n != this.history.index)
            this.findAllMoves();
            this.turn = (this.history.set.length-1) % 2;
            draw(this)
        }
    }
    findPiece (coordinates) {
        return this.slots[coordinates[0]][coordinates[1]];
    }
    parse (string) {
        if (typeof string !== 'string') {
            console.error('[Chess]: Expected argument of type string, got '+typeof string+'\n\tat Board.parse (board.js)\n\tat new Board')
            return;
        }
        else if (/K{2,}|k{2,}/g.test(string)) {
            console.error('[Chess]: Impossible to declare more than one king of the same color\n\tat Board.parse (board.js)\n\tat new Board')
            return;
        }
        else if (!this.isVirtual && /k/.test(string) && !/K/.test(string)
            || !this.isVirtual && !/k/.test(string) && /K/.test(string)) {
                debugger;
                console.error('[Chess]: Zero or two kings must be declared, but got a different number\n\tat Board.parse (board.js)\n\tat new Board')
                return;
        }
        string = string.replace(/\s+/g, '');
// the rook moves to it's own king, captures it, and the game throws an error. Fix it
        let arr = string.split('/');
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].length; j++) {
                let l = arr[i][j];
                if (/[rRaAnNbBfFqQkKpP]/.test(l)) {
                    this.slots[i][j] = new Piece(l, i, j);
                    if (l == 'k' || l == 'K') {
                        let s = l == 'k' ? 'K' : 'k';
                        let err = false;

                        if (arr[i][j-1] == s || arr[i][j+1] == s)
                            err = true;
                        else if (i-1 > -1 && (arr[i-1][j-1] == s || arr[i-1][j] == s || arr[i-1][j+1] == s))
                            err = true;
                        else if (i+1 < 8 && (arr[i+1][j-1] == s || arr[i+1][j] == s || arr[i+1][j+1] == s))
                            err = true;

                        if (err) {
                            console.error('[Chess]: Impossible to place two kings of the opposite color next to each other\n\tat Board.parse (board.js)\n\tat new Board')
                            return;
                        }
                    }
                }
                else {
                    this.slots[i][j] = {
                        row: i,
                        col: j
                    }
                }
            }
        }
        // return this.slots;
        // !this.isVirtual && history.add();
        this.findAllMoves();
    }
    reset () {
        this.parse(this.default)
    }
    values (color = null) {
        let value = -10_000;
        if (color === null) value = 0;
        if (this.isMate) {
            if (color === null) {
                value += 10_000 * this.turn == 0 ? -1 : +1;
            } else {
                value += 10_000;
            }
        }
        for (let row in slots) {
            for (let col in slots[row]) {
                let slot = slots[row][col];
                if (this.isVirtual) {
                    slot = this.slots[row][col];
                }
                if (!slot.isPiece) {
                    // str+='*';
                    continue;
                };
                if (color !== null && slot.color == color) {
                    value += slot.value;
                } else {
                    let n = slot.color == 0 ? 1 : -1
                    value += slot.value * n
                }
            }
        }
        return value;
    }
    moves (color) {
        let b = this.slots;
        let allMoves = [];
        for (let row in b) {
            for (let col in b[row]) {
                let slot = b[row][col];
                if (!slot.isPiece)
                    continue;
                if (+color !== color && slot.color === turn) {
                    for (let i of slot.canGo) {
                        allMoves.push({
                            piece: slot.type,
                            from: ''+slot.row+slot.col,
                            to: i
                        });
                    }
                } else if (+color === color && slot.color == color) {
                    for (let i of slot.canGo) {
                        allMoves.push({
                            piece: slot.type,
                            from: ''+slot.row+slot.col,
                            to: i
                        });
                    }
                }
            }
        }
        return allMoves;
    }
    stringify () {
        let str = '';
        for (let row = 0; row < this.slots.length; row++) {
            for (let col in this.slots[row]) {
                let slot = this.slots[row][col];
                if (!slot.isPiece) {
                    str+='*';
                    continue;
                };
                let l = slot.type[0];
                if (slot.type == 'knight') l = 'n';
                if (slot.color == 1)
                    l = l.toUpperCase()
                str+=l;
            }
            // to avoid '/' at the end
            row < 7 && (str+='/')
        }
        return str;
    }
    findAllMoves () {
        if (this.isMate) return void console.log('Mate');
        this.whites = -9999;
        this.blacks = -9999;
        this.blackMoves = [];
        this.whiteMoves = [];
        this.pinns = new Set();
        this.whiteKingCantGo = new Set();
        this.blackKingCantGo = new Set();
        let whiteKing, blackKing;
        // // First find out if it is check
        // this.findMoves(history.set[history.index][0])
    
        let movesLeft = 0;
        let b = this.slots
        for (let row in b) {
            for (let col in b[row]) {
                let slot = b[row][col];
                if (!slot.isPiece) continue;
    
                slot.canGo = new Set();
                // isCheck && console.log(isCheck)
                if (!this.isCheck) {
                    let ck = this.findMoves(slot, slot.col, slot.row);
                    if (ck) {
                        if (slot.canGo.has(this.check.canBeCaptured)) {
                            this.isCheck = false;
                            this.check = {}
                            ck = false;
                        }
                        return void this.findAllMoves()
                    }
                    if (slot.type == 'king') {
                        if (slot.color == 0) whiteKing = slot;
                        else blackKing = slot;
                    }
                }
                else {
                    if (this.turn == slot.color) {
                        // console.log(this.turn, slot.color)
                        //  || check?.color != turn
                        this.findMoves(slot, slot.col, slot.row);
                        if (slot.type !== 'king' && !this.check.doubleCheck) {
                            let newCanGo = new Set();
                            if (this.check.canBeCovered) {
                                for (let i of this.check.canBeCovered) {
                                    if (slot.canGo.has(i))
                                        newCanGo.add(i);
                                }
                            }
                            //king moves under danger. Fix it. 
                            if (slot.canGo.has(this.check.canBeCaptured))
                                newCanGo.add(this.check.canBeCaptured);
                            movesLeft += newCanGo.size;
                            slot.canGo = newCanGo;
                        }
                    } else {
                        this.findMoves(slot, slot.col, slot.row);
                    }
                        // check if the king is under danger, and write it into a box
                        
                    // console.log(slot.type)
                    if (slot.type == 'king') {
                        if (slot.color == 0) whiteKing = slot;
                        else blackKing = slot;
                        continue;
                    }
                }
            }
        }
        
        if (this.check?.doubleCheck) {
            for (let row in this.slots) {
                for (let col in this.slots[row]) {
                    let slot = this.slots[row][col];
                    if (slot.type != 'king' && this.turn == slot.color) {
                        slot.canGo = new Set();
                        // console.log(1)
                    }
                }
            }
        }
        whiteKing && this.findMoves(whiteKing)
        blackKing && this.findMoves(blackKing)
        if (whiteKing && whiteKing.canGo) {
            let newMoves = new Set();
            for (let i of whiteKing.canGo) {
                if (this.whiteKingCantGo.has(i) == false) {
                    // whiteKing.canGo.delete(i)
                    if (!whiteKing.moved && i == '72' && !newMoves.has('73')
                    || !whiteKing.moved && i == '76' && !newMoves.has('75'))
                    continue;
                    newMoves.add(i);
                    // console.log(i)
                }
            }
            whiteKing.canGo = newMoves;
        }
        // debugger;
        if (blackKing && blackKing.canGo) {
            let newMoves = new Set();
            for (let i of blackKing.canGo) {
                if (this.blackKingCantGo.has(i) == false) {
                    // blackKing.canGo.delete(i)
                    if (!blackKing.moved && i == '02' && !newMoves.has('03')
                    || !blackKing.moved && i == '06' && !newMoves.has('05'))
                        continue;
                    // if (!blackKing.moved && this.blackKingCantGo.has(`${blackKing.row}${+blackKing.col-1}`))
                    newMoves.add(i);
                }
            }
            // if (newMoves.has)
            // if (!blackKing.moved && !blackKing.canGo.has(`${blackKing.row}${+blackKing.col-1}`))
            //     newMoves.delete([blackKing.row, +blackKing.col-2].join(''))
            blackKing.canGo = newMoves;
        }
        for (let i of this.pinns) {
            let tmp = this.slots[i.row][i.col];
            // console.log(tmp.canGo)
            let sh = ''+i.row+i.col;
            let newMoves = new Set();
            for (let j of i.allowedMoves) {
                if (tmp.canGo.has(j))
                    newMoves.add(j);
            }
            tmp.canGo = newMoves;
        }
        movesLeft = this.moves(this.turn).length;
        if (movesLeft == 0 && this.isCheck) {
            // debugger
            console.log('Checkmate')
            this.isMate = true;
            return;
        } else if (movesLeft == 0 && !this.isCheck) {
            console.log('Draw')
            return;
        }
    }
    castle(king) {
        let n = king.color == 0 ? 7 : 0;
        if (king.col == 6) {
            if (king.moved || this.slots[n][7].moved) return;
            this.swap(this.slots[n][7], this.slots[n][5])   
            emptySlot(this.slots[n][7])        
            // this.turn = +!this.turn
            king.moved = true;
            return 'O-O'
        } else if (king.col == 2) {
            if (king.moved || slots[n][3].moved) return;
            this.swap(this.slots[n][0], this.slots[n][3])
            emptySlot(this.slots[n][0])
            // this.turn = +!this.turn;
            king.moved = true;
            return 'O-O-O'
        }
    }
    swap(start, end) {
        let x = end.col;
        let y = end.row;
        let b = this.slots;
        b[end.row][end.col] = JSON.parse(JSON.stringify(start));
        let prevX = start.col;
        let prevY = start.row;
        let final = b[end.row][end.col];
        b[prevY][prevX] = {
            col: ''+prevX,
            row: ''+prevY
        }
        final.col = ''+x;
        final.row = ''+y;
        return final;
    }
    capture(start, end) {
        // debugger;
        let e = JSON.parse(JSON.stringify(end));
        let final = this.swap(start, end);
        let prevX = start.col;
        let prevY = start.row;
        let x = end.col;
        let y = end.row;
        emptySlot(start);

        this.isCheck = false;
        let t = null;
        if (final.type == 'king') {
            if (!final.moved && (x == 6 || x == 2) && (y == 0 || y == 7)) {
                t = this.castle(final, this);
                // if (t) this.turn = +!this.turn;
            }
            final.moved = true;
        } else if (final.type == 'rook') {
            final.moved = true;
        }
        else if (final.type == 'pawn') {
            t = isPromotion(final);
            let n = -1;
            if (final.color == 0) n = 1
            if (this.enPassant && this.enPassant[0] == ''+final.row+final.col) {
                emptySlot(this.findPiece(this.enPassant[1]))
            }
            if (prevY == 6 && final.row == 4 || prevY == 1 && final.row == 3)
                this.enPassant = [''+(+final.row+n)+final.col, ''+final.row+final.col];
            else 
                this.enPassant = null;
            
        } else {
            this.enPassant = null;
        }
        selected = {};

        this.isCheck = false;
        this.check = {};
        // setTimeout(findAllMoves, 1000);
        // setTimeout(draw, 1000);
        // !this.isVirtual && history.add();
        this.history.add(this.stringify())
        
        this.turn = +!this.turn//this.history.set.length % 2;
        this.findAllMoves();
        
        let obj = null;
        if (!this.isVirtual) {
            obj = {
                turn: this.turn,
                mate: this.isMate,
                draw: this.isDraw || false,
                from: readable(''+prevY+prevX),
                to: readable(''+final.row+final.col),
                fromN: ''+prevY+prevX,
                toN: ''+final.row+final.col,
                capturedSlot: e,
                piece: final,
                idLetter: final.type == 'knight' ? 'N' : final.type[0].toUpperCase(),
                action: t || (end.isPiece ? 'capture' : 'move')
            }
            let rank = false, file = false;
            if (obj.idLetter != 'K' || obj.idLetter != 'P') {
                // debugger
                for (let i of this.slots[final.row]) {
                    if (!i.isPiece || i == final || i.color != final.color || i.type != final.type) continue;
                    rank = true;
                }
                for (let j = 0; j < 8; j++) {
                    let i = this.slots[j][final.col];
                    if (i == final || i.color != final.color || i.type != final.type) continue;
                    file = true;
                }
            }
            // console.table(obj)
            let a = '';
            if (obj.action == 'capture') {
                if (file)
                    a = obj.from[0]+'×';
                else if (rank)
                    a = obj.from[1]+'×';
                else a = '×'
            }
            // a = obj.from+'x';
            let str = '';
            if (t == 'Promotion') {
                str = `${
                    a.toLowerCase()
                }${
                    obj.idLetter
                }${
                    obj.action == 'capture' && a
                }${
                    obj.to.toLowerCase()
                }${
                    this.isMate ? '#' : this.isCheck ? '+' : ''
                }${
                    this.isDraw ? '1/2' : ''
                }`
            }
            else if (t == 'O-O' || t == 'O-O-O') {
                str = `${
                    t
                }${
                    this.isMate ? '#' : this.isCheck ? '+' : ''
                }${
                    this.isDraw ? '1/2' : ''
                }`
            }
            else {
                str = `${
                    obj.idLetter == 'P' ? '' : obj.idLetter
                }${
                    a.toLowerCase()
                }${
                    obj.to.toLowerCase()
                }${
                    this.isMate ? '#' : this.isCheck ? '+' : ''
                }${
                    this.isDraw ? '1/2' : ''
                }`
            }

            this.history.notations(str)
        }
    }
    isCheckingPiece (slot) {
        // console.log(!this.check, !this.check.canBeCaptured, slot.color != this.turn)

        if (!this.check && !this.check.canBeCaptured || slot.color != this.turn) return;
        let c = this.check;
        if (slot.type != c.type || c.row != slot.row || c.col != slot.col) {
            this.setCheck(slot);
        }
    }
    validateMoves(slot, pos) {
        let allowedMoves = new Set([''+slot.row+slot.col]);
        let pin = false;
        let pinned = null;
        let n = 0;
        // if (this.isCheck && slot.type == 'queen' && this.turn == 0 && pos.has('65')) debugger
        // if (slot.color == 0 && slot.row == '5') debugger;
        
        for (let i of pos) {
            let tmp = this.slots[i[0]][i[1]]
            if (!tmp.isPiece && !pin) {
                slot.canGo.add(i);
                allowedMoves.add(i)
            }
            else if (!tmp.isPiece && pin) {
                allowedMoves.add(i)
            }
            else if (tmp.color == slot.color && !pin) {
                slot.dangerZone.add(i);
                break;
            }
            else if (tmp.color == slot.color && pin) {
                break;
            }
            else if (tmp.color != slot.color) {
                if (tmp.type != 'king' && !pin) {
                    pin = true;
                    pinned = i;
                    slot.canGo.add(i);
                } else if (tmp.type != 'king' && pin) {
                    break;
                }
                else if (tmp.type == 'king' && !pin) {
                    if (this.isCheck) {
                        // this.isCheckingPiece(slot);
                        if (this.check.canBeCaptured != ''+slot.row+slot.col) {
                            this.check.doubleCheck = true;
                        }
                        // console.log(this.check.doubleCheck)
                        // this is to avoid repeatead finAllMoves function call.
                        slot.canGo.add(i)
                        slot.dangerZone.add([...pos][n+1])
                        if (slot.color == 0)
                            this.blackKingCantGo.add([...pos][n+1])
                        else if (slot.color == 1)
                            this.whiteKingCantGo.add([...pos][n+1])
                        break;
                    }
                    else {
                        this.setCheck(slot)
                        this.check.canBeCovered = allowedMoves
                        !this.isVirtual && console.log(`[Chess]: Check from ${slot.type.toUpperCase()} at ${readable(''+slot.col+slot.row)}`)
                        slot.dangerZone.add([...pos][++n])
                        return true;
                    }
                } else if (tmp.type == 'king' && pin) {
                    this.pinns.add({
                        row: pinned[0],
                        col: pinned[1],
                        allowedMoves
                    })
                    break;
                }
            }
            n++;
        }
    }
    setCheck(slot) {
        // console.log(this.isCheck ? 'Check' : null)
        if (this.isCheck) {
            this.check.doubleCheck = true;
        } else {
            this.isCheck = true;
            this.check.type = slot.type
            this.check.canBeCaptured = '' + slot.row + slot.col;
            this.check.canBeCovered = new Set();
            this.check.color = slot.color;
            this.check.to = +!slot.color;
        }
    }
    pawnMove(slot, x, y) {
        slot.dangerZone = new Set();
        let n = -1
        if (slot.color == 1)
            n = +1;
        slot.canGo = new Set();

        let front = this.slots[y+n]
        front &&= front[x];

        let doubleFront;
        if (this.modern)
            if (slot.color == 0 && y == 6 || slot.color == 1 && y == 1) {
                doubleFront = this.slots[y+n*2][x]
            }
        
        let frontLeft = {}
        let frontRight = {}
        if (x-1 != -1) {
            frontLeft = this.slots[y+n]
            frontLeft &&= frontLeft[x-1];
        }
        if (x+1 != 8) {
            frontRight = this.slots[y+n]
            frontRight &&= frontRight[x+1]
        }
    
        if (!front?.isPiece) {
            slot.canGo.add([y+n, x].join(''))
        }
        if (!front?.isPiece && doubleFront && !doubleFront.isPiece) {
            slot.canGo.add([+doubleFront.row, x].join(''))
        }
        if (frontLeft) {
            if (frontLeft.isPiece && frontLeft.color != slot.color) {
                slot.canGo.add([y+n, x-1].join(''))
                if (frontLeft.type == 'king') {
                    if (this.isCheck) {
                        // this is to avoid repeatead finAllMoves function call.
                        // slot.canGo.add(i)
                        // slot.dangerZone.add([...pos][n+1])
                        if (slot.color == 0)
                            this.blackKingCantGo.add([y+n, x-1].join(''))
                        else if (slot.color == 1)
                            this.whiteKingCantGo.add([y+n, x-1].join(''))
                        // break;
                    }
                    else {
                        this.setCheck(slot)
                        console.log('check')
                        // slot.dangerZone.add()
                        return true;
                    }
                }
            } else if (!frontLeft.isPiece && x-1 > -1) {
                slot.dangerZone.add([y+n, x-1].join(''))
            } else if (frontLeft.isPiece && frontLeft.color == slot.color) {
                if (slot.color == 0)
                    this.blackKingCantGo.add([y+n, x-1].join(''))
                else if (slot.color == 1)
                    this.whiteKingCantGo.add([y+n, x-1].join(''))
            }
            if (this.enPassant && this.enPassant[0] == ''+frontLeft.row+frontLeft.col) {
                slot.canGo.add(this.enPassant[0])
            }
        }
        if (frontRight) {
            if (frontRight.isPiece && frontRight.color != slot.color) {
                slot.canGo.add([y+n, x+1].join(''))
                if (frontRight.type == 'king') {
                    if (isCheck) {
                        if (slot.color == 0)
                            this.blackKingCantGo.add([y+n, x+1].join(''))
                        else if (slot.color == 1)
                            this.whiteKingCantGo.add([y+n, x+1].join(''))
                        // break;
                    }
                    else {
                        this.setCheck(slot)
                        console.log('check')
                        // slot.dangerZone.add()
                        return true;
                    }
                }
            }
            else if (frontRight.isPiece && frontRight.color == slot.color) {
                if (slot.color == 0)
                    this.blackKingCantGo.add([y+n, x+1].join(''))
                else if (slot.color == 1)
                    this.whiteKingCantGo.add([y+n, x+1].join(''))
            } else if (!frontRight.isPiece && x+1 < 8) {
                slot.dangerZone.add([y+n, x+1].join(''))
            }
            if (this.enPassant && this.enPassant[0] == ''+frontRight.row+frontRight.col) {
                slot.canGo.add(this.enPassant[0])
            }
        }
    }
    findMoves (slot, x, y) {
        x = +x;
        y = +y
        if (!slot.canGo) slot.canGo = new Set();
        let c = false;
    
        
        if (slot.type == 'pawn') 
            c = this.pawnMove(slot, x, y);
        else if (slot.type == 'knight')
            c = this.knightMove(slot, x, y);
        else if (slot.type == 'rook')
            c = this.rookMove(slot, x, y);
        else if (slot.type == 'bishop')
            c = this.bishopMove(slot, x, y);
        else if (slot.type == 'queen') {
            c = this.queenMove(slot, x, y);
        }
        else if (slot.type == 'king') {
            c = this.kingMove(slot, x, y);
        }
        else if (slot.type == 'alfil') {
            c = this.alfilMove(slot, x, y);
        }
        else if (slot.type == 'ferz') {
            c = this.ferzMove(slot, x, y);
        }
        if (slot.canGo.size > 0 || slot.dangerZone && slot.dangerZone.size > 0) {
            if (slot.color == 1) {
                if (slot.type == 'pawn') {
                    this.whiteKingCantGo = new Set([...this.whiteKingCantGo, ...slot.dangerZone])
                }
                else {
                    let arr = [...this.whiteKingCantGo, ...slot.canGo];
                    if (slot.dangerZone && slot.dangerZone.size > 0) arr.push(...slot.dangerZone)
                    this.whiteKingCantGo = new Set(arr)
                }
            } else if (slot.color == 0) {
                if (slot.type == 'pawn') {
                    this.blackKingCantGo = new Set([...this.blackKingCantGo, ...slot.dangerZone])
                }
                else {
                    let arr = [...this.blackKingCantGo, ...slot.canGo];
                    if (slot.dangerZone && slot.dangerZone.size > 0) arr.push(...slot.dangerZone)
                    this.blackKingCantGo = new Set(arr)
                }
            }
        }
        // if (slot.canGo.size > 0)
        //     n.add(...slot.canGo)
        return c;
    }
    ferzMove (slot, x, y) {
        slot.dangerZone = new Set();
        if (x-1 > -1 && y-1 > -1 && this.slots[y-1][x-1].color != slot.color) {
            slot.canGo.add([y-1, x-1].join(''))
            if (slots[y-1][x-1].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (x-1 > -1 && y-1 > -1 && this.slots[y-1][x-1].color != slot.color) {
            slot.dangerZone.add([y-1, x-1].join(''))
        }
        if (x-1 > -1 && y+1 < 8 && this.slots[y+1][x-1].color != slot.color) {
            slot.canGo.add([y+1, x-1].join(''))
            if (slots[y+1][x-1].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (x-1 > -1 && y+1 < 8 && this.slots[y+1][x-1].color != slot.color) {
            slot.dangerZone.add([y-1, x-1].join(''))
        }
        if (x+1 < 8 && y+1 < 8 && this.slots[y+1][x+1].color != slot.color) {
            slot.canGo.add([y+1, x+1].join(''))
            if (slots[y+1][x+1].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (x+1 < 8 && y+1 < 8 && this.slots[y+1][x+1].color != slot.color) {
            slot.dangerZone.add([y-1, x-1].join(''))
        }
        if (x+1 < 8 && y-1 > -1 && this.slots[y-1][x+1].color != slot.color) {
            slot.canGo.add([y-1, x+1].join(''))
            if (slots[y-1][x+1].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (x+1 <8 && y-1 > -1 && this.slots[y-1][x-1].color != slot.color) {
            slot.dangerZone.add([y-1, x+1].join(''))
        }
    }
    alfilMove(slot, x, y) {
        slot.dangerZone = new Set();
        if (y-2 > -1 && x-2 > -1 && this.slots[y-2][x-2].color != slot.color) {
            slot.canGo.add([y-2, x-2].join(''))
            if (this.slots[y-2][x-2].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (y-2 > -1 && x-2 > -1 && this.slots[y-2][x-2].color == slot.color) {
            slot.dangerZone.add([y-2, x-2].join(''))
        }
        if (y+2 < 8 && x+2 < 8 && this.slots[y+2][x+2].color != slot.color) {
            slot.canGo.add([y+2, x+2].join(''))
            if (this.slots[y+2][x+2].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (y+2 < 8 && x+2 < 8 && this.slots[y+2][x+2].color == slot.color) {
            slot.dangerZone.add([y+2, x+2].join(''))
        }
        if (y+2 < 8 && x-2 > 1 && this.slots[y+2][x-2].color != slot.color) {
            slot.canGo.add([y+2, x-2].join(''))
            if (this.slots[y+2][x-2].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (y+2 < 8 && x-2 > 1 && this.slots[y+2][x-2].color == slot.color) {
            slot.dangerZone.add([y+2, x-2].join(''))
        }
        if (y-2 > -1 && x+2 < 8 && this.slots[y-2][x+2].color != slot.color) {
            slot.canGo.add([y-2, x+2].join(''))
            if (this.slots[y-2][x+2].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (y-2 > -1 && x+2 < 8 && this.slots[y-2][x+2].color == slot.color) {
            slot.dangerZone.add([y-2, x+2].join(''))
        }
    }
    knightMove(slot, x, y) {
        slot.dangerZone = new Set();
        // left left down
        if (x-2 > -1 && y+1 < 8 && this.slots[y+1][x-2].color != slot.color) {
            slot.canGo.add([y+1, x-2].join(''))
            if (slots[y+1][x-2].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
            // if (this.isCheck) 
            //     this.isCheckingPiece(slot)
        } else if (x-2 > -1 && y+1 < 8 && this.slots[y+1][x-2].color == slot.color) {
            slot.dangerZone.add([y+1, x-2].join(''))
        }
        // left left up
        if (x-2 > -1 && y-1 > -1 && this.slots[y-1][x-2].color != slot.color) {
            slot.canGo.add([y-1, x-2].join(''))
            if (this.slots[y-1][x-2].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (x-2 > -1 && y-1 > -1 && this.slots[y-1][x-2].color == slot.color) {
            slot.dangerZone.add([y-1, x-2].join(''))
        }
        // left up up
        if (x-1 > -1 && y-2 > -1 && this.slots[y-2][x-1].color != slot.color) {
            slot.canGo.add([y-2, x-1].join(''))
            if (this.slots[y-2][x-1].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (x-1 > -1 && y-2 > -1 && this.slots[y-2][x-1].color == slot.color) {
            slot.dangerZone.add([y-2, x-1].join(''))
        }
        // left down down
        if (x-1 > -1 && y+2 < 8 && this.slots[y+2][x-1].color != slot.color) {
            slot.canGo.add([y+2, x-1].join(''))
            if (this.slots[y+2][x-1].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (x-1 > -1 && y+2 < 8 && this.slots[y+2][x-1].color == slot.color) {
            slot.dangerZone.add([y+2, x-1].join(''))
        }
        // right up up
        if (x+1 < 8 && y-2 > -1 && this.slots[y-2][x+1].color != slot.color) {
            slot.canGo.add([y-2, x+1].join(''))
            if (this.slots[y-2][x+1].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (x+1 < 8 && y-2 > -1 && this.slots[y-2][x+1].color == slot.color) {
            slot.dangerZone.add([y-2, x+1].join(''))
        }
        // right down down
        if (x+1 < 8 && y+2 < 8 && this.slots[y+2][x+1].color != slot.color) {
            slot.canGo.add([y+2, x+1].join(''))
            if (this.slots[y+2][x+1].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (x+1 < 8 && y+2 < 8 && this.slots[y+2][x+1].color == slot.color) {
            slot.dangerZone.add([y+2, x+1].join(''))
        }
        // right right up
        if (x+2 < 8 && y-1 > -1 && this.slots[y-1][x+2].color != slot.color) {
            slot.canGo.add([y-1, x+2].join(''))
            if (this.slots[y-1][x+2].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (x+2 < 8 && y-1 > -1 && this.slots[y-1][x+2].color == slot.color) {
            slot.dangerZone.add([y-1, x+2].join(''))
        }
        // right right down
        if (x+2 < 8 && y+1 < 8 && this.slots[y+1][x+2].color != slot.color) {
            slot.canGo.add([y+1, x+2].join(''))
            if (this.slots[y+1][x+2].type == 'king' && !this.isCheck) {
                this.setCheck(slot)
                return true;
            }
        } else if (x+2 < 8 && y+1 < 8 && this.slots[y+1][x+2].color == slot.color) {
            slot.dangerZone.add([y+1, x+2].join(''))
        }
    }
    rookMove(slot, x, y, isQueen) {
        if (!isQueen) {
            slot.dangerZone = new Set();
        }
        // left
        let pos = new Set();
        for (let i = x -1; i > -1; i--) {
            pos.add(''+y+i)
        }
        if (this.validateMoves(slot, pos)) return true;
    
        // right
        pos = new Set();
        for (let i = x +1; i < 8; i++) {
            pos.add(''+y+i)
        }
        if (this.validateMoves(slot, pos)) return true;
        // up
        pos = new Set();
        for (let i = y -1; i > -1; i--) {
            pos.add(''+i+x)
        }
        if (this.validateMoves(slot, pos)) return true;
        // down
        pos = new Set();
        for (let i = y +1; i < 8; i++) {
            pos.add(''+i+x)
        }
        if (this.validateMoves(slot, pos)) return true;
    }
    bishopMove(slot, x, y, isQueen) {
        slot.dangerZone = new Set();
        // left up
        let pos = new Set();
        for (let i = x-1, j = y-1; i > -1 && j > -1; i--, j--) {
            pos.add(''+j+i);
        }
        if (pos.size > 0 && this.validateMoves(slot, pos)) return true;
        // left down
        pos = new Set()
        for (let i = x-1, j = y+1; i > -1 && j < 8; i--, j++) {
            pos.add(''+j+i)
        }
        if (pos.size > 0 && this.validateMoves(slot, pos)) return true;
        // right down
        pos = new Set();
        for (let i = x+1, j = y+1; i < 8 && j < 8; i++, j++) {
            pos.add(''+j+i)
        }
        if (pos.size > 0 && this.validateMoves(slot, pos)) return true;
        // right up
        pos = new Set();
        for (let i = x+1, j = y-1; i < 8 && j > -1; i++, j--) {
            pos.add(''+j+i)
        }
        if (pos.size > 0 && this.validateMoves(slot, pos)) return true;
    }
    queenMove(slot, x, y) {
        let c = this.bishopMove(slot, x, y, true)
        let z = this.rookMove(slot, x, y, true);
        return c || z;
    }
    kingMove(slot, x, y) {
        slot.dangerZone = new Set();
        if (!x) x = +slot.col
        if (!y) y = +slot.row
        // let castle = this.castle[this.turn == 0 ? 'white' : 'black']
        if (this.modern) {
            if (x == 4 && !slot.moved && !this.slots[y][x-4].moved && !this.slots[y][x-2].isPiece && !this.slots[y][x-3].isPiece && !slots[y][x-1].isPiece)
                if (this.slots[y][0].isPiece && this.slots[y][0].type == 'rook' && this.slots[y][0].color == slot.color) {
                    if (slot.canGo.has(`${y}${x-1}`))
                        slot.canGo.add([y, x-2].join(''))
                }
            if (x == 4 && !slot.moved && !this.slots[y][x+3].moved && !this.slots[y][x+2].isPiece && !this.slots[y][x+1].isPiece) {
                if (this.slots[y][7].isPiece && this.slots[y][7].type == 'rook' && this.slots[y][7].color == slot.color) {
                    if (slot.canGo.has(`${y}${x+1}`))
                        slot.canGo.add([y, x+2].join(''))
                }
            }
        }
        // up left
        if (x-1 > -1 && y-1 > -1) {
            if (this.slots[y-1][x-1].color != slot.color) {
                slot.canGo.add([y-1, x-1].join(''));
            }
            slot.dangerZone.add([y-1, x-1].join(''));
        }
        // up right
        if (x+1 < 8 && y-1 > -1) {
            if (this.slots[y-1][x+1].color != slot.color) {
                slot.canGo.add([y-1, x+1].join(''));
            }
            slot.dangerZone.add([y-1, x+1].join(''));
        } 
        // up
        if (y-1 > -1) {
            if (this.slots[y-1][x].color != slot.color) {
                slot.canGo.add([y-1, x].join(''));
            }
            slot.dangerZone.add([y-1, x].join(''));
        } 
        // right
        if (x+1 < 8) {
            if (this.slots[y][x+1].color != slot.color) {
                slot.canGo.add([y, x+1].join(''));
            }
            slot.dangerZone.add([y, x+1].join(''));
        }
        // up right
        if (x+1 < 8 && y-1 > -1) {
            if (this.slots[y-1][x+1].color != slot.color) {
                slot.canGo.add([y-1, x+1].join(''));
            }
            slot.dangerZone.add([y-1, x+1].join(''));
        }
        // down right
        if (x+1 < 8 && y+1 < 8) {
            if (this.slots[y+1][x+1].color != slot.color) {
                slot.canGo.add([y+1, x+1].join(''));
            }
            slot.dangerZone.add([y+1, x+1].join(''));
        }
        // down
        if (y+1 < 8) {
            if (this.slots[y+1][x].color != slot.color) {
                slot.canGo.add([y+1, x].join(''));
            }
            slot.dangerZone.add([y+1, x].join(''));
        } 
        // down left
        if (x-1 > -1 && y+1 < 8) {
            if (this.slots[y+1][x-1].color != slot.color) {
                slot.canGo.add([y+1, x-1].join(''));
            }
            slot.dangerZone.add([y+1, x-1].join(''));
        }
        // left
        if (x-1 > -1) {
            if (this.slots[y][x-1].color != slot.color) {
                slot.canGo.add([y, x-1].join(''));
            }
            slot.dangerZone.add([y, x-1].join(''));
        }
        
        // if (slot.color == 0) {
        //     this.whiteKingCantGo = new Set([...this.whiteKingCantGo, ...slot.canGo]);
        // } else {
        //     // console.log(145)
        //     this.blackKingCantGo = new Set([...this.blackKingCantGo, ...slot.canGo]);
        // }
    }
}
let board = new Board()
// let board = new Board('chaturanga', false);
// let board = new Board(`
// ********/
// **K***r*/
// ********/
// **r*****/
// ***P****/
// ******R*/
// **p**R**/
// ***k****/
// `, false, true, 1);