import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { isStaleVersionError, reloadForNewVersion } from './app/core/utils/version-reload';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    // Bản mới phát lên trong lúc trang đang mở: nạp lại trang thay vì để màn hình trắng.
    if (isStaleVersionError(err)) {
      reloadForNewVersion();
      return;
    }
    console.error(err);
  });