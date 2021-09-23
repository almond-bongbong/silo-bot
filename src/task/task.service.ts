import { Injectable } from '@nestjs/common';
import { CrawlerService } from '../crawler/crawler.service';
import { SlackService } from '../slack/slack.service';
import { CRAWLER_NOTIFICATION_CHANNEL } from '../slack/slack.constant';
import * as dayjs from 'dayjs';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TaskService {
  isSoldOutModamoda = true;
  errorModamoda;
  isStockedList = new Set();

  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly slackService: SlackService,
  ) {}

  // @Cron(CronExpression.EVERY_MINUTE)
  async checkForModaModaShampooSoldOut() {
    console.log('✅ Check modamoda crawler : ', new Date().toLocaleString());

    try {
      const isSoldOut = await this.crawlerService.checkModamodaSoldOut();
      const datetime = dayjs().format('MM/DD HH:mm');

      if (this.isSoldOutModamoda !== isSoldOut) {
        const soldOutMessage = isSoldOut
          ? '🔴 모다모다 샴푸가 품절되었습니다.'
          : '🟢️ 모다모다 샴푸 구매가 가능합니다. https://modamoda.co.kr/';
        const message = `${soldOutMessage} - ${datetime}`;
        this.slackService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, message);
      }

      if (this.errorModamoda) {
        const message = '🛠 정상화 되었습니다.';
        this.slackService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, message);
      }

      this.isSoldOutModamoda = isSoldOut;
      this.errorModamoda = null;
    } catch (error) {
      console.error(error);

      if (!this.errorModamoda) {
        const errorMessage =
          error?.response?.status > 500 ? '⚠️ 5xx 서버에러' : '⚠️ 문제가 발생했습니다.';
        this.slackService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, errorMessage);
      }
      this.errorModamoda = error;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkForNewBalanceStocked() {
    console.log('✅ Check newBalance crawler : ', new Date().toLocaleString());

    try {
      const shoesList = await this.crawlerService.getNewBalanceShoesList();

      shoesList.forEach((item) => {
        const shoesName = `${item.DisplayName} ${item.ColName}`;
        const image = `https://image.nbkorea.com${item.ImageUrl}`;
        const link = `https://www.nbkorea.com/product/productDetail.action?styleCode=${item.StyleCode}&colCode=${item.ColCode}&cIdx=${item.CIdx}`;
        const isSoldOut = item.SoldOutYn === 'Y';

        if (isSoldOut) {
          const deleted = this.isStockedList.delete(shoesName);
          if (deleted) {
            this.slackService.postMessage(
              CRAWLER_NOTIFICATION_CHANNEL,
              `${shoesName}가 품절되었습니다.`,
            );
          }
          return;
        }

        if (!this.isStockedList.has(shoesName)) {
          this.slackService.postMessage(
            CRAWLER_NOTIFICATION_CHANNEL,
            `${shoesName} 구매가 가능합니다.\n${link}`,
          );
        }
        this.isStockedList.add(shoesName);
      });
    } catch (error) {
      console.error(error);

      const errorMessage =
        error?.response?.status > 500
          ? '⚠️ 5xx 서버에러'
          : error?.message || '⚠️ 문제가 발생했습니다.';
      this.slackService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, errorMessage);
    }
  }
}
