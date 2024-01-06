import { Fragment, useEffect, FC, PropsWithChildren, memo } from 'react';
import { useAction, useAuth, useInfinityList, useSelector } from '../../hooks';
import { ConversationList } from '../../lib';
import { UsersStatusType } from '../../store';

const UserStatusEventsProvider: FC<PropsWithChildren> = ({ children }) => {
  const selectors = useSelector();
  const conversationListInstance = useInfinityList(ConversationList);
  const actions = useAction();
  const auth = useAuth();
  const isCurrentOwner = auth.isCurrentOwner();
  const connectionSocket = selectors.userServiceSocket.connection;
  const usersStatus = selectors.specificDetails.usersStatus;

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

  return <Fragment>{children}</Fragment>;
};

export default memo(UserStatusEventsProvider);
