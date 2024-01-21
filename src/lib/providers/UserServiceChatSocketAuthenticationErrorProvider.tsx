import { Fragment, useEffect, FC, PropsWithChildren, memo, useState } from 'react';
import { useSelector } from '../../hooks';
import FailedConnectionOfConversation from '../../components/Chat/FailedConnectionOfConversation';
import { WsErrorObj } from '../socket';

const UserServiceChatSocketAuthenticationErrorProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isErrorExist, setIsErrorExist] = useState<boolean>(false);
  const selectors = useSelector();
  const chatSocket = selectors.userServiceSocket.chat;

  useEffect(() => {
    if (chatSocket) {
      chatSocket.on('error', (data: WsErrorObj) => {
        if (data.event === 'authentication') {
          setIsErrorExist(!!data);
        }
      });
    }
  }, [chatSocket]);

  return isErrorExist ? <FailedConnectionOfConversation /> : <Fragment>{children}</Fragment>;
};

export default memo(UserServiceChatSocketAuthenticationErrorProvider);
