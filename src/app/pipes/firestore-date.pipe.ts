import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'firestoreDate',
  standalone: true,
})
export class FirestoreDatePipe implements PipeTransform {
  transform(value: any): Date | any {
    if (value instanceof Timestamp) {
      return value.toDate();
    }
    return value;
  }
}
