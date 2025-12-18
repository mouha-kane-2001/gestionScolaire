import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkNotesComponent } from './bulk-notes.component';

describe('BulkNotesComponent', () => {
  let component: BulkNotesComponent;
  let fixture: ComponentFixture<BulkNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkNotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
