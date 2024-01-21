import { FC, Fragment, PropsWithChildren, memo, useEffect, useState } from 'react';
import { useAction, useRequest } from '../../hooks';
import { signInWithCustomToken, onIdTokenChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { GenerateCustomTokenApi, SigninWithCustomTokenApi } from '../../apis';
import { AccessTokenObj } from '../authentication';
import ConversationSkeleton from '../../components/Chat/ConversationSkeleton';
import FailedConnectionOfConversation from '../../components/Chat/FailedConnectionOfConversation';

const GenerateCustomTokenProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const actions = useAction();
  const request = useRequest();
  const isInitialGenerateCustomTokenApiProcessing = request.isInitialApiProcessing(GenerateCustomTokenApi);
  const isInitialGenerateCustomTokenApiFailed = request.isInitialProcessingApiFailed(GenerateCustomTokenApi);
  const isInitialSigninWithCustomTokenApiProcessing = request.isInitialApiProcessing(SigninWithCustomTokenApi);
  const isInitialSigninWithCustomTokenApiFailed = request.isInitialProcessingApiFailed(SigninWithCustomTokenApi);

  useEffect(() => {
    const api = new GenerateCustomTokenApi();
    api.setInitialApi();
    request.build<AccessTokenObj>(api).then((response) => {
      actions.initialProcessingApiLoading(SigninWithCustomTokenApi.name);
      signInWithCustomToken(auth, response.data.accessToken)
        .then((userCredential) => setUser(userCredential.user))
        .catch((error) => {
          actions.initialProcessingApiError(SigninWithCustomTokenApi.name);
          setUser(null);
          actions.updateFirebaseIdToken('');
        });
    });
  }, []);

  useEffect(() => {
    onIdTokenChanged(
      auth,
      (user) => {
        if (user) {
          user
            .getIdToken()
            .then((token) => {
              setUser(user);
              actions.updateFirebaseIdToken(token);
            })
            .catch((error) => {
              actions.initialProcessingApiError(SigninWithCustomTokenApi.name);
              setUser(null);
              actions.updateFirebaseIdToken('');
            });
        } else {
          setUser(null);
          actions.updateFirebaseIdToken('');
        }
      },
      (error) => {
        actions.initialProcessingApiError(SigninWithCustomTokenApi.name);
        setUser(null);
        actions.updateFirebaseIdToken('');
      }
    );
  }, []);

  useEffect(() => {
    if (isInitialSigninWithCustomTokenApiProcessing && user) {
      user
        .getIdToken()
        .then((token) => {
          actions.initialProcessingApiSuccess(SigninWithCustomTokenApi.name);
          actions.updateFirebaseIdToken(token);
        })
        .catch((error) => {
          actions.initialProcessingApiError(SigninWithCustomTokenApi.name);
          setUser(null);
          actions.updateFirebaseIdToken('');
        });
    }
  }, [isInitialSigninWithCustomTokenApiProcessing, user]);

  return isInitialGenerateCustomTokenApiProcessing || isInitialSigninWithCustomTokenApiProcessing ? (
    <ConversationSkeleton />
  ) : isInitialGenerateCustomTokenApiFailed || isInitialSigninWithCustomTokenApiFailed ? (
    <FailedConnectionOfConversation />
  ) : user ? (
    <Fragment>{children}</Fragment>
  ) : (
    <FailedConnectionOfConversation />
  );
};

export default memo(GenerateCustomTokenProvider);
