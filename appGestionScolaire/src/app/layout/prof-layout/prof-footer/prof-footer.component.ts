import { Component } from '@angular/core';
import { FooterComponent } from '@coreui/angular';

@Component({
  selector: 'app-prof-footer',
  templateUrl: './prof-footer.component.html',
  styleUrls: ['./prof-footer.component.scss']
})
export class ProfFooterComponent extends FooterComponent {
  constructor() {
    super();
  }
}
