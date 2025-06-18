/**
 * Exzly - Service Worker
 *
 * @author Agung Dirgantara <agungmasda29@gmail.com>
 * @license MIT
 */

import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { INotificationOptions, PushEventDataJSON } from './types';

declare let self: ServiceWorkerGlobalScope & {
  __WB_DISABLE_DEV_LOGS?: boolean;
};

const version = '0.0.1';

self.__WB_DISABLE_DEV_LOGS = ENVIRONMENT === 'production';

/**
 * Checks whether the given value is a valid JSON object.
 *
 * @param {object|string} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a valid JSON object, otherwise false.
 */
const isJSON = (value: string | object): boolean => {
  let result = typeof value === 'object';

  if (!result) {
    try {
      const o = JSON.parse(value as string);
      if (o && typeof o === 'object') {
        result = true;
      }
    } catch {
      result = false;
    }
  }

  return result;
};

/**
 * Sends feedback for a web push notification.
 *
 * @param {string} name - The type of feedback.
 * @param {object} data - The associated data to send.
 */
const webPushFeedback = async (name: string, data: object): Promise<void> => {
  try {
    const response = await fetch(`${API_ROUTE}/notifications/web-push-feedback`, {
      mode: 'same-origin',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
};

/**
 * Workbox Caching
 *
 * Caching is only enabled in the production environment
 *
 * @see {@link https://developer.chrome.com/docs/workbox/modules|Workbox Modules}
 * @see {@link https://developer.chrome.com/docs/workbox/modules/workbox-strategies|Workbox Strategies}
 */
if (ENVIRONMENT === 'production') {
  /**
   * Cache manifest file
   * Caching the manifest ensures that important references (e.g., assets) are available for the app.
   */
  registerRoute(
    ({ request }) => request.destination === 'manifest',
    new CacheFirst({
      cacheName: 'assets-manifest',
      matchOptions: {
        ignoreVary: true,
      },
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 24 * 60 * 60, // 1 Day
        }),
      ],
    }),
  );

  /**
   * Cache style (CSS) files
   * This ensures stylesheets are cached, reducing the need to re-fetch on subsequent visits.
   */
  registerRoute(
    ({ request }) => request.destination === 'style',
    new CacheFirst({
      cacheName: 'assets-style',
      matchOptions: {
        ignoreVary: true,
      },
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 24 * 60 * 60, // 1 Day
        }),
      ],
    }),
  );

  /**
   * Cache script (JavaScript) files
   * Ensures JavaScript files are cached for faster access during future visits.
   */
  registerRoute(
    ({ request }) => request.destination === 'script',
    new CacheFirst({
      cacheName: 'assets-script',
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 24 * 60 * 60, // 1 Day
        }),
      ],
    }),
  );

  /**
   * Cache .map files (Source Maps)
   * Caches source map files for debugging purposes in development.
   */
  registerRoute(
    ({ url }) => url.pathname.endsWith('.map'),
    new CacheFirst({
      cacheName: 'assets-sourcemap',
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 24 * 60 * 60, // 1 Day
        }),
      ],
    }),
  );

  /**
   * Cache font files
   * Caches fonts to make sure they load quickly on subsequent visits without re-fetching.
   */
  registerRoute(
    ({ request }) => request.destination === 'font',
    new CacheFirst({
      cacheName: 'assets-font',
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 24 * 60 * 60, // 1 Day
        }),
      ],
    }),
  );

  /**
   * Cache image files
   * Caches images to improve performance and reduce load times on subsequent visits.
   */
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'assets-image',
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 24 * 60 * 60, // 1 Day
        }),
      ],
    }),
  );
}

/**
 * Handles the service worker's "install" event.
 */
self.addEventListener('install', () => {
  console.log(`Service worker version ${version} installed`);
  self.skipWaiting();
});

/**
 * Handles the service worker's "activate" event.
 */
self.addEventListener('activate', () => {
  console.log(`Service worker version ${version} activated`);
  clients.claim();
});

/**
 * Handles the "push" event triggered by a web push.
 *
 * @param {PushEvent} event - The received push event.
 */
self.addEventListener('push', (event: PushEvent) => {
  // If data text is a valid JSON format
  if (isJSON(event.data.json())) {
    // Push event data
    const push = event.data.json() as PushEventDataJSON;

    // Push notification
    if (push?.type === 'notification' || push?.fcmMessageId) {
      const notificationOption: INotificationOptions = push.notification;

      event.waitUntil(
        clients
          .matchAll({
            type: 'window',
            includeUncontrolled: true,
          })
          .then((list) => {
            if (list.length > 0) {
              list.forEach((client: Client) => {
                const isExzlyMessaging = typeof push.ecmMessageId !== 'undefined';
                const isFirebaseMessaging = typeof push.fcmMessageId !== 'undefined';

                // Post message to client
                client.postMessage({
                  messageType: 'push-received',
                  isExzlyMessaging,
                  isFirebaseMessaging,
                  data: push,
                });
              });
            } else {
              // Display notification
              self.registration.showNotification(push.notification.title, notificationOption);
            }
          }),
      );
    }

    // TODO: Handle cases where the push event data is not intended for notifications
  } else {
    // Handle other formats
    // Read more at: https://developer.mozilla.org/en-US/docs/Web/API/PushMessageData
  }
});

/**
 * Handles the "notificationclick" event.
 *
 * @param {NotificationEvent} event - The notification event.
 */
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const clickedNotification = event.notification;
  const urlToOpen =
    clickedNotification.data && clickedNotification.data.url ? clickedNotification.data.url : '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        return clients.openWindow(urlToOpen);
      })
      .then(() => {
        webPushFeedback('clicked', {
          ecmMessageId: clickedNotification.data?.ecmMessageId,
          fcmMessageId: clickedNotification.data?.fcmMessageId,
          urlOpened: urlToOpen,
        });
      }),
  );
});

/**
 * Handles the "notificationclose" event.
 *
 * @param {NotificationEvent} event - The notification event.
 */
self.addEventListener('notificationclose', (event: NotificationEvent) => {
  event.notification.close();

  const closedNotification = event.notification;
  webPushFeedback('closed', {
    ecmMessageId: closedNotification.data?.ecmMessageId,
    fcmMessageId: closedNotification.data?.fcmMessageId,
  });
});
