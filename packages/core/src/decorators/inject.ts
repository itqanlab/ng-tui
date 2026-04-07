import { setInjectToken } from '../di/metadata.js';
import type { Token } from '../di/provider.js';

/**
 * Explicitly specifies the DI token for a constructor parameter.
 * Use when injecting interfaces or InjectionTokens.
 *
 * @example
 * constructor(@Inject(AI_PROVIDER) private ai: AiProvider) {}
 */
export function Inject(token: Token): ParameterDecorator {
  return (target, _propertyKey, parameterIndex) => {
    setInjectToken(target, parameterIndex, token);
  };
}
