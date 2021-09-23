import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from './slack.constant';
import { NotificationModuleOptions } from './slack.type';
import { App, MessageAttachment } from '@slack/bolt';
import { isDevelopment } from '../lib/environment';

@Injectable()
export class SlackService {
  slackApp: App;

  constructor(@Inject(CONFIG_OPTIONS) private readonly options?: NotificationModuleOptions) {
    this.slackApp = new App({
      token: options.slackBotOauthToken,
      signingSecret: options.slackBotSigningSecret,
      appToken: options.slackBotAppToken,
      socketMode: true,
    });
    this.subscribeCommand();
    this.slackApp.start();
  }

  async postMessage(channel: string, message: string, attachments?: MessageAttachment[]) {
    const text = `${isDevelopment ? '(개발) ' : ''}${message}`;

    try {
      console.log(attachments);
      await this.slackApp.client.chat.postMessage({ channel, text, attachments });
    } catch (error) {
      console.log(error);
    }
  }

  subscribeCommand() {
    this.slackApp.command('/hi', async ({ ack, say }) => {
      try {
        await ack();
        await say("Hello! i'm here 👋");
      } catch (error) {
        console.error(error);
      }
    });
  }
}
