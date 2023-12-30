import 'reflect-metadata';
import './assets/styles/index.css';
import { FC } from 'react';
import { Pathes, isContainerApp } from './lib';
import { Navigate } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { SnackbarProvider } from 'notistack';
import Chat from './components/Chat';
import { useAuth } from './hooks';
import UserServiceChatSocketProvider from './lib/providers/UserServiceChatSocketProvider';
import UserServiceConnectionSocketProvider from './lib/providers/UserServiceConnectionSocketProvider';

export const history = createBrowserHistory();

const App: FC = () => {
  const auth = useAuth();

  if (isContainerApp()) {
    const isUserLoggedIn = auth.isUserAuthenticated();
    if (!isUserLoggedIn) {
      return <Navigate to={Pathes.LOGIN} />;
    }
    return (
      <SnackbarProvider
        dense
        maxSnack={Infinity}
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        style={{ maxWidth: '300px', wordBreak: 'break-word', overflow: 'hidden' }}
      >
        <UserServiceConnectionSocketProvider>
          <UserServiceChatSocketProvider>
            <Chat />
          </UserServiceChatSocketProvider>
        </UserServiceConnectionSocketProvider>
      </SnackbarProvider>
    );
  }
  return <div>Runs the app in the container</div>;
};

export default App;
