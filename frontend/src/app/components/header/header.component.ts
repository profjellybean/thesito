import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  headerNeeded(): boolean{
    return !this.router.url.includes('login') && !this.router.url.includes('register') && !this.router.url.includes('404')
  }


}
