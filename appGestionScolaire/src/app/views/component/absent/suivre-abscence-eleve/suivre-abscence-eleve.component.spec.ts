import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuivreAbscenceEleveComponent } from './suivre-abscence-eleve.component';

describe('SuivreAbscenceEleveComponent', () => {
  let component: SuivreAbscenceEleveComponent;
  let fixture: ComponentFixture<SuivreAbscenceEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuivreAbscenceEleveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuivreAbscenceEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
