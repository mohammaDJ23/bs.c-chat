import { FC, Fragment, useEffect, PropsWithChildren, useCallback, memo } from 'react';
import { AllOwnersApi, AllUsersApi, FirestoreQueries, StartConversationApi } from '../../apis';
import { useAction, useAuth, useForm, useInfinityList, useRequest, useSelector } from '../../hooks';
import { DocumentData, QuerySnapshot, onSnapshot } from 'firebase/firestore';
import {
  Conversation,
  ConversationDocObj,
  ConversationList,
  UserListFilters,
  UserObj,
  getConversationTargetId,
  preventRunAt,
} from '../../lib';
import { useSnackbar } from 'notistack';
import { AxiosResponse } from 'axios';

const ConversationListSnapshotsProvider: FC<PropsWithChildren> = ({ children }) => {
  const selectors = useSelector();
  const conversationListInstance = useInfinityList(ConversationList);
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const userListFiltersFormInstance = useForm(UserListFilters);
  const isCurrentOwner = auth.isCurrentOwner();
  const decodedToken = auth.getDecodedToken()!;
  const snackbar = useSnackbar();
  const connectionSocket = selectors.userServiceSocket.connection;
  const chatSocket = selectors.userServiceSocket.chat;

  const isSearchConversationQueryExist = useCallback(() => {
    return userListFiltersFormInstance.getForm().q.length > 0;
  }, [userListFiltersFormInstance]);

  const insertNewConversation = useCallback(
    async (receivedConversation: ConversationDocObj) => {
      const conversationTargetId = getConversationTargetId(receivedConversation);
      const apiData = {
        page: 1,
        take: 1,
        filters: { ids: [conversationTargetId] },
      };

      const api = isCurrentOwner ? new AllUsersApi(apiData) : new AllOwnersApi(apiData);

      return request.build<[UserObj[], number]>(api).then((response): AxiosResponse<[UserObj[], number]> => {
        const [list] = response.data;
        const [findedUser] = list;
        if (findedUser && connectionSocket) {
          const conversation = new Conversation(findedUser, receivedConversation);
          conversationListInstance.unshiftList(conversation);
          conversationListInstance.updateListAsObject(conversation, (val) => val.user.id);

          if (isCurrentOwner) {
            connectionSocket.emit('users-status', { ids: [conversationTargetId] });
          }

          if (chatSocket) {
            chatSocket.emit('make-rooms', {
              roomIds: [conversation.conversation.roomId],
            });
          }
        }

        return response;
      });
    },
    [connectionSocket, chatSocket, conversationListInstance]
  );

  useEffect(() => {
    // this snapshot is for when the two users have created the conversation before
    const conversationListForSnapshotQuery = new FirestoreQueries.ConversationListForSnapshotQuery(
      decodedToken.id
    ).getQuery();
    const unsubscribe = onSnapshot(
      conversationListForSnapshotQuery,
      preventRunAt(function (snapshot: QuerySnapshot<DocumentData, DocumentData>) {
        snapshot.docChanges().forEach((result) => {
          const data = result.doc.data() as ConversationDocObj;

          // when a conversation is not exists in the client
          if (!document.querySelector(`[data-cid="${data.id}"]`)) {
            insertNewConversation(data).then(() => {
              if (isSearchConversationQueryExist()) {
                actions.processingApiSuccess(StartConversationApi.name);
                userListFiltersFormInstance.onChange('q', '');
              }
            });
          }
        });
      }, 1),
      (error) => {
        if (isSearchConversationQueryExist()) {
          actions.processingApiError(StartConversationApi.name);
          userListFiltersFormInstance.onChange('q', '');
        }
        snackbar.enqueueSnackbar({ message: error.message, variant: 'error' });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userListFiltersFormInstance, conversationListInstance, isSearchConversationQueryExist, insertNewConversation]);

  useEffect(() => {
    // this snapshot is for when the two users have not created the conversation before
    const initialConversationListForSnapshotQuery = new FirestoreQueries.InitialConversationListForSnapshotQuery(
      decodedToken.id
    ).getQuery();
    const unsubscribe = onSnapshot(
      initialConversationListForSnapshotQuery,
      preventRunAt(function (snapshot: QuerySnapshot<DocumentData, DocumentData>) {
        snapshot.docChanges().forEach((result) => {
          const data = result.doc.data() as ConversationDocObj;
          const conversationEl = document.querySelector(`[data-cid="${data.id}"]`);

          // when the conversation is not exists in the client
          if (!conversationEl) {
            insertNewConversation(data).then(() => {
              if (isSearchConversationQueryExist()) {
                actions.processingApiSuccess(StartConversationApi.name);
                userListFiltersFormInstance.onChange('q', '');
              }
            });
          }

          // when the conversation is exist in the client
          else {
            if (isSearchConversationQueryExist()) {
              actions.processingApiSuccess(StartConversationApi.name);
              userListFiltersFormInstance.onChange('q', '');
            }

            const index = conversationEl.getAttribute('data-index');

            if (index && !isNaN(parseInt(index))) {
              const parsedIndex = +index;
              const conversationList = conversationListInstance.getList();

              if (conversationList[parsedIndex]) {
                const [newConversation] = conversationList.splice(parsedIndex, 1);
                conversationListInstance.unshiftList(newConversation);
              }
            }
          }
        });
      }, 1),
      (error) => {
        if (isSearchConversationQueryExist()) {
          actions.processingApiError(StartConversationApi.name);
          userListFiltersFormInstance.onChange('q', '');
        }
        snackbar.enqueueSnackbar({ message: error.message, variant: 'error' });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversationListInstance, userListFiltersFormInstance, isSearchConversationQueryExist, insertNewConversation]);

  return <Fragment>{children}</Fragment>;
};

export default memo(ConversationListSnapshotsProvider);
