import moment from 'moment';

export function getConversationDate(date: Date | number) {
  const now = new Date().getTime();
  const messageDate = new Date(date).getTime();
  const calculatedTime = now - messageDate;

  // one day
  if (calculatedTime < 86400000) {
    return moment(messageDate).format('LT');

    // two days
  } else if (calculatedTime < 172800000) {
    return moment(messageDate).subtract(1, 'days').calendar();

    // one week or more
  } else if (calculatedTime < 604800000 || calculatedTime >= 604800000) {
    return moment(messageDate).format('l');
  }
}
