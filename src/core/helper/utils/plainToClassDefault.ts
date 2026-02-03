import {
  ClassConstructor,
  ClassTransformOptions,
  plainToClass,
} from '@nestjs/class-transformer';

/**
 * Converts a plain object to a class instance with default settings.
 */
export function plainToClassDefault<T, V>(
  cls: ClassConstructor<T>,
  plain: V,
  options?: ClassTransformOptions,
  uid?: string | number,
): T {
  if (uid) plain = { ...plain, uid };

  return plainToClass(cls, plain, {
    ...options,
    excludeExtraneousValues: true,
    exposeUnsetFields: false,
    enableImplicitConversion: true,
  });
}
