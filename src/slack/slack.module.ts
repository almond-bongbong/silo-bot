import { DynamicModule, Module } from '@nestjs/common';
import { NotificationModuleOptions } from './slack.type';
import { SlackService } from './slack.service';
import { CONFIG_OPTIONS } from './slack.constant';

@Module({
  providers: [SlackService],
})
export class SlackModule {
  static forRoot(options: NotificationModuleOptions): DynamicModule {
    return {
      global: true,
      module: SlackModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        SlackService,
      ],
      exports: [SlackService],
    };
  }
}
