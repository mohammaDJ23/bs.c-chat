import { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../../hooks';
import { MessageObj, getConversationDate } from '../../lib';

interface MessageCardImportation {
  message: MessageObj;
}

const MessageCard: FC<MessageCardImportation> = ({ message }) => {
  const auth = useAuth();
  const isUserEqualToCurrentUser = auth.isUserEqualToCurrentUser(message.userId);

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
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            backgroundColor: isUserEqualToCurrentUser ? '#20A0FF' : '#f8f8f8',
            padding: '6px 12px',
            borderRadius: isUserEqualToCurrentUser ? '0 10px 10px 10px' : '10px 0 10px 10px',
            maxWidth: '400px',
            border: '1px solid #f2f2f2',
            color: isUserEqualToCurrentUser ? 'white' : 'black',
            wordBreak: 'break-word',
            minWidth: '20px',
          }}
        >
          <Box display={'flex'} flexDirection={'column'} gap={'8px'}>
            <Typography sx={{ fontSize: '15px', fontWeight: '400', letterSpacing: '0.3px' }} component="p">
              {message.text}
            </Typography>
            <Typography
              fontSize={'8px'}
              fontWeight={'400'}
              sx={{ color: isUserEqualToCurrentUser ? 'white' : '#999999' }}
              component="p"
            >
              {/* @ts-ignore */}
              {getConversationDate(message.createdAt.seconds * 1000)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MessageCard;
