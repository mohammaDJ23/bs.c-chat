import { FC } from 'react';
import { Pathes, UserRoles, getTokenInfo, isContainerApp, isUserAuthenticated } from './lib';
import { Navigate } from 'react-router-dom';
import OwnerChat from './components/OwnerChat';
import UserChat from './components/UserChat';

const App: FC = () => {
  if (isContainerApp()) {
    const isUserLoggedIn = isUserAuthenticated();
    if (!isUserLoggedIn) {
      return <Navigate to={Pathes.LOGIN} />;
    }
    const userInfo = getTokenInfo()!;
    if (userInfo.role === UserRoles.OWNER) {
      return <OwnerChat />;
    }
    return <UserChat />;
  }
  return <div>Runs the app in the container</div>;
};

export default App;
