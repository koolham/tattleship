import React, { useState, useEffect } from "react";
import "./Tattleship.css";

const GRID_SIZE = 10;
const SHIP_SIZES = [2, 3, 4];
const SHIP_WORDS = {
  2: "TO",
  3: "CAT",
  4: "SHIP",
};
const TOTAL_SHIP_CELLS = SHIP_SIZES.reduce((sum, size) => sum + size, 0); // 9

function Tattleship() {
  const [grid, setGrid] = useState([]); // 0=empty, 1=ship(hidden), 2=hit, 3=miss, 4=spotted
  const [letterGrid, setLetterGrid] = useState([]); // Stores ship letters
  const [ships, setShips] = useState([]); // Ship objects with cells and state
  const [hits, setHits] = useState(0); // Correct letter guesses, including first spot
  const [misses, setMisses] = useState(0); // Missed shots
  const [guesses, setGuesses] = useState(0); // Tracks letter guesses
  const [score, setScore] = useState(0); // Tracks player score
  const [gameOver, setGameOver] = useState(false);
  const [activeCell, setActiveCell] = useState(null); // For letter input (row, col)
  const [message, setMessage] = useState(""); // Tracks event messages

  useEffect(() => {
    initializeGame();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000); // Message fades after 3 seconds
  };

  const initializeGame = () => {
    const newGrid = Array(GRID_SIZE)
      .fill()
      .map(() => Array(GRID_SIZE).fill(0));
    const newLetterGrid = Array(GRID_SIZE)
      .fill()
      .map(() => Array(GRID_SIZE).fill(""));
    const placedShips = [];

    SHIP_SIZES.forEach((shipLength) => {
      const word = SHIP_WORDS[shipLength];
      let placed = false;
      while (!placed) {
        const isHorizontal = Math.random() > 0.5;
        let row, col;

        if (isHorizontal) {
          row = Math.floor(Math.random() * GRID_SIZE);
          col = Math.floor(Math.random() * (GRID_SIZE - shipLength + 1));
        } else {
          row = Math.floor(Math.random() * (GRID_SIZE - shipLength + 1));
          col = Math.floor(Math.random() * GRID_SIZE);
        }

        let canPlace = true;
        const shipCells = [];
        for (let i = 0; i < shipLength; i++) {
          const r = isHorizontal ? row : row + i;
          const c = isHorizontal ? col + i : col;
          if (newGrid[r][c] !== 0) {
            canPlace = false;
            break;
          }
          shipCells.push([r, c]);
        }

        if (canPlace) {
          shipCells.forEach(([r, c], index) => {
            newGrid[r][c] = 1; // Hidden ship
            newLetterGrid[r][c] = word[index];
          });
          placedShips.push({
            cells: shipCells,
            word: word,
            spotted: false,
            guessedLetters: Array(shipLength).fill(""),
            sunk: false,
            spottedCell: null,
          });
          placed = true;
        }
      }
    });

    setGrid(newGrid);
    setLetterGrid(newLetterGrid);
    setShips(placedShips);
    showMessage("Game started! Find and sink the ships.");
  };

  const handleCellClick = (row, col) => {
    if (gameOver || grid[row][col] === 2 || grid[row][col] === 3) return;

    const newGrid = [...grid.map((row) => [...row])];
    let newShips = [...ships];

    if (grid[row][col] === 1 || grid[row][col] === 4) {
      newShips = newShips.map((ship) => {
        const cellIndex = ship.cells.findIndex(
          ([r, c]) => r === row && c === col
        );
        if (cellIndex !== -1 && !ship.spotted) {
          ship.spotted = true;
          ship.spottedCell = [row, col];
          ship.guessedLetters[cellIndex] = ship.word[cellIndex];
          newGrid[row][col] = 2;
          setHits(hits + 1);
          setScore(score + 10); // 10 points for spotting
          showMessage(`Ship spotted! (+10 points)`);
          ship.cells.forEach(([r, c]) => {
            if (r !== row || c !== col) {
              newGrid[r][c] = 4; // Other cells are spotted
            }
          });
          return { ...ship };
        } else if (ship.spotted && !ship.sunk) {
          setActiveCell([row, col]);
        }
        return ship;
      });
    } else {
      newGrid[row][col] = 3;
      setMisses(misses + 1);
      showMessage("Missed shot!");
    }

    setGrid(newGrid);
    setShips(newShips);
  };

  const handleLetterInput = (e, row, col) => {
    if (!activeCell || activeCell[0] !== row || activeCell[1] !== col) return;

    const guessedLetter = e.target.value.toUpperCase().slice(0, 1);
    let newShips = [...ships];
    let newGrid = [...grid.map((row) => [...row])];
    const ship = newShips.find((s) =>
      s.cells.some(([r, c]) => r === row && c === col)
    );
    const cellIndex = ship.cells.findIndex(([r, c]) => r === row && c === col);
    const previousGuess = ship.guessedLetters[cellIndex];

    if (guessedLetter && guessedLetter !== previousGuess) {
      setGuesses(guesses + 1);
    }

    newShips = newShips.map((ship) => {
      if (ship.spotted && !ship.sunk) {
        const cellIndex = ship.cells.findIndex(
          ([r, c]) => r === row && c === col
        );
        if (cellIndex !== -1) {
          ship.guessedLetters[cellIndex] = guessedLetter;
          if (guessedLetter === ship.word[cellIndex]) {
            newGrid[row][col] = 2;
            setHits(hits + 1);
            setScore(score + 5); // 5 points for hitting
            showMessage(`Hit! (+5 points)`);
            if (ship.guessedLetters.join("") === ship.word) {
              ship.sunk = true;
              setScore(score + 20); // 20 points for sinking
              showMessage(`Ship sunk! Word: ${ship.word} (+20 points)`);
            }
          }
        }
      }
      return ship;
    });

    setShips(newShips);
    setGrid(newGrid);
    setActiveCell(null);

    if (newShips.every((ship) => ship.sunk)) {
      setGameOver(true);
      showMessage(`Game Over! You won with ${score + 20} points!`);
    }
  };

  const resetGame = () => {
    setHits(0);
    setMisses(0);
    setGuesses(0);
    setScore(0);
    setGameOver(false);
    setActiveCell(null);
    setMessage("");
    initializeGame();
  };

  return (
    <div className="tattleship">
      <h1>Tattleship</h1>
      <p>
        Hits: {hits}/{TOTAL_SHIP_CELLS} | Misses: {misses} | Guesses: {guesses}{" "}
        | Score: {score}
      </p>
      <div className="message-placeholder">
        <p className="event-message">{message}</p>{" "}
        {/* Always render, empty when no message */}
      </div>
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => {
              const ship = ships.find((s) =>
                s.cells.some(([r, c]) => r === rowIndex && c === colIndex)
              );
              const cellIndex = ship
                ? ship.cells.findIndex(
                    ([r, c]) => r === rowIndex && c === colIndex
                  )
                : -1;
              const isActive =
                activeCell &&
                activeCell[0] === rowIndex &&
                activeCell[1] === colIndex;
              const isSpottedCell =
                ship &&
                ship.spottedCell &&
                ship.spottedCell[0] === rowIndex &&
                ship.spottedCell[1] === colIndex;

              return (
                <div
                  key={colIndex}
                  className={`cell ${
                    cell === 2
                      ? "hit"
                      : cell === 3
                      ? "miss"
                      : cell === 4
                      ? "spotted"
                      : ""
                  }`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell === 3 ? (
                    "O"
                  ) : cell === 2 ? (
                    letterGrid[rowIndex][colIndex]
                  ) : cell === 4 && ship && !ship.sunk ? (
                    isActive ? (
                      <input
                        type="text"
                        maxLength="1"
                        value={ship.guessedLetters[cellIndex] || ""}
                        onChange={(e) =>
                          handleLetterInput(e, rowIndex, colIndex)
                        }
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : isSpottedCell ? (
                      letterGrid[rowIndex][colIndex]
                    ) : (
                      ship.guessedLetters[cellIndex] || ""
                    )
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <button onClick={resetGame}>Reset Game</button>
    </div>
  );
}

export default Tattleship;
