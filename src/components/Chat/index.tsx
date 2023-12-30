import { FC, useCallback, useEffect, useRef } from 'react';
import { Box, styled } from '@mui/material';
import Users from './Users';
import MessagesContent from './MessagesContent';
import {
  AllConversationsApi,
  AllOwnersApi,
  AllUsersApi,
  FirestoreQueries,
  MessagesApi,
  RootApi,
  StartConversationApi,
} from '../../apis';
import { useAction, useAuth, useForm, useInfinityList, useRequest, useSelector } from '../../hooks';
import {
  AggregateField,
  AggregateQuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  getCountFromServer,
  getDocs,
} from 'firebase/firestore';
import {
  Conversation,
  ConversationDocObj,
  ConversationList,
  ConversationObj,
  MessageList,
  MessageObj,
  UserListFilters,
  UserObj,
  getConversationTargetId,
  preventRunAt,
} from '../../lib';
import { useSnackbar } from 'notistack';
import { UsersStatusType } from '../../store';
import ConversationListSnapshotsProvider from '../../lib/providers/ConversationListSnapshotsProvider';

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
  const lastVisibleConversationDocRef = useRef<QueryDocumentSnapshot<DocumentData, DocumentData> | object>({});
  const lastVisibleMessageDocRef = useRef<QueryDocumentSnapshot<DocumentData, DocumentData> | object>({});
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const messageListInstance = useInfinityList(MessageList);
  const userListFiltersFormInstance = useForm(UserListFilters);
  const isCurrentOwner = auth.isCurrentOwner();
  const decodedToken = auth.getDecodedToken()!;
  const snackbar = useSnackbar();
  const messageList = messageListInstance.getList();
  const isAllConversationApiProcessing = request.isApiProcessing(AllConversationsApi);
  const isMessagesApiProcessing = request.isApiProcessing(MessagesApi);
  const connectionSocket = selectors.userServiceSocket.connection;
  const chatSocket = selectors.userServiceSocket.chat;
  const usersStatus = selectors.specificDetails.usersStatus;
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

  useEffect(() => {
    if (connectionSocket && isCurrentOwner) {
      connectionSocket.on('users-status', (data: UsersStatusType) => {
        const newUsersStatus = Object.assign({}, usersStatus, data);
        actions.setSpecificDetails('usersStatus', newUsersStatus);
      });

      connectionSocket.on('user-status', (data: UsersStatusType) => {
        const conversationListAsObject = conversationListInstance.getListAsObject();
        const [id] = Object.keys(data);
        if (conversationListAsObject[id]) {
          const newUsersStatus = Object.assign({}, usersStatus, data);
          actions.setSpecificDetails('usersStatus', newUsersStatus);
        }
      });

      return () => {
        connectionSocket.removeListener('users-status');
        connectionSocket.removeListener('user-status');
      };
    }
  }, [connectionSocket, usersStatus, isCurrentOwner]);

  useEffect(() => {
    if (chatSocket && connectionSocket) {
      chatSocket.on('fail-start-conversation', (error: Error) => {
        actions.processingApiError(StartConversationApi.name);
        snackbar.enqueueSnackbar({ message: error.message, variant: 'error' });
      });

      chatSocket.on('success-start-conversation', (data: ConversationObj) => {
        userListFiltersFormInstance.onChange('q', '');
      });

      return () => {
        chatSocket.removeListener('fail-start-conversation');
        chatSocket.removeListener('success-start-conversation');
      };
    }
  }, [chatSocket, connectionSocket, conversationListInstance]);

  const getConversationList = useCallback(
    async (data: Partial<ConversationList> & Partial<RootApi> = {}) => {
      if (data.isInitialApi) actions.initialProcessingApiLoading(AllConversationsApi.name);
      else actions.processingApiLoading(AllConversationsApi.name);

      data.page = data.page || conversationListInstance.getPage();
      const page = data.page!;

      const paginatedConversationListQuery = new FirestoreQueries.PaginatedConversationListQuery(
        decodedToken.id,
        conversationListInstance.getTake(),
        lastVisibleConversationDocRef.current
      ).getQuery();
      const conversationListQuery = new FirestoreQueries.ConversationListQuery(decodedToken.id).getQuery();

      Promise.all([getDocs(paginatedConversationListQuery), getCountFromServer(conversationListQuery)])
        .then(([paginatedConversationListSnapshot, conversationListSnapshot]) => {
          if (data.isInitialApi) actions.initialProcessingApiSuccess(AllConversationsApi.name);
          else actions.processingApiSuccess(AllConversationsApi.name);

          const docs = paginatedConversationListSnapshot.docs;
          const count = conversationListSnapshot.data().count;

          const conversationDocs = docs.map((doc) => doc.data()) as ConversationDocObj[];
          const ids = conversationDocs.map((doc) => getConversationTargetId(doc));

          if (conversationDocs.length && ids.length) {
            lastVisibleConversationDocRef.current = docs[docs.length - 1];

            const apiData = {
              page: 1,
              take: conversationListInstance.getTake(),
              filters: { ids },
            };

            const api = isCurrentOwner ? new AllUsersApi(apiData) : new AllOwnersApi(apiData);

            request.build<[UserObj[], number]>(api).then((response) => {
              const [list] = response.data;
              const conversationList: ConversationObj[] = ids
                .map((id, i) => {
                  const findedUser = list.find((user) => user.id === id)!;
                  return new Conversation(findedUser, conversationDocs[i]);
                })
                .filter((conversation) => !!conversation.user);

              conversationListInstance.updateAndConcatList(conversationList);
              conversationListInstance.updateListAsObject(conversationList, (val) => val.user.id);
              conversationListInstance.updatePage(page);
              conversationListInstance.updateTotal(count);

              if (connectionSocket && isCurrentOwner) {
                connectionSocket.emit('users-status', { payload: ids });
              }
            });
          }
        })
        .catch((error: Error) => {
          if (data.isInitialApi) actions.initialProcessingApiError(AllConversationsApi.name);
          else actions.processingApiError(AllConversationsApi.name);

          snackbar.enqueueSnackbar({ message: error.message, variant: 'error' });
        });
    },
    [connectionSocket, conversationListInstance, isCurrentOwner]
  );

  useEffect(() => {
    getConversationList({ isInitialApi: true });
  }, [connectionSocket]);

  useEffect(() => {
    const el = document.getElementById('chat__conversation-list-spinner');
    if (el) {
      let observer = new IntersectionObserver(
        preventRunAt(function (entries: IntersectionObserverEntry[]) {
          if (!isAllConversationApiProcessing && !conversationListInstance.isListEnd()) {
            let page = conversationListInstance.getPage();
            page++;
            getConversationList({ page });
          }
        }, 1)
      );
      observer.observe(el);
      return () => {
        observer.unobserve(el);
        observer.disconnect();
      };
    }
  }, [isAllConversationApiProcessing, conversationListInstance, getConversationList]);

  return (
    <ConversationListSnapshotsProvider>
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
    </ConversationListSnapshotsProvider>
  );
};

export default Chat;
