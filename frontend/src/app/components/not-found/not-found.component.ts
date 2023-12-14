import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent implements OnInit{
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  goBack(): void {
    this.router.navigate(['/']);
  }


  getSurprised(): void {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ?autoplay=1&cc_load_policy=1';
    window.open(url, '_blank');
  }
}
