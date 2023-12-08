import { InfinityList } from './infinityList';
import { UserObj } from './user';
import { FieldValue } from 'firebase/app/dist/firestore';

interface MessageObj {
  userId: number;
  id: string;
  text: string;
  createdAt: FieldValue;
  isReaded: boolean;
}

export interface ConversationDocObj {
  id: string;
  creatorId: number;
  targetId: number;
  roomId: string;
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

export class ConversationList<T = ConversationObj> extends InfinityList.BaseList<T> {
  constructor(arg: Partial<InfinityList.BaseList<T>> = {}) {
    super(arg);
    this.take = arg.take || 30;
  }
}
