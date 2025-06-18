import { initializeApp } from 'firebase/app';
import {
  deleteToken,
  getMessaging,
  getToken,
  GetTokenOptions,
  MessagePayload,
  NextFn,
  Observer,
  onMessage,
} from 'firebase/messaging';
import { firebaseConfig } from '@/config';

const app = initializeApp(firebaseConfig);
const initFirebaseMessaging = getMessaging(app);

export const firebaseMessaging = {
  getToken: (options?: GetTokenOptions) => getToken(initFirebaseMessaging, options),
  onMessage: (nextOrObserver: NextFn<MessagePayload> | Observer<MessagePayload>) => {
    return onMessage(initFirebaseMessaging, nextOrObserver);
  },
  deleteToken: () => deleteToken(initFirebaseMessaging),
};
