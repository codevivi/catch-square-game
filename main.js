"use strict";

/// helpers

function getRandomColor() {
  let red = rand(0, 255);
  let green = rand(0, 255);
  let blue = rand(0, 255);
  return `rgb(${red}, ${green}, ${blue})`;
}
function rand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
