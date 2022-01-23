import '@/styles/index.scss'

import { Game } from './js/game.js'

const main = async () => {
  const canvas = document.getElementById('screen');
  const game = new Game(canvas); 
  await game.initRender();
};

main();