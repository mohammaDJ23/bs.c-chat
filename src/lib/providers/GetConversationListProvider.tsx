import { FC, Fragment, PropsWithChildren, memo, useCallback, useEffect, useRef } from 'react';
import { AllConversationsApi, AllOwnersApi, AllUsersApi, FirestoreQueries, RootApi } from '../../apis';
import { useAction, useAuth, useInfinityList, useRequest, useSelector } from '../../hooks';
import { DocumentData, QueryDocumentSnapshot, getCountFromServer, getDocs } from 'firebase/firestore';
import {
  Conversation,
  ConversationDocObj,
  ConversationList,
  ConversationObj,
  UserObj,
  getConversationTargetId,
  preventRunAt,
} from '../../lib';
import { useSnackbar } from 'notistack';

const GetConversationListProvider: FC<PropsWithChildren> = ({ children }) => {
  const selectors = useSelector();
  const conversationListInstance = useInfinityList(ConversationList);
  const lastVisibleConversationDocRef = useRef<QueryDocumentSnapshot<DocumentData, DocumentData> | object>({});
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const isCurrentOwner = auth.isCurrentOwner();
  const decodedToken = auth.getDecodedToken()!;
  const snackbar = useSnackbar();
  const isAllConversationApiProcessing = request.isApiProcessing(AllConversationsApi);
  const connectionSocket = selectors.userServiceSocket.connection;
  const chatSocket = selectors.userServiceSocket.chat;

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

              if (chatSocket) {
                chatSocket.emit('make-rooms', {
                  payload: conversationList.map((item) => item.conversation.roomId),
                });
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
    [connectionSocket, chatSocket, conversationListInstance, isCurrentOwner]
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

  return <Fragment>{children}</Fragment>;
};

export default memo(GetConversationListProvider);
