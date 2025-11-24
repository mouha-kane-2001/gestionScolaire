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
import { ParentHeaderComponent } from './parent-header/parent-header.component';
import { ParentFooterComponent } from './parent-footer/parent-footer.component';
import { AuthService } from '../../services/auth/auth.service';

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
  selector: 'app-parent-layout',
  templateUrl: './parent-layout.component.html',
  styleUrls: ['./parent-layout.component.scss'],
  standalone: true,
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
    ParentHeaderComponent,
    ParentFooterComponent,
    RouterLink,

  ]
})
export class ParentLayoutComponent {
  public navItems = [...navItems];
  sidebarId = "sidebar1";
     constructor( private router: Router,private authService:AuthService) {}


    seDeconnecter() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
