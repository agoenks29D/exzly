import ServiceWorkerManager from '@/service-worker-manager';

const serviceWorkerManager = new ServiceWorkerManager();

// (async () => {
//   /**
//    * Service Worker
//    */
//   if (serviceWorkerManager.isSupported()) {
//     serviceWorkerManager.isRegistered().then((isRegistered) => {
//       if (isRegistered && Notification.permission === 'default') {
//         serviceWorkerManager.subscribeWebPush().then(
//           (subscription) => {
//             console.log({ subscription });
//           },
//           (error) => {
//             console.log({ error });
//           },
//         );
//       }

//       serviceWorkerManager.subscribeWebPush().then(
//         (subscription) => {
//           console.log({ subscription });
//         },
//         (error) => {
//           console.log({ error });
//         },
//       );

//       if (!isRegistered) {
//         serviceWorkerManager.register().then(
//           (registration) => {
//             console.log('registered', registration);
//           },
//           (error) => {
//             console.error('Registration error', error);
//           },
//         );
//       }
//     });
//   }

//   serviceWorkerManager.onMessage((data) => {
//     console.log('onMESSAGE', { data });
//   });
// })();

export default { serviceWorkerManager };
