import { FC, useCallback, useEffect } from 'react';
import { Box, styled, Drawer, Typography, CircularProgress } from '@mui/material';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Users from './Users';
import MessageCard from './MessageCard';
import { ModalNames } from '../../store';
import EmptyMessages from './EmptyMessages';
import { useAction, useAuth, useInfinityList, useRequest, useSelector } from '../../hooks';
import StartConversation from './StartConversation';
import { getConversationTargetId, getDynamicPath, getUserStatusDate, MessageList, Pathes } from '../../lib';
import { MessagesApi } from '../../apis';
import TextSenderInput from './TextSenderInput';
import GetMessageListProvider from '../../lib/providers/GetMessageListProvider';
import { history } from '../../App';
import MessagesSkeleton from './MessagesSkeleton';

const ArrowLeftIconWrapper = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));

const MessagesContent: FC = () => {
  const messageListInstance = useInfinityList(MessageList);
  const selectors = useSelector();
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const isInitialMessagesApiProcessing = request.isInitialApiProcessing(MessagesApi);
  const messageList = messageListInstance.getList();
  const isCurrentOwner = auth.isCurrentOwner();
  const isConversationDrawerOpen = !!selectors.modals[ModalNames.CONVERSATION];
  const selectedConversation = selectors.conversations.selectedUser;

  const onUserConversationNameClick = useCallback(() => {
    if (window.innerWidth < 900) {
      actions.showModal(ModalNames.CONVERSATION);
    }
  }, []);

  useEffect(() => {
    function resizeProcess() {
      if (window.innerWidth >= 900) {
        actions.hideModal(ModalNames.CONVERSATION);
      }
    }

    window.addEventListener('resize', resizeProcess);
    return () => {
      window.removeEventListener('resize', resizeProcess);
    };
  }, [isConversationDrawerOpen]);

  return (
    <GetMessageListProvider>
      {selectedConversation ? (
        isInitialMessagesApiProcessing ? (
          <Box sx={{ padding: '16px', height: '100%' }}>
            <MessagesSkeleton />
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                padding: '8px 10px',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '5px',
                height: '53px',
                backgroundColor: 'white',
                width: '100%',
                flexShrink: '0',
              }}
            >
              <Box
                onClick={() => onUserConversationNameClick()}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeftIconWrapper>
                  <ArrowLeftIcon fontSize="medium" />
                </ArrowLeftIconWrapper>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    fontSize="14px"
                    fontWeight={'bold'}
                    sx={{
                      maxWidth: '560px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                  </Typography>
                  {isCurrentOwner &&
                    (() => {
                      const userLastConnection = auth.getUserLastConnection(selectedConversation.user.id);
                      if (userLastConnection) {
                        return (
                          <Typography component={'p'} fontSize="10px" color="rgba(0, 0, 0, 0.6)">
                            {getUserStatusDate(userLastConnection)}
                          </Typography>
                        );
                      } else if (
                        userLastConnection === null &&
                        (selectedConversation.conversation.isCreatorTyping ||
                          selectedConversation.conversation.isTargetTyping) &&
                        !auth.isUserEqualToCurrentUser(getConversationTargetId(selectedConversation.conversation))
                      ) {
                        return (
                          <Typography component={'p'} fontSize="10px" color="rgba(0, 0, 0, 0.6)">
                            Typing...
                          </Typography>
                        );
                      } else if (userLastConnection === null) {
                        return (
                          <Typography component={'p'} fontSize="10px" color="rgba(0, 0, 0, 0.6)">
                            online
                          </Typography>
                        );
                      }
                    })()}
                </Box>
              </Box>
              <Box
                component={'span'}
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  history.push(
                    getDynamicPath(Pathes.USER, {
                      id: selectedConversation.user.id,
                    })
                  );
                }}
              >
                <ArrowRightIcon fontSize="medium" />
              </Box>
            </Box>
            {messageList.length > 0 ? (
              <Box
                id="chat__messages-wrapper"
                component="div"
                sx={{
                  height: '100%',
                  width: '100%',
                  padding: '5px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  flexShrink: '1',
                }}
              >
                {!messageListInstance.isListEnd() && selectors.conversations.isMessagesSpinnerElementActive && (
                  <Box
                    id="chat__message-list-spinner"
                    component={'div'}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      padding: '16px',
                    }}
                  >
                    <CircularProgress size={30} />
                  </Box>
                )}
                <Box sx={{ width: '100%', height: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    {messageList.map((message, i) => (
                      <Box
                        key={message.id}
                        sx={{ paddingBottom: i >= messageList.length - 1 ? '5px' : '0' }}
                        data-mid={message.id}
                        data-index={i}
                      >
                        <MessageCard message={message} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box component="div" sx={{ width: '100%', height: '100%', flexShrink: '1' }}>
                <EmptyMessages />
              </Box>
            )}
            <Box
              sx={{
                width: '100%',
                height: '50px',
                backgroundColor: 'white',
                borderTop: '1px solid #e0e0e0',
                flexShrink: '0',
              }}
            >
              <TextSenderInput />
            </Box>
          </Box>
        )
      ) : (
        <StartConversation />
      )}
      <Drawer
        sx={{ zIndex: 20 }}
        ModalProps={{ keepMounted: true }}
        anchor="left"
        open={isConversationDrawerOpen}
        onClose={() => actions.hideModal(ModalNames.CONVERSATION)}
      >
        <Box sx={{ width: '280px', height: '100%' }}>
          <Users onUserClick={() => actions.hideModal(ModalNames.CONVERSATION)} />
        </Box>
      </Drawer>
    </GetMessageListProvider>
  );
};

export default MessagesContent;
