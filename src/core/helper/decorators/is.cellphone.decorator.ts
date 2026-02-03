import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from '@nestjs/class-validator';
import { validateCellphone } from '../utils/validate-cellphone';

@ValidatorConstraint({ name: 'IsCellphone', async: false })
export class IsCellphoneConstraint implements ValidatorConstraintInterface {
  validate(cellphone: any): boolean {
    if (typeof cellphone !== 'string') return false;
    return validateCellphone(cellphone);
  }

  defaultMessage(): string {
    return 'Número de celular deve ser válido';
  }
}

/**
 * Decorator para validação de número de celular (formato internacional)
 * @param validationOptions - Opções de validação
 */
export function IsCellphone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCellphoneConstraint,
    });
  };
}
