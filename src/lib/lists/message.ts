import { InfinityList } from './infinityList';
import { FieldValue } from 'firebase/app/dist/firestore';

export interface MessageObj {
  userId: number;
  id: string;
  text: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  deletedAt: FieldValue | null;
  isReaded: boolean;
}

export class MessageList<T = MessageObj> extends InfinityList.BaseList<T> {
  constructor(arg: Partial<InfinityList.BaseList<T>> = {}) {
    super(arg);
    this.take = arg.take || 30;
  }
}
