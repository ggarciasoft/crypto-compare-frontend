import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'


import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http'
import { MainCoinCompareComponent } from './main-coin-compare/main-coin-compare.component';
import { ExchangeCompareComponent } from './exchange-compare/exchange-compare.component';
import { CurrencyService } from './services/currency.service.';
import { EmptyComponent } from './empty/empty.component';

const routes = [
  {
    path: '',
    component: EmptyComponent
  },
  { path: 'main-coin', component: MainCoinCompareComponent },
  { path: 'exchange', component: ExchangeCompareComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    MainCoinCompareComponent,
    ExchangeCompareComponent,
    EmptyComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    HttpClientModule
  ],
  providers: [CurrencyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
