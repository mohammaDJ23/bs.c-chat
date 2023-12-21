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
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  getCountFromServer,
  getDocs,
  onSnapshot,
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
  const lastMessage = useRef<MessageObj | null>(null);
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
  const connectionSocket = selectors.userServiceSocket.connection;
  const chatSocket = selectors.userServiceSocket.chat;
  const usersStatus = selectors.specificDetails.usersStatus;
  const selectedConversation = selectors.conversations.selectedUser;

  const getMessages = useCallback(() => {
    if (selectedConversation) {
      actions.processingApiLoading(MessagesApi.name);

      if (selectedConversationRef.current && selectedConversationRef.current.user.id !== selectedConversation.user.id) {
        lastVisibleMessageDocRef.current = {};
      }

      selectedConversationRef.current = selectedConversation;

      const messagesQuery = new FirestoreQueries.MessagesQuery(
        selectedConversation.conversation.roomId,
        messageListInstance.getTake(),
        lastVisibleMessageDocRef.current
      ).getQuery();

      getDocs(messagesQuery)
        .then((snapshot) => {
          actions.processingApiSuccess(MessagesApi.name);

          if (snapshot.size) {
            lastVisibleMessageDocRef.current = snapshot.docs[snapshot.docs.length - 1];
          }
          const docs = snapshot.docs.map((doc) => doc.data()) as MessageObj[];
          messageListInstance.updateList(docs);
        })
        .catch((error: Error) => {
          actions.processingApiError(MessagesApi.name);
          snackbar.enqueueSnackbar({ message: error.message, variant: 'error' });
        });
    }
  }, [selectedConversation]);

  useEffect(() => {
    getMessages();
  }, [selectedConversation, getMessages]);

  useEffect(() => {
    if (messageList.length) {
      lastMessage.current = messageList[messageList.length - 1];
      const messagesWrapperEl = document.getElementById('chat__messages-wrapper');
      if (messagesWrapperEl) {
        messagesWrapperEl.scrollTo({
          behavior: 'smooth',
          top: messagesWrapperEl.scrollHeight,
        });
      }
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
        actions.processingApiSuccess(StartConversationApi.name);
        connectionSocket.emit('users-status', { payload: [data.user.id] });
        userListFiltersFormInstance.onChange('q', '');
        const conversationListAsObject = conversationListInstance.getListAsObject();

        if (!data.conversation.lastMessage) {
          if (data.user.id in conversationListAsObject) {
            const conversationList = conversationListInstance.getList();
            const findedIndex = conversationList.findIndex(
              (item) => item.conversation.roomId === data.conversation.roomId
            );
            if (findedIndex > -1) {
              let [newConversation] = conversationList.splice(findedIndex, 1);
              newConversation = data;
              conversationList.unshift(newConversation);
              conversationListInstance.updateList(conversationList);
            }
          } else {
            conversationListInstance.unshiftList(data);
            conversationListInstance.updateListAsObject(data, (val) => val.user.id);
          }
        }
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

  useEffect(() => {
    const el = document.getElementById('chat__message-list-spinner');
    if (el) {
      let observer = new IntersectionObserver(
        preventRunAt(function (entries: IntersectionObserverEntry[]) {
          const [entry] = entries;
          if (entry.isIntersecting) {
          }
        }, 1),
        { threshold: 0.2 }
      );
      observer.observe(el);
      return () => {
        observer.unobserve(el);
        observer.disconnect();
      };
    }
  }, [messageListInstance]);

  useEffect(() => {
    const conversationListForSnapshotQuery = new FirestoreQueries.ConversationListForSnapshotQuery(
      decodedToken.id
    ).getQuery();
    const unsubscribe = onSnapshot(
      conversationListForSnapshotQuery,
      preventRunAt(function (snapshot: QuerySnapshot<DocumentData, DocumentData>) {
        snapshot.docChanges().forEach((result) => {
          const data = result.doc.data() as ConversationDocObj;
          const conversationListAsObject = conversationListInstance.getListAsObject();
          const conversationTargetId = getConversationTargetId(data);

          // when a conversation exists in the client
          if (conversationTargetId in conversationListAsObject) {
            const conversationList = conversationListInstance.getList();
            const findedIndex = conversationList.findIndex((item) => item.conversation.roomId === data.roomId);
            if (findedIndex > -1) {
              const [newConversation] = conversationList.splice(findedIndex, 1);
              newConversation.conversation = data;
              conversationList.unshift(newConversation);
              conversationListInstance.updateList(conversationList);
              if (
                selectedConversationRef.current &&
                selectedConversationRef.current.conversation.roomId === newConversation.conversation.roomId &&
                (!lastMessage.current ||
                  (lastMessage.current &&
                    data.lastMessage &&
                    // @ts-ignore
                    data.lastMessage.createdAt.seconds > lastMessage.current.createdAt.seconds))
              ) {
                messageListInstance.updateAndConcatList([data.lastMessage!]);
              }
            }
          }

          // when a conversation is not exists in the client
          else if (!(conversationTargetId in conversationListAsObject)) {
            const apiData = {
              page: 1,
              take: 1,
              filters: { ids: [conversationTargetId] },
            };

            const api = isCurrentOwner ? new AllUsersApi(apiData) : new AllOwnersApi(apiData);

            request.build<[UserObj[], number]>(api).then((response) => {
              const [list] = response.data;
              const [findedUser] = list;
              if (findedUser && connectionSocket) {
                connectionSocket.emit('users-status', { payload: [conversationTargetId] });
                const conversation = new Conversation(findedUser, data);
                conversationListInstance.unshiftList(conversation);
                conversationListInstance.updateListAsObject(conversation, (val) => val.user.id);
              }
            });
          }
        });
      }, 1),
      (error) => {
        snackbar.enqueueSnackbar({ message: error.message, variant: 'error' });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversationListInstance]);

  return (
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
  );
};

export default Chat;
