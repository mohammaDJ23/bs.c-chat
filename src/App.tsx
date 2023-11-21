import 'reflect-metadata';
import './assets/styles/index.css';
import { FC } from 'react';
import { Pathes, isContainerApp } from './lib';
import { Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import Chat from './components/Chat';
import { useAuth } from './hooks';
import UserServiceChatSocketProvider from './lib/providers/userServiceChatSocketProvider';
import { store } from './store';

export const history = createBrowserHistory();

const App: FC = () => {
  const auth = useAuth();

  if (isContainerApp()) {
    const isUserLoggedIn = auth.isUserAuthenticated();
    if (!isUserLoggedIn) {
      return <Navigate to={Pathes.LOGIN} />;
    }
    return (
      <Provider store={store}>
        <UserServiceChatSocketProvider>
          <Chat />
        </UserServiceChatSocketProvider>
      </Provider>
    );
  }
  return <div>Runs the app in the container</div>;
};

export default App;
