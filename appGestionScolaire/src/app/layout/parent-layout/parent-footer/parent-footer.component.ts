import { Component } from '@angular/core';
import { FooterComponent } from '@coreui/angular';

@Component({
  selector: 'app-parent-footer',
  templateUrl: './parent-footer.component.html',
  styleUrls: ['./parent-footer.component.scss']
})
export class ParentFooterComponent extends FooterComponent {
  constructor() {
    super();
  }
}
