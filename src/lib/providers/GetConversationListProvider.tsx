import { FC, Fragment, PropsWithChildren, memo, useCallback, useEffect, useRef } from 'react';
import { AllConversationsApi, AllOwnersApi, AllUsersApi, FirestoreQueries, RootApi } from '../../apis';
import { useAction, useAuth, useInfinityList, useRequest, useSelector } from '../../hooks';
import { DocumentData, QueryDocumentSnapshot, getCountFromServer, getDocs } from 'firebase/firestore';
import {
  Conversation,
  ConversationDocObj,
  ConversationList,
  UserObj,
  getConversationTargetId,
  preventRunAt,
} from '../../lib';
import { useSnackbar } from 'notistack';
import { Socket } from 'socket.io-client';
import { useSearchParams } from 'react-router-dom';

const GetConversationListProvider: FC<PropsWithChildren> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const selectors = useSelector();
  const conversationListInstance = useInfinityList(ConversationList);
  const lastVisibleConversationDocRef = useRef<QueryDocumentSnapshot<DocumentData, DocumentData> | object>({});
  const connectionSocketRef = useRef<Socket | null>(null);
  const chatSocketRef = useRef<Socket | null>(null);
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const isCurrentOwner = auth.isCurrentOwner();
  const decodedToken = auth.getDecodedToken()!;
  const snackbar = useSnackbar();
  const userId = searchParams.get('uid');
  const isAllConversationApiProcessing = request.isApiProcessing(AllConversationsApi);
  const connectionSocket = selectors.userServiceSocket.connection;
  const chatSocket = selectors.userServiceSocket.chat;

  useEffect(() => {
    connectionSocketRef.current = connectionSocket;
  }, [connectionSocket]);

  useEffect(() => {
    chatSocketRef.current = chatSocket;
  }, [chatSocket]);

  const getPaginatedConversationListAndCount = useCallback(
    async (id: number, take: number, lastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | object) => {
      const paginatedConversationListQuery = new FirestoreQueries.PaginatedConversationListQuery(
        id,
        take,
        lastVisible
      ).getQuery();
      const conversationListQuery = new FirestoreQueries.ConversationListQuery(decodedToken.id).getQuery();
      return Promise.all([getDocs(paginatedConversationListQuery), getCountFromServer(conversationListQuery)])
        .then((responses) => {
          return responses;
        })
        .catch((error: Error) => {
          throw error;
        });
    },
    []
  );

  const getUserList = useCallback(async (ids: number[], take: number) => {
    const apiData = {
      page: 1,
      take,
      filters: { ids },
    };

    const api = isCurrentOwner ? new AllUsersApi(apiData) : new AllOwnersApi(apiData);
    return request
      .build<[UserObj[], number]>(api)
      .then((response) => {
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }, []);

  const getConversationList = useCallback(async (data: Partial<RootApi> = {}) => {
    if (data.isInitialApi) actions.initialProcessingApiLoading(AllConversationsApi.name);
    else actions.processingApiLoading(AllConversationsApi.name);

    return getPaginatedConversationListAndCount(
      decodedToken.id,
      conversationListInstance.getTake(),
      lastVisibleConversationDocRef.current
    )
      .then(([paginatedConversationListSnapshot, conversationListSnapshot]) => {
        const count = conversationListSnapshot.data().count;
        if (paginatedConversationListSnapshot.size > 0 || count > 0) {
          const docs = paginatedConversationListSnapshot.docs;
          lastVisibleConversationDocRef.current = docs[docs.length - 1];

          const conversationDocs = docs.map((doc) => doc.data()) as ConversationDocObj[];
          const ids = conversationDocs.map((doc) => getConversationTargetId(doc));

          return getUserList(ids, conversationListInstance.getTake())
            .then((response) => {
              if (data.isInitialApi) actions.initialProcessingApiSuccess(AllConversationsApi.name);
              else actions.processingApiSuccess(AllConversationsApi.name);

              const [list] = response.data;

              const conversationList = ids
                .map((id, i) => {
                  const findedUser = list.find((user) => user.id === id)!;
                  return new Conversation(findedUser, conversationDocs[i]);
                })
                .filter((conversation) => !!conversation.user);

              if (connectionSocketRef.current && isCurrentOwner) {
                connectionSocketRef.current.emit('users-status', { ids });
              }

              if (chatSocketRef.current) {
                chatSocketRef.current.emit('make-rooms', {
                  roomIds: conversationList.map((item) => item.conversation.roomId),
                });
              }

              return { list: conversationList, count };
            })
            .catch((error: Error) => {
              throw error;
            });
        }
        return undefined;
      })
      .catch((error: Error) => {
        if (data.isInitialApi) actions.initialProcessingApiError(AllConversationsApi.name);
        else actions.processingApiError(AllConversationsApi.name);

        snackbar.enqueueSnackbar({ message: error.message, variant: 'error' });

        throw error;
      });
  }, []);

  useEffect(() => {
    getConversationList({ isInitialApi: true }).then((conversationList) => {
      if (conversationList) {
        conversationListInstance.updateList(conversationList.list);
        conversationListInstance.updateListAsObject(conversationList.list, (val) => val.user.id);
        conversationListInstance.updatePage(1);
        conversationListInstance.updateTotal(conversationList.count);
      }
    });
  }, []);

  useEffect(() => {
    const el = document.getElementById('chat__conversation-list-spinner');
    if (el) {
      let observer = new IntersectionObserver(
        preventRunAt(function (entries: IntersectionObserverEntry[]) {
          if (!isAllConversationApiProcessing && !conversationListInstance.isListEnd()) {
            let page = conversationListInstance.getPage();
            page++;

            getConversationList().then((conversationList) => {
              if (conversationList) {
                conversationListInstance.updateAndConcatList(conversationList.list);
                conversationListInstance.updateListAsObject(conversationList.list, (val) => val.user.id);
                conversationListInstance.updatePage(page);
                conversationListInstance.updateTotal(conversationList.count);
              }
            });
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

  return <Fragment>{children}</Fragment>;
};

export default memo(GetConversationListProvider);
