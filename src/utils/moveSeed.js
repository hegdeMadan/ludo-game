import { moveSeed, sendNotification } from '../actions/gameData';
import store from '../store';

import { startPoint, newSeedPosition } from './seedPath.js';
import { still, movesLeft, home } from './constants';

/**
 * setColours
 * 
 * Sets the colour of the houses
 * and indirectly of the seeds.
 * Will later be used to allow playes choose house colours
 */
export function setColours(state, action) {
  state.houseOneCards["H1-Colour"] = action.houseOneColour;
  state.houseTwoCards["H2-Colour"] = action.houseTwoColour;
  state.houseThreeCards["H3-Colour"] = action.houseThreeColour;
  state.houseFourCards["H4-Colour"] = action.houseFourColour;
  return state;
}

/**
 * findSeedGroup
 * 
 * gets the house a seed belongs to
 */
export function findSeedGroup(state, seedId) {
  let house;
  switch (seedId.substr(0, 2)) {
    case 'H1':
      house = state.houseOneCards;
      break;
    case 'H2':
      house = state.houseTwoCards;
      break;
    case 'H3':
      house = state.houseThreeCards;
      break;
    case 'H4':
      house = state.houseFourCards;
      break;
    default:
      return;
  }
  return house;
}

/**
 * getSeedPosition
 * 
 * gets the current position of a seed
 */
function getSeedPosition(state, seedId) {
  const seedGroup = findSeedGroup(state, seedId);
  return seedGroup[seedId].position;
}
/**
 * seedRemainingMoves
 * 
 * gets the remaining number of moves for a seed
 */
function seedRemainingMoves(state, seedId) {
  const seedGroup = findSeedGroup(state, seedId);
  return seedGroup[seedId].movesLeft;
}
/**
 * getLudoSeeds
 *
 * Merge all the seeds into a single object
 * this is to make matching and iteration easier.
 */
export function getLudoSeeds(gameData) {
  let seeds = {};
  seeds = { ...gameData.houseOneCards };
  seeds = { ...seeds, ...gameData.houseTwoCards };
  seeds = { ...seeds, ...gameData.houseThreeCards };
  seeds = { ...seeds, ...gameData.houseFourCards };

  return seeds;
}
/**
 * killSeed
 * 
 * returns a seed to its house if another seeds
 * move ends at its position.
 */
function killSeed(state, dispatch, seedPosition, movingSeed) {
  const seeds = getLudoSeeds(state);
  const seedsInSamePosition = Object.keys(seeds).filter((seed) => {
    return (seed !== movingSeed) && (seeds[seed].position === seedPosition);
  });

  const seedId = seedsInSamePosition && seedsInSamePosition.length > 0 ?
    seedsInSamePosition[0].toString() : null;

  if (seedId && (movingSeed.substr(0, 2) !== seedId.substr(0, 2))) {
    let seedGroup = findSeedGroup(state, seedId);
    seedGroup[seedId].position = still;
    seedGroup[seedId].movesLeft = movesLeft;
    dispatch(moveSeed(seedGroup));

    dispatch(sendNotification({
      type: 'Info',
      title: `${movingSeed} kills ${seedId}`,
      message: `${movingSeed} is going home`,
    }));

    seedGroup = findSeedGroup(state, movingSeed);
    seedGroup[movingSeed].position = home;
    seedGroup[movingSeed].movesLeft = 0;
    dispatch(moveSeed(seedGroup));
  }
}

/**
 * makeSeedMove
 * 
 * Dispatches the updated seed position
 */
function makeSeedMove(options) {
  const { lastMove, state, dispatch, seedPosition, seedId, reduceMoves } = options;
  const seedGroup = findSeedGroup(state, seedId);

  seedGroup[seedId].position = seedPosition;

  if (reduceMoves) {
    const movesLeft = seedGroup[seedId].movesLeft;
    seedGroup[seedId].movesLeft = movesLeft - 1;
  }
  dispatch(moveSeed(seedGroup))
  if (lastMove && seedPosition !== home) {
    killSeed(state, dispatch, seedPosition, seedId);
  }
}

/**
 * invalidPlay
 * 
 * Hanldes conditions that can make a play invalid
 */
function invalidPlay(state, seedId, moves, dispatch) {
  const position = getSeedPosition(state, seedId);
  const movesLeft = seedRemainingMoves(state, seedId);
  const movesSum = moves.reduce((a, b) => Number(a) + Number(b), 0);

  if (position === still && !moves.includes(6)) {

    dispatch(sendNotification({
      type: 'Error',
      title: 'Throw a Six!',
      message: 'A 6 is need to leave the house!'
    }));
    return true;
  };
  if (position === still && movesSum - 6 > movesLeft) {
    dispatch(sendNotification({
      type: 'Error',
      title: 'Too many Moves',
      message: 'Remove some values to move seed.',
    }));
    return true;
  };
  if (position !== still && movesSum > movesLeft) {
    dispatch(sendNotification({
      type: 'Error',
      title: 'Too many Moves',
      message: 'Remove some values to move seed.'
    }));
    return true;
  };

  return false;
}

/**
 * setSeedPosition
 * 
 * Updates the seed state to chnge
 * its positions on the game board.
 */
export function setSeedPosition(data) {
  const { seed: seedId, position: moves, dispatch, cb } = data;
  const state = store.getState().gameData;

  if (invalidPlay(state, seedId, moves, dispatch)) {
    return;
  }
  if (getSeedPosition(state, seedId) === still && moves.includes(6)) {
    moves.splice(moves.indexOf(6), 1);
    setTimeout(() => {
      const lastMove = (moves.length === 1) ? true : false;
      const seedPosition = startPoint(seedId);
      const options = {
        lastMove, state, dispatch, seedPosition, seedId
      }
      makeSeedMove(options);
    }, 100);
  }
  if (moves.length > 0) {
    const move = moves.reduce((a, b) => Number(a) + Number(b), 0); // sum up the content of the array.
    for (let j = 0; j < move; j++) {
      setTimeout(() => {
        const currentSeedPosition = getSeedPosition(state, seedId);
        const lastMove = (j + 1 === Number(move)) ? true : false;
        const seedPosition = newSeedPosition(seedId, currentSeedPosition);
        const options = {
          lastMove, state, dispatch, seedPosition, seedId,
          reduceMoves: true
        }
        makeSeedMove(options);
      }, (j + 1) * 500);
    }
  }
  cb();
}
