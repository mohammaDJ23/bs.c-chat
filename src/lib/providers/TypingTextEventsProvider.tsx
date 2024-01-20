import { FC, Fragment, PropsWithChildren, memo, useCallback, useEffect, useRef } from 'react';
import { useAuth, useInfinityList, useSelector } from '../../hooks';
import { Conversation, ConversationList, ConversationObj } from '../lists';

interface TypingTextObj {
  roomId: string;
  conversationId: number;
  userId: number;
}

interface StopingTextObj extends TypingTextObj {}

const TypingTextEventsProvider: FC<PropsWithChildren> = ({ children }) => {
  const selectors = useSelector();
  const selectedConversationRef = useRef<ConversationObj | null>(null);
  const conversationListInstance = useInfinityList(ConversationList);
  const auth = useAuth();
  const isCurrentOwner = auth.isCurrentOwner();
  const chatSocket = selectors.userServiceSocket.chat;
  const selectedConversation = selectors.conversations.selectedUser;

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const updateUserTypingStatus = useCallback(
    (data: TypingTextObj | StopingTextObj, type: 'typing' | 'stoping') => {
      const conversationEl = document.querySelector(`[data-cid="${data.conversationId}"]`);

      if (conversationEl) {
        const index = conversationEl.getAttribute('data-index');

        if (index && !isNaN(parseInt(index))) {
          const parsedIndex = +index;
          const conversationList = conversationListInstance.getList();
          const conversation = conversationList[parsedIndex];

          if (conversation) {
            const newConversation = new Conversation(conversation.user, conversation.conversation);
            if (newConversation.conversation.creatorId === data.userId) {
              newConversation.conversation.isCreatorTyping = type === 'typing';
            } else if (newConversation.conversation.targetId === data.userId) {
              newConversation.conversation.isTargetTyping = type === 'typing';
            }

            conversationList[parsedIndex] = newConversation;
            conversationListInstance.updateList(conversationList);
          }
        }
      }
    },
    [conversationListInstance]
  );

  useEffect(() => {
    if (chatSocket && isCurrentOwner) {
      chatSocket.removeListener('typing-text');
      chatSocket.removeListener('stoping-text');

      chatSocket.on('typing-text', (data: TypingTextObj) => {
        console.log(data);
        updateUserTypingStatus(data, 'typing');
      });

      chatSocket.on('stoping-text', (data: StopingTextObj) => {
        updateUserTypingStatus(data, 'stoping');
      });

      return () => {
        chatSocket.removeListener('typing-text');
        chatSocket.removeListener('stoping-text');
      };
    }
  }, [chatSocket, isCurrentOwner, updateUserTypingStatus]);

  return <Fragment>{children}</Fragment>;
};

export default memo(TypingTextEventsProvider);
