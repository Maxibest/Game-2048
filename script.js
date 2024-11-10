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
  if (v === null) {
    c.innerText = "";
  } else {
    c.innerText = v === 0 ? " " : v;
    c.setAttribute("data-value", v);
    const level = tileLevels[v] || 0;
  }
}

async function reset() {
  document.querySelector('.reset-btn')?.addEventListener('click', () => {
    score = 0;
    bestScore;
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
  });
}
reset();

document.addEventListener("DOMContentLoaded", () => {
  const cases = document.querySelectorAll('.case');
  bestScore = 0;
  localStorage.removeItem('bestScore');



  function initGame() {
    const set = new Set();
    while (set.size < 2) {
      const randomI = Math.floor(Math.random() * cases.length);
      set.add(randomI);
    }
    set.forEach(i => {
      cases[i].innerText = 2;
      colorUpdate(cases[i], 2);
    });
  }

  function move(direction) {
    let moved = false;

    const getRow = (i) => {
      return Array.from(cases).slice(i * 4, i * 4 + 4);
    }

    function moveLine(line) {
      const filtered = line.filter(cell => cell.innerText !== "");
      const merged = [];
      let zoomedCell = null;

      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].innerText === filtered[i + 1]?.innerText) {
          const newValue = parseInt(filtered[i].innerText) * 2;
          merged.push({ value: newValue, merged: true });

          score += newValue;
          zoomedCell = filtered[i];
          i++;
        } else {
          merged.push({ value: parseInt(filtered[i].innerText), merged: false });
        }
      }

      while (merged.length < 4) {
        merged.push({ value: " ", merged: false });
      }

      if (zoomedCell) {
        zoomedCell.classList.add("zoom");

        setTimeout(() => {
          zoomedCell.classList.remove("zoom");
        }, 500);
      }
      return merged;
    }

    if (direction === "right" || direction === "left") {
      for (let row = 0; row < 4; row++) {
        let currentRow = getRow(row);
        if (direction === "right") currentRow.reverse();
        const newRow = moveLine(currentRow);
        if (direction === "right") newRow.reverse();

        newRow.forEach((cell, i) => {
          const caseIndex = row * 4 + i;
          if (cases[caseIndex].innerText !== cell.value.toString()) {
            moved = true;
            colorUpdate(cases[caseIndex], cell.value);
          }
        });
      }
    } else if (direction === "down" || direction === "up") {
      for (let col = 0; col < 4; col++) {
        let currentCol = Array.from(cases).filter((_, index) => index % 4 === col);
        if (direction === "down") currentCol.reverse();
        const newCol = moveLine(currentCol);
        if (direction === "down") newCol.reverse();

        newCol.forEach((cell, i) => {
          const caseIndex = i * 4 + col;
          if (cases[caseIndex].innerText !== cell.value.toString()) {
            moved = true;
            colorUpdate(cases[caseIndex], cell.value);
          }
        });
      }
    }

    if (moved) {
      randomTime();
      document.getElementById('score').textContent = score;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        document.getElementById('best-score').textContent = bestScore;
      }
    }
  }

  function randomTime() {
    const emptyCases = Array.from(cases).filter(cell => cell.innerText === "");
    if (emptyCases.length > 0) {
      const randomCase = emptyCases[Math.floor(Math.random() * emptyCases.length)];
      randomCase.innerText = 2;
      colorUpdate(randomCase, 2);
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
