import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'seatDisplay',
  standalone: true
})
export class SeatDisplayPipe implements PipeTransform {
  transform(seats: any[]): string {
    if (!seats || seats.length === 0) {
      return '';
    }
    
    return seats.map(seat => seat.row + seat.col).join(', ');
  }
}