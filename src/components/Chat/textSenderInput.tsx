import { Box, TextField as TF, styled } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import { useAuth, useInfinityList, useSelector } from '../../hooks';
import { ConversationList, Message, MessageList } from '../../lib';
import SendIcon from '@mui/icons-material/Send';

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

const TextSenderInput = () => {
  const [text, setText] = useState<string>('');
  const selectors = useSelector();
  const auth = useAuth();
  const messageListInstance = useInfinityList(MessageList);
  const conversationListInstance = useInfinityList(ConversationList);
  const decodedToken = auth.getDecodedToken()!;
  const selectedConversation = selectors.conversations.selectedUser;
  const chatSocket = selectors.userServiceSocket.chat;

  const onSendText = useCallback(() => {
    if (chatSocket && selectedConversation && text.length) {
      const message = new Message({
        userId: decodedToken.id,
        text: text.trim(),
      });

      const conversationEl = document.querySelector(`[data-cactive="true"]`);

      // check if the conversation exist
      if (conversationEl) {
        const conversationId = conversationEl.getAttribute('data-cid');

        if (conversationId === selectedConversation.conversation.id) {
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
          const payload = {
            message,
            roomId: selectedConversation.conversation.roomId,
            conversationId: selectedConversation.conversation.id,
          };
          chatSocket.emit('send-message', { payload });
          setText('');
        }
      }
    }
  }, [text, chatSocket, selectedConversation, messageListInstance, conversationListInstance]);

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
          onChange={(event) => setText(event.target.value)}
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
