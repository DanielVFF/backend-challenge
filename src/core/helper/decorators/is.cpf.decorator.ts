import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from '@nestjs/class-validator';
import { validateCPF } from '../utils/validate-cpf';

@ValidatorConstraint({ name: 'IsCPF', async: false })
export class IsCPFConstraint implements ValidatorConstraintInterface {
  validate(cpf: any, args: ValidationArguments): boolean {
    if (typeof cpf !== 'string') return false;
    return validateCPF(cpf);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'CPF deve ser válido';
  }
}

/**
 * Decorator para validação de CPF
 * @param validationOptions - Opções de validação
 */
export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCPFConstraint,
    });
  };
}
