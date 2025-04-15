import React, { useState, useEffect, useRef } from "react";
import "./Tattleship.css";

const GRID_SIZE = 10;
const DIFFICULTY = {
  EASY: { ships: [2, 3, 3] },
  MEDIUM: { ships: [2, 3, 3, 4] },
  HARD: { ships: [2, 3, 3, 4, 5] },
};

const DEFAULT_DIFFICULTY = "EASY";

// Word lists for each ship size
const WORDS_2 = [
  "AT",
  "BE",
  "BY",
  "DO",
  "GO",
  "HE",
  "IF",
  "IN",
  "IS",
  "IT",
  "ME",
  "NO",
  "OF",
  "ON",
  "OR",
  "SO",
  "TO",
  "UP",
  "US",
  "WE",
  "AN",
  "AS",
  "AX",
  "BO",
  "CO",
  "DE",
  "ED",
  "EF",
  "EL",
  "EM",
  "EN",
  "ER",
  "ES",
  "ET",
  "EX",
  "FA",
  "FE",
  "HA",
  "HI",
  "HO",
  "ID",
  "JO",
  "LA",
  "LI",
  "LO",
  "MA",
  "MI",
  "MO",
  "MU",
  "MY",
  "NA",
  "NE",
  "NU",
  "OD",
  "OE",
  "OH",
  "OK",
  "OM",
  "OP",
  "OS",
  "OW",
  "OX",
  "OY",
  "PA",
  "PE",
  "PI",
  "PO",
  "QI",
  "RE",
  "SI",
  "TA",
  "TE",
  "TI",
  "TU",
  "UM",
  "UN",
  "UT",
  "WO",
  "XI",
  "XU",
  "YA",
  "YE",
  "YO",
  "ZA",
  "AD",
  "AG",
  "AH",
  "AI",
  "AL",
  "AM",
  "AR",
  "AW",
  "AY",
  "BA",
  "BI",
  "DA",
  "DI",
  "EA",
  "EH",
];

const WORDS_3 = [
  "CAT",
  "DOG",
  "BAT",
  "RAT",
  "HAT",
  "MAT",
  "PAT",
  "SAT",
  "FAT",
  "LET",
  "BET",
  "SET",
  "GET",
  "JET",
  "NET",
  "PET",
  "RED",
  "BED",
  "LED",
  "FED",
  "ADD",
  "AND",
  "ANY",
  "ARE",
  "ARM",
  "ART",
  "ASK",
  "ATE",
  "BAD",
  "BAG",
  "BAN",
  "BAR",
  "BAY",
  "BEE",
  "BIG",
  "BIN",
  "BIT",
  "BOB",
  "BOW",
  "BOX",
  "BOY",
  "BUD",
  "BUG",
  "BUN",
  "BUS",
  "BUT",
  "BUY",
  "CAN",
  "CAR",
  "CON",
  "COT",
  "COW",
  "CRY",
  "CUP",
  "CUT",
  "DAY",
  "DEN",
  "DID",
  "DIE",
  "DIG",
  "DIM",
  "DIP",
  "DON",
  "DRY",
  "DUE",
  "DUG",
  "DYE",
  "EAR",
  "EAT",
  "EGG",
  "END",
  "EYE",
  "FAN",
  "FAR",
  "FEE",
  "FEW",
  "FIG",
  "FIN",
  "FIT",
  "FIX",
  "FLY",
  "FOG",
  "FOR",
  "FOX",
  "FUN",
  "GAP",
  "GAS",
  "GAY",
  "GEM",
  "GIN",
  "GOT",
  "GUM",
  "GUN",
  "GUY",
  "HAD",
  "HAM",
];

const WORDS_4 = [
  "SHIP",
  "BOAT",
  "FISH",
  "SAIL",
  "WAVE",
  "PORT",
  "DOCK",
  "CREW",
  "DECK",
  "HULL",
  "KEEL",
  "MAST",
  "RUDD",
  "BOWS",
  "STERN",
  "HOLD",
  "ANCH",
  "ROPE",
  "KNOT",
  "WIND",
  "TIDE",
  "SEAS",
  "GALE",
  "CALM",
  "REEF",
  "BUOY",
  "HOOK",
  "LINE",
  "SINK",
  "SWIM",
  "DIVE",
  "RAFT",
  "OARS",
  "PADD",
  "YACHT",
  "JETS",
  "FOAM",
  "MIST",
  "FOGS",
  "SURF",
  "BEAM",
  "BULK",
  "CARG",
  "FLEET",
  "NAVY",
  "PIER",
  "QUAY",
  "RIGG",
  "SKEG",
  "TACK",
  "TRIM",
  "VANE",
  "WAKE",
  "WHARF",
  "YARD",
  "BARN",
  "BELL",
  "BILL",
  "BIRD",
  "BLOW",
  "BLUE",
  "BOLT",
  "BOND",
  "BOOK",
  "BURN",
  "CALL",
  "CAME",
  "CAMP",
  "CARD",
  "CASE",
  "CASH",
  "CAST",
  "CAVE",
  "CHIN",
  "CITY",
  "CLAY",
  "CLUB",
  "COAL",
  "CODE",
  "COLD",
  "COOK",
  "CORE",
  "CORN",
  "COST",
  "CROP",
  "CUBE",
  "CURE",
  "DARE",
  "DARK",
  "DASH",
  "DATE",
  "DAWN",
  "DEAL",
  "DEAR",
  "DEBT",
  "DEEP",
  "DENY",
  "DESK",
];

const WORDS_5 = [
  "FLEET",
  "STERN",
  "SHORE",
  "OCEAN",
  "WHALE",
  "BEACH",
  "WATER",
  "WAVES",
  "SURGE",
  "STORM",
  "FLOAT",
  "PEACE",
  "SOUND",
  "STEAM",
  "CRASH",
  "DRIFT",
  "SPRAY",
  "PLANK",
  "CABIN",
  "CARGO",
  "COAST",
  "CORAL",
  "DEPTH",
  "CHART",
  "BOARD",
  "ROUGH",
  "CLAIM",
  "VALVE",
  "SLIDE",
  "BLOCK",
  "BRAVE",
  "CLEAN",
  "COVER",
  "CYCLE",
  "DAILY",
  "EARTH",
  "FAITH",
  "FIELD",
  "GLASS",
  "GRASS",
  "HAPPY",
  "HEART",
  "HONEY",
  "HORSE",
  "HOUSE",
  "JUICE",
  "KNIFE",
  "LEMON",
  "LIGHT",
  "LINEN",
  "MAGIC",
  "MANGO",
  "MARCH",
  "MOUSE",
  "MUSIC",
  "NIGHT",
  "NOISE",
  "OFFER",
  "OLIVE",
  "PAINT",
  "PANEL",
  "PEARL",
  "PLANT",
  "PLATE",
  "PRIZE",
  "QUEEN",
  "QUIET",
  "RANGE",
  "RIVER",
  "ROBIN",
  "SALAD",
  "SAUCE",
  "SHEEP",
  "SHEET",
  "SHINE",
  "SHIRT",
  "SHOCK",
  "SMILE",
  "SNAKE",
  "SOLID",
  "SOUTH",
  "SPACE",
  "SPOON",
  "SQUAD",
  "STAFF",
  "STAGE",
  "STEEL",
  "STONE",
  "STORE",
  "SUGAR",
  "TABLE",
  "TEACH",
  "TIGER",
  "TOAST",
  "TOOTH",
  "TRAIN",
  "TRUCK",
  "UNCLE",
  "UNION",
  "VIRUS",
];

const SHIP_WORDS = {
  2: WORDS_2,
  3: WORDS_3,
  4: WORDS_4,
  5: WORDS_5,
};

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
  const messageTimeout = useRef();

  useEffect(() => {
    initializeGame();
  }, []);

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
          setScore(score + 10);
          showMessage(`Ship spotted! (+10 points)`);
          ship.cells.forEach(([r, c]) => {
            if (r !== row || c !== col) {
              newGrid[r][c] = 4;
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
      setGrid(newGrid); // Show the miss immediately
      setFadingMisses((prev) => [...prev, `${row},${col}`]);
      setTimeout(() => {
        setFadingMisses((prev) => prev.filter((id) => id !== `${row},${col}`));
        // Do NOT reset the cell to 0 here!
      }, 1000);
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
            setScore(score + 5);
            showMessage(`Hit! (+5 points)`);
            setActiveCell(null); // Only clear active cell on correct guess
            if (ship.guessedLetters.join("") === ship.word) {
              ship.sunk = true;
              setScore(score + 20);
              showMessage(`Ship sunk! Word: ${ship.word} (+20 points)`);
            }
          }
          // Keep focus on wrong guesses by maintaining the activeCell state
        }
      }
      return ship;
    });

    setShips(newShips);
    setGrid(newGrid);

    if (newShips.every((ship) => ship.sunk)) {
      setGameOver(true);
      // Calculate bonus: total points divided by number of guesses (rounded down)
      const bonus = guesses > 0 ? Math.floor((score + 20) / guesses) : 0;
      setScore((prev) => prev + bonus);
      showMessage(
        `Game Over! You won with ${score + 20 + bonus} points! Bonus: ${bonus}`,
        true // persist the message
      );
    }

    // Immediately re-focus the input after state updates
    requestAnimationFrame(() => {
      const input = document.querySelector(
        `.cell[data-row="${row}"][data-col="${col}"] input`
      );
      if (input) {
        input.focus();
      }
    });
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
        <img
          src="/logo192.png"
          alt="Tattleship Logo"
          className="game-logo"
          width="120"
          height="120"
        />
        <h1>Tattleship</h1>

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

        <div className="message-placeholder">
          <div className="event-message">{message}</div>
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
            <span className="stat-value">{score}</span>
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
      </div>
    </div>
  );
}

export default Tattleship;
