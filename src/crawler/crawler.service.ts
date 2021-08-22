import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class CrawlerService {
  async checkModamodaSoldOut() {
    const { data } = await axios.get('https://modamoda.co.kr/');
    const $ = cheerio.load(data);

    const starterProduct = $('.prdList')
      .children()
      .toArray()
      .filter((e) => $(e).html().includes('34,000원'));

    if (!starterProduct) throw new Error('Node not found');

    const soldOutIcon = $(starterProduct).find('[alt=품절]').attr('src');
    return Boolean(soldOutIcon);
  }
}
