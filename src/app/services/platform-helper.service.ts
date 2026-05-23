import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class PlatformHelperService {
  private platform = inject(Platform);

  readonly isDesktopWeb =
    !Capacitor.isNativePlatform() &&
    !this.platform.is('mobileweb') &&
    !this.platform.is('tablet');
}
