import { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../../hooks';
import { MessageObj, getConversationDate, getMessageDate } from '../../lib';

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
          backgroundColor: isUserEqualToCurrentUser ? '#20A0FF' : '#f8f8f8',
          padding: '6px 12px',
          borderRadius: isUserEqualToCurrentUser ? '0 8px 8px 8px' : '8px 0 8px 8px',
          maxWidth: '400px',
          color: isUserEqualToCurrentUser ? 'white' : 'black',
          wordBreak: 'break-word',
          minWidth: '20px',
        }}
      >
        <Box
          display={'flex'}
          flexDirection={'column'}
          gap={'8px'}
          alignItems={isUserEqualToCurrentUser ? 'start' : 'end'}
        >
          <Typography sx={{ fontSize: '13px', fontWeight: '400', letterSpacing: '0.3px' }} component="p">
            {message.text}
          </Typography>
          <Typography
            fontSize={'8px'}
            fontWeight={'400'}
            sx={{ color: isUserEqualToCurrentUser ? 'white' : '#999999' }}
            component="p"
          >
            {/* @ts-ignore */}
            {getMessageDate(message.createdAt.seconds * 1000)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MessageCard;
