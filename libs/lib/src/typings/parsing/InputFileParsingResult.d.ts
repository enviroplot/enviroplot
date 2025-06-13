interface InputFileParsingResult {
  samples: Sample[];
  skipUnparsableValues: boolean;
  messages: ParsingMessage[];
}
