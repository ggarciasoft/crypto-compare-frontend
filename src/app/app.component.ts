import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import Currency from './Currency';
import Exchange from './Exchange';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'app';

  public loading: boolean;
  public error: string;
  public exchanges: Exchange[];
  public exchangesName: string[];
  public currenciesName: string[];
  public currentExchangeSelected: string;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loading = true;
    // this.exchanges = [
    //   {
    //     Exchange: "Bittrex",
    //     Markets: [
    //       {
    //         CurrencyPair: "BTC-ETH",
    //         Buy: 1,
    //         Sell: 2
    //       }
    //     ]
    //   },
    //   {
    //     Exchange: "Poloniex",
    //     Markets: [
    //       {
    //         CurrencyPair: "BTC-ETH",
    //         Buy: 3,
    //         Sell: 4
    //       }
    //     ]
    //   }
    // ]

    this.http.get("https://crypto-compare-backend-ggarciasoft.c9users.io/currencies").subscribe((data: Exchange[]) => {
      this.exchanges = data;
      this.setExchangesName();
      this.setCurrenciesName();
      this.loading = false;
    }, err => {
      this.error = err.statusText;
      console.log(this.error);
      this.loading = false;
    });
  }
  public setExchangesName() {
    this.exchangesName = this.exchanges
      .map(o => o.Exchange)
      .sort((a, b) =>{
        if(a > b)
        {
          return 1;
        }
        else if(a < b)
        {
          return -1;
        }
        
        return 0;
      });
  }

  public setCurrenciesName() {
    //Set all distinct currencies
    this.currenciesName = this.exchanges
    .map(exchange => exchange.Markets.map(market => market.CurrencyPair))
    .reduce((a, b) => a.concat(b))
    .filter((value, index, self) => self.indexOf(value) === index && this.currencyIsOnMoreThanOneExchange(value));
  }

  public currencyIsOnMoreThanOneExchange(currency: string){
    return this.exchanges.filter(exchange => exchange.Markets.some(market => market.CurrencyPair == currency)).length > 1;
  }

  public getArrayNumberExchanges() {
    let arr = [];
    for (let i = 0; i < this.exchangesName.length * 2; i++)
      arr[i] = i;
    return arr;
  }

  public getBuyOrSell(currency: string, exchangeIndex: number) {
    if (this.currentExchangeSelected) {
      let currencyMarket = this.getCurrency(currency);
      this.currentExchangeSelected = null;
      if (currencyMarket) {
        return currencyMarket.Sell;
      }
    } else {
      this.currentExchangeSelected = this.exchangesName[exchangeIndex];
      let currencyMarket = this.getCurrency(currency);
      if (currencyMarket) {
        return currencyMarket.Buy;
      }
    }

    return 0;
  }

  public getCurrency(currency: string) {
    return this.exchanges.filter(o => o.Exchange == this.currentExchangeSelected)[0].Markets.filter(o => o.CurrencyPair == currency)[0];
  }
}
