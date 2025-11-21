import { FormGroup } from '@angular/forms';

export function markFormGroupTouched(formGroup: FormGroup): void {
  Object.values(formGroup.controls).forEach((control) => {
    control.markAsTouched();
  });
}

