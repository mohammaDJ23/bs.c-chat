import { FC, useCallback, useEffect, useRef } from 'react';
import { Box, styled } from '@mui/material';
import Users from './Users';
import MessagesContent from './MessagesContent';
import { FirestoreQueries, MessagesApi, RootApi, StartConversationApi } from '../../apis';
import { useAction, useForm, useInfinityList, useRequest, useSelector } from '../../hooks';
import {
  AggregateField,
  AggregateQuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  getCountFromServer,
  getDocs,
} from 'firebase/firestore';
import { ConversationList, ConversationObj, MessageList, MessageObj, UserListFilters, preventRunAt } from '../../lib';
import { useSnackbar } from 'notistack';
import ConversationListSnapshotsProvider from '../../lib/providers/ConversationListSnapshotsProvider';
import UserStatusEventsProvider from '../../lib/providers/UserStatusEventsProvider';
import GetConversationListProvider from '../../lib/providers/GetConversationListProvider';

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
  const selectors = useSelector();
  const conversationListInstance = useInfinityList(ConversationList);
  const selectedConversationRef = useRef<ConversationObj | null>(null);
  const lastVisibleMessageRef = useRef<MessageObj | null>(null);
  const lastVisibleMessageDocRef = useRef<QueryDocumentSnapshot<DocumentData, DocumentData> | object>({});
  const actions = useAction();
  const request = useRequest();
  const messageListInstance = useInfinityList(MessageList);
  const userListFiltersFormInstance = useForm(UserListFilters);
  const snackbar = useSnackbar();
  const messageList = messageListInstance.getList();
  const isMessagesApiProcessing = request.isApiProcessing(MessagesApi);
  const connectionSocket = selectors.userServiceSocket.connection;
  const chatSocket = selectors.userServiceSocket.chat;
  const selectedConversation = selectors.conversations.selectedUser;
  const isMessagesSpinnerElementActive = selectors.conversations.isMessagesSpinnerElementActive;

  const getMessages = useCallback(async (arg: Partial<RootApi> = {}) => {
    const isInitialApi = arg.isInitialApi;

    if (isInitialApi) actions.initialProcessingApiLoading(MessagesApi.name);
    else actions.processingApiLoading(MessagesApi.name);

    const conversation = selectedConversationRef.current!;
    const paginatedMessageListQuery = new FirestoreQueries.PaginatedMessageListQuery(
      conversation.conversation.roomId,
      messageListInstance.getTake(),
      lastVisibleMessageDocRef.current
    ).getQuery();
    const messageListQuery = new FirestoreQueries.MessageListQuery(conversation.conversation.roomId).getQuery();
    return Promise.all([getDocs(paginatedMessageListQuery), getCountFromServer(messageListQuery)])
      .then((responses) => {
        if (isInitialApi) actions.initialProcessingApiSuccess(MessagesApi.name);
        else actions.processingApiSuccess(MessagesApi.name);

        return responses;
      })
      .catch((error: Error) => {
        if (isInitialApi) actions.initialProcessingApiError(MessagesApi.name);
        else actions.processingApiError(MessagesApi.name);

        throw error;
      });
  }, []);

  const updateLastVisibleMessageDoc = useCallback((snapshot: QuerySnapshot<DocumentData, DocumentData>) => {
    if (snapshot.size) {
      lastVisibleMessageDocRef.current = snapshot.docs[snapshot.docs.length - 1];
    }
  }, []);

  const getMessagesCount = useCallback(
    (snapshot: AggregateQuerySnapshot<{ count: AggregateField<number> }, DocumentData, DocumentData>) => {
      return snapshot.data().count;
    },
    []
  );

  const getMessagesData = useCallback((snapshot: QuerySnapshot<DocumentData, DocumentData>) => {
    return snapshot.docs.map((doc) => doc.data()).reverse() as MessageObj[];
  }, []);

  const getMessageWrapperElement = useCallback(() => {
    return document.getElementById('chat__messages-wrapper');
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      if (selectedConversationRef.current && selectedConversationRef.current.user.id !== selectedConversation.user.id) {
        lastVisibleMessageDocRef.current = {};
      }

      selectedConversationRef.current = selectedConversation;

      getMessages({ isInitialApi: true })
        .then(([paginatedMessageListSnapshot, messageListSnapshot]) => {
          updateLastVisibleMessageDoc(paginatedMessageListSnapshot);
          messageListInstance.updateList(getMessagesData(paginatedMessageListSnapshot));
          messageListInstance.updateTotal(getMessagesCount(messageListSnapshot));
          messageListInstance.updatePage(1);

          {
            const timer = setTimeout(() => {
              const messagesWrapperElement = getMessageWrapperElement();
              if (messagesWrapperElement) {
                messagesWrapperElement.scrollTo({ top: messagesWrapperElement.scrollHeight });
              }
              clearTimeout(timer);
            });
          }

          {
            const timer = setTimeout(() => {
              actions.showMessagesSpinnerElement();
              clearTimeout(timer);
            }, 500);
          }
        })
        .catch((error) => {
          snackbar.enqueueSnackbar({ message: error.message, variant: 'error' });
        });
    }
  }, [selectedConversation, getMessages]);

  useEffect(() => {
    const el = document.getElementById('chat__message-list-spinner');
    if (el) {
      let observer = new IntersectionObserver(
        preventRunAt(function (entries: IntersectionObserverEntry[]) {
          const [entry] = entries;
          if (!entry.isIntersecting) {
            return;
          }

          const messagesWrapperElement = getMessageWrapperElement();
          if (messagesWrapperElement) {
            const height = window.getComputedStyle(el).getPropertyValue('height');
            const paddingBottom = window.getComputedStyle(el).getPropertyValue('padding-bottom');
            const scrollHeight = Number.parseInt(height) + Number.parseInt(paddingBottom);
            messagesWrapperElement.scrollTo({ behavior: 'smooth', top: scrollHeight });
          }

          if (!isMessagesApiProcessing && !messageListInstance.isListEnd()) {
            getMessages().then(([paginatedMessageListSnapshot, messageListSnapshot]) => {
              let page = messageListInstance.getPage();
              page++;
              updateLastVisibleMessageDoc(paginatedMessageListSnapshot);
              messageListInstance.unshiftList(getMessagesData(paginatedMessageListSnapshot));
              messageListInstance.updateTotal(getMessagesCount(messageListSnapshot));
              messageListInstance.updatePage(page);
            });
          }
        }, 1),
        { threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
      );
      observer.observe(el);
      return () => {
        observer.unobserve(el);
        observer.disconnect();
      };
    }
  }, [isMessagesSpinnerElementActive, messageListInstance, isMessagesApiProcessing, getMessages]);

  useEffect(() => {
    if (messageList.length) {
      lastVisibleMessageRef.current = messageList[messageList.length - 1];
    }
  }, [messageList]);

  return (
    <ConversationListSnapshotsProvider>
      <UserStatusEventsProvider>
        <GetConversationListProvider>
          <Box
            sx={{
              width: '100vw',
              height: 'calc(100vh - 64px)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ width: '100%', height: '100%' }}>
              <MessageWrapper>
                <UsersWrapper>
                  <Users />
                </UsersWrapper>
                <MessagesContent />
              </MessageWrapper>
            </Box>
          </Box>
        </GetConversationListProvider>
      </UserStatusEventsProvider>
    </ConversationListSnapshotsProvider>
  );
};

export default Chat;
