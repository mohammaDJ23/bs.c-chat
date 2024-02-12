import { Fragment, useEffect, FC, PropsWithChildren, memo, useState } from 'react';
import { useSelector } from '../../hooks';
import FailedConnectionOfConversation from '../../components/Chat/FailedConnectionOfConversation';

const UserServiceChatSocketConnectErrorProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isErrorExist, setIsErrorExist] = useState<boolean>(false);
  const selectors = useSelector();
  const chatSocket = selectors.userServiceSocket.chat;

  useEffect(() => {
    if (chatSocket) {
      chatSocket.on('connect_error', () => {
        setIsErrorExist(true);
      });
    }
  }, [chatSocket]);

  return isErrorExist ? <FailedConnectionOfConversation /> : <Fragment>{children}</Fragment>;
};

export default memo(UserServiceChatSocketConnectErrorProvider);
