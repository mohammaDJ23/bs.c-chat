import { Fragment, useEffect, FC, PropsWithChildren, useState, memo } from 'react';
import { getUserServiceChatSocket } from '../socket';
import { useAction, useSelector } from '../../hooks';
import ConversationSkeleton from '../../components/Chat/ConversationSkeleton';

type IdTokenStatus = 'pending' | 'error' | 'success';

const UserServiceChatSocketProvider: FC<PropsWithChildren> = ({ children }) => {
  const [idTokenStatus, setIdTokenStatus] = useState<IdTokenStatus>('pending');
  const actions = useAction();
  const selectors = useSelector();
  const firebaseIdToken = selectors.firebase.firebaseIdToken;

  useEffect(() => {
    if (firebaseIdToken) {
      const socket = getUserServiceChatSocket(firebaseIdToken);
      actions.setUserServiceChatSocket(socket);
      setIdTokenStatus('success');
    }
  }, [firebaseIdToken]);

  return idTokenStatus === 'pending' ? (
    <ConversationSkeleton />
  ) : idTokenStatus === 'error' ? (
    <div>Not found the firebase id token.</div>
  ) : (
    <Fragment>{children}</Fragment>
  );
};

export default memo(UserServiceChatSocketProvider);
