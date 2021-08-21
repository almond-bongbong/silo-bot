import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CrawlerService } from '../crawler/crawler.service';
import { NotificationService } from '../notification/notification.service';
import { CRAWLER_NOTIFICATION_CHANNEL } from '../notification/notification.constant';

@Injectable()
export class TaskService {
  isSoldOut = true;

  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkForModaModaShampooSoldOut() {
    console.log('✅ Check modamoda crawler : ', new Date().toLocaleString());

    try {
      const isSoldOut = await this.crawlerService.checkModamodaSoldOut();

      if (this.isSoldOut !== isSoldOut) {
        const message = isSoldOut
          ? `❌ 모다모다 샴푸가 품절되었습니다.`
          : `⭕️ 현재 모다모다 샴푸 구입이 가능합니다. https://modamoda.co.kr/`;
        this.notificationService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, message);
      }

      this.isSoldOut = isSoldOut;
    } catch (error) {
      console.error(error);
    }
  }
}
