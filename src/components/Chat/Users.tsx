import { FC, useCallback } from 'react';
import { List, Box, ListItemButton, ListItem, ListItemText, CircularProgress, styled } from '@mui/material';
import EmptyUsers from './EmptyUsers';
import { useAction, useAuth, useInfinityList, useRequest, useSelector } from '../../hooks';
import {
  ConversationList,
  ConversationObj,
  MessageList,
  getConversationDate,
  getConversationTargetId,
} from '../../lib';
import { AllConversationsApi, MessagesApi, StartConversationApi } from '../../apis';
import UsersFinderInput from './UsersFinderInput';

const UsersWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    height: 'calc(100vh - 48px)',
  },
  [theme.breakpoints.up('md')]: {
    height: 'calc(100vh - 64px)',
  },
}));

const ListWrapper = styled(List)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    paddingBottom: '0',
  },
  [theme.breakpoints.up('md')]: {
    paddingBottom: '50px',
  },
}));

interface UsersImportation {
  onUserClick: () => void;
}

const Users: FC<Partial<UsersImportation>> = ({ onUserClick }) => {
  const selectors = useSelector();
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const isCurrentOwner = auth.isCurrentOwner();
  const conversationListInstance = useInfinityList(ConversationList);
  const messageListInstance = useInfinityList(MessageList);
  const conversationList = conversationListInstance.getList();
  const isStartConversationApiProcessing = request.isApiProcessing(StartConversationApi);
  const isInitialAllConversationApiProcessing = request.isInitialApiProcessing(AllConversationsApi);
  const isInitialMessagesApiProcessing = request.isInitialApiProcessing(MessagesApi);
  const selectedConversation = selectors.conversations.selectedUser;

  const onConversationClick = useCallback(
    (item: ConversationObj) => {
      if (isInitialMessagesApiProcessing) {
        return;
      }

      if (!selectedConversation || (selectedConversation && selectedConversation.user.id !== item.user.id)) {
        actions.selectUserForStartConversation(item);
        actions.hideMessagesSpinnerElement();
        messageListInstance.resetList();
      }

      if (onUserClick) {
        onUserClick.call({});
      }
    },
    [selectedConversation, isInitialMessagesApiProcessing]
  );

  return (
    <UsersWrapper
      sx={{
        width: '100%',
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto',
        overflowX: 'hidden',
        wordBreak: 'break-word',
        position: 'relative',
      }}
    >
      {isInitialAllConversationApiProcessing ? (
        <Box
          component={'div'}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <CircularProgress size={30} />
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          {conversationList.length > 0 ? (
            <ListWrapper disablePadding>
              {conversationList.map((item, index) => (
                <ListItemButton
                  selected={selectors.conversations.selectedUser?.user?.id === item.user.id}
                  key={item.conversation.id}
                  sx={{ padding: '14px 16px', borderBottom: '1px solid #e0e0e0' }}
                  onClick={() => onConversationClick(item)}
                  data-cid={item.conversation.id}
                  data-index={index}
                  data-cactive={selectedConversation && selectedConversation.conversation.id === item.conversation.id}
                >
                  <ListItem disablePadding>
                    <Box sx={{ width: '100%', height: '100%' }}>
                      <Box
                        component="div"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'nowrap',
                          width: '100%',
                        }}
                      >
                        <Box
                          component="div"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'nowrap',
                          }}
                        >
                          {isCurrentOwner && (
                            <ListItemText
                              sx={{
                                flex: 'unset',
                                width: '8px',
                                height: '8px',
                                backgroundColor: auth.getUserStatusColor(item.user.id),
                                borderRadius: '50%',
                              }}
                              secondary={<Box component="span"></Box>}
                            />
                          )}
                          <ListItemText
                            primaryTypographyProps={{
                              fontSize: '14px',
                              fontWeight: 'bold',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              width: '165px',
                            }}
                            primary={`${item.user.firstName} ${item.user.lastName}`}
                          />
                        </Box>
                        {/* @ts-ignore */}
                        {item.conversation.lastMessage && (
                          <ListItemText
                            secondaryTypographyProps={{
                              fontSize: '10px',
                              fontWeight: '500',
                            }}
                            sx={{ flexGrow: '0', flexShrink: '0' }}
                            // @ts-ignore
                            secondary={getConversationDate(item.conversation.lastMessage.updatedAt.seconds * 1000)}
                          />
                        )}
                      </Box>

                      <Box component="div">
                        <ListItemText
                          secondaryTypographyProps={{
                            fontSize: '11px',
                            fontWeight: '500',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            width: '250px',
                          }}
                          secondary={
                            (item.conversation.isCreatorTyping || item.conversation.isTargetTyping) &&
                            !auth.isUserEqualToCurrentUser(getConversationTargetId(item.conversation))
                              ? 'Typing...'
                              : item.conversation.lastMessage
                              ? auth.isUserEqualToCurrentUser(item.conversation.lastMessage.userId)
                                ? `You: ${item.conversation.lastMessage.text}`
                                : item.conversation.lastMessage.text
                              : 'No mesage'
                          }
                        />
                      </Box>
                    </Box>
                  </ListItem>
                </ListItemButton>
              ))}
              {!conversationListInstance.isListEndByLength() && (
                <Box
                  id="chat__conversation-list-spinner"
                  component={'div'}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '16px',
                  }}
                >
                  <CircularProgress size={30} />
                </Box>
              )}
            </ListWrapper>
          ) : (
            <EmptyUsers />
          )}
          <Box sx={{ position: 'fixed', zIndex: 1, bottom: '0', left: '0', width: '280px', height: '50px' }}>
            <Box sx={{ width: '100%', height: '100%', backgroundColor: '#e0e0e0' }}>
              <UsersFinderInput />
              {isStartConversationApiProcessing && (
                <CircularProgress size={20} sx={{ position: 'absolute', zIndex: '1', right: '13px', top: '12px' }} />
              )}
            </Box>
          </Box>
        </Box>
      )}
    </UsersWrapper>
  );
};

export default Users;
