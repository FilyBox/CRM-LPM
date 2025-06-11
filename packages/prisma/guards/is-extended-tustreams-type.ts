import { ExtendedTuStreamsType } from '../types/extended-tustreams-type';

export const isExtendedTuStreamsType = (value: unknown): value is ExtendedTuStreamsType => {
  if (typeof value !== 'string') {
    return false;
  }

  // We're using the assertion for a type-guard so it's safe to ignore the eslint warning
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return Object.values(ExtendedTuStreamsType).includes(value as ExtendedTuStreamsType);
};
