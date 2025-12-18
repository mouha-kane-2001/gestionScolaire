import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfVoirNoteComponent } from './prof-voir-note.component';

describe('ProfVoirNoteComponent', () => {
  let component: ProfVoirNoteComponent;
  let fixture: ComponentFixture<ProfVoirNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfVoirNoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfVoirNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
