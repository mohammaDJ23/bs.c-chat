import './assets/styles/index.css';
import { FC } from 'react';
import { Pathes, UserRoles, isContainerApp } from './lib';
import { Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import OwnerChat from './components/OwnerChat';
import UserChat from './components/UserChat';
import { useAuth } from './hooks';
import UserServiceSocketProvider from './lib/providers/userServiceSocketProvider';
import { store } from './store';

const App: FC = () => {
  const auth = useAuth();

  if (isContainerApp()) {
    const isUserLoggedIn = auth.isUserAuthenticated();
    if (!isUserLoggedIn) {
      return <Navigate to={Pathes.LOGIN} />;
    }
    const userInfo = auth.getDecodedToken()!;
    if (userInfo.role === UserRoles.OWNER) {
      return (
        <Provider store={store}>
          <UserServiceSocketProvider>
            <OwnerChat />
          </UserServiceSocketProvider>
        </Provider>
      );
    }
    return (
      <Provider store={store}>
        <UserServiceSocketProvider>
          <UserChat />
        </UserServiceSocketProvider>
      </Provider>
    );
  }
  return <div>Runs the app in the container</div>;
};

export default App;
