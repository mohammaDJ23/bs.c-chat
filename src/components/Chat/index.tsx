import { FC, useEffect, useRef } from 'react';
import { Box, styled } from '@mui/material';
import Users from './Users';
import MessagesContent from './MessagesContent';
import { FirestoreQueries } from '../../apis';
import { useAction, useAuth, useInfinityList, useSelector } from '../../hooks';
import { DocumentData, QuerySnapshot, onSnapshot } from 'firebase/firestore';
import {
  ConversationDocObj,
  ConversationList,
  ConversationObj,
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
  const actions = useAction();
  const auth = useAuth();
  const selectedFindedUserRef = useRef<UserObj | null>(null);
  const isCurrentOwner = auth.isCurrentOwner();
  const decodedToken = auth.getDecodedToken()!;
  const { enqueueSnackbar } = useSnackbar();
  const connectionSocket = selectors.userServiceSocket.connection;
  const usersStatus = selectors.specificDetails.usersStatus;
  const selectedFindedUser = selectors.conversations.selectedFindedUser;

  useEffect(() => {
    selectedFindedUserRef.current = selectedFindedUser;
  }, [selectedFindedUser]);

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
    const conversationListQuery = new FirestoreQueries.ConversationListQuery(decodedToken.id).getQuery();
    const unsubscribe = onSnapshot(
      conversationListQuery,
      preventRunAt(function (snapshot: QuerySnapshot<DocumentData, DocumentData>) {
        snapshot.docChanges().forEach((result) => {
          const data = result.doc.data() as ConversationDocObj;
          const conversationListAsObject = conversationListInstance.getListAsObject();

          // when a user was selected to start a new conversation
          if (selectedFindedUserRef.current) {
            const conversationObj: ConversationObj = { conversation: data, user: selectedFindedUserRef.current };
            conversationListInstance.unshiftList(conversationObj);
            actions.cleanFindedUserForStartConversation();
            selectedFindedUserRef.current = null;
            return;
          }

          // when a user is exist in the conversation list and both of them are trying to send a message
          const id = getConversationTargetId(data);
          if (id in conversationListAsObject && data.lastMessage) {
            const list = Array.from(conversationListInstance.getList());
            const finedIndex = list.findIndex((item) => item.user.id === id);
            if (finedIndex > -1) {
              const [removedConversation] = list.splice(finedIndex, 1);
              const newConversation = { conversation: data, user: removedConversation.user };
              list.unshift(newConversation);
              conversationListInstance.updateList(list);
            }
          }
        });
      }, 1),
      (error) => {
        enqueueSnackbar({ message: error.message, variant: 'error' });
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
