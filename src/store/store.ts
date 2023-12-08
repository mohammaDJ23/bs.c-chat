import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import {
  FormReducer,
  conversationsReducer,
  modalReducer,
  paginationListReducer,
  requsetProcessReducer,
  specificDetailsReducer,
  userServiceSocketReducer,
  infinityListReducer,
} from './reducers';

const reducers = combineReducers({
  requestProcess: requsetProcessReducer,
  userServiceSocket: userServiceSocketReducer,
  conversations: conversationsReducer,
  modals: modalReducer,
  paginationLists: paginationListReducer,
  forms: FormReducer,
  specificDetails: specificDetailsReducer,
  infinityLists: infinityListReducer,
});

export const store = createStore(reducers, {}, applyMiddleware(thunk));

export type RootState = ReturnType<typeof reducers>;
