const NUM_CELLS_IN_A_GRID = 81; /* 9 x 9 grid */
const MIN_CLUES_TO_SOLVE = 17;
const ROW_AND_COL_LENGTH = 9;

const isValidPuzzleRE = new RegExp('^[1-9\.]{81}$');
const isValidRowRE = new RegExp('^[a-i]$', 'i');
const isValidColumnRE = new RegExp('^[1-9]$');
const isValidValueRE = isValidColumnRE;

class SudokuSolver 
{
  validate( puzzleString ) 
  {
    if( puzzleString.length !== NUM_CELLS_IN_A_GRID) {
      return {
        "isValid": false,
        "error":"Expected puzzle to be 81 characters long"
      };
    }
    if(! isValidPuzzleRE.test(puzzleString) ) {
      return {
        "isValid": false,
        "error": "Invalid characters in puzzle"
      };
    }
    if(! areEnoughClues(puzzleString) ) {
      return {
        "isValid": false, 
        "error": "Puzzle cannot be solved"
      };
    }
    let isEachClueValid = validateEachClue(puzzleString);
    if (! isEachClueValid ) {
      return {
        "isValid": false, 
        "error": "Puzzle cannot be solved"
      };
    }
    else {
      return {
        "isValid": true
      };
    }
  }

  checkRowPlacement( puzzleString, row, column, value ) {
    if (! isValidRowColVal(row, column, value)) {
      return false;
    }
    let rowNumber = rowLetter2Number(row);
    let puzzleMatrix = createPuzzleMatrix(puzzleString);
    let currentRow = puzzleMatrix[rowNumber];
    
    if (isCellTaken(puzzleString, 
                    rowNumber,
                    parseInt(column) - 1)) 
    { 
      return false;
    }
    return ! doesValueAlreadyExist(currentRow, value);
  }

  checkColPlacement( puzzleString, row, column, value ) {
    if (! isValidRowColVal(row, column, value)) {
      return false;
    }
    let rowNumber = rowLetter2Number(row);
    let puzzleMatrix = createPuzzleMatrix(puzzleString);
    let currentColumn = getSudokuMatrixColumn(puzzleMatrix,
                    parseInt(column) - 1);
    
    if (isCellTaken(puzzleString, 
                    rowNumber,
                    parseInt(column) - 1)) 
    { 
      return false;
    }
    return ! doesValueAlreadyExist(currentColumn, value);
  }

  checkRegionPlacement( puzzleString, row, column, value ) {
    if (! isValidRowColVal(row, column, value)) {
      return false;
    }
    let rowNumber = rowLetter2Number(row);
    let currentRegion = 
      getSudokuMatrixRegion(puzzleString,
                            rowNumber,
                            parseInt(column) - 1);
    
    if (isCellTaken(puzzleString, 
                    rowNumber,
                    parseInt(column) - 1)) 
    { 
      return false;
    }
    return ! doesValueAlreadyExist(currentRegion, value);
  }

  solve( puzzleString ) {
    let puzzleMatrix = createPuzzleMatrix(puzzleString);
    if( puzzleString.length !== NUM_CELLS_IN_A_GRID )
    {
      return { "error": "Invalid length in solve()" };
    }
    if(! isValidPuzzleRE.test(puzzleString) )
    {
      return { "error": "Invalid characters in solve()" };
    }
    let annotatedMatrix = 
      addNextToTryToMatrix(puzzleMatrix);
    let unsolvable = false;
    let iter = 0;
    while( iter < NUM_CELLS_IN_A_GRID ) {
      // get the working cell
      let wRowIndex = 
        Math.floor(iter / ROW_AND_COL_LENGTH);
      let wColumnIndex = iter % ROW_AND_COL_LENGTH;
      let wCell = annotatedMatrix[wRowIndex][wColumnIndex];
      let wPuzzleString = annotatedMatrix
                        .flat()
                        .map((e) => {return e.value;} )
                        .join("");
      // skip clues
      if( wCell.nextNumToTry === -1/*clue*/ ) {
        iter++;
      }
 
      // make a guess
      else {
        let possibleValue = 
          findNextValidNumber(wPuzzleString,
                              wRowIndex,
                              wColumnIndex,
                              wCell.nextNumToTry);
        if( possibleValue === -1 ) {
          wCell.value = ".";
          wCell.nextNumToTry = 1;
          iter = backtrack(puzzleString, iter);
          if (iter === -1) {unsolvable = true; break;}
          wRowIndex = Math.floor(iter / ROW_AND_COL_LENGTH);
          wColumnIndex = iter % ROW_AND_COL_LENGTH;
          wCell = annotatedMatrix[wRowIndex][wColumnIndex];
          wCell.value = ".";
          wPuzzleString = annotatedMatrix
                          .flat()
                          .map((e) => {return e.value;} )
                          .join("");
        }
        else {
          wCell.value = possibleValue;
          wCell.nextNumToTry = possibleValue + 1;

          wPuzzleString = annotatedMatrix
                          .flat()
                          .map((e) => {return e.value;} )
                          .join("");
          iter++;
        }
      }
    }
    if (unsolvable) {
      return { "error": "Puzzle cannot be solved" };
    }
    return {
             "solution": annotatedMatrix
                         .flat()
                         .map((e) => {return e.value;} )
                         .join("")
           };
  }
}

module.exports = SudokuSolver;

let sudokuSolver = new SudokuSolver();

/* HELPERS */

function rowLetterFromIndex(index) {
  let letter = String.fromCharCode( index + 'A'.charCodeAt(0));
  return letter;
}

function findNextValidNumber(puzzleString, row, col, nextNumberToTry) {
  let nextNum = nextNumberToTry;
  while( nextNum <= 9 ) {
    if ( 
         sudokuSolver.checkColPlacement(
           puzzleString,
           rowLetterFromIndex(row),
           parseInt(col) + 1,
           nextNum.toString()
         )
         && 
         sudokuSolver.checkRowPlacement(
           puzzleString,
           rowLetterFromIndex(row),
           parseInt(col) + 1,
           nextNum.toString()
         ) 
         && sudokuSolver.checkRegionPlacement(
           puzzleString,
           rowLetterFromIndex(row),
           parseInt(col) + 1,
           nextNum.toString()
         )
       )
    { 
      return nextNum;
    }
    nextNum++;
  }
  return -1;
}

function addNextToTryToMatrix(puzzleMatrix) {
  let annotatedMatrix = puzzleMatrix.map(row => {
    return row.map(cell => {
      if(cell === ".")
      {
        return {
                 value: cell,
                 nextNumToTry: 1
               };
      }
      else {
        return {
                 value: cell,
                 nextNumToTry: -1
               };
      }
    })
  });
  return annotatedMatrix;
}

function backtrack(puzzleString, currentIndex) {
  let indexIter = currentIndex - 1;
  while( indexIter >= 0 ) {
    let prevCell = puzzleString[indexIter];
    if (prevCell === '.') {
      return indexIter;
    }
    else {
      indexIter--;
    }
  }
  return -1;
}

function prettyPrint(puzzleString) {
  const puzzle = createPuzzleMatrix(puzzleString);
  console.log("   1 2 3 | 4 5 6 | 7 8 9");
  console.log("");
  for (let i = 0; i < 9; i++) {
    const letter = String.fromCharCode('A'.charCodeAt(0) + i);
    const row = puzzle[i];
    const firstThree = row.slice(0, 3);
    const middleThree = row.slice(3, 6);
    const lastThree = row.slice(6, 9);
    if (i !== 0 && i % 3 === 0) {console.log("------------------------");}
    const res =  letter +": " + firstThree.join(" ") + " | " + middleThree.join(" ") + " | " + lastThree.join(" ");
    console.log(res);
  }
  console.log("");
}

function getRegionTopLeftIndex(row, column) {
  const regionYCoord = Math.floor(row / 3);
  const regionXCoord = Math.floor(column / 3);
  const res = regionXCoord * 3 + regionYCoord * 9 * 3;
  return res;
}

function getRegion(regionIndex, puzzleString) {
  let regionArray = [];
  for (let i = 0; i < ROW_AND_COL_LENGTH; i++)
  {
    let rowOffset = Math.floor(i / 3);
    let columnOffset = i % 3;
    let wIndex = regionIndex 
                 + rowOffset 
                 * ROW_AND_COL_LENGTH 
                 + columnOffset;

    regionArray.push(puzzleString[wIndex]);
  }
  return regionArray;
}

function getSudokuMatrixRegion(puzzleString,
                               rowNumber,
                               colIndex)
{
  const regionIndex =
    getRegionTopLeftIndex(rowNumber, colIndex);

  const region = getRegion(regionIndex, puzzleString);
  return region;
}


function getSudokuMatrixColumn(matrix, columnIndex) {
  let column = [];
  for (let i = 0; i < ROW_AND_COL_LENGTH; i++) {
    const cellValue = matrix[i][columnIndex];
    column.push(cellValue);
  }
  return column;
} 

function createPuzzleMatrix(puzzleString) {
  let puzzleMatrix = [];
  let puzzleRow = [];
  for (let i = 0; i < puzzleString.length; i++) {
    let c = puzzleString[i];
    if (i !== 0 && i % ROW_AND_COL_LENGTH === 0) {
      puzzleMatrix.push([...puzzleRow]);
      puzzleRow = [];
    }
    puzzleRow.push(c);
  }
  puzzleMatrix.push(puzzleRow);
  return puzzleMatrix;
}

function isValidRowColVal(row, col, val) {
  return isValidRowRE.test(row)
         && isValidColumnRE.test(col)
         && isValidValueRE.test(val)
  /*
  Kept here in case sanity tests are needed 
  if (! isValidRowRE.test(row)) {
    return false;
  }
  if (! isValidColumnRE.test(col)) {
    return false;
  }
  return isValidValueRE.test(val);
  */
}

function doesValueAlreadyExist(seq, val) {
  for (let i = 0; i < seq.length; i++) {
    if (seq[i] === val) { 
      return true;
    }
  }
  return false;
}

function isCellTaken(puzzleString, row, col) {
  let index = row * 9 + col;
  return puzzleString[index] !== '.';
}

function areEnoughClues(puzzleString) {
  const onlyNumerals = 
      puzzleString.replace(/[^1-9]/gm, '');

  return onlyNumerals.length >= MIN_CLUES_TO_SOLVE;
}

function validateEachClue(puzzleString) {
  for( let i = 0; i < NUM_CELLS_IN_A_GRID; i++ ) {
      let wValue = puzzleString[i];

      let wRowNumber =
        Math.floor(i / ROW_AND_COL_LENGTH); 
      
      let wRow = 
        String.fromCharCode( wRowNumber
                             + 'A'.charCodeAt(0)); 

      let wCol = i % ROW_AND_COL_LENGTH + 1;
      if( wValue === '.' ) continue;

      let puzzleArray = puzzleString.split("");
      puzzleArray[i] = '.';
      let wPuzzleString = puzzleArray.join("");

      if(! sudokuSolver.checkRowPlacement(wPuzzleString,
                             wRow, 
                             wCol, 
                             wValue))
      {
        return false;
      }    
      if(! sudokuSolver.checkColPlacement(wPuzzleString,
                             wRow, 
                             wCol, 
                             wValue))
      {
        return false;
      }   
      if(! sudokuSolver.checkRegionPlacement(wPuzzleString,
                                wRow, 
                                wCol, 
                                wValue))
      {
        return false;
      }
  }
  return true;
}

function rowLetter2Number(row) {
  const res = 
    row.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  return res;
}

/* END OF HELPERS */