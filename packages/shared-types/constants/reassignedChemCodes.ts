interface ChemCodesObj {
  [property: string]: ReassignedChem[];
}

export const ESDAT_CHEM_CODES: ChemCodesObj = {
  TOTALPAH: [
    {
      name: 'Total PAH',
      reassignTo: 'SUM_PAH_DETECT',
    },
  ],
  '132207-33-1(<2mm)': [
    {
      name: 'FA and AF (g) (NEPC, 2013)',
      reassignTo: 'FA_AF_g',
      units: 'g',
    },
    {
      name: 'FA and AF (% w/w) (NEPC, 2013)',
      reassignTo: 'FA_AF_ww',
      units: '%(w/w)',
    },
  ],

  Asb_FA_AF_in_Soil: [
    {
      name: 'FA and AF (% w/w) (NEPC, 2013)',
      reassignTo: 'FA_AF_ww',
    },
  ],
  '132207-33-1 (>7mm)': [
    {
      name: 'ACM > 7 mm (NEPC, 2013)',
      reassignTo: 'ACM_7mm',
    },
  ],
  '132207-33-1': [
    {
      name: 'Asbestos',
      reassignTo: '132207-33-1_ESdat',
    },
  ],
  '540-59-0(cis)': [
    {
      name: 'cis-1,2-dichloroethene',
      reassignTo: '156-59-2',
    },
  ],
  '540-59-0(trans)': [
    {
      name: 'trans-1,2-dichloroethene',
      reassignTo: '156-60-5',
    },
  ],
  '% Moisture': [
    {
      name: 'Moisture %',
      reassignTo: 'MOISTCONTENT',
    },
  ],
};
