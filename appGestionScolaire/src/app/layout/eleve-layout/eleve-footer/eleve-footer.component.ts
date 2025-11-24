import { Component } from '@angular/core';
import { FooterComponent } from '@coreui/angular';

@Component({
  selector: 'app-eleve-footer',
  templateUrl: './eleve-footer.component.html',
  styleUrls: ['./eleve-footer.component.scss']
})
export class EleveFooterComponent extends FooterComponent {
  constructor() {
    super();
  }
}
