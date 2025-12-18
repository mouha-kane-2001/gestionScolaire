import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionNotesComponent } from './gestion-notes.component';

describe('GestionNotesComponent', () => {
  let component: GestionNotesComponent;
  let fixture: ComponentFixture<GestionNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionNotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
