import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvocationListComponent } from './convocation-list.component';

describe('ConvocationListComponent', () => {
  let component: ConvocationListComponent;
  let fixture: ComponentFixture<ConvocationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvocationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConvocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
