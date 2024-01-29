import { Box, TextField as TF, styled } from '@mui/material';
import { ChangeEvent, FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useAuth, useInfinityList, useSelector } from '../../hooks';
import { ConversationList, Message, MessageList, debounce } from '../../lib';
import SendIcon from '@mui/icons-material/Send';
import { WsErrorObj } from '../../lib/socket';
import { useSnackbar } from 'notistack';

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

const TextSenderInput: FC = () => {
  const [text, setText] = useState<string>('');
  const halfSecondDebounce = useRef(debounce());
  const selectors = useSelector();
  const snackbar = useSnackbar();
  const auth = useAuth();
  const messageListInstance = useInfinityList(MessageList);
  const conversationListInstance = useInfinityList(ConversationList);
  const decodedToken = auth.getDecodedToken()!;
  const selectedConversation = selectors.conversations.selectedUser;
  const chatSocket = selectors.userServiceSocket.chat;

  useEffect(() => {
    if (chatSocket) {
      chatSocket.on('error', (data: WsErrorObj) => {
        if (data.event === 'send-message') {
          snackbar.enqueueSnackbar({ message: data.message, variant: 'error' });
        }
      });
    }
  }, [chatSocket]);

  const onSendText = useCallback(() => {
    if (chatSocket && selectedConversation && text.length) {
      const conversationEl = document.querySelector(`[data-cactive="true"]`);

      // check if the conversation exist
      if (conversationEl) {
        const conversationId = conversationEl.getAttribute('data-cid');

        if (conversationId === selectedConversation.conversation.id) {
          const message = new Message({
            userId: decodedToken.id,
            text: text.trim(),
          });

          messageListInstance.updateAndConcatList([message]);

          // scrolling the chat wrapper element to the bottom of the page
          const timer = setTimeout(() => {
            const messagesWrapperElement = document.getElementById('chat__messages-wrapper');
            if (messagesWrapperElement) {
              messagesWrapperElement.scrollTo({ behavior: 'smooth', top: messagesWrapperElement.scrollHeight });
            }
            clearTimeout(timer);
          });

          // then send the created message to the server to create a new one in the db
          chatSocket.emit('send-message', {
            message,
            roomId: selectedConversation.conversation.roomId,
            conversationId: selectedConversation.conversation.id,
          });
          setText('');
        }
      }
    }
  }, [text, chatSocket, selectedConversation, messageListInstance, conversationListInstance]);

  const onTextFieldChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setText(event.target.value);

      if (chatSocket && selectedConversation) {
        const payload = {
          roomId: selectedConversation.conversation.roomId,
          conversationId: selectedConversation.conversation.id,
          userId: decodedToken.id,
        };

        chatSocket.emit('typing-text', payload);

        halfSecondDebounce.current(() => {
          chatSocket.emit('stoping-text', payload);
        });
      }
    },
    [chatSocket, selectedConversation]
  );

  return (
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
          focused={true}
          onChange={onTextFieldChange}
          placeholder={'Type your message here'}
          fullWidth
          value={text}
          sx={{
            height: '100%',
            width: '100%',
            '& fieldset': { border: 'none' },
            '& input': { padding: '14px' },
          }}
        />
        <Box sx={{ padding: '0 14px' }} onClick={() => onSendText()}>
          <SendIcon color={text.length ? 'primary' : 'disabled'} sx={{ cursor: 'pointer' }} />
        </Box>
      </Box>
    </form>
  );
};

export default memo(TextSenderInput);
