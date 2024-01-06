import { InfinityList } from './infinityList';
import { FieldValue, Timestamp } from 'firebase/firestore';
import { v4 as uuid } from 'uuid';

export enum MessageStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface MessageObj {
  userId: number;
  id: string;
  text: string;
  status: MessageStatus;
  isReaded: boolean;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  deletedAt: FieldValue | null;
}

export class Message implements MessageObj {
  id: string = uuid();
  userId: number;
  text: string;
  isReaded: boolean = true;
  status: MessageStatus = MessageStatus.PENDING;
  createdAt: FieldValue = Timestamp.fromDate(new Date());
  updatedAt: FieldValue = Timestamp.fromDate(new Date());
  deletedAt: FieldValue | null = null;

  constructor(arg: Pick<Message, 'userId' | 'text'>) {
    this.userId = arg.userId;
    this.text = arg.text;
  }
}

export class MessageList<T = MessageObj> extends InfinityList.BaseList<T> {
  constructor(arg: Partial<InfinityList.BaseList<T>> = {}) {
    super(arg);
    this.take = arg.take || 30;
  }
}
