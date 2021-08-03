'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

const validNumbers = 
[
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];

const validLetters = 
[
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
];

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {

      if( (! req.body.hasOwnProperty("puzzle"))
          || req.body.puzzle === ""
          || (! req.body.hasOwnProperty("coordinate"))
          || req.body.coordinate === ""
          || (! req.body.hasOwnProperty("value"))
          || req.body.value === "" 
        ) 
      {
        res.json({"error":"Required field(s) missing"});
        return;
      }

      const puzzleString = req.body.puzzle;
      const coordinate = req.body.coordinate;
      const value = req.body.value;

      if(! validNumbers.includes(value)) {
        res.json({ "error": "Invalid value" });
        return;
      }

      const splitCoordinate = coordinate.split("");
      if (splitCoordinate.length !== 2) {
        res.json({ "error": "Invalid coordinate" });
        return;
      }
      let row = splitCoordinate[0];
      let col = splitCoordinate[1];

      if(! validLetters.includes(row)) {
        res.json({ "error": "Invalid coordinate" });
        return;
      }
      if(! validNumbers.includes(col)) {
        res.json({ "error": "Invalid coordinate" });
        return;
      } 

      let validateRes = solver.validate(puzzleString);
      if( validateRes.isValid ) {
        let conflicts = []; 
        let isValidColPlacement = 
          solver.checkColPlacement(puzzleString, 
                                   row,
                                   col,
                                   value);
        let isValidRowPlacement =
          solver.checkRowPlacement(puzzleString,
                                   row,
                                   col,
                                   value);
        let isValidRegionPlacement = 
          solver.checkRegionPlacement(puzzleString,
                                      row,
                                      col,
                                      value);
        
        if(! isValidRowPlacement ) {
          conflicts.push("row");
        }
        if(! isValidColPlacement) {
          conflicts.push("column");
        }
        if(! isValidRegionPlacement ) {
          conflicts.push("region");
        }
        if( conflicts.length === 0) {
          res.json({ "valid": true });
        }
        else {
          res.json(
            {
              "valid": false,
              "conflict": conflicts
            });
        }
      }
      else {
        res.json({"error": validateRes.error});
      }
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      if( !req.body.hasOwnProperty("puzzle") ) {
        res.json({"error":"Required field missing"});
      }
      const puzzleString = req.body.puzzle;
      if( puzzleString === "") {
        /* should be an or clause. Here in case I want to
        test */
        res.json({"error":"Required field missing"});
      }
      let validateRes = solver.validate(puzzleString);
      if( validateRes.isValid ) { 
        let solverRes = solver.solve(puzzleString);
        res.json(solverRes);
      }
      else {
        res.json({"error": validateRes.error});
      }
    });
};
