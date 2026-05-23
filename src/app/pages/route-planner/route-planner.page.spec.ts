import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutePlannerPage } from './route-planner.page';

describe('RoutePlannerPage', () => {
  let component: RoutePlannerPage;
  let fixture: ComponentFixture<RoutePlannerPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(RoutePlannerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
