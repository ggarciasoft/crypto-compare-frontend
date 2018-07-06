import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import Currency from '../Currency';
import Exchange from '../Exchange';
import { environment } from '../../environments/environment';
import { CurrencyService } from '../services/currency.service.';

@Component({
  selector: 'app-main-coin-compare',
  templateUrl: './main-coin-compare.component.html',
  styleUrls: ['./main-coin-compare.component.css']
})
export class MainCoinCompareComponent implements OnInit {
  private loading: boolean;
  private error: string;
  private exchanges: Exchange[];
  private generatedTableHtml: string;
  private minPercentToRelateExchange: number = 5;

  constructor(private _service: CurrencyService) { }

  ngOnInit(): void {
    this.loading = true;
    this._service.getCurrencies().subscribe((data: Exchange[]) => {
      this.exchanges = data;
      this.generateExchangeTable();
      this.loading = false;
    }, err => {
      this.error = err.error;
      console.log(this.error);
      this.loading = false;
    });
  }

  private generateExchangeTable() {
    let exchangesName = this.getExchangesName();

    for (let index = 0; index < exchangesName.length; index++) {
      let exchangeName = exchangesName[index];
      let currencies = this.exchanges
      .filter(exchange => exchange.Exchange == exchangeName)[0].Currencies;
      for (let index = 0; index < currencies.length; index++) {
        let currency = currencies[index];
        
      }
      
    }

    let currenciesName = this.getCurrenciesName();
    let exchangeNameBuyAndSellHtml = this.getThExchangeNameBuyAndSellHtml(exchangesName);
    let exchangeBodyHtml = this.getExchangeBodyHtml(exchangesName, currenciesName);

    let trth = (text: string) => `
      <tr>
        <th>
        ${text}
        </th>
      </tr>
    `
    this.generatedTableHtml = `
    <table class="table-exchange">
      <thead>
        ${trth(exchangeNameBuyAndSellHtml.exchangeName)}
        ${trth(exchangeNameBuyAndSellHtml.BuyAndSell)}
      </thead>
      <tbody>
        ${exchangeBodyHtml}
      </tbody>
      <tfoot>
        ${trth(exchangeNameBuyAndSellHtml.BuyAndSell)}
        ${trth(exchangeNameBuyAndSellHtml.exchangeName)}
      </tfoot>
    </table>
    `
  }

  private getThExchangeNameBuyAndSellHtml(exchangesName: string[]): { exchangeName, BuyAndSell } {
    let thExchangesName = "";
    let thBuyAndSell = "";

    exchangesName.forEach(exchangeName => {
      thExchangesName += `<th colspan="2">${exchangeName}</th>`;
      thBuyAndSell += `
      <th>Buy</th>
      <th>Sell</th>`
    })
    return {
      exchangeName: thExchangesName,
      BuyAndSell: thBuyAndSell
    }
  }

  private getExchangeBodyHtml(exchangesName: string[], currenciesName: string[]) {
    let html = "";
    currenciesName.forEach(currencyName => {
      html += `<tr><td>${currencyName}</td>`;
      for (let exchangeIndex = 0; exchangeIndex < exchangesName.length; exchangeIndex++) {
        let exchangeName = exchangesName[exchangeIndex];
        let currency = this.getCurrency(currencyName, exchangeName);
        //if a currency exists on current exchange, look for relates exchanges with the price, otherwise, put default value.
        if (currency) {
          this.cleanRelateExchanges(currency);

          this.setRelatedExchangesToCurrency(currency, exchangeName, exchangesName, exchangeIndex);
          let relateExchangesOnBuy = currency.RelateExchangesOnBuy.join();
          let relateExchangesOnSell = currency.RelateExchangesOnSell.join();
          html += `
          <td ${relateExchangesOnBuy ? "class='has-relate-exchange'" : ""}>${currency.Buy} ${relateExchangesOnBuy}</td>
          <td ${relateExchangesOnSell ? "class='has-relate-exchange'" : ""}>${currency.Sell} ${relateExchangesOnSell}</td>
        `
        }
        else {
          html += `
          <td>0</td>
          <td>0</td>
        `
        }
      }
      html += `<td>${currencyName}</td></tr>`;
    });
    return html;
  }

  /**
   * Set a relationship between current exchange currency, and others exchanges with prices.
   * @param currency Currency to verify the price on others exchanges and relate it with them.
   * @param currentExchangeName Exchange where @currency belong to.
   * @param exchangesName Every exchanges on system.
   * @param exchangeIndex Index of currentExchange.
   */
  private setRelatedExchangesToCurrency(currency: Currency, currentExchangeName: string, exchangesName: string[], exchangeIndex: number) {
    //Start with the next exchange on the list.
    for (exchangeIndex++; exchangeIndex < exchangesName.length; exchangeIndex++) {
      let exchangeName = exchangesName[exchangeIndex];
      let nextCurrency = this.getCurrency(currency.CurrencyPair, exchangeName);
      if (nextCurrency) {
        this.cleanRelateExchanges(nextCurrency);

        //if each values on currency is greater than 0.
        if ((currency.Sell > 0 && nextCurrency.Buy > 0) || (nextCurrency.Sell > 0 && currency.Buy > 0)) {
          //if buy value on next exchange is greater than sell value on current exchange, 
          //and the differences between those values is greater than or equal to min percent, relate the currency on those exchanges.
          if (nextCurrency.Buy > currency.Sell) {
            let percent = this.getPercentBetweenValues(nextCurrency.Buy, currency.Sell);
            if (percent >= this.minPercentToRelateExchange) {
              currency.RelateExchangesOnSell.push(`${exchangeName} (${percent})`);
              nextCurrency.RelateExchangesOnBuy.push(`${currentExchangeName} (${percent})`);
            }
          }
          //if buy value on current exchange is greater than sell value on next exchange, 
          //and the differences between those values is greater than or equal to min percent, relate the currency on those exchanges.
          if (currency.Buy > nextCurrency.Sell) {
            let percent = this.getPercentBetweenValues(currency.Buy, nextCurrency.Sell);
            if (percent >= this.minPercentToRelateExchange) {
              currency.RelateExchangesOnBuy.push(`${exchangeName} (${percent})`);
              nextCurrency.RelateExchangesOnSell.push(`${currentExchangeName} (${percent})`);
            }
          }
        }
      }
    }
  }

  private getPercentBetweenValues(val1: number, val2: number): number {
    let maxValue = Math.max(val1, val2);
    let minValue = Math.min(val1, val2);
    let result = maxValue - minValue;
    return Number(Number((result / maxValue) * 100).toFixed(2));
  }

  private cleanRelateExchanges(currency: Currency) {
    if (currency) {
      if (!currency.RelateExchangesOnBuy) {
        currency.RelateExchangesOnBuy = [];
      }
      if (!currency.RelateExchangesOnSell) {
        currency.RelateExchangesOnSell = [];
      }
    }
  }

  private getExchangesName() {
    return this.exchanges
      .map(o => o.Exchange)
      .sort();
  }

  private getCurrenciesName() {
    //Get all distinct currencies
    return this.exchanges
      .map(exchange => exchange.Currencies.map(market => market.CurrencyPair))
      .reduce((a, b) => a.concat(b))
      .filter((value, index, self) => self.indexOf(value) === index && this.currencyIsOnMoreThanOneExchange(value))
      .sort();
  }

  private currencyIsOnMoreThanOneExchange(currency: string) {
    return this.exchanges.filter(exchange => exchange.Currencies.some(market => market.CurrencyPair == currency)).length > 1;
  }

  private getCurrency(currency: string, exchange: string): Currency {
    return this.exchanges.filter(o => o.Exchange == exchange)[0].Currencies.filter(o => o.CurrencyPair == currency)[0];
  }
}
