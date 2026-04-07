import { setInjectableMetadata } from '../di/metadata.js';

/**
 * Marks a class as injectable via the DI system.
 *
 * @example
 * @Injectable()
 * export class AiService {
 *   constructor(private config: ConfigService) {}
 * }
 */
export function Injectable(): ClassDecorator {
  return (target) => {
    setInjectableMetadata(target);
  };
}
