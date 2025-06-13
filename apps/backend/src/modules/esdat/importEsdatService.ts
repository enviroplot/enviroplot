import * as _ from 'lodash'
import readerHelper from './readerHelper.js'
import * as constants from './constants.js'
import { Readable } from 'node:stream'
let ExcelJS: any
async function getExcelJS() {
  if (!ExcelJS) {
    const mod = await import('exceljs/lib/exceljs.nodejs.js')
    ExcelJS = mod.default ?? mod
  }
  return ExcelJS
}
import unitsConverter from '../criteria/unitsConverter.js'
import extras from '../criteria/extras.js'


export default {
  readCSVFileNormalValues,
  readCSVSampleFile,
  readAndSetChemicalData,
}

async function readCSVFileNormalValues(
  sampleStream: Readable,
  chemistryStream: Readable,
  skip: boolean,
  assessmentType: any,
  seedData: any,
) {
  const result: any = await readCSVSampleFile(sampleStream)
  if (!result) return false
  await readAndSetChemicalData(chemistryStream, result, skip, assessmentType, seedData)
  return result
}

async function readCSVSampleFile(sampleStream: Readable) {
  const { Workbook } = await getExcelJS()
  const workbook = new Workbook()
  await workbook.csv.read(sampleStream)
  const ws = workbook.worksheets[0]
  const readResult: any = { samples: [] }
  ws.eachRow((wsRow: any, idx: number) => {
    if (idx <= 1) return
    const row: any[] = wsRow.values as any[]
    row.shift()
    const sampleType = row[7]
    const dpSampleId = row[2]
    const isException = constants.sampleFieldIdExceptions.includes(dpSampleId)
    if (!(sampleType === 'Normal' && !isException)) return
    const sample: any = {}
    sample.labSampleId = row[0]
    sample.sampleId = dpSampleId
    sample.dateSampled = readerHelper.parseDateTime(row[3])
    const depthDataString = row[4]
    const depthData = readerHelper.parseDepthData(depthDataString)
    sample.depth = depthData.depth
    sample.matrixType = _.isString(row[6]) ? _.capitalize(row[6]) : null
    sample.sampleType = 'Normal'
    sample.labName = row[11]
    readResult.samples.push(sample)
  })
  return readResult
}

async function readAndSetChemicalData(
  chemistryStream: Readable,
  result: any,
  skip: boolean,
  assessmentType: any,
  seedData: any,
) {
  const { Workbook } = await getExcelJS()
  const workbook = new Workbook()
  await workbook.csv.read(chemistryStream)
  const ws = workbook.worksheets[0]
  ws.eachRow((wsRow: any, idx: number) => {
    if (idx <= 1) return
    const row: any[] = wsRow.values as any[]
    row.shift()
    const dpSampleId = row[2]
    const sample = result.samples.find((s: any) => s.sampleId === dpSampleId)
    if (!sample) return
    const chem = row[9]
    const rawValue = row[10]
    if (rawValue === '' || rawValue === null) return
    const val = parseFloat(rawValue)
    if (Number.isNaN(val)) return
    const units = row[11]
    const converted = unitsConverter.convertMeasurementValue(
      { value: val, units },
      units,
    )
    if (!sample.measurements) sample.measurements = []
    sample.measurements.push({
      chemical: chem,
      value: converted.value,
      units: converted.units,
    })
  })
  extras.calculateCalculatedChemicals(result.samples)
}
