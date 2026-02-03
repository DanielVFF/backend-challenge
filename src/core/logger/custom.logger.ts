import { ConsoleLogger } from '@nestjs/common';

export class CustomLogger extends ConsoleLogger {
  log(message: string) {
    if (
      message.includes('[RoutesResolver]') ||
      message.includes('[RouterExplorer]') ||
      message.includes('[InstanceLoader]') ||
      (message.includes('Mapped') && message.includes('route'))
    ) {
      return;
    }
    super.log(message);
  }
}
