import generateReportFromSession from './generateReportFromSession';

async function run() {
  let getReportLocation = (reportName: string) => {
    return `./local/${reportName}.XLSX`;
  };

  let getSessionLocation = (sessionFileName: string) => {
    return `./local/sessions/${sessionFileName}.erd`;
  };

  try {
    await generateReportFromSession.generate(getSessionLocation('soil2'), getReportLocation('report_soil'));
    console.log('Done for soil!');
    await generateReportFromSession.generate(getSessionLocation('waste2'), getReportLocation('report_waste'));
    console.log('Done for waste!');
    await generateReportFromSession.generate(getSessionLocation('gw2'), getReportLocation('report_gw'));
    console.log('Done for groundwater!');
    await generateReportFromSession.generate(
      getSessionLocation('_gw2'),
      getReportLocation('report_gwT'),
      ReportOutputFormat.TRANSPOSED_OUTPUT_FORMAT
    );
    console.log('Done for groundwater transposed!');
  } catch (err) {
    console.log('Error on generation report items');
    console.log(err);
  }

  console.log('Done for all!');
}

run();
