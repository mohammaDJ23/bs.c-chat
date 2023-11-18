import { FC } from 'react';
import { Box, styled } from '@mui/material';
import Users from './Users';
import MessagesContent from './MessagesContent';
import { useSelector } from '../../hooks';

const MessageWrapper = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '280px auto',
  height: '100%',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'auto',
  },
  '.css-fsky3x': {
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
}));

const OwnerChat: FC = () => {
  const selectors = useSelector();

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ width: '100%', height: '100%' }}>
        <MessageWrapper>
          <Users />
          <MessagesContent />
        </MessageWrapper>
      </Box>
    </Box>
  );
};

export default OwnerChat;
