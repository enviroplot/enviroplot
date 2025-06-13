## Copper

This calculations used only to determine criterion value for EIL.

Depends on

- Contaminantion type
- CEC
- pH
- MBC
- Iron Content
- Traffic level
- State

Select LookupValue from lookup table:

| Criteria | Fresh | Aged |
| -------- | ----- | ---- |
| AES      | 48    | 64.1 |
| UR/POS   | 101   | 193  |
| C/Ind    | 150   | 283  |

Calculate formulas:

_Based on CEC:_

> Formula 1 = LookupValue \* (CEC/10) ^ 0.106

> Formula 2 = LookupValue \* (CEC/10) ^ 0.96

> Formula 3 = LookupValue \* (CEC/10) ^ 0.58

> Formula 4 = LookupValue \* (CEC/10) ^ 0.848

> Formula 5 = LookupValue \* (CEC/10) ^ 0.751
> Formula 6 = LookupValue \* (CEC/10) ^ 1.06

_Based on pH_:

> Formula 1 = 10 ^ (LOG10(LookupValue) + (pH-6) \* 0.310 + (LOG10(OrganicCarbon)-LOG(1)) \* 1.05)

> Formula 2 = 10 ^ (LOG10(LookupValue) + (pH-6) \* 0.3479

Proceed with lowest value.

**Has input MBC**:

> result = FormulaValue + MBC

**No MBC**:

- Contaminantion type = **Fresh**

> ABC = 10 ^ (log10(IronContent) \* 0.612 + 0.808)

- Contaminantion type =**Aged**, look up for ABC in the following table:

  | Traffic      | NSW | QLD | SA  | VIC |
  | ------------ | --- | --- | --- | --- |
  | low traffic  | 18  | 12  | 17  | 10  |
  | high traffic | 28  | 17  | 26  | 10  |

So final result:

> result = ABC + FormulaValue

Apply _NEPM rounding_ to the final result.
