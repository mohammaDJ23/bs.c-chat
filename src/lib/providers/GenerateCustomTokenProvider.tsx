import { FC, Fragment, PropsWithChildren, memo, useEffect, useState } from 'react';
import { useAction, useRequest } from '../../hooks';
import { signInWithCustomToken, onIdTokenChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { GenerateCustomTokenApi, SigninWithCustomTokenApi } from '../../apis';
import { AccessTokenObj } from '../authentication';

const GenerateCustomTokenProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const actions = useAction();
  const request = useRequest();
  const isInitialGenerateCustomTokenApiProcessing = request.isInitialApiProcessing(GenerateCustomTokenApi);
  const isInitialGenerateCustomTokenApiFailed = request.isInitialProcessingApiFailed(GenerateCustomTokenApi);
  const isInitialSigninWithCustomTokenApiProcessing = request.isInitialApiProcessing(SigninWithCustomTokenApi);
  const isInitialSigninWithCustomTokenApiFailed = request.isInitialProcessingApiFailed(SigninWithCustomTokenApi);
  const isUserExist = !!user;

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
        });
    });
  }, []);

  useEffect(() => {
    onIdTokenChanged(
      auth,
      (value) => setUser(value),
      (error) => setUser(null)
    );
  }, []);

  useEffect(() => {
    if (isInitialSigninWithCustomTokenApiProcessing && isUserExist) {
      actions.initialProcessingApiSuccess(SigninWithCustomTokenApi.name);
    }
  }, [isInitialSigninWithCustomTokenApiProcessing, isUserExist]);

  return isInitialGenerateCustomTokenApiProcessing || isInitialSigninWithCustomTokenApiProcessing ? (
    <div>Generating a token...</div>
  ) : isInitialGenerateCustomTokenApiFailed || isInitialSigninWithCustomTokenApiFailed ? (
    <div>Failed to generate a token.</div>
  ) : isUserExist ? (
    <Fragment>{children}</Fragment>
  ) : (
    <div>you are unable to use the conversation.</div>
  );
};

export default memo(GenerateCustomTokenProvider);
