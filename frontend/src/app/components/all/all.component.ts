import { Component } from '@angular/core';
import {Listing} from "../../models/Listing";
import {Qualification} from "../../models/Qualification";

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrl: './all.component.css'
})
export class AllComponent {

  allListings: Listing[] = [
    { id: 1, title: 'Listing 1', details: 'Details 1', requirement: Qualification.Masters, tags: [] },
    { id: 2, title: 'Listing 2', details: 'Details 2', requirement: Qualification.Bachelors, tags: [] },
    { id: 3, title: 'Listing 3', details: 'Details 3', requirement: Qualification.PhD, tags: [] },
  ]

}
