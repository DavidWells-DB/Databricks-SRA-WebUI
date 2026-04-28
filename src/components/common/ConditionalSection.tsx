import type { ReactNode } from 'react';
import type { Condition, FormValues } from '../../schemas/types';

interface ConditionalSectionProps {
  conditions: Condition[];
  values: FormValues;
  children: ReactNode;
}

function evaluateCondition(condition: Condition, values: FormValues): boolean {
  const fieldValue = values[condition.field];

  switch (condition.operator) {
    case 'eq':
      return fieldValue === condition.value;
    case 'neq':
      return fieldValue !== condition.value;
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(fieldValue);
    case 'truthy':
      return Boolean(fieldValue);
    case 'falsy':
      return !fieldValue;
    default:
      return false;
  }
}

export default function ConditionalSection({
  conditions,
  values,
  children,
}: ConditionalSectionProps) {
  const allMet = conditions.every((c) => evaluateCondition(c, values));

  if (!allMet) return null;

  return <>{children}</>;
}
