import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { AdminFooterComponent } from './admin-footer/admin-footer.component';



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
import { AuthService } from '../../services/auth/auth.service';

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
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
    AdminHeaderComponent,
    AdminFooterComponent,
    RouterLink,



  ]
})
export class AdminLayoutComponent {
  public navItems = [...navItems];
  sidebarId = "sidebar1";
  constructor( private router: Router,private authService:AuthService) {}


    seDeconnecter() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
