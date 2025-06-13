jest.mock('@supabase/supabase-js', () => {
  const fs = require('node:fs')
  const { Readable } = require('node:stream')
  return {
    createClient: () => ({
      storage: {
        from: () => ({
          download: async (key: string) => ({
            data: Readable.from(
              fs.readFileSync(__dirname + '/fixtures/' + key.split('/').pop()!)
            ),
            error: null,
          }),
        }),
      },
    }),
  }
})

jest.mock('exceljs/lib/exceljs.nodejs.js', () => {
  class Workbook {
    worksheets: any[] = [
      { eachRow: (_cb: any) => {} },
    ]
    csv = { read: async (_s: any) => {} }
  }
  return { Workbook }
})

import { parseEsdatBundle } from '../../modules/esdat/index.js'

describe('parseEsdatBundle', () => {
  it('parses fixture bundle', async () => {
    const results = await parseEsdatBundle({
      sampleKey: '2024-01/sample.csv',
      chemistryKey: '2024-01/chemistry.csv',
      headerKey: '2024-01/header.xml'
    })
    expect(results.samples).toBeDefined()
  })
})
