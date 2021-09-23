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

  async getNewBalanceShoesList() {
    const params = new URLSearchParams();
    params.append('pageNo', '1');
    params.append('pageSize', '100');
    params.append('schWord', '992');
    params.append('prodPart', '');
    params.append('cIdx', '1283');
    params.append('cateGrpCode', '250110');
    params.append('chgGather', 'N');
    params.append('emphasis', 'Y');
    params.append('compareView', 'N');
    params.append('subCateIdx[]', '1283');
    params.append('resultSort', '01');
    params.append('moreBtnObj', 'moreList');
    params.append('appendObj', 'prodList');
    params.append('cateSummaryYn', 'N');
    params.append('gTagList', '');
    const { data } = await axios.post(
      'https://www.nbkorea.com/product/searchResultFilter.action',
      params,
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
        },
      },
    );
    if (data.message) throw new Error(data.message);
    return data.resultList;
  }
}
