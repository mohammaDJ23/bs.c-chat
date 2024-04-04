import { FC, Fragment, PropsWithChildren, memo, useCallback, useEffect, useRef } from 'react';
import { FirestoreQueries, MessagesApi, RootApi } from '../../apis';
import { useAction, useInfinityList, useRequest, useSelector } from '../../hooks';
import {
  AggregateField,
  AggregateQuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  getCountFromServer,
  getDocs,
} from 'firebase/firestore';
import { ConversationObj, MessageList, MessageObj, preventRunAt } from '../../lib';
import { useSnackbar } from 'notistack';

const GetMessageListProvider: FC<PropsWithChildren> = ({ children }) => {
  const selectors = useSelector();
  const selectedConversationRef = useRef<ConversationObj | null>(null);
  const lastVisibleMessageDocRef = useRef<QueryDocumentSnapshot<DocumentData, DocumentData> | object>({});
  const actions = useAction();
  const request = useRequest();
  const messageListInstance = useInfinityList(MessageList);
  const snackbar = useSnackbar();
  const isMessagesApiProcessing = request.isApiProcessing(MessagesApi);
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
        })
        .then(() => {
          const messagesWrapperElement = document.getElementById('chat__messages-wrapper');
          if (messagesWrapperElement) {
            messagesWrapperElement.scrollTo({ top: messagesWrapperElement.scrollHeight });
          }
        })
        .then(() => {
          const timer = setTimeout(() => {
            actions.showMessagesSpinnerElement();
            clearTimeout(timer);
          }, 500);
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

          let previousScrollHeight = 0;
          const messagesWrapperElement = document.getElementById('chat__messages-wrapper');
          if (messagesWrapperElement) {
            previousScrollHeight = messagesWrapperElement.scrollHeight;
          }

          if (!isMessagesApiProcessing && !messageListInstance.isListEnd()) {
            getMessages()
              .then(([paginatedMessageListSnapshot, messageListSnapshot]) => {
                let page = messageListInstance.getPage();
                page++;
                updateLastVisibleMessageDoc(paginatedMessageListSnapshot);
                messageListInstance.unshiftList(getMessagesData(paginatedMessageListSnapshot));
                messageListInstance.updateTotal(getMessagesCount(messageListSnapshot));
                messageListInstance.updatePage(page);
              })
              .then(() => {
                if (messagesWrapperElement) {
                  messagesWrapperElement.scrollTop = messagesWrapperElement.scrollHeight - previousScrollHeight;
                  previousScrollHeight = 0;
                }
              });
          }
        }, 1),
        { threshold: [0.2] }
      );
      observer.observe(el);
      return () => {
        observer.unobserve(el);
        observer.disconnect();
      };
    }
  }, [isMessagesSpinnerElementActive, messageListInstance, isMessagesApiProcessing, getMessages]);

  return <Fragment>{children}</Fragment>;
};

export default memo(GetMessageListProvider);
