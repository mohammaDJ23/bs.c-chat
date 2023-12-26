import moment from 'moment';

export function getConversationDate(date: Date | number) {
  const now = moment();
  const startOfDay = now.startOf('day').toDate();
  const endOfDay = now.endOf('day').toDate();
  const startOfWeek = now.startOf('week').toDate();
  const endOfWeek = now.endOf('week').toDate();

  const messageDate = moment(date).toDate();

  if (messageDate >= startOfDay && messageDate <= endOfDay) {
    return moment(messageDate).format('LT');
  } else if (messageDate >= startOfWeek && messageDate <= endOfWeek) {
    return moment(messageDate).subtract(1, 'days').format('dddd LT');
  } else {
    return moment(messageDate).format('ll');
  }
}
