import { Fragment, useEffect, FC, PropsWithChildren } from 'react';
import { getUserServiceChatSocket } from '../socket';
import { useAction } from '../../hooks';

const UserServiceChatSocketProvider: FC<PropsWithChildren> = ({ children }) => {
  const actions = useAction();

  useEffect(() => {
    const socket = getUserServiceChatSocket();
    actions.setUserServiceSocket(socket);
  }, []);

  return <Fragment>{children}</Fragment>;
};

export default UserServiceChatSocketProvider;
