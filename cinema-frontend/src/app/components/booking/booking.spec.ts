import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Booking } from './booking';
import { PaymentService } from '../../services/payment';
import { of } from 'rxjs';

describe('Booking', () => {
  let component: Booking;
  let fixture: ComponentFixture<Booking>;
  let paymentServiceSpy: jasmine.SpyObj<PaymentService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PaymentService', ['createPayment']);

    await TestBed.configureTestingModule({
      imports: [Booking],
      providers: [
        { provide: PaymentService, useValue: spy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Booking);
    component = fixture.componentInstance;
    paymentServiceSpy = TestBed.inject(PaymentService) as jasmine.SpyObj<PaymentService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call payment API when callPayment is invoked', () => {
    paymentServiceSpy.createPayment.and.returnValue(of('http://payment.url'));
    spyOnProperty(window, 'location', 'get').and.returnValue(window.location);
    spyOnProperty(window.location, 'href', 'set');
    component.selectedSeats = [{ seatNumber: 'A1' }];
    component.movie = { title: 'Test Movie', price: 100 };
    component.callPayment('123');
    expect(paymentServiceSpy.createPayment).toHaveBeenCalled();
  });
});
