import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationModule } from './notification/notification.module';
import { NotificationService } from './notification/notification.service';
import { ConfigModule } from '@nestjs/config';
import { isDevelopment } from './lib/environment';
import { CRAWLER_NOTIFICATION_CHANNEL } from './notification/notification.constant';

console.log('Environment :', process.env.NODE_ENV);

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly notificationService: NotificationService) {
    notificationService.postMessage(
      CRAWLER_NOTIFICATION_CHANNEL,
      'Server started! 🚀',
    );
  }
}
