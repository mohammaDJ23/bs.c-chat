import { FC } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { useAuth } from '../../hooks';
import { MessageObj, MessageStatus, getMessageDate } from '../../lib';

interface MessageCardImportation {
  message: MessageObj;
}

const MessageContent = styled(Box)(({ theme }) => ({
  maxWidth: '400px',

  [theme.breakpoints.down('sm')]: {
    maxWidth: '280px',
  },
}));

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
      <MessageContent
        sx={{
          backgroundColor: isUserEqualToCurrentUser ? '#20A0FF' : '#f8f8f8',
          padding: '6px 12px',
          borderRadius: isUserEqualToCurrentUser ? '0 8px 8px 8px' : '8px 0 8px 8px',
          color: isUserEqualToCurrentUser ? 'white' : 'black',
          wordBreak: 'break-word',
          minWidth: '20px',
          opacity: message.status === MessageStatus.PENDING || message.status === MessageStatus.ERROR ? 0.55 : 1,
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
      </MessageContent>
    </Box>
  );
};

export default MessageCard;
