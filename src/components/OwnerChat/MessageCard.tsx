import { FC, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';
import { useAuth } from '../../hooks';

export interface MessageObj {
  userId: number;
  id: string;
  text: string;
  date: number;
  isReaded: boolean;
  isDateDisabled?: boolean;
}

interface MessageCardImportation {
  message: MessageObj;
}

const MessageCard: FC<MessageCardImportation> = ({ message }) => {
  const auth = useAuth();
  const isUserEqualToCurrentUser = auth.isUserEqualToCurrentUser(message.userId);

  const getMessageDate = useCallback((date: Date | number) => {
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
      return moment(messageDate).format('llll');
    }
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: isUserEqualToCurrentUser ? 'start' : 'end',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: isUserEqualToCurrentUser ? 'end' : 'start',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <Box
          sx={{
            backgroundColor: isUserEqualToCurrentUser ? '#20A0FF' : '#f8f8f8',
            padding: '12px',
            borderRadius: isUserEqualToCurrentUser ? '0 10px 10px 10px' : '10px 0 10px 10px',
            maxWidth: '400px',
            border: '1px solid #f2f2f2',
            color: isUserEqualToCurrentUser ? 'white' : 'black',
          }}
        >
          <Typography
            sx={{ fontSize: '15px', fontWeight: '400', letterSpacing: '0.3px', minWidth: '50px' }}
            component="p"
          >
            {message.text}
          </Typography>
        </Box>
        {!message.isDateDisabled && (
          <Typography fontSize={'10px'} fontWeight={'400'} sx={{ color: '#999999' }} component="p">
            {getMessageDate(message.date)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MessageCard;
