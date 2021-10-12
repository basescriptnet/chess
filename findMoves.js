let pinns = new Set();
let blackMoves = [];
let whiteMoves = [];
let whites = -9999;
let blacks = -9999;
function findAllMoves (slotsArr, who2move = turn) {
    if (this.isMate) return void console.log('Mate');
    whites = -9999;
    blacks = -9999;
    blackMoves = [];
    whiteMoves = [];
    this.pinns = new Set();
    let whiteKingCantGo = new Set();
    let blackKingCantGo = new Set();
    let whiteKing, blackKing;
    // // First find out if it is check
    // findMoves(history.set[history.index][0])

    let movesLeft = 0;
    let b = this.slots
    for (let row in b) {
        for (let col in b[row]) {
            let slot = b[row][col];
            if (!slot.isPiece) continue;

            slot.canGo = new Set();
            isCheck && console.log(isCheck)
            if (!isCheck) {
                let ck = findMoves(slot, slot.col, slot.row);
                if (ck) {
                    if (slot.canGo.has(check.canBeCauptured)) {
                        isCheck = false;
                        check = {}
                        ck = false;
                    }
                    return void findAllMoves(arguments)
                }
                if (slot.type == 'king') {
                    if (slot.color == 0) whiteKing = slot;
                    else blackKing = slot;
                }
            }
            else {
                // console.log(slot.type)
                if (who2move == slot.color) {
                    // console.log(who2move, slot.color)
                    //  || check?.color != turn
                    findMoves(slot, slot.col, slot.row);
                    if (slot.type !== 'king') {
                        let newCanGo = new Set();
                        if (check.canBeCovered) {
                            for (let i of check.canBeCovered) {
                                if (slot.canGo.has(i))
                                    newCanGo.add(i);
                            }
                        }
                        //king moves under danger. Fix it. 
                        if (slot.canGo.has(check.canBeCauptured))
                            newCanGo.add(check.canBeCauptured);
                        movesLeft += newCanGo.size;
                        slot.canGo = newCanGo;
                    }
                } else {
                    findMoves(slot, slot.col, slot.row);
                }
                    // check if the king is under danger, and write it into a box
                    
                console.log(slot.type)
                if (slot.type == 'king') {
                    if (slot.color == 0) whiteKing = slot;
                    else blackKing = slot;
                }
            }
        }
    }
    whiteKing && findMoves(whiteKing)
    blackKing && findMoves(blackKing)
    if (whiteKing && whiteKing.canGo) {
        let newMoves = new Set();
        for (let i of whiteKing.canGo) {
            if (whiteKingCantGo.has(i) == false) {
                // whiteKing.canGo.delete(i)
                newMoves.add(i);
            }
        }
        whiteKing.canGo = newMoves;
    }
    // debugger;
    if (blackKing && blackKing.canGo) {
        let newMoves = new Set();
        for (let i of blackKing.canGo) {
            if (blackKingCantGo.has(i) == false) {
                // blackKing.canGo.delete(i)
                newMoves.add(i);
            }
        }
        blackKing.canGo = newMoves;
    }
    for (let i of pinns) {
        let tmp = slots[i.row][i.col];
        console.log(tmp.canGo)
        let sh = ''+i.row+i.col;
        let newMoves = new Set();
        for (let j of i.allowedMoves) {
            if (tmp.canGo.has(j))
                newMoves.add(j);
        }
        tmp.canGo = newMoves;
        // tmp.canGo = new Set()
    }
    for (let row in slots) {
        for (let col in slots[row]) {
            let slot = slots[row][col];
            // if (slot.color && slot.color != turn) {
            if (slot.color == 1) {
                blacks += slot.value;
                for (let i of slot.canGo) {
                    blackMoves.push({
                        piece: slot.type,
                        from: ''+slot.row+slot.col,
                        to: i
                    });
                }
            }
            else if (slot.color == 0) {
                whites += slot.value;
                for (let i of slot.canGo) {
                    whiteMoves.push({
                        piece: slot.type,
                        from: ''+slot.row+slot.col,
                        to: i
                    });
                }
            }
        }
    }
    // console.clear();
    // console.log(whites, ' ', blacks)
    // if (Math.max(whites, blacks) == whites) {
    //     console.log(Math.max(whites, blacks) - Math.min(whites, blacks));
    // } else {
    //     console.log(-(Math.max(whites, blacks) - Math.min(whites, blacks)));
    // }
    // turn is not updated until all the moves are calculated
    if (who2move == 0) {
        movesLeft += whiteMoves.length;
    } else {
        movesLeft += blackMoves.length;
    }
    if (movesLeft == 0 && isCheck) {
        console.log('Checkmate')
        isMate = true;
        return;
    } else if (movesLeft == 0 && !isCheck) {
        console.log('Draw')
        return;
    }
}
function findMoves (slot, x, y) {
    x = +x;
    y = +y
    if (!slot.canGo) slot.canGo = new Set();
    let c = false;

    if (slot.type == 'pawn') 
        c = pawnMove.bind(this, slot, x, y);
    else if (slot.type == 'horse')
        c = horseMove.bind(this, slot, x, y);
    else if (slot.type == 'rook')
        c = rookMove.bind(this, slot, x, y);
    else if (slot.type == 'bishop')
        c = bishopMove.bind(this, slot, x, y);
    else if (slot.type == 'queen') {
        c = queenMove.bind(this, slot, x, y);
    }
    else if (slot.type == 'king') {
        c = kingMove.bind(this, slot, x, y);
    }
    // let n = slot.color == 0 ? whiteKingCantGo : blackKingCantGo;
    if (slot.canGo.size > 0 || slot.dangerZone && slot.dangerZone.size > 0) {
        // console.log(slot.canGo.size)
        if (slot.color == 1) {
            if (slot.type == 'pawn') {
                whiteKingCantGo = new Set([...whiteKingCantGo, ...slot.dangerZone])
            }
            else {
                let arr = [...whiteKingCantGo, ...slot.canGo];
                if (slot.dangerZone && slot.dangerZone.size > 0) arr.push(...slot.dangerZone)
                whiteKingCantGo = new Set(arr)
            }
        } else if (slot.color == 0) {
            if (slot.type == 'pawn') {
                blackKingCantGo = new Set([...blackKingCantGo, ...slot.dangerZone])
            }
            else {
                let arr = [...blackKingCantGo, ...slot.canGo];
                if (slot.dangerZone && slot.dangerZone.size > 0) arr.push(...slot.dangerZone)
                blackKingCantGo = new Set(arr)
            }
        }
    }
    // if (slot.canGo.size > 0)
    //     n.add(...slot.canGo)
    return c;
}

function kingMove(slot, x, y) {
    slot.dangerZone = new Set();
    if (!x) x = +slot.col
    if (!y) y = +slot.row
    // if (x == 4 && !slot.moved && !slots[y][x-4].moved && !slots[y][x-2].isPiece && !slots[y][x-3].isPiece && !slots[y][x-1].isPiece) {
    //     if (slots[y][0].isPiece && slots[y][0].type == 'rook' && slots[y][0].color == slot.color) {
    //         slots[y][x-2].isCassleLong = true;
    //         slot.canGo.add([y, x-2].join(''))
    //     }
    // }
    // if (x == 4 && !slot.moved && !slots[y][x+3].moved && !slots[y][x+2].isPiece && !slots[y][x+1].isPiece) {
    //     if (slots[y][7].isPiece && slots[y][7].type == 'rook' && slots[y][7].color == slot.color) {
    //         slots[y][x+2].isCassleShort = true;
    //         slot.canGo.add([y, x+2].join(''))
    //     }
    // }
    // up left
    if (x-1 > -1 && y-1 > -1) {
        if (slots[y-1][x-1].color != slot.color) {
            slot.canGo.add([y-1, x-1].join(''));
        }
        slot.dangerZone.add([y-1, x-1].join(''));
    }
    // up right
    if (x+1 < 8 && y-1 > -1) {
        if (slots[y-1][x+1].color != slot.color) {
            slot.canGo.add([y-1, x+1].join(''));
        }
        slot.dangerZone.add([y-1, x+1].join(''));
    } 
    // up
    if (y-1 > -1) {
        if (slots[y-1][x].color != slot.color) {
            slot.canGo.add([y-1, x].join(''));
        }
        slot.dangerZone.add([y-1, x].join(''));
    } 
    // right
    if (x+1 < 8) {
        if (slots[y][x+1].color != slot.color) {
            slot.canGo.add([y, x+1].join(''));
        }
        slot.dangerZone.add([y, x+1].join(''));
    }
    // up right
    if (x+1 < 8 && y-1 > -1) {
        if (slots[y-1][x+1].color != slot.color) {
            slot.canGo.add([y-1, x+1].join(''));
        }
        slot.dangerZone.add([y-1, x+1].join(''));
    }
    // down right
    if (x+1 < 8 && y+1 < 8) {
        if (slots[y+1][x+1].color != slot.color) {
            slot.canGo.add([y+1, x+1].join(''));
        }
        slot.dangerZone.add([y+1, x+1].join(''));
    }
    // down
    if (y+1 < 8) {
        if (slots[y+1][x].color != slot.color) {
            slot.canGo.add([y+1, x].join(''));
        }
        slot.dangerZone.add([y+1, x].join(''));
    } 
    // down left
    if (x-1 > -1 && y+1 < 8) {
        if (slots[y+1][x-1].color != slot.color) {
            slot.canGo.add([y+1, x-1].join(''));
        }
        slot.dangerZone.add([y+1, x-1].join(''));
    }
    // left
    if (x-1 > -1) {
        if (slots[y][x-1].color != slot.color) {
            slot.canGo.add([y, x-1].join(''));
        }
        slot.dangerZone.add([y, x-1].join(''));
    }
    
    // if (slot.color == 0) {
    //     whiteKingCantGo = new Set([...whiteKingCantGo, ...slot.canGo]);
    // } else {
    //     // console.log(145)
    //     blackKingCantGo = new Set([...blackKingCantGo, ...slot.canGo]);
    // }
}
function setCheck(slot) {
    isCheck = true;
    check.type = slot.type
    check.canBeCauptured = '' + slot.row + slot.col;
    check.canBeCovered = new Set();
    check.color = slot.color;
    check.to = +!slot.color;
}
function rookMove(slot, x, y, isQueen) {
    if (!isQueen) {
        slot.dangerZone = new Set();
    }
    // left
    let pos = new Set();
    for (let i = x -1; i > -1; i--) {
        pos.add(''+y+i)
    }
    if (validateMoves(slot, pos)) return true;

    // for (let i = x -1; i > -1; i--) {
    //     if (slots[y][i].isPiece && slots[y][i].color == slot.color) {
    //         slot.dangerZone.add([y, i].join(''));
    //         break;
    //     }else if (slots[y][i].isPiece && slots[y][i].color != slot.color) {
    //         slot.canGo.add([y, i].join(''));
    //         if (check.type == slot.type && check.canBeCauptured && check.canBeCauptured == slot.row+slot.col) {
                
    //             if (slots[y][i].type == 'king') {
    //                 slot.dangerZone.add([y, --i].join(''))
    //             }
    //             break;
    //         }
    //         if (slots[y][i].type == 'king') {
    //             // isCheck = true;
    //             // check.type = slot.type
    //             // check.canBeCauptured = [slot.row, slot.col].join('');
    //             // check.canBeCovered = new Set();
    //             // check.color = slot.color;
    //             setCheck(slot, y, i, 'x < slot.col', 0, +1);
    //             for (let n = i; n < slot.col; n++) {
    //                 check.canBeCovered.add([y, n].join(''))
    //             }
    //             slot.dangerZone.add([y, --i].join(''))
    //             return true;
    //         }
    //         break;
    //     } else if (!slots[y][i].isPiece && slots[y][i].color != slot.color) {
    //         slot.canGo.add([y, i].join(''));
    //     }
    // }
    // right
    pos = new Set();
    for (let i = x +1; i < 8; i++) {
        pos.add(''+y+i)
    }
    if (validateMoves.call(slot, pos)) return true;
    // for (let i = x +1; i < 8; i++) {
    //     // one piece needs to protect the other one.
    //     if (slots[y][i].isPiece && slots[y][i].color == slot.color) {
    //         slot.dangerZone.add([y, i].join(''));
    //         // console.log([y, i])
    //         break;
    //     } else if (slots[y][i].isPiece && slots[y][i].color != slot.color) {
    //         slot.canGo.add([y, i].join(''));
    //         if (check.type == slot.type && check.canBeCauptured && check.canBeCauptured[0] == slot.row && check.canBeCauptured[1] == slot.col) {
                
    //             if (slots[y][i].type == 'king') {
    //                 slot.dangerZone.add([y, ++i].join(''))
    //             }
    //             break;
    //         }
    //         if (slots[y][i].type == 'king') {
    //             // isCheck = true;
    //             // check.type = slot.type
    //             // check.canBeCauptured = [slot.row, slot.col].join('');
    //             // check.canBeCovered = new Set();
    //             // check.color = slot.color;
    //             setCheck(slot, y, i, 'x > slot.col', 0, -1);
    //             for (let n = i; n > slot.col; n--) {
    //                 check.canBeCovered.add([y, n].join(''))
    //             }
                
    //             slot.dangerZone.add([y, ++i].join(''))
    //             return true;
    //         }
    //         break;
    //     } else if (!slots[y][i].isPiece && slots[y][i].color != slot.color) {
    //         slot.canGo.add([y, i].join(''));
    //     }
    // }
    // up
    pos = new Set();
    for (let i = y -1; i > -1; i--) {
        pos.add(''+i+x)
    }
    if (validateMoves.call(this, slot, pos)) return true;
    // for (let i = y -1; i > -1; i--) {
    //     let p = slots[i][x];
    //     if (p.isPiece && p.color == slot.color) {
    //         slot.dangerZone.add([i, x].join(''));
    //         break;
    //     } else if (p.isPiece && p.color != slot.color) {
    //         slot.canGo.add([i, x].join(''));
    //         if (check.type == slot.type && check.canBeCauptured && check.canBeCauptured[0] == slot.row && check.canBeCauptured[1] == slot.col) {
    //             if (p.type == 'king') {
    //                 slot.dangerZone.add([--i, x].join(''))
    //             }
    //             break;
    //         }
    //         if (p.type == 'king') {
    //             // isCheck = true;
    //             // check.type = slot.type
    //             // check.canBeCauptured = [slot.row, slot.col].join('');
    //             // check.canBeCovered = new Set();
    //             // check.color = slot.color;
    //             setCheck(slot, i, x, 'y < slot.col', +1, 0);
    //             for (let n = i; n < slot.row; n++) {
    //                 check.canBeCovered.add([n, x].join(''))
    //             }
    //             slot.dangerZone.add([--i, x].join(''))
    //             return true;
    //         }
    //         break;
    //     } else if (!p.isPiece && p.color != slot.color) {
    //         slot.canGo.add([i, x].join(''));
    //     }
    // }
    // down
    pos = new Set();
    for (let i = y +1; i < 8; i++) {
        pos.add(''+i+x)
    }
    if (validateMoves.call(this, slot, pos)) return true;
    // for (let i = y +1; i < 8; i++) {
    //     if (slots[i][x].isPiece && slots[i][x].color == slot.color) {
    //         if (slot.color == 'white') {
    //             slot.dangerZone.add([i, x].join(''));
    //         }
    //         else slot.dangerZone.add([i, x].join(''));
    //         break;
    //     } else if (slots[i][x].isPiece && slots[i][x].color != slot.color) {
    //         slot.canGo.add([i, x].join(''));
    //         if (check.type == slot.type && check.canBeCauptured && check.canBeCauptured[0] == slot.row && check.canBeCauptured[1] == slot.col) {
    //             if (slots[i][x].type == 'king') {
    //                 slot.dangerZone.add([++i, x].join(''))
    //             }
    //             break;
    //         }
    //         if (slots[i][x].type == 'king') {
    //             // isCheck = true;
    //             // check.type = slot.type
    //             // check.canBeCauptured = [slot.row, slot.col].join('');
    //             // check.canBeCovered = new Set();
    //             // check.color = slot.color;
    //             setCheck(slot, i, x, 'y > slot.col', -1, 0);
    //             for (let n = i; n > slot.row; n--) {
    //                 check.canBeCovered.add([n, x].join(''))
    //             }
    //             slot.dangerZone.add([++i, x].join(''))
    //             return true;
    //         }
    //         break;
    //         // bug fixed; shorten the code; add check object to all the figures;
    //     } else if (!slots[i][x].isPiece) {
    //         slot.canGo.add([i, x].join(''));
    //     }
    // }
}
function pawnMove(slot, x, y) {
    slot.dangerZone = new Set();
    let n = -1
    if (slot.color == 1)
        n = +1;
    slot.canGo = new Set();
    let front = this.slots[y+n][x];
    let doubleFront;
    if (slot.color == 0 && y == 6 || slot.color == 1 && y == 1) {
        doubleFront = slots[y+n*2][x]
    }
    
    let frontLeft = {}
    let frontRight = {}
    if (x-1 != -1) {
        frontLeft = this.slots[y+n][x-1];
    }
    if (x+1 != 8) {
        frontRight = this.slots[y+n][x+1]
    }

    if (!front.isPiece) {
        slot.canGo.add([y+n, x].join(''))
    }
    if (!front.isPiece && doubleFront && !doubleFront.isPiece) {
        slot.canGo.add([+doubleFront.row, x].join(''))
    }
    if (frontLeft.isPiece && frontLeft.color != slot.color) {
        slot.canGo.add([y+n, x-1].join(''))
        if (frontLeft.type == 'king') {
            if (isCheck) {
                // this is to avoid repeatead finAllMoves function call.
                // slot.canGo.add(i)
                // slot.dangerZone.add([...pos][n+1])
                if (slot.color == 0)
                    blackKingCantGo.add([y+n, x-1].join(''))
                else if (slot.color == 1)
                    whiteKingCantGo.add([y+n, x-1].join(''))
                // break;
            }
            else {
                setCheck(slot)
                console.log('check')
                // slot.dangerZone.add()
                return true;
            }
        }
    } else if (!frontLeft.isPiece && x-1 > -1) {
        slot.dangerZone.add([y+n, x-1].join(''))
    } else if (frontLeft.isPiece && frontLeft.color == slot.color) {
        if (slot.color == 0)
            blackKingCantGo.add([y+n, x-1].join(''))
        else if (slot.color == 1)
            whiteKingCantGo.add([y+n, x-1].join(''))
    }
    if (frontRight.isPiece && frontRight.color != slot.color) {
        slot.canGo.add([y+n, x+1].join(''))
        if (frontRight.type == 'king') {
            if (isCheck) {
                if (slot.color == 0)
                    blackKingCantGo.add([y+n, x+1].join(''))
                else if (slot.color == 1)
                    whiteKingCantGo.add([y+n, x+1].join(''))
                // break;
            }
            else {
                setCheck(slot)
                console.log('check')
                // slot.dangerZone.add()
                return true;
            }
        }
    }
    else if (frontRight.isPiece && frontRight.color == slot.color) {
        if (slot.color == 0)
            blackKingCantGo.add([y+n, x+1].join(''))
        else if (slot.color == 1)
            whiteKingCantGo.add([y+n, x+1].join(''))
    } else if (!frontRight.isPiece && x+1 < 8) {
        slot.dangerZone.add([y+n, x+1].join(''))
    }
}
function horseMove(slot, x, y) {
    slot.dangerZone = new Set();
    // left left down
    if (x-2 > -1 && y+1 < 8 && slots[y+1][x-2].color != slot.color) {
        slot.canGo.add([y+1, x-2].join(''))
        if (slots[y+1][x-2].type == 'king' && !isCheck) {
            // isCheck = true;
            // check.type = 'knight';
            // check.canBeCauptured = [slot.row, slot.col].join('');
            setCheck(slot)
            // slot.dangerZone.add([y, ++i].join(''))
            return true;
        }
    } else if (x-2 > -1 && y+1 < 8 && slots[y+1][x-2].color == slot.color) {
        slot.dangerZone.add([y+1, x-2].join(''))
    }
    // left left up
    if (x-2 > -1 && y-1 > -1 && slots[y-1][x-2].color != slot.color) {
        slot.canGo.add([y-1, x-2].join(''))
        if (slots[y-1][x-2].type == 'king' && !isCheck) {
            setCheck(slot)
            // isCheck = true;
            // check.type = 'knight';
            // check.canBeCauptured = [slot.row, slot.col].join('');
            // slot.dangerZone.add([y, ++i].join(''))
            return true;
        }
    } else if (x-2 > -1 && y-1 > -1 && slots[y-1][x-2].color == slot.color) {
        slot.dangerZone.add([y-1, x-2].join(''))
    }
    // left up up
    if (x-1 > -1 && y-2 > -1 && slots[y-2][x-1].color != slot.color) {
        slot.canGo.add([y-2, x-1].join(''))
        if (slots[y-2][x-1].type == 'king' && !isCheck) {
            setCheck(slot)
            // isCheck = true;
            // check.type = 'knight';
            // check.canBeCauptured = [slot.row, slot.col].join('');
            // slot.dangerZone.add([y, ++i].join(''))
            return true;
        }
    } else if (x-1 > -1 && y-2 > -1 && slots[y-2][x-1].color == slot.color) {
        slot.dangerZone.add([y-2, x-1].join(''))
    }
    // left down down
    if (x-1 > -1 && y+2 < 8 && slots[y+2][x-1].color != slot.color) {
        slot.canGo.add([y+2, x-1].join(''))
        if (slots[y+2][x-1].type == 'king' && !isCheck) {
            setCheck(slot)
            // isCheck = true;
            // check.type = 'knight';
            // check.canBeCauptured = [slot.row, slot.col].join('');
            // slot.dangerZone.add([y, ++i].join(''))
            return true;
        }
    } else if (x-1 > -1 && y+2 < 8 && slots[y+2][x-1].color == slot.color) {
        slot.dangerZone.add([y+2, x-1].join(''))
    }
    // right up up
    if (x+1 < 8 && y-2 > -1 && slots[y-2][x+1].color != slot.color) {
        slot.canGo.add([y-2, x+1].join(''))
        if (slots[y-2][x+1].type == 'king' && !isCheck) {
            // isCheck = true;
            // check.type = 'knight';
            // check.canBeCauptured = [slot.row, slot.col].join('');
            setCheck(slot)
            // slot.dangerZone.add([y, ++i].join(''))
            return true;
        }
    } else if (x+1 < 8 && y-2 > -1 && slots[y-2][x+1].color == slot.color) {
        slot.dangerZone.add([y-2, x+1].join(''))
    }
    // right down down
    if (x+1 < 8 && y+2 < 8 && slots[y+2][x+1].color != slot.color) {
        slot.canGo.add([y+2, x+1].join(''))
        if (slots[y+2][x+1].type == 'king' && !isCheck) {
            setCheck(slot)
            // isCheck = true;
            // check.type = 'knight';
            // check.canBeCauptured = [slot.row, slot.col].join('');
            // slot.dangerZone.add([y, ++i].join(''))
            return true;
        }
    } else if (x+1 < 8 && y+2 < 8 && slots[y+2][x+1].color == slot.color) {
        slot.dangerZone.add([y+2, x+1].join(''))
    }
    // right right up
    if (x+2 < 8 && y-1 > -1 && slots[y-1][x+2].color != slot.color) {
        slot.canGo.add([y-1, x+2].join(''))
        if (slots[y-1][x+2].type == 'king' && !isCheck) {
            setCheck(slot)
            // isCheck = true;
            // check.type = 'knight';
            // check.canBeCauptured = [slot.row, slot.col].join('');
            // slot.dangerZone.add([y, ++i].join(''))
            return true;
        }
    } else if (x+2 < 8 && y-1 > -1 && slots[y-1][x+2].color == slot.color) {
        slot.dangerZone.add([y-1, x+2].join(''))
    }
    // right right down
    if (x+2 < 8 && y+1 < 8 && slots[y+1][x+2].color != slot.color) {
        slot.canGo.add([y+1, x+2].join(''))
        if (slots[y+1][x+2].type == 'king' && !isCheck) {
            setCheck(slot)
            // isCheck = true;
            // check.type = 'knight';
            // check.canBeCauptured = [slot.row, slot.col].join('');
            // slot.dangerZone.add([y, ++i].join(''))
            return true;
        }
    } else if (x+2 < 8 && y+1 < 8 && slots[y+1][x+2].color == slot.color) {
        slot.dangerZone.add([y+1, x+2].join(''))
    }
}
function validateMoves(slot, pos) {
    let allowedMoves = new Set()
    let pin = false;
    let pinned = null;
    allowedMoves.add(''+slot.row+slot.col)
    let n = 0;
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
        else if (tmp.color == slot.color) {
            slot.dangerZone.add(i);
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
                if (isCheck) {
                    // this is to avoid repeatead finAllMoves function call.
                    slot.canGo.add(i)
                    slot.dangerZone.add([...pos][n+1])
                    if (slot.color == 0)
                        blackKingCantGo.add([...pos][n+1])
                    else if (slot.color == 1)
                        whiteKingCantGo.add([...pos][n+1])
                    break;
                }
                else {
                    setCheck(slot)
                    // i, m is x; j, n is y
                    // for (let n = j, m = i; n < slot.row, m < slot.col; n++, m++) {
                        this.check.canBeCovered = allowedMoves//.add([n, m].join(''))
                    // }
                    console.log('check')
                    slot.dangerZone.add([...pos][++n])
                    return true;
                }
            } else if (tmp.type == 'king' && pin) {
                pinns.add({
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
function bishopMove(slot, x, y, isQueen) {
    let pin = false;
    let pinned = null;
    let allowedMoves = new Set();
    // if (!isQueen) {
        slot.dangerZone = new Set();
    // }
    // left up
    let pos = new Set();
    for (let i = x-1, j = y-1; i > -1 && j > -1; i--, j--) {
        pos.add(''+j+i);
    }
    if (validateMoves(slot, pos)) return true;
    // for (let i = x-1, j = y-1; i > -1 && j > -1; i--, j--) {
    //     if (slots[j][i].isPiece && slots[j][i].color == slot.color) {
    //         slot.dangerZone.add([j, i].join(''));
    //         break;
    //     } else if (slots[j][i].isPiece && slots[j][i].color != slot.color) {
    //         slot.canGo.add([j, i].join(''));
    //         // console.log(pin)
    //         if (slots[j][i].type == 'king') {
    //             // isCheck = true;
    //             // check.type = slot.type
    //             // check.canBeCauptured = [slot.row, slot.col].join('');
    //             // check.canBeCovered = new Set();
    //             // check.color = slot.color;
    //             setCheck(slot)
    //             // i, m is x; j, n is y
    //             for (let n = j, m = i; n < slot.row, m < slot.col; n++, m++) {
    //                 check.canBeCovered.add([n, m].join(''))
    //             }
    //             console.log('check')
    //             slot.dangerZone.add([--j, --i].join(''))
    //             return true;
    //         } 
    //         // else {
    //         //     if (pin) {
    //         //         pin = false;
    //         //         break;
    //         //     }
    //         //     pin = true;
    //         //     console.log(slots[j][i].type)
    //         //     // debugger
    //         // }
    //         break;
    //     } else if (!slots[j][i].isPiece && slots[j][i].color != slot.color) {
    //         slot.canGo.add([j, i].join(''));
    //     }
    // }
    // console.log(pos)
    // left down
    for (let i = x-1, j = y+1; i > -1 && j < 8; i--, j++) {
        if (slots[j][i].isPiece && slots[j][i].color == slot.color) {
            if (slot.color == 'white') slot.dangerZone.add([j, i].join(''));
            else slot.dangerZone.add([j, i].join(''));
            break;
        } else if (slots[j][i].isPiece && slots[j][i].color != slot.color) {
            slot.canGo.add([j, i].join(''));
            if (slots[j][i].type == 'king') {
                isCheck = true;
                check.type = isQueen ? 'queen' : 'bishop';
                check.canBeCauptured = [slot.row, slot.col].join('');
                check.canBeCovered = new Set();
                check.color = slot.color;
                // i is x, j is y
                // m is x, n is y
                for (let n = j, m = i; n > slot.row, m < slot.col; n--, m++) {
                    check.canBeCovered.add([n, m].join(''))
                    console.log(j, i)
                }
                console.log('check')
                slot.dangerZone.add([++j, --i].join(''))
                return true;
            }
            break;
        } else if (!slots[j][i].isPiece && slots[j][i].color != slot.color) {
            slot.canGo.add([j, i].join(''));
        }
    }
    // right down
    pos = new Set();
    for (let i = x+1, j = y+1; i < 8 && j < 8; i++, j++) {
        pos.add(''+j+i)}
    if (validateMoves(slot, pos)) return true;
    // for (let i = x+1, j = y+1; i < 8 && j < 8; i++, j++) {
    //     if (slots[j][i].isPiece && slots[j][i].color == slot.color) {
    //         if (slot.color == 'white') slot.dangerZone.add([j, i].join(''));
    //         else slot.dangerZone.add([j, i].join(''));
    //         break;
    //     } else if (slots[j][i].isPiece && slots[j][i].color != slot.color) {
    //         slot.canGo.add([j, i].join(''));
    //         if (slots[j][i].type == 'king') {
    //             isCheck = true;
    //             check.type = isQueen ? 'queen' : 'bishop';
    //             check.canBeCauptured = [slot.row, slot.col].join('');
    //             check.canBeCovered = new Set();
    //             check.color = slot.color;
    //             // i, m is x; j, n is y
    //             for (let n = j, m = i; n > slot.row, m > slot.col; n--, m--) {
    //                 check.canBeCovered.add([n, m].join(''))
    //             }
    //             console.log('check')
    //             slot.dangerZone.add([++j, ++i].join(''))
    //             return true;
    //         }
    //         break;
    //     } else if (!slots[j][i].isPiece && slots[j][i].color != slot.color) {
    //         slot.canGo.add([j, i].join(''));
    //     }
    // }
    // right up
    pos = new Set();
    for (let i = x+1, j = y-1; i < 8 && j > -1; i++, j--) {
        pos.add(''+j+i)
    }
    if (validateMoves(slot, pos)) return true;
    // for (let i = x+1, j = y-1; i < 8 && j > -1; i++, j--) {
    //     if (slots[j][i].isPiece && slots[j][i].color == slot.color) {
    //         slot.dangerZone.add([j, i].join(''));
    //         break;
    //     } else if (slots[j][i].isPiece && slots[j][i].color != slot.color) {
    //         if (!pin)
    //             slot.canGo.add([j, i].join(''));
    //         if (slots[j][i].type == 'king') {
    //             isCheck = true;
    //             check.type = slot.type
    //             check.canBeCauptured = [slot.row, slot.col].join('');
    //             check.canBeCovered = new Set();
    //             check.color = slot.color;
    //             // setCheck();
    //             // i, m is x; j, n is y
    //             for (let n = j, m = i; n < slot.row, m > slot.col; n++, m--) {
    //                 check.canBeCovered.add([n, m].join(''))
    //             }
    //             console.log('check')
    //             slot.dangerZone.add([--j, ++i].join(''))
    //             return true;
    //         }
    //         break;
    //     } else if (!slots[j][i].isPiece && slots[j][i].color != slot.color) {
    //         slot.canGo.add([j, i].join(''));
    //     }
    // }
}
function queenMove(slot, x, y) {
    // if (isCheck)
    // debugger
    let c = bishopMove(slot, x, y, true)
    let z = rookMove(slot, x, y, true);
    return c || z;
}