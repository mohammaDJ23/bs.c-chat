import { FC } from 'react';
import { Box, styled } from '@mui/material';
import Users from './Users';
import MessagesContent from './MessagesContent';
import ConversationListSnapshotsProvider from '../../lib/providers/ConversationListSnapshotsProvider';
import UserStatusEventsProvider from '../../lib/providers/UserStatusEventsProvider';
import GetConversationListProvider from '../../lib/providers/GetConversationListProvider';
import ConversationEventsProvider from '../../lib/providers/ConversationEventsProvider';
import TypingTextEventsProvider from '../../lib/providers/TypingTextEventsProvider';
import GenerateCustomTokenProvider from '../../lib/providers/GenerateCustomTokenProvider';
import UserServiceChatSocketProvider from '../../lib/providers/UserServiceChatSocketProvider';
import { useRequest } from '../../hooks';
import { AllConversationsApi } from '../../apis';
import ConversationSkeleton from './ConversationSkeleton';

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
  const request = useRequest();
  const isInitialAllConversationApiProcessing = request.isInitialApiProcessing(AllConversationsApi);

  return (
    <GenerateCustomTokenProvider>
      <UserServiceChatSocketProvider>
        <ConversationListSnapshotsProvider>
          <ConversationEventsProvider>
            <UserStatusEventsProvider>
              <GetConversationListProvider>
                <TypingTextEventsProvider>
                  <Box
                    sx={{
                      width: '100vw',
                      height: 'calc(100vh - 64px)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ width: '100%', height: '100%' }}>
                      {isInitialAllConversationApiProcessing ? (
                        <ConversationSkeleton />
                      ) : (
                        <MessageWrapper>
                          <UsersWrapper>
                            <Users />
                          </UsersWrapper>
                          <MessagesContent />
                        </MessageWrapper>
                      )}
                    </Box>
                  </Box>
                </TypingTextEventsProvider>
              </GetConversationListProvider>
            </UserStatusEventsProvider>
          </ConversationEventsProvider>
        </ConversationListSnapshotsProvider>
      </UserServiceChatSocketProvider>
    </GenerateCustomTokenProvider>
  );
};

export default Chat;
