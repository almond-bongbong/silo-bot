import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SlackModule } from './slack/slack.module';
import { SlackService } from './slack/slack.service';
import { ConfigModule } from '@nestjs/config';
import { isDevelopment, isProduction } from './lib/environment';
import { CRAWLER_NOTIFICATION_CHANNEL } from './slack/slack.constant';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskService } from './task/task.service';
import { CrawlerService } from './crawler/crawler.service';

console.log('Environment :', process.env.NODE_ENV);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: isDevelopment ? '.env.development' : '.env.production',
    }),
    SlackModule.forRoot({
      slackBotOauthToken: process.env.SLACK_BOT_OAUTH_TOKEN,
      slackBotSigningSecret: process.env.SLACK_BOT_SIGNING_SECRET,
      slackBotAppToken: process.env.SLACK_BOT_APP_TOKEN,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [TaskService, CrawlerService],
})
export class AppModule {
  constructor(private readonly slackService: SlackService) {
    if (isProduction) {
      slackService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, '🚀 Server started!');
    }
  }
}
