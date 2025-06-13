import generateReportFromSession from './generateReportFromSession';

async function run() {
  let appSessionFilePath = './local/sessions/current.erd';
  try {
    await generateReportFromSession.generate(appSessionFilePath);
  } catch (err) {
    console.log('Error on generation report items');
    console.log(err);
  }

  console.log(`Done for ${appSessionFilePath}!`);
}

run();
