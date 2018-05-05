import Types from '../actions/actionTypes';
import { setColours } from '../utils/moveSeed';
import { still, movesLeft } from '../utils/constants';

// movesLeft here is the minimum number of moves needed to finish after coming out of the house.
const initialState = {
  houseOneCards: {
    'H1-C1': { position: still, movesLeft: movesLeft },
    'H1-C2': { position: still, movesLeft: movesLeft },
    'H1-C3': { position: still, movesLeft: movesLeft },
    'H1-C4': { position: still, movesLeft: movesLeft },
    'H1-Colour': 'blue'
  },
  houseTwoCards: {
    'H2-C1': { position: still, movesLeft: movesLeft },
    'H2-C2': { position: still, movesLeft: movesLeft },
    'H2-C3': { position: still, movesLeft: movesLeft },
    'H2-C4': { position: still, movesLeft: movesLeft },
    'H2-Colour': 'red'
  },
  houseThreeCards: {
    'H3-C1': { position: still, movesLeft: movesLeft },
    'H3-C2': { position: still, movesLeft: movesLeft },
    'H3-C3': { position: still, movesLeft: movesLeft },
    'H3-C4': { position: still, movesLeft: movesLeft },
    'H3-Colour': 'yellow'
  },
  houseFourCards: {
    'H4-C1': { position: still, movesLeft: movesLeft },
    'H4-C2': { position: still, movesLeft: movesLeft },
    'H4-C3': { position: still, movesLeft: movesLeft },
    'H4-C4': { position: still, movesLeft: movesLeft },
    'H4-Colour': 'green'
  },
  playerTurn: 'P1',
};



export default function gameData(state = initialState, action) {
  switch (action.type) {
    case Types.SET_COLOURS:
      return setColours(state, action);
    case Types.MOVE_SEED_TO_POSITION:
      return Object.assign({}, state, action.seedGroup);
    default:
      return state;
  }
}
