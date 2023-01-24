import { InvalidInput, parse, ParsedSubmittedInput } from '@tower-defense/utils';

export function isInvalid(input: ParsedSubmittedInput): input is InvalidInput {
  return (input as InvalidInput).error !== undefined;
}
//utils/src/parser
export default parse;
