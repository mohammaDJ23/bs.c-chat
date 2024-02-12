import 'reflect-metadata';
import './assets/styles/index.css';
import { FC } from 'react';
import { Pathes, isContainerApp, routes } from './lib';
import { Navigate, Routes, unstable_HistoryRouter as HistoryRouter, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { SnackbarProvider } from 'notistack';
import { useAuth } from './hooks';
import UserServiceConnectionSocketProvider from './lib/providers/UserServiceConnectionSocketProvider';
import RedirectionProvider from './lib/providers/RedirectionProvider';

export const history = createBrowserHistory();

const App: FC = () => {
  const auth = useAuth();

  if (isContainerApp()) {
    const isUserLoggedIn = auth.isUserAuthenticated();
    if (!isUserLoggedIn) {
      return <Navigate to={Pathes.LOGIN} />;
    }
    return (
      /**@ts-ignore */
      <HistoryRouter history={history}>
        <RedirectionProvider>
          <SnackbarProvider
            dense
            maxSnack={Infinity}
            anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
            style={{ maxWidth: '300px', wordBreak: 'break-word', overflow: 'hidden' }}
          >
            <UserServiceConnectionSocketProvider>
              <Routes>
                {routes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}
              </Routes>
            </UserServiceConnectionSocketProvider>
          </SnackbarProvider>
        </RedirectionProvider>
      </HistoryRouter>
    );
  }
  return <div>Runs the app in the container</div>;
};

export default App;
