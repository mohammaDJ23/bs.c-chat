import { FC } from 'react';
import { Box, styled } from '@mui/material';
import Users from './Users';
import MessagesContent from './MessagesContent';
import ConversationListSnapshotsProvider from '../../lib/providers/ConversationListSnapshotsProvider';
import UserStatusEventsProvider from '../../lib/providers/UserStatusEventsProvider';
import GetConversationListProvider from '../../lib/providers/GetConversationListProvider';

const MessageWrapper = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '280px auto',
  height: '100%',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'auto',
  },
}));

const UsersWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const Chat: FC = () => {
  return (
    <ConversationListSnapshotsProvider>
      <UserStatusEventsProvider>
        <GetConversationListProvider>
          <Box
            sx={{
              width: '100vw',
              height: 'calc(100vh - 64px)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ width: '100%', height: '100%' }}>
              <MessageWrapper>
                <UsersWrapper>
                  <Users />
                </UsersWrapper>
                <MessagesContent />
              </MessageWrapper>
            </Box>
          </Box>
        </GetConversationListProvider>
      </UserStatusEventsProvider>
    </ConversationListSnapshotsProvider>
  );
};

export default Chat;
