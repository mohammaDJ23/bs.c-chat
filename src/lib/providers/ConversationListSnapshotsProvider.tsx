import { FC, Fragment, useEffect, PropsWithChildren, useCallback, memo } from 'react';
import { AllOwnersApi, AllUsersApi, FirestoreQueries, StartConversationApi } from '../../apis';
import { useAction, useAuth, useInfinityList, useRequest, useSelector } from '../../hooks';
import { DocumentData, QuerySnapshot, onSnapshot } from 'firebase/firestore';
import {
  Conversation,
  ConversationDocObj,
  ConversationList,
  UserObj,
  getConversationTargetId,
  preventRunAt,
} from '../../lib';
import { useSnackbar } from 'notistack';

const ConversationListSnapshotsProvider: FC<PropsWithChildren> = ({ children }) => {
  const selectors = useSelector();
  const conversationListInstance = useInfinityList(ConversationList);
  const actions = useAction();
  const auth = useAuth();
  const request = useRequest();
  const isCurrentOwner = auth.isCurrentOwner();
  const decodedToken = auth.getDecodedToken()!;
  const snackbar = useSnackbar();
  const connectionSocket = selectors.userServiceSocket.connection;
  const chatSocket = selectors.userServiceSocket.chat;

  const insertNewConversation = useCallback(
    (receivedConversation: ConversationDocObj) => {
      const conversationTargetId = getConversationTargetId(receivedConversation);
      const apiData = {
        page: 1,
        take: 1,
        filters: { ids: [conversationTargetId] },
      };

      const api = isCurrentOwner ? new AllUsersApi(apiData) : new AllOwnersApi(apiData);

      request.build<[UserObj[], number]>(api).then((response): void => {
        const [list] = response.data;
        const [findedUser] = list;
        if (findedUser && connectionSocket) {
          if (isCurrentOwner) {
            connectionSocket.emit('users-status', { payload: [conversationTargetId] });
          }
          const conversation = new Conversation(findedUser, receivedConversation);
          conversationListInstance.unshiftList(conversation);
          conversationListInstance.updateListAsObject(conversation, (val) => val.user.id);

          if (chatSocket) {
            chatSocket.emit('make-rooms', {
              payload: conversation.conversation.roomId,
            });
          }
        }
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
          actions.processingApiSuccess(StartConversationApi.name);

          const data = result.doc.data() as ConversationDocObj;
          const conversationEl = document.querySelector(`[data-cid="${data.id}"]`);

          // when a conversation is not exists in the client
          if (!conversationEl) {
            insertNewConversation(data);
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
  }, [insertNewConversation]);

  useEffect(() => {
    // this snapshot is for when the two users have not created the conversation before
    const initialConversationListForSnapshotQuery = new FirestoreQueries.InitialConversationListForSnapshotQuery(
      decodedToken.id
    ).getQuery();
    const unsubscribe = onSnapshot(
      initialConversationListForSnapshotQuery,
      preventRunAt(function (snapshot: QuerySnapshot<DocumentData, DocumentData>) {
        snapshot.docChanges().forEach((result) => {
          actions.processingApiSuccess(StartConversationApi.name);

          const data = result.doc.data() as ConversationDocObj;
          const conversationEl = document.querySelector(`[data-cid="${data.id}"]`);

          // when the conversation is not exists in the client
          if (!conversationEl) {
            insertNewConversation(data);
          }

          // when the conversation is exist in the client
          else {
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
        snackbar.enqueueSnackbar({ message: error.message, variant: 'error' });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversationListInstance, insertNewConversation]);

  return <Fragment>{children}</Fragment>;
};

export default memo(ConversationListSnapshotsProvider);
