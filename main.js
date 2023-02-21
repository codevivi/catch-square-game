"use strict";
const game = {
  pcPlayer: new Player(),
  humanPlayer: null,
  roundsAmount: 5,
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
      let newX = rand(0, this.container.offsetWidth - 50);
      let newY = rand(0, this.container.offsetHeight - 50);
      this.element.style.top = `${newY}px`;
      this.element.style.left = `${newX}px`;
    },
    update: function () {
      this.element.classList.remove("clicked");
      this.clicked = false;
      this.changeColor();
      this.changePos();
    },
    listenForClicks() {
      this.element.addEventListener("mousedown", () => {
        this.clicked = true;
        this.element.classList.add("clicked");
      });
    },
  },
  round: {
    id: 0,
    seconds: 5,
    intervalId: null,
    timeLeft: this.seconds,
    timerEl: document.querySelector("#timer"),
    timeDecrease() {
      this.timeLeft--;
      this.updateTimer();
    },
    end() {
      this.timerEl.classList.add("hidden");
      clearInterval(this.intervalId);
    },
    start() {
      this.timeLeft = this.seconds;
      this.timerEl.classList.remove("hidden");
      this.updateTimer();
      this.id++;
    },
    updateTimer() {
      this.timerEl.textContent = this.timeLeft.toString().length > 1 ? this.timeLeft + "s" : "0" + this.timeLeft.toString() + "s";
    },
  },
  play: function () {
    console.log("playing");
    this.round.start();
    this.square.update();
    this.square.element.classList.remove("hidden");
    this.round.intervalId = setInterval(() => {
      this.updateScore();
      if (this.round.timeLeft === 1) {
        //if on last second
        this.humanPlayer.savePoints();
        this.pcPlayer.savePoints();
        this.round.end();
        this.square.element.classList.add("hidden");
        this.views.showRoundStats(this.pcPlayer, this.humanPlayer);
        if (this.round.id < this.roundsAmount) {
          //if more rounds left, start another round
          setTimeout(() => {
            game.views.hideRoundStats();
            this.square.element.classList.remove("hidden");
            game.play(); //set interval again
          }, 5000);
          // return;
        } else {
          //end of game
          let winner = "It is a draw!";
          if (this.humanPlayer.totalPoints > this.pcPlayer.totalPoints) {
            winner = this.humanPlayer.name;
          } else if (this.humanPlayer.totalPoints < this.pcPlayer.totalPoints) {
            winner = this.pcPlayer.name;
          }
          this.views.winnerNameEl.textContent = winner;
          this.views.showRoundStats(this.pcPlayer, this.humanPlayer, true); //true for end of game
          // return;
        }
      }
      this.square.update();
      this.round.timeDecrease();
    }, 1000);
  },
  updateScore() {
    if (this.square.clicked) {
      this.humanPlayer.currentRoundPoints++;
    } else {
      this.pcPlayer.currentRoundPoints++;
    }
  },
  views: {
    start: document.querySelector(".initial-view"),
    inGame: document.querySelector(".game-view"),
    current: "start",
    /////
    roundStats: document.querySelector(".round-stats"),
    endStats: document.querySelector(".game-end-stats"),
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
    showRoundStats: function (pcPlayer, humanPlayer, gameOver = false) {
      this.roundStats.classList.remove("hidden");
      if (gameOver) {
        this.endStats.classList.remove("hidden");
      } else {
        this.humanTotalPointsEl.textContent = humanPlayer.totalPoints;
        this.pcTotalPointsEl.textContent = pcPlayer.totalPoints;
        let humanRoundPoints = humanPlayer.history[humanPlayer.history.length - 1];
        let pcRoundPoints = pcPlayer.history[pcPlayer.history.length - 1];
        let humanWinner = humanRoundPoints > pcRoundPoints ? true : false;
        this.humanRoundStatsEl.innerHTML += `<li class=${humanWinner ? "green" : ""}>${humanRoundPoints}</li>`;
        this.pcRoundStatsEl.innerHTML += `<li class=${humanWinner ? "" : "green"}>${pcRoundPoints}</li>`;
      }
    },
    hideRoundStats: function () {
      this.roundStats.classList.add("hidden");
    },
  },
  init(e) {
    if (e.type === "submit") {
      //if first time
      e.preventDefault();
      let formData = getFormData(e.target);
      let playerName = formData.name;
      if (playerName === "PC") {
        return alert("Name is taken");
      }
      this.humanPlayer = new Player(playerName);
      this.round.seconds = formData.seconds;
      this.roundsAmount = formData.rounds;
      this.square.listenForClicks();
      this.views.switchView("inGame");
    }
    this.views.hideRoundStats();
    this.views.endStats.classList.add("hidden");
    this.views.humanRoundStatsEl.innerHTML = "";
    this.views.pcRoundStatsEl.innerHTML = "";
    this.humanPlayer.reset();
    this.pcPlayer.reset();
    this.round.id = 0;
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
    data[key] = value;
  }
  return data;
}
function Player(name = "PC") {
  this.name = name;
  if (name !== "PC") {
    document.querySelector(".human-stats .name").textContent = name;
  }
  this.totalPoints = 0;
  /////FIX: nox need to save all rounds to history as using + innerHtml anyway
  this.history = [];
  this.currentRoundPoints = 0;
  this.savePoints = function () {
    //at the end of round save to history
    this.totalPoints += this.currentRoundPoints;
    this.history.push(this.currentRoundPoints);
    this.currentRoundPoints = 0; //clear for next round
  };
  this.reset = function () {
    this.totalPoints = 0;
    this.history.length = 0;
    this.currentRoundPoints = 0;
  };
}

document.querySelector("#start-form").addEventListener("submit", game.init.bind(game));
document.querySelector("#play-btn").addEventListener("click", game.init.bind(game));
