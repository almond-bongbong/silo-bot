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
    console.log('β Check modamoda crawler : ', new Date().toLocaleString());

    try {
      const isSoldOut = await this.crawlerService.checkModamodaSoldOut();
      const datetime = dayjs().format('MM/DD HH:mm');

      if (this.isSoldOutModamoda !== isSoldOut) {
        const soldOutMessage = isSoldOut
          ? 'π΄ λͺ¨λ€λͺ¨λ€ μ΄νΈκ° νμ λμμ΅λλ€.'
          : 'π’οΈ λͺ¨λ€λͺ¨λ€ μ΄νΈ κ΅¬λ§€κ° κ°λ₯ν©λλ€. https://modamoda.co.kr/';
        const message = `${soldOutMessage} - ${datetime}`;
        this.slackService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, message);
      }

      if (this.errorModamoda) {
        const message = 'π  μ μν λμμ΅λλ€.';
        this.slackService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, message);
      }

      this.isSoldOutModamoda = isSoldOut;
      this.errorModamoda = null;
    } catch (error) {
      console.error(error);

      if (!this.errorModamoda) {
        const errorMessage =
          error?.response?.status > 500 ? 'β οΈ 5xx μλ²μλ¬' : 'β οΈ λ¬Έμ κ° λ°μνμ΅λλ€.';
        this.slackService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, errorMessage);
      }
      this.errorModamoda = error;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkForNewBalanceStocked() {
    console.log('β Check newBalance crawler : ', new Date().toLocaleString());

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
              `${shoesName}κ° νμ λμμ΅λλ€.`,
            );
          }
          return;
        }

        if (!this.isStockedList.has(shoesName)) {
          this.slackService.postMessage(
            CRAWLER_NOTIFICATION_CHANNEL,
            `${shoesName} κ΅¬λ§€κ° κ°λ₯ν©λλ€.\n${link}`,
          );
        }
        this.isStockedList.add(shoesName);
      });
    } catch (error) {
      console.error(error);

      const errorMessage =
        error?.response?.status > 500
          ? 'β οΈ 5xx μλ²μλ¬'
          : error?.message || 'β οΈ λ¬Έμ κ° λ°μνμ΅λλ€.';
      this.slackService.postMessage(CRAWLER_NOTIFICATION_CHANNEL, errorMessage);
    }
  }
}
