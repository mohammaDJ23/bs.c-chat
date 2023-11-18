import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { requsetProcessReducer, userServiceSocketReducer } from './reducers';

const reducers = combineReducers({
  requestProcess: requsetProcessReducer,
  userServiceSocket: userServiceSocketReducer,
});

export const store = createStore(reducers, {}, applyMiddleware(thunk));

export type RootState = ReturnType<typeof reducers>;
