import { InfinityList } from './infinityList';
import { MessageObj } from './message';
import { UserObj } from './user';
import { FieldValue } from 'firebase/app/dist/firestore';

export interface ConversationDocObj {
  id: string;
  creatorId: number;
  targetId: number;
  roomId: string;
  isCreatorTyping: boolean;
  isTargetTyping: boolean;
  contributors: number[];
  lastMessage: MessageObj | null;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  deletedAt: FieldValue | null;
  deletedBy: number | null;
}

export interface ConversationObj {
  user: UserObj;
  conversation: ConversationDocObj;
}

export class Conversation implements ConversationObj {
  constructor(public readonly user: UserObj, public readonly conversation: ConversationDocObj) {}
}

export class ConversationList<T = ConversationObj> extends InfinityList.BaseList<T> {
  constructor(arg: Partial<InfinityList.BaseList<T>> = {}) {
    super(arg);
    this.take = arg.take || 30;
  }
}
