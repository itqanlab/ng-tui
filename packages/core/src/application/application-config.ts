import type { Provider } from '../di/provider.js';

/**
 * Configuration passed to bootstrapApplication().
 */
export interface ApplicationConfig {
  providers?: Provider[];
}
