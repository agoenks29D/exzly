export interface PushEventDataJSON {
  type?: string;
  priority?: string;
  collapse_key?: string;
  notification?: INotificationOptions & { title: string };

  /**
   * Exzly message id
   */
  ecmMessageId?: string;

  /**
   * Firebase message id
   */
  fcmMessageId?: string;
}

export interface INotificationOptions extends NotificationOptions {
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
  image?: string;
  renotify?: boolean;
  timestamp?: number;
  vibrate?: VibratePattern;
}
