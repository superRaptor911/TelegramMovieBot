import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(
  '1KtvXkeYOV2UM6zwKwvxHQzdUU019PyX0dZAunsohrYs',
);

let sheet: GoogleSpreadsheetWorksheet | null = null;

async function getSheet(): Promise<GoogleSpreadsheetWorksheet> {
  if (sheet) {
    return sheet;
  }

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });
  await doc.loadInfo();
  sheet = doc.sheetsByIndex[0];
  return sheet;
}

export async function writeUsageToSheet(
  name: string,
  search: string,
): Promise<void> {
  try {
    const sheet = await getSheet();
    await sheet.addRow({
      name: name,
      search: search,
    });
  } catch (e) {
    console.error('test::writeUsageToSheet', e);
  }
}
