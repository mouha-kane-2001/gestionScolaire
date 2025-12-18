import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';




 import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  HeaderNavComponent,
  NavItemComponent,
  NavLinkDirective,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective,
} from '@coreui/angular';

import { navItems } from './_nav';
import { EleveHeaderComponent } from './eleve-header/eleve-header.component';
import { EleveFooterComponent } from './eleve-footer/eleve-footer.component';
import { AuthService } from '../../services/auth/auth.service';

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
  selector: 'app-eleve-layout',
  templateUrl: './eleve-layout.component.html',
  styleUrls: ['./eleve-layout.component.scss'],
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    ContainerComponent,

    NgScrollbar,
    RouterOutlet,
    RouterLink,
    ShadowOnScrollDirective,
     EleveHeaderComponent,
    EleveFooterComponent,
    RouterLink,



  ]
})
export class EleveLayoutComponent {
  public navItems = [...navItems];
  sidebarId = "sidebar1";
     constructor( private router: Router,private authService:AuthService) {}


    seDeconnecter() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
