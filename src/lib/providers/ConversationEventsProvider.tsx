import { FC, Fragment, PropsWithChildren, memo, useEffect, useRef } from 'react';
import { useInfinityList, useSelector } from '../../hooks';
import { ConversationList, ConversationObj, Message, MessageList } from '../../lib';
import { useSnackbar } from 'notistack';

interface SendMessageObj {
  message: Message;
  roomId: string;
  conversationId: string;
}

const ConversationEventsProvider: FC<PropsWithChildren> = ({ children }) => {
  const selectedConversationRef = useRef<ConversationObj | null>(null);
  const messageListInstance = useInfinityList(MessageList);
  const conversationListInstance = useInfinityList(ConversationList);
  const selectors = useSelector();
  const snackbar = useSnackbar();
  const conversationList = conversationListInstance.getList();
  const chatSocket = selectors.userServiceSocket.chat;
  const selectedConversation = selectors.conversations.selectedUser;

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    if (chatSocket) {
      conversationList.forEach((item) => {
        // listen to all conversation
        chatSocket.on(item.conversation.roomId, (data: SendMessageObj) => {
          // move the conversation to the top
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

  return <Fragment>{children}</Fragment>;
};

export default memo(ConversationEventsProvider);
