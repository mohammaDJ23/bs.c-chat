/// <reference path="./index.d.ts" />

import ReactDOM from 'react-dom/client';
import App from './App';
import { isDevelopment } from './lib';
import { Provider } from 'react-redux';
import { store } from './store';

function app(el: Element) {
  const root = ReactDOM.createRoot(el);

  return {
    mount() {
      root.render(
        <Provider store={store()}>
          <App />
        </Provider>
      );
    },
    unMount() {
      root.unmount();
    },
  };
}

if (isDevelopment()) {
  const el = document.querySelector('#_chat-service');
  if (el) app(el).mount();
}

export { app };
