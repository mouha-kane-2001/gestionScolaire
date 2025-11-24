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
import { ProfHeaderComponent } from './prof-header/prof-header.component';
import { ProfFooterComponent } from './prof-footer/prof-footer.component';
import { AuthService } from '../../services/auth/auth.service';

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
  selector: 'app-prof-layout',
  templateUrl: './prof-layout.component.html',
  styleUrls: ['./prof-layout.component.scss'],
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
    ProfHeaderComponent,
    ProfFooterComponent,
    RouterLink,

   ]
})
export class ProfLayoutComponent {
  public navItems = [...navItems];
  sidebarId = "sidebar1";
    constructor( private router: Router,private authService:AuthService) {}


    seDeconnecter() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
