import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { NotificationModule } from './notification/notification.module';
import { NotificationService } from './notification/notification.service';
import { ConfigModule } from '@nestjs/config';
import { isDevelopment, isProduction } from './lib/environment';
import { CRAWLER_NOTIFICATION_CHANNEL } from './notification/notification.constant';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskService } from './task/task.service';
import { CrawlerService } from './crawler/crawler.service';

console.log('Environment :', process.env.NODE_ENV);
console.log('Environment SLACK_BOT_OAUTH_TOKEN :', process.env.SLACK_BOT_OAUTH_TOKEN);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // ignoreEnvFile: isProduction,
      envFilePath: isDevelopment ? '.env.development' : '.env.production',
    }),
    NotificationModule.forRoot({
      slackBotOauthToken: process.env.SLACK_BOT_OAUTH_TOKEN,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [TaskService, CrawlerService],
})
export class AppModule {
  constructor(private readonly notificationService: NotificationService) {
    if (isProduction) {
      notificationService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, '🚀 Server started!');
    }
  }
}
