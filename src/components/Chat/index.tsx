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
import UserServiceChatSocketAuthenticationErrorProvider from '../../lib/providers/UserServiceChatSocketAuthenticationErrorProvider';
import UserServiceChatSocketDisconnectErrorProvider from '../../lib/providers/UserServiceChatSocketDisconnectErrorProvider';
import UserServiceChatSocketConnectErrorProvider from '../../lib/providers/UserServiceChatSocketConnectErrorProvider';

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
  height: 'calc(100% - 64px)',

  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const MessageContentWrapper = styled(Box)(({ theme }) => ({
  height: 'calc(100% - 64px)',

  [theme.breakpoints.down('sm')]: {
    height: 'calc(100% - 48px)',
  },
}));

const ConversationWrapper = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: 'calc(100% - 64px)',
  position: 'relative',
  overflow: 'hidden',

  [theme.breakpoints.down('sm')]: {
    height: 'calc(100% - 48px)',
  },
}));

const Chat: FC = () => {
  const request = useRequest();
  const isInitialAllConversationApiProcessing = request.isInitialApiProcessing(AllConversationsApi);

  return (
    <GenerateCustomTokenProvider>
      <UserServiceChatSocketProvider>
        <UserServiceChatSocketDisconnectErrorProvider>
          <UserServiceChatSocketConnectErrorProvider>
            <UserServiceChatSocketAuthenticationErrorProvider>
              <ConversationListSnapshotsProvider>
                <ConversationEventsProvider>
                  <UserStatusEventsProvider>
                    <GetConversationListProvider>
                      <TypingTextEventsProvider>
                        <ConversationWrapper>
                          {isInitialAllConversationApiProcessing ? (
                            <ConversationSkeleton />
                          ) : (
                            <MessageWrapper>
                              <UsersWrapper>
                                <Users />
                              </UsersWrapper>
                              <MessageContentWrapper>
                                <MessagesContent />
                              </MessageContentWrapper>
                            </MessageWrapper>
                          )}
                        </ConversationWrapper>
                      </TypingTextEventsProvider>
                    </GetConversationListProvider>
                  </UserStatusEventsProvider>
                </ConversationEventsProvider>
              </ConversationListSnapshotsProvider>
            </UserServiceChatSocketAuthenticationErrorProvider>
          </UserServiceChatSocketConnectErrorProvider>
        </UserServiceChatSocketDisconnectErrorProvider>
      </UserServiceChatSocketProvider>
    </GenerateCustomTokenProvider>
  );
};

export default Chat;
