import { FC, useCallback, useState, useEffect } from 'react';
import { Box, TextField as TF, styled, Drawer, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Users from './Users';
import MessageCard from './MessageCard';
import { ModalNames } from '../../store';
import EmptyMessages from './EmptyMessages';
import { useAction, useAuth, useInfinityList, useSelector } from '../../hooks';
import StartConversation from './StartConversation';
import { ConversationObj, getConversationDate, MessageList, MessageObj } from '../../lib';
import { useSnackbar } from 'notistack';

interface SendMessageObj extends ConversationObj {
  text: string;
}

const TextField = styled(TF)(({ theme }) => ({
  '.css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input': {
    border: 'none',
    padding: '14px',
    fontSize: '14px',
    letterSpacing: '0.3px',
  },
  '.css-1d3z3hw-MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

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

const MessagesContent: FC = () => {
  const [text, setText] = useState<string>('');
  const messageListInstance = useInfinityList(MessageList);
  const selectors = useSelector();
  const actions = useAction();
  const auth = useAuth();
  const snackbar = useSnackbar();
  const messageList = messageListInstance.getList();
  const isCurrentOwner = auth.isCurrentOwner();
  const isConversationDrawerOpen = !!selectors.modals[ModalNames.CONVERSATION];
  const chatSocket = selectors.userServiceSocket.chat;
  const selectedUser = selectors.conversations.selectedUser;

  const chunkedMessageIndexesByTime = useCallback((messages: MessageObj[], time: number = 60000) => {
    const indexes: number[][] = [];
    let tempIndexes: number[] = [];
    const now = new Date();

    for (let i = 0; i < messages.length; i++) {
      secondLoop: for (let j = i + 1; j < messages.length && messages[j]; j++) {
        if (
          messages[i].userId === messages[j].userId &&
          // @ts-ignore
          now.getTime() - new Date(messages[i].createdAt.seconds * 1000).getTime() < time &&
          // @ts-ignore
          now.getTime() - new Date(messages[j].createdAt.seconds * 1000).getTime() < time
        ) {
          tempIndexes.push(i, j);
          i = j;
        } else {
          break secondLoop;
        }
      }

      if (tempIndexes.length) {
        indexes.push(Array.from(new Set(tempIndexes)));
        tempIndexes = [];
      }
    }

    return indexes;
  }, []);

  useEffect(() => {
    const messages: MessageObj[] = [];

    const chunkedIndexes = chunkedMessageIndexesByTime(messages);

    for (let indexes of chunkedIndexes) {
      indexes = indexes.slice(0, -1);
      for (const index of indexes) {
        // messages[index].isDateDisabled = true;
      }
    }

    // setting the messages
  }, [chunkedMessageIndexesByTime]);

  useEffect(() => {
    // write the isDateDisabled for the onSnapshot fn
  }, []);

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
      chatSocket.on('success-send-message', (data: SendMessageObj) => {});

      chatSocket.on('fail-send-message', (error: Error) => {
        snackbar.enqueueSnackbar({ message: error.message, variant: 'error' });
      });

      return () => {
        chatSocket.removeListener('success-send-message');
        chatSocket.removeListener('fail-send-message');
      };
    }
  }, [chatSocket]);

  const onSendText = useCallback(() => {
    if (chatSocket && selectedUser && text.length) {
      const payload = Object.assign(selectedUser, { text: text.trim() });
      chatSocket.emit('send-message', { payload });
      setText('');
    }
  }, [text, chatSocket, selectedUser]);

  return (
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
                  const userLastConnection = auth.getUserLastConnection(selectors.conversations.selectedUser.user.id);
                  if (userLastConnection) {
                    return (
                      <Typography component={'p'} fontSize="10px" color="rgba(0, 0, 0, 0.6)">
                        {getConversationDate(userLastConnection)}
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

          {messageList.length > 0 ? (
            <MessagesWrapper
              id="chat__messages-wrapper"
              component="div"
              sx={{ width: '100%', padding: '10px', overflowY: 'auto', overflowX: 'hidden' }}
            >
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
                    <Box key={message.id} sx={{ paddingBottom: i >= messageList.length - 1 ? '5px' : '0' }}>
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
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSendText();
              }}
            >
              <Box
                component="div"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <TextField
                  onChange={(event) => setText(event.target.value)}
                  placeholder={'Type your message here'}
                  fullWidth
                  value={text}
                  sx={{ height: '100%', width: '100%' }}
                />
                <Box sx={{ padding: '0 14px' }} onClick={() => onSendText()}>
                  <SendIcon color="primary" sx={{ cursor: 'pointer' }} />
                </Box>
              </Box>
            </form>
          </FormWrapper>
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
  );
};

export default MessagesContent;
