import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from '@nestjs/class-validator';
import { validateCNPJ } from '../utils/validate-cnpj';

@ValidatorConstraint({ name: 'IsCNPJ', async: false })
export class IsCNPJConstraint implements ValidatorConstraintInterface {
  validate(cnpj: any, args: ValidationArguments): boolean {
    if (typeof cnpj !== 'string') return false;
    return validateCNPJ(cnpj);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'CNPJ deve ser válido';
  }
}

/**
 * Decorator para validação de CNPJ
 * @param validationOptions - Opções de validação
 */
export function IsCNPJ(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCNPJConstraint,
    });
  };
}
