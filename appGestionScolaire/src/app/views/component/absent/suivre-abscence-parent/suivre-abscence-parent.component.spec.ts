import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuivreAbscenceParentComponent } from './suivre-abscence-parent.component';

describe('SuivreAbscenceParentComponent', () => {
  let component: SuivreAbscenceParentComponent;
  let fixture: ComponentFixture<SuivreAbscenceParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuivreAbscenceParentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuivreAbscenceParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
