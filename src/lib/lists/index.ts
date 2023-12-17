import { UserList } from './user';
import { ConversationList } from './conversation';
import { MessageList } from './message';

export * from './paginationList';
export * from './infinityList';
export * from './user';
export * from './conversation';
export * from './message';

export const paginationLists = {
  UserList,
};

export const infinityLists = {
  ConversationList,
  MessageList,
};
