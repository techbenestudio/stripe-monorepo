import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IProduct } from '@nx-stripe-workshop/shared-web';

@Component({
  selector: 'nx-stripe-workshop-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  products: IProduct[] | null = null;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.http.get<{ products: IProduct[] }>('/api/sporty').subscribe(res => {
        this.products = res.products;
    })
  }

}
