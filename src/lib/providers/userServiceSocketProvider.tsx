import { Fragment, useEffect, FC, PropsWithChildren } from 'react';
import { getUserServiceSocket } from '../socket';
import { useAction } from '../../hooks';

const UserServiceSocketProvider: FC<PropsWithChildren> = ({ children }) => {
  const actions = useAction();

  useEffect(() => {
    const socket = getUserServiceSocket();
    actions.setUserServiceSocket(socket);
  }, []);

  return <Fragment>{children}</Fragment>;
};

export default UserServiceSocketProvider;
