import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { environment } from "../../environments/environment";
import Exchange from "../Exchange";

@Injectable()
export class CurrencyService {
    constructor(private http: HttpClient) { }

    public getCurrencies(getCache: boolean = true): Observable<Exchange[]>{
        return this.http.get<Exchange[]>(`${environment.ApiUrlHost}/currencies?get_cache=${getCache}`)
    }
}