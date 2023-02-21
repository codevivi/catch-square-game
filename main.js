"use strict";
const game = {
  playerPc: new Player(),
  playerHuman: null,
  roundSeconds: 5,
  roundsCount: 5,
  timerEl: document.querySelector("#timer-counter"),
  humanStatsNameEl: document.querySelector(".human-stats .name"),
  square: {
    element: document.getElementById("square"),
    container: document.getElementById("stage"),
    clicked: false,
    changeColor: function () {
      ///just not black
      let red = rand(20, 255);
      let green = rand(20, 255);
      let blue = rand(20, 255);
      this.element.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
    },
    changePos: function () {
      console.log(this);
      let newX = rand(0, this.container.offsetWidth - 50);
      let newY = rand(0, this.container.offsetHeight - 50);
      this.element.style.top = `${newY}px`;
      this.element.style.left = `${newX}px`;
    },
    update: function () {
      this.changeColor();
      this.changePos();
      this.element.classList.remove("clicked");
    },
    listenForClicks() {
      this.element.addEventListener("click", () => {
        this.clicked = true;
        this.element.classList.add("clicked");
      });
    },
  },
  round: {
    intervalId: null,
    time: null,
  },
  play: function () {
    this.round.time = this.roundSeconds;
    this.round.intervalId = setInterval(() => {
      if (this.round.time <= 0) {
        clearInterval(this.round.intervalId);
        this.playerHuman.savePoints();
        this.playerPc.savePoints();
        this.views.showRoundStats(this.playerPc, this.playerHuman);
        this.square.element.classList.add("hidden");
        this.round.time = this.roundSeconds; //reset
        if (this.playerPc.history.length < this.roundsCount) {
          console.log(this.playerPc.history, "history");
          setTimeout(() => {
            game.views.hideRoundStats();
            this.square.element.classList.remove("hidden");
            game.play(); //set interval again
          }, 3000);
        } else {
          let winner = "It is a draw!";
          if (this.playerHuman.totalPoints > this.playerPc.totalPoints) {
            winner = this.playerHuman.name;
          } else {
            winner = this.playerPc.name;
          }
          this.views.winnerNameEl.textContent = winner;
          this.views.switchView("end");
        }
      }
      this.updateScore();
      this.square.update();
      this.timerEl.textContent = this.round.time;

      this.round.time--;
    }, 500);
  },
  updateScore() {
    if (this.square.clicked) {
      this.playerHuman.currentRoundPoints++;
      this.square.clicked = false;
    } else {
      this.playerPc.currentRoundPoints++;
    }
  },
  views: {
    start: document.querySelector(".initial-view"),
    inGame: document.querySelector(".game-view"),
    end: document.querySelector(".end-view"),
    current: "start",
    /////
    roundStats: document.querySelector(".round-stats"),
    humanRoundStatsEl: document.querySelector(".human-stats .rounds"),
    humanTotalPointsEl: document.querySelector(".human-stats .total"),
    pcTotalPointsEl: document.querySelector(".pc-stats .total"),
    pcRoundStatsEl: document.querySelector(".pc-stats .rounds"),
    winnerNameEl: document.querySelector(".winner-name"),
    switchView: function (viewStr) {
      if (this[viewStr]) {
        this[viewStr].classList.remove("hidden");
        this[this.current].classList.add("hidden");
        this.current = viewStr;
      }
    },
    showRoundStats: function (playerPc, playerHuman) {
      this.roundStats.classList.remove("hidden");
      this.humanTotalPointsEl.textContent = playerHuman.totalPoints;
      this.pcTotalPointsEl.textContent = playerPc.totalPoints;
      this.humanRoundStatsEl.innerHTML += `<li>${playerHuman.history[playerHuman.history.length - 1]}</li>`;
      this.pcRoundStatsEl.innerHTML += `<li>${playerPc.history[playerPc.history.length - 1]}</li>`;
    },
    hideRoundStats: function () {
      this.roundStats.classList.add("hidden");
    },
  },
  init(e) {
    if (e.type === "submit") {
      //if first time
      e.preventDefault();
      let playerName = getFormData(e.target).name;
      this.playerHuman = new Player(playerName);
      this.humanStatsNameEl.textContent = playerName;
      this.square.listenForClicks();
    }
    console.log(this);
    this.views.switchView("inGame");
    this.views.hideRoundStats();
    this.square.element.classList.remove("hidden");
    this.views.humanRoundStatsEl.innerHTML = "";
    this.views.pcRoundStatsEl.innerHTML = "";
    this.playerHuman.reset();
    this.playerPc.reset();
    this.play();
  },
};
/// helpers

function rand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function getFormData(form) {
  //I just use this way as I wanted to remember how to
  const formData = new FormData(form);
  let data = {};
  for (const [key, value] of formData) {
    console.log(key, value);
    data[key] = value;
  }
  return data;
}
function Player(name = "PC") {
  this.name = name;
  // this.roundsWon = 0;
  this.totalPoints = 0;
  this.history = [];
  this.currentRoundPoints = 0;
  this.savePoints = function () {
    //at the end of round save to history
    this.totalPoints += this.currentRoundPoints;
    this.history.push(this.currentRoundPoints);
    this.currentRoundPoints = 0; //clear for next round
  };
  this.reset = function () {
    // this.roundsWon = 0;
    this.totalPoints = 0;
    this.history.length = 0;
    this.currentRoundPoints = 0;
  };
}

document.querySelector("#start-form").addEventListener("submit", game.init.bind(game));
document.querySelector("#play-btn").addEventListener("click", game.init.bind(game));
