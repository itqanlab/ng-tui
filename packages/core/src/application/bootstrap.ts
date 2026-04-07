import type { Type } from '../types/type.js';
import type { ApplicationConfig } from './application-config.js';
import { ApplicationRef } from './application-ref.js';
import { Injector } from '../di/injector.js';

/**
 * Bootstraps an ng-tui application with the given root component.
 *
 * @example
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     AiService,
 *     { provide: AI_PROVIDER, useClass: ClaudeProvider },
 *   ]
 * });
 */
export function bootstrapApplication(
  rootComponent: Type,
  config: ApplicationConfig = {},
): ApplicationRef {
  const providers = config.providers || [];

  // Create root injector with all providers
  const injector = new Injector([...providers, rootComponent]);

  // Create application ref
  const appRef = new ApplicationRef(rootComponent, injector);

  // Register ApplicationRef itself so services can inject it
  const appInjector = new Injector(
    [{ provide: ApplicationRef, useValue: appRef }],
    injector,
  );

  // Initialize
  appRef.init();

  return appRef;
}
