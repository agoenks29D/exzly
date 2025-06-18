import { Workbox } from 'workbox-window';
import { firebaseMessaging } from './helpers';

export default class ServiceWorkerManager {
  registration: ServiceWorkerRegistration | null = null;

  isSupported() {
    return 'serviceWorker' in navigator;
  }

  async isRegistered(clientURL?: string | URL) {
    this.registration = (await navigator.serviceWorker.getRegistration(clientURL)) ?? null;
    return this.registration !== null;
  }

  async register(swPath?: string) {
    const workboxSW = new Workbox(swPath || '/service-worker.bundle.js');
    this.registration = await workboxSW.register();

    return this.registration;
  }

  async subscribeWebPush(vapidKey?: string) {
    if (this.registration && 'PushManager' in window) {
      const token = await firebaseMessaging.getToken({
        vapidKey: vapidKey || PUBLIC_VAPID_KEY,
        serviceWorkerRegistration: this.registration,
      });

      const webpush = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.base64ToUint8Array(vapidKey || PUBLIC_VAPID_KEY),
      });

      return { token, webpush };
    }
  }

  onMessage(callback: (data: unknown) => void) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      callback(event.data);
    });
  }

  private base64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}
