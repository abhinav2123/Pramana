import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertHtmlToPdf() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Load the HTML file
    const htmlPath = path.join(__dirname, 'EHR_User_Documentation.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    await page.pdf({
        path: 'EHR_User_Documentation.pdf',
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
        }
    });
    
    console.log('PDF generated successfully: EHR_User_Documentation.pdf');
    await browser.close();
}

convertHtmlToPdf().catch(console.error); 