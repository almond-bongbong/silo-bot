import { DynamicModule, Module } from '@nestjs/common';
import { NotificationModuleOptions } from './notification.type';
import { NotificationService } from './notification.service';
import { CONFIG_OPTIONS } from './notification.constant';

@Module({
  providers: [NotificationService],
})
export class NotificationModule {
  static forRoot(options: NotificationModuleOptions): DynamicModule {
    return {
      global: true,
      module: NotificationModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        NotificationService,
      ],
      exports: [NotificationService],
    };
  }
}
