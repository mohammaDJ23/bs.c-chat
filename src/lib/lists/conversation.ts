import { BaseList } from './list';
import { UserObj } from './user';
import { FieldValue } from 'firebase/app/dist/firestore';

interface MessageObj {
  userId: number;
  id: string;
  text: string;
  createdAt: FieldValue;
  isReaded: boolean;
}

interface ConversationDocObj {
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

export class ConversationList extends BaseList {
  constructor(arg: Partial<BaseList> = {}) {
    super(arg);
    this.take = arg.take || 30;
  }
}
