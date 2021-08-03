const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver =  new Solver();

suite('UnitTests', () => {

  suite('Puzzle string validation', function() {
    
    test('Valid puzzle of 81 characters', function(done) {
      let input = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
      assert.deepEqual(solver.validate(input), 
                       { "isValid": true});
      done();
    });
    
    test('Invalid characters in puzzle as input', function(done) {
      let input = '1.5..2.84..63.12.7.2..5.s...9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
      assert.deepEqual(solver.validate(input),
                   {
                     "isValid": false,
                     "error": "Invalid characters in puzzle"
                   });
      done();
    });
    
    test('Puzzle that is not 81 characters long', function(done) {
      let input = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37';
      assert.deepEqual(solver.validate(input), 
                   { 
                     "isValid": false,
                     "error":"Expected puzzle to be 81 characters long"
                   });
      done();
    });
  })

  suite('Row placement validation', function() {

    test('Logic handles a valid row placement', function(done) {
      let puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
      let rowLetter = "A";
      let columnNumber = "2";
      let value = "7";
      assert.equal(solver.checkRowPlacement(puzzle,
                                            rowLetter,
                                            columnNumber,
                                            value),
                   true);
      done();
    });
    
    test('Logic handles an invalid row placement', function(done)
    {
      let puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
      let rowLetter = "A";
      let columnNumber = "1";
      let value = "1";
      assert.equal(solver.checkRowPlacement(puzzle,
                                            rowLetter,
                                            columnNumber,
                                            value),
                   false);
      done();
    });
    
    test('Logic handles a valid column placement', function(done) {
      let puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
      let rowLetter = "A";
      let columnNumber = "2";
      let value = "6";
      assert.equal(solver.checkRowPlacement(puzzle,
                                            rowLetter,
                                            columnNumber,
                                            value),
                   true);
      done();
    });

    test('Logic handles an invalid column placement', function(done) {
      let puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
      let rowLetter = "A";
      let columnNumber = "2";
      let value = "6";
      assert.equal(solver.checkColPlacement(puzzle,
                                            rowLetter,
                                            columnNumber,
                                            value),
                   false);
      done();
    }); 

    test('Logic handles a valid region (3x3 grid) placement', function(done) {
      let puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
      let rowLetter = "A";
      let columnNumber = "2";
      let value = "3";
      assert.equal(
        solver.checkRegionPlacement(puzzle,
                                    rowLetter,
                                    columnNumber,
                                    value),
        true);
      done();
    }); 

    test('Logic handles an invalid region (3x3 grid) placement', function(done) {
      let puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
      let rowLetter = "A";
      let columnNumber = "2";
      let value = "6";
      assert.equal(
        solver.checkRegionPlacement(puzzle,
                                    rowLetter,
                                    columnNumber,
                                    value),
        false);
      done();
    }); 
  })

  suite('Solver unit tests', function() {
    
    test('Valid puzzle strings pass the solver', function(done) {
      let puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
      assert.deepEqual(solver.solve(puzzle),
                    { 
                      "solution":     "135762984946381257728459613694517832812936745357824196473298561581673429269145378"
                    }
                  );
      done();
    }); 

    test('Invalid puzzle strings fail the solver', function(done) {
      let puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37s';
      assert.deepEqual(solver.solve(puzzle), 
                    { "error": "Invalid characters in solve()" } 
                  );
      done();
    }); 

    test('Solver returns the the expected solution for an incomplete puzzle', function(done) {
      let puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914';
      assert.deepEqual(solver.solve(puzzle), 
                   { "error": "Invalid length in solve()" });
      done();
    });
  });
});
