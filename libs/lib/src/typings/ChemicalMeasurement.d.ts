interface ChemicalMeasurement {
  laboratorySampleId: string;
  chemical: {
    code: string;
    name: string;
  };
  units: string;
  pqlValue: number;
  pqlPrefix?: string;
  prefix: string;
  asbestosValue?: string;
  resultValue: number;
  aslpTclpType: AslpTclpType;
  method: string;
  dissolved?: boolean;
}
