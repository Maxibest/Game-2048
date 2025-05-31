const tileLevels = {
  2: 1,
  4: 2,
  8: 3,
  16: 4,
  32: 5,
  64: 6,
  128: 7,
  256: 8,
  512: 9,
  1024: 10,
  2048: 11
};

let score = 0;
let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;

function colorUpdate(c, v) {
  if (v === null || v === " " || v === "") {
    c.innerText = "";
    c.removeAttribute("data-value");
    c.classList.remove("merge", "move");
  } else {
    c.innerText = v === 0 ? "" : v;
    c.setAttribute("data-value", v);
    const level = tileLevels[v] || 0;
  }
}

function canMerge(value1, value2) {
  return value1 !== "" && value1 === value2;
}

function isGameOver() {
  const grid = [];
  const cases = document.querySelectorAll('.case');
  
  for (let i = 0; i < 4; i++) {
    grid[i] = [];
    for (let j = 0; j < 4; j++) {
      grid[i][j] = cases[i * 4 + j].innerText;
    }
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === "" || grid[i][j] === " ") {
        return false;
      }
    }
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      if (canMerge(grid[i][j], grid[i][j + 1])) {
        return false;
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      if (canMerge(grid[i][j], grid[i + 1][j])) {
        return false;
      }
    }
  }

  return true;
}

function reset() {
  score = 0;
  document.getElementById('score').textContent = score;
  document.getElementById('best-score').textContent = bestScore;

  const cases = document.querySelectorAll('.case');
  cases.forEach(caseElem => {
    caseElem.innerText = "";
    colorUpdate(caseElem, 0);
  });

  const emptyCases = Array.from(cases).filter(caseElem => caseElem.innerText === "");
  if (emptyCases.length > 0) {
    const randomI1 = Math.floor(Math.random() * emptyCases.length);
    emptyCases[randomI1].innerText = 2;
    colorUpdate(emptyCases[randomI1], 2);
    const EmptyCases2 = emptyCases.filter((_, index) => index !== randomI1);
    if (EmptyCases2.length > 0) {
      const randomI2 = Math.floor(Math.random() * EmptyCases2.length);
      const randomValue = Math.random() < 0.3 ? 4 : 2;
      EmptyCases2[randomI2].innerText = randomValue;
      colorUpdate(EmptyCases2[randomI2], randomValue);
    }
  }
}

document.querySelector('.reset-btn')?.addEventListener('click', reset);

document.addEventListener("DOMContentLoaded", () => {
  const cases = document.querySelectorAll('.case');

  function getSpawnValue(currentScore) {
    // Plus le score est élevé, plus la chance d'avoir un 4 augmente
    const baseChance = 0.2; // 20% de chance de base d'avoir un 4
    const scoreMultiplier = Math.min(0.3, currentScore / 10000); // Augmente avec le score, max 30%
    const chance = baseChance + scoreMultiplier;
    
    // Chance supplémentaire si la grille est presque pleine
    const cases = document.querySelectorAll('.case');
    const filledCases = Array.from(cases).filter(cell => cell.innerText !== "" && cell.innerText !== " ").length;
    const gridFullness = filledCases / 16; // Ratio de remplissage de la grille
    
    if (gridFullness > 0.7) { // Si la grille est remplie à plus de 70%
      return Math.random() < (chance + 0.2) ? 4 : 2; // Augmente encore la chance d'avoir un 4
    }
    
    return Math.random() < chance ? 4 : 2;
  }

  function initGame() {
    const cases = document.querySelectorAll('.case');
    const set = new Set();
    while (set.size < 2) {
      const randomI = Math.floor(Math.random() * cases.length);
      set.add(randomI);
    }

    // Convertir le Set en array pour pouvoir accéder aux indices
    const positions = Array.from(set);
    
    // Premier nombre : 70% de chance d'être un 2, 30% d'être un 4
    const firstValue = Math.random() < 0.7 ? 2 : 4;
    cases[positions[0]].innerText = firstValue;
    colorUpdate(cases[positions[0]], firstValue);
    
    // Deuxième nombre : si le premier était un 4, on met un 2, sinon 20% de chance d'avoir un 4
    const secondValue = firstValue === 4 ? 2 : (Math.random() < 0.2 ? 4 : 2);
    cases[positions[1]].innerText = secondValue;
    colorUpdate(cases[positions[1]], secondValue);
  }

  async function moveLine(line) {
    const filtered = line.filter(cell => cell.innerText !== "" && cell.innerText !== " ");
    const result = new Array(4).fill(null);
    let position = 0;
    let hasMoved = false;

    for (let i = 0; i < filtered.length; i++) {
      const current = parseInt(filtered[i].innerText);
      const next = i + 1 < filtered.length ? parseInt(filtered[i + 1].innerText) : null;

      if (next !== null && current === next) {
        result[position] = current * 2;
        score += result[position];
        i++;
        hasMoved = true;
      } else {
        result[position] = current;
      }
      position++;
    }

    for (let i = 0; i < 4; i++) {
      if (result[i] === null) {
        result[i] = "";
      }
    }

    // Mettre à jour les cases avec animation
    const promises = result.map((value, index) => {
      return new Promise(resolve => {
        if (line[index].innerText !== value.toString()) {
          hasMoved = true;
          if (value !== "") {
            const previousValue = line[index].innerText;
            line[index].innerText = value;
            line[index].setAttribute("data-value", value);
            if (previousValue !== "" && parseInt(previousValue) * 2 === value) {
              line[index].classList.add("merge");
              setTimeout(() => {
                line[index].classList.remove("merge");
                resolve();
              }, 200);
            } else {
              resolve();
            }
          } else {
            line[index].innerText = "";
            line[index].removeAttribute("data-value");
            resolve();
          }
        } else {
          resolve();
        }
      });
    });

    await Promise.all(promises);
    return hasMoved;
  }

  async function move(direction) {
    let moved = false;
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    if (direction === "right" || direction === "left") {
      for (let row = 0; row < 4; row++) {
        const currentRow = Array.from(cases).slice(row * 4, (row + 1) * 4);
        if (direction === "right") {
          currentRow.reverse();
        }
        const hasMoved = await moveLine(currentRow);
        if (hasMoved) {
          moved = true;
        }
        if (direction === "right") {
          currentRow.reverse();
        }
      }
    } else if (direction === "down" || direction === "up") {
      for (let col = 0; col < 4; col++) {
        const currentCol = Array.from(cases).filter((_, index) => index % 4 === col);
        if (direction === "down") {
          currentCol.reverse();
        }
        const hasMoved = await moveLine(currentCol);
        if (hasMoved) {
          moved = true;
        }
        if (direction === "down") {
          currentCol.reverse();
        }
      }
    }

    if (moved) {
      await delay(150);
      randomTime();
      document.getElementById('score').textContent = score;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        document.getElementById('best-score').textContent = bestScore;
      }

      if (isGameOver()) {
        alert("Game Over! Score final : " + score);
        if (confirm("Voulez-vous recommencer ?")) {
          reset();
        }
      }
    }
  }

  function randomTime() {
    const emptyCases = Array.from(cases).filter(cell => !cell.innerText || cell.innerText === "" || cell.innerText === " ");
    if (emptyCases.length > 0) {
      const randomCase = emptyCases[Math.floor(Math.random() * emptyCases.length)];
      const newValue = getSpawnValue(score);
      randomCase.classList.add('new');
      randomCase.innerText = newValue;
      colorUpdate(randomCase, newValue);
      
      // Retirer la classe après l'animation
      setTimeout(() => {
        randomCase.classList.remove('new');
      }, 200);
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === "ArrowRight") {
      move("right");
    }
    if (e.key === "ArrowLeft") {
      move("left");
    }
    if (e.key === "ArrowDown") {
      move("down");
    }
    if (e.key === "ArrowUp") {
      move("up");
    }
  });

  initGame();
});
