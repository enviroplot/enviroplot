interface IHasChemicalDetail {
  group: string;
  code: string;
  chemical: string;
  wcType: AslpTclpType;
  dissolved?: boolean;
}
