import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from './notification.constant';
import { NotificationModuleOptions } from './notification.type';
import { WebClient } from '@slack/web-api';
import { isDevelopment } from '../lib/environment';

@Injectable()
export class NotificationService {
  slackClient;

  constructor(@Inject(CONFIG_OPTIONS) private readonly options?: NotificationModuleOptions) {
    this.slackClient = new WebClient(options.slackBotOauthToken);
  }

  postMessage(channel: string, message: string) {
    const text = `${isDevelopment ? '(개발) ' : ''}${message}`;

    this.slackClient.chat
      .postMessage({
        channel,
        text,
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
