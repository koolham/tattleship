import React, { useState, useEffect, useRef } from "react";
import "./Tattleship.css";
import { WORDS_2, WORDS_3, WORDS_4, WORDS_5, SHIP_WORDS } from "./words";

const GRID_SIZE = 10;
const DIFFICULTY = {
  EASY: { ships: [3, 3, 3] },
  MEDIUM: { ships: [2, 3, 3, 4] },
  HARD: { ships: [2, 3, 4, 5, 5] },
};

const DEFAULT_DIFFICULTY = "EASY";

const SPOT_POINTS = 10;
const HIT_POINTS = 5;
const SUNK_POINTS = 20;

function Tattleship() {
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const [grid, setGrid] = useState([]);
  const [letterGrid, setLetterGrid] = useState([]);
  const [ships, setShips] = useState([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [guesses, setGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [activeCell, setActiveCell] = useState(null);
  const [message, setMessage] = useState("");
  const [fadingMisses, setFadingMisses] = useState([]);
  const [scoreAnimations, setScoreAnimations] = useState([]); // {id, value}
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("tattleshipHighScore");
    return saved ? parseInt(saved, 10) : 0;
  });
  let scoreAnimId = useRef(0);
  const messageTimeout = useRef();

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem("tattleshipHighScore", score);
    }
  }, [gameOver, score, highScore]);

  const showMessage = (msg, persist = false) => {
    setMessage(msg);
    if (messageTimeout.current) {
      clearTimeout(messageTimeout.current);
      messageTimeout.current = null;
    }
    if (!persist) {
      messageTimeout.current = setTimeout(() => setMessage(""), 3000);
    }
  };

  const triggerScoreAnimation = (value, delay = 0) => {
    const id = scoreAnimId.current++;
    setTimeout(() => {
      setScoreAnimations((prev) => [...prev, { id, value }]);
      setTimeout(() => {
        setScoreAnimations((prev) => prev.filter((anim) => anim.id !== id));
      }, 2000);
    }, delay);
  };

  const initializeGame = () => {
    const shipSizes = DIFFICULTY[difficulty].ships;
    const newGrid = Array(GRID_SIZE)
      .fill()
      .map(() => Array(GRID_SIZE).fill(0));
    const newLetterGrid = Array(GRID_SIZE)
      .fill()
      .map(() => Array(GRID_SIZE).fill(""));
    const placedShips = [];

    shipSizes.forEach((shipLength) => {
      // Randomly select a word from the appropriate list
      const wordList = SHIP_WORDS[shipLength];
      const word = wordList[Math.floor(Math.random() * wordList.length)];
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
            newGrid[r][c] = 1;
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
    let nextCell = null;

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
          setScore(score + SPOT_POINTS);
          triggerScoreAnimation(SPOT_POINTS);
          showMessage(`Ship spotted! (+${SPOT_POINTS} points)`);
          ship.cells.forEach(([r, c]) => {
            if (r !== row || c !== col) {
              newGrid[r][c] = 4;
            }
          });
          // Auto shift to the next cell to guess
          for (let i = 0; i < ship.cells.length; i++) {
            if (i !== cellIndex && ship.guessedLetters[i] !== ship.word[i]) {
              nextCell = ship.cells[i];
              break;
            }
          }
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
      setGrid(newGrid); // Show the miss immediately
      setFadingMisses((prev) => [...prev, `${row},${col}`]);
      setTimeout(() => {
        setFadingMisses((prev) => prev.filter((id) => id !== `${row},${col}`));
        // Do NOT reset the cell to 0 here!
      }, 1000);
    }

    setGrid(newGrid);
    setShips(newShips);

    // Move focus to the next cell to guess if ship was just spotted
    if (nextCell) {
      setActiveCell(nextCell);
      requestAnimationFrame(() => {
        const input = document.querySelector(
          `.cell[data-row="${nextCell[0]}"][data-col="${nextCell[1]}"] input`
        );
        if (input) {
          input.focus();
          input.select();
        }
      });
    }
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

    let nextCell = null;

    newShips = newShips.map((shipObj) => {
      if (shipObj.spotted && !shipObj.sunk) {
        const idx = shipObj.cells.findIndex(([r, c]) => r === row && c === col);
        if (idx !== -1) {
          shipObj.guessedLetters[idx] = guessedLetter;
          if (guessedLetter === shipObj.word[idx]) {
            newGrid[row][col] = 2;
            setHits(hits + 1);
            setScore(score + HIT_POINTS);
            triggerScoreAnimation(HIT_POINTS);
            showMessage(`Hit! (+${HIT_POINTS} points)`);
            // Find next unguessed cell in this ship
            if (shipObj.guessedLetters.join("") !== shipObj.word) {
              for (let i = 0; i < shipObj.cells.length; i++) {
                if (shipObj.guessedLetters[i] !== shipObj.word[i]) {
                  nextCell = shipObj.cells[i];
                  break;
                }
              }
            }
            if (shipObj.guessedLetters.join("") === shipObj.word) {
              shipObj.sunk = true;
              setScore(score + SUNK_POINTS);
              triggerScoreAnimation(SUNK_POINTS, 700);
              showMessage(
                `Ship sunk! Word: ${shipObj.word} (+${SUNK_POINTS} points)`
              );
              nextCell = null; // Don't move focus if ship is sunk
            }
          }
          // Keep focus on wrong guesses by maintaining the activeCell state
        }
      }
      return shipObj;
    });

    setShips(newShips);
    setGrid(newGrid);

    if (newShips.every((ship) => ship.sunk)) {
      setGameOver(true);
      // Calculate bonus: total points divided by number of guesses (rounded down)
      const bonus = guesses > 0 ? Math.floor((score + 20) / guesses) : 0;
      setScore((prev) => prev + bonus);
      triggerScoreAnimation(bonus);
      showMessage(
        `Game Over! You won with ${score + 20 + bonus} points! Bonus: ${bonus}`,
        true // persist the message
      );
    }

    // Move focus to next cell if available, else clear activeCell
    if (nextCell) {
      setActiveCell(nextCell);
      requestAnimationFrame(() => {
        const input = document.querySelector(
          `.cell[data-row="${nextCell[0]}"][data-col="${nextCell[1]}"] input`
        );
        if (input) {
          input.focus();
          input.select();
        }
      });
    } else if (ship && ship.guessedLetters.join("") === ship.word) {
      setActiveCell(null);
    } else {
      // Keep focus on current cell if guess was wrong
      requestAnimationFrame(() => {
        const input = document.querySelector(
          `.cell[data-row="${row}"][data-col="${col}"] input`
        );
        if (input) {
          input.focus();
          input.select();
        }
      });
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

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    resetGame();
  };

  const getTotalShipCells = (difficulty) =>
    DIFFICULTY[difficulty].ships.reduce((sum, size) => sum + size, 0);

  return (
    <div className="game-container">
      <div className="tattleship">
        <div className="logo-divider" style={{ flexDirection: "column" }}>
          <img
            src="/logo192.png"
            alt="Tattleship Logo"
            className="game-logo"
            width="120"
            height="120"
          />
          <h1 style={{ margin: "16px 0 0 0" }}>Tattleship</h1>
        </div>

        <div className="difficulty-controls">
          {Object.keys(DIFFICULTY).map((diff) => (
            <button
              key={diff}
              className={`difficulty-button ${
                difficulty === diff ? "active" : ""
              }`}
              onClick={() => handleDifficultyChange(diff)}
            >
              {diff.toLowerCase()}
            </button>
          ))}
          <button className="reset-button" onClick={resetGame}>
            Reset
          </button>
        </div>

        <div className="stats">
          <div className="stat-group">
            <span className="stat-label">Hits:</span>
            <span className="stat-value">{hits}</span>
            <span className="stat-divider">/</span>
            <span className="stat-total">{getTotalShipCells(difficulty)}</span>
          </div>
          <div className="stat-group">
            <span className="stat-label">Misses:</span>
            <span className="stat-value">{misses}</span>
          </div>
          <div className="stat-group">
            <span className="stat-label">Guesses:</span>
            <span className="stat-value">{guesses}</span>
          </div>
          <div className="stat-group">
            <span className="stat-label">Score:</span>
            <span className="stat-value">
              {score}
              {scoreAnimations.map((anim) => (
                <span key={anim.id} className="score-float">
                  +{anim.value}
                </span>
              ))}
            </span>
          </div>
          <div className="stat-group">
            <span className="stat-label">High Score:</span>
            <span className="stat-value">{highScore}</span>
          </div>
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
                    data-row={rowIndex}
                    data-col={colIndex}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell === 3 ? (
                      fadingMisses.includes(`${rowIndex},${colIndex}`) ? (
                        <span className="miss-splash" />
                      ) : null
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
        <div className="message-placeholder">
          <div className="event-message">{message}</div>
        </div>
      </div>
      <footer className="footer">
        &copy; {new Date().getFullYear()} Landex Development
      </footer>
    </div>
  );
}

export default Tattleship;
