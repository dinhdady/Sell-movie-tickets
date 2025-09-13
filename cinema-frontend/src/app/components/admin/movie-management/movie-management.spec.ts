import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieManagement } from './movie-management';

describe('MovieManagement', () => {
  let component: MovieManagement;
  let fixture: ComponentFixture<MovieManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
