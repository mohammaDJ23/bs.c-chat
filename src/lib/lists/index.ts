import { UserList } from './user';
import { BillList } from './bill';
import { DeletedUserList } from './deletedUsers';
import { DeletedBillList } from './deletedBills';
import { NotificationList } from './notification';
import { ConsumerList } from './consumer';
import { AllBillList } from './allBill';
import { ReceiverList } from './receivers';

export * from './bill';
export * from './list';
export * from './user';
export * from './deletedUsers';
export * from './deletedBills';
export * from './notification';
export * from './consumer';
export * from './allBill';
export * from './receivers';

export const lists = {
  UserList,
  BillList,
  DeletedUserList,
  DeletedBillList,
  NotificationList,
  ConsumerList,
  AllBillList,
  ReceiverList,
};
