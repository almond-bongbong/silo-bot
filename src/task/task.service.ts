import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CrawlerService } from '../crawler/crawler.service';
import { SlackService } from '../slack/slack.service';
import { CRAWLER_NOTIFICATION_CHANNEL } from '../slack/slack.constant';
import dayjs from 'dayjs';

@Injectable()
export class TaskService {
  isSoldOut = true;
  error;

  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly slackService: SlackService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkForModaModaShampooSoldOut() {
    console.log('✅ Check modamoda crawler : ', new Date().toLocaleString());

    try {
      const isSoldOut = await this.crawlerService.checkModamodaSoldOut();
      const datetime = dayjs().format('MM/DD HH:mm');

      if (this.isSoldOut !== isSoldOut) {
        const soldOutMessage = isSoldOut
          ? '🔴 모다모다 샴푸가 품절되었습니다.'
          : '🟢️ 모다모다 샴푸 구매가 가능합니다. https://modamoda.co.kr/';
        const message = `${soldOutMessage} - ${datetime}`;
        this.slackService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, message);
      }

      this.isSoldOut = isSoldOut;
      this.error = null;
    } catch (error) {
      console.error(error);
      if (!this.error) {
        this.slackService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, '문제가 발생했습니다.');
      }
      this.error = error;
    }
  }
}
