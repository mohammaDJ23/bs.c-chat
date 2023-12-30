import { FC, useCallback, useEffect, useRef } from 'react';
import { Box, styled, Drawer, Typography, CircularProgress } from '@mui/material';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Users from './Users';
import MessageCard from './MessageCard';
import { ModalNames } from '../../store';
import EmptyMessages from './EmptyMessages';
import { useAction, useAuth, useInfinityList, useRequest, useSelector } from '../../hooks';
import StartConversation from './StartConversation';
import { ConversationList, ConversationObj, getUserStatusDate, Message, MessageList } from '../../lib';
import { useSnackbar } from 'notistack';
import { AllConversationsApi, MessagesApi } from '../../apis';
import TextSenderInput from './TextSenderInput';
import GetMessageListProvider from '../../lib/providers/GetMessageListProvider';

interface SendMessageObj {
  message: Message;
  roomId: string;
  conversationId: string;
}

const ArrowLeftIconWrapper = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));

const FormWrapper = styled(Box)(({ theme }) => ({
  position: 'fixed',
  zIndex: 1,
  bottom: '0',
  left: '280px',
  width: 'calc(100% - 280px)',
  height: '50px',
  backgroundColor: 'white',
  borderTop: '1px solid #e0e0e0',
  [theme.breakpoints.down('md')]: {
    left: '0',
    width: '100%',
  },
}));

const MessagesWrapper = styled(Box)(({ theme }) => ({
  height: 'calc(100% - 103px)',
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100% - 83px)',
  },
}));

const EmptyMessagesWrapper = styled(Box)(({ theme }) => ({
  height: 'calc(100% - 103px)',
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100% - 83px)',
  },
}));

const MessagesSpinnerWrapper = styled(Box)(({ theme }) => ({
  height: 'calc(100% - 48px)',
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100% - 33px)',
  },
}));

const MessagesContent: FC = () => {
  const selectedConversationRef = useRef<ConversationObj | null>(null);
  const messageListInstance = useInfinityList(MessageList);
  const conversationListInstance = useInfinityList(ConversationList);
  const selectors = useSelector();
  const actions = useAction();
  const auth = useAuth();
  const snackbar = useSnackbar();
  const request = useRequest();
  const isInitialMessagesApiProcessing = request.isInitialApiProcessing(MessagesApi);
  const isInitialAllConversationApiProcessing = request.isInitialApiProcessing(AllConversationsApi);
  const messageList = messageListInstance.getList();
  const conversationList = conversationListInstance.getList();
  const isCurrentOwner = auth.isCurrentOwner();
  const isConversationDrawerOpen = !!selectors.modals[ModalNames.CONVERSATION];
  const chatSocket = selectors.userServiceSocket.chat;
  const selectedConversation = selectors.conversations.selectedUser;

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

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

  useEffect(() => {
    if (chatSocket) {
      conversationList.forEach((item) => {
        // listen to all conversation
        chatSocket.on(item.conversation.roomId, (data: SendMessageObj) => {
          const conversationEl = document.querySelector(`[data-cid="${data.conversationId}"]`);
          if (conversationEl) {
            const index = conversationEl.getAttribute('data-index');
            if (index && !isNaN(parseInt(index))) {
              const parsedIndex = +index;
              if (conversationList[parsedIndex]) {
                const [newConversation] = conversationList.splice(parsedIndex, 1);
                newConversation.conversation.lastMessage = data.message;
                conversationListInstance.unshiftList(newConversation);
              }
            }
          }

          if (selectedConversationRef.current && selectedConversationRef.current.conversation.roomId === data.roomId) {
            // this check runs for sender who has created the message
            const messageEl = document.querySelector(`[data-mid="${data.message.id}"]`);
            if (messageEl) {
              const index = messageEl.getAttribute('data-index');
              if (index && !isNaN(parseInt(index))) {
                const parsedIndex = +index;
                const messageList = messageListInstance.getList();
                const message = messageList[parsedIndex];
                if (message) {
                  message.status = data.message.status;
                  messageList.splice(parsedIndex, 1, message);
                  messageListInstance.updateList(messageList);
                }
              }
            }

            // this check runs for receiver who receive the message from the sender
            else {
              messageListInstance.updateAndConcatList([data.message]);

              // scrolling the chat wrapper element to the bottom of the page
              const timer = setTimeout(() => {
                const messagesWrapperElement = document.getElementById('chat__messages-wrapper');
                if (messagesWrapperElement) {
                  messagesWrapperElement.scrollTo({ behavior: 'smooth', top: messagesWrapperElement.scrollHeight });
                }
                clearTimeout(timer);
              });
            }
          }
        });
      });

      chatSocket.on('fail-send-message', (error: Error) => {
        snackbar.enqueueSnackbar({ message: error.message, variant: 'error' });
      });

      return () => {
        chatSocket.removeListener('success-send-message');
        chatSocket.removeListener('fail-send-message');
      };
    }
  }, [chatSocket, messageListInstance, conversationList]);

  return (
    <GetMessageListProvider>
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
        <>
          {selectors.conversations.selectedUser ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                onClick={() => onUserConversationNameClick()}
                sx={{
                  position: 'sticky',
                  top: 0,
                  left: 0,
                  padding: '8px 10px',
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  height: '53px',
                  backgroundColor: 'white',
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
                    {selectors.conversations.selectedUser.user.firstName}{' '}
                    {selectors.conversations.selectedUser.user.lastName}
                  </Typography>
                  {isCurrentOwner &&
                    (() => {
                      const userLastConnection = auth.getUserLastConnection(
                        selectors.conversations.selectedUser.user.id
                      );
                      if (userLastConnection) {
                        return (
                          <Typography component={'p'} fontSize="10px" color="rgba(0, 0, 0, 0.6)">
                            {getUserStatusDate(userLastConnection)}
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

              {isInitialMessagesApiProcessing ? (
                <MessagesSpinnerWrapper
                  sx={{
                    width: '100%',
                    padding: '10px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <CircularProgress size={30} />
                </MessagesSpinnerWrapper>
              ) : (
                <>
                  {messageList.length > 0 ? (
                    <MessagesWrapper
                      id="chat__messages-wrapper"
                      component="div"
                      sx={{ width: '100%', padding: '5px', overflowY: 'auto', overflowX: 'hidden' }}
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
                    </MessagesWrapper>
                  ) : (
                    <EmptyMessagesWrapper component="div" sx={{ width: '100%' }}>
                      <EmptyMessages />
                    </EmptyMessagesWrapper>
                  )}
                  <FormWrapper>
                    <TextSenderInput />
                  </FormWrapper>
                </>
              )}
            </Box>
          ) : (
            <StartConversation />
          )}
          <Drawer
            sx={{ zIndex: 10 }}
            ModalProps={{ keepMounted: true }}
            anchor="left"
            open={isConversationDrawerOpen}
            onClose={() => actions.hideModal(ModalNames.CONVERSATION)}
          >
            <Box sx={{ width: '280px', height: '100vh' }}>
              <Users onUserClick={() => actions.hideModal(ModalNames.CONVERSATION)} />
            </Box>
          </Drawer>
        </>
      )}
    </GetMessageListProvider>
  );
};

export default MessagesContent;
