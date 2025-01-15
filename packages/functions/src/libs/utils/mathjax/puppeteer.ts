/* eslint-disable max-lines */
import { LiteElement } from 'mathjax-full/js/adaptors/lite/Element';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import puppeteer from 'puppeteer';
import sanitizeHtml from 'sanitize-html';

const LATEX_REGEX = /\$([^$]+)\$/g; // Inline math $...$
const BLOCK_LATEX_REGEX = /\$\$([^$]+)\$\$/g; // Block math $$...$$
const HTML_TAGS_REGEX = /<[^>]*>/g;

const HEADER_HEIGHT_IN_PX = 64;
const CONTENT_MARGIN_TOP_IN_PX = HEADER_HEIGHT_IN_PX + 16;
const FOOTER_HEIGHT_IN_PX = 56;
const FONT_FAMILY = 'font-family: Arial, sans-serif;';
const FONT_SIZE_IN_PX = '16px';

const PUPPETEER_ARGS = [
  '--disable-features=IsolateOrigins',
  '--disable-site-isolation-trials',
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];

type Statement =
  | {
      type: 'statement';
      text: string;
      numberOfLines: number;
    }
  | {
      type: 'question';
      text: string;
      index: number;
      numberOfLines: number;
    }
  | {
      type: 'problem';
      index: number;
    };

export const generatePdfWithPuppeteer = async (
  inputStatements: Statement[],
  // outputPath: string,
): Promise<Buffer> => {
  const innerHtml = inputStatements
    .map(statement => {
      if (statement.type === 'problem') {
        return `<h4 class="problem-title">Exercice ${statement.index}</h4>`;
      }
      const sanitizedInput = getSanitizedInputString(statement.text);
      const htmlString = getStringAsHtml(sanitizedInput);
      switch (statement.type) {
        case 'statement':
          return `<div class="statement">${htmlString}</div>`;
        case 'question': {
          const numberOfLines = statement.numberOfLines;
          let htmlLines = '';
          for (let i = 0; i < numberOfLines; i++) {
            htmlLines += '<div class="line"></div>';
          }

          return `<div class="statement">${statement.index}) ${htmlString}<div class="answer-container">${htmlLines}</div></div>`;
        }
      }

      return `<div>${htmlString}</div>`;
    })
    .join('');

  const browser = await puppeteer.launch({
    headless: true,
    args: PUPPETEER_ARGS,
  });
  const page = await browser.newPage();

  // Prepare HTML content
  const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                html {
                  -webkit-print-color-adjust: exact;
                }

                body {
                    font-family: ${FONT_FAMILY};
                    line-height: 1.6;
                    font-size: ${FONT_SIZE_IN_PX};
                    padding: 0px;
                }

                .inline-math { display: inline; }
                .block-math { display: block; text-align: center; }
                .statement { margin-bottom: 8px; page-break-inside: avoid; }

                .line {
                  height: 1rem;
                  box-sizing: border-box;
                  padding-top: 24px;
                  width: 100%;
                  position: relative;
                  border-bottom: solid 1px #f3f6f4;
                }
                
                .answer-container {
                  position: relative;
                  border: solid 1px black;
                  width: 100%;
                  box-sizing: border-box;
                  padding: 8px;
                }

                .problem-title { text-decoration: underline; margin-top: 32px; margin-bottom: 8px; }
            </style>
        </head>
        <body>
            ${innerHtml}
        </body>
        </html>
    `;

  // Load the sanitized and validated HTML into Puppeteer
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const headerTemplate = `
    <style>
      #header { padding: 0 !important; }
      .header {
          display: flex;
          align-items: center;
          height: ${HEADER_HEIGHT_IN_PX}px;
          box-sizing: border-box;
          padding-left: 32px; 
          margin: 0; 
          -webkit-print-color-adjust: exact; 
          background-color: ghostwhite; 
          width: 100%; 
          font-size: ${FONT_SIZE_IN_PX};
          font-family: ${FONT_FAMILY};
      }
      .header label {
          margin-right: 10px;
      }
      .header .box {
          width: 50px;
          height: 25px;
          border: 1px solid;
          display: inline-flex;
      }
    </style>
    <div class="header">
        <label for="identifiant-box">Identifiant :</label>
        <div class="box" id="identifiant-box"></div>
    </div>`;

  const footerTemplate = `
    <style>
      #footer { padding: 0 !important; }
      .footer {
          display: flex;
          align-items: center;
          justify-content: center;
          height: ${FOOTER_HEIGHT_IN_PX}px;
          box-sizing: border-box;
          margin: 0; 
          -webkit-print-color-adjust: exact; 
          width: 100%; 
          font-size: ${FONT_SIZE_IN_PX};
          font-family: ${FONT_FAMILY};
      }
    </style>
    <div 
      class="footer"
    >
      <div style="width: max-content; text-align: center;">
        Page <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    </div>`;

  // Generate PDF
  const pdfBuffer = await page.pdf({
    // path: outputPath,
    format: 'A4',
    displayHeaderFooter: true,
    headerTemplate,
    footerTemplate,
    printBackground: true,
    margin: {
      top: `${CONTENT_MARGIN_TOP_IN_PX}px`,
      bottom: `${FOOTER_HEIGHT_IN_PX}px`,
      right: '32px',
      left: '32px',
    },
  });

  await browser.close();

  return Buffer.from(pdfBuffer);
};

const getSanitizedInputString = (inputString: string) => {
  // Sanitize the input to remove any potential XSS/HTML injection
  const sanitizedInput = sanitizeHtml(inputString);

  if (HTML_TAGS_REGEX.test(sanitizedInput)) {
    throw new Error('HTML tags are not allowed in input.');
  }

  return sanitizedInput;
};

const getStringAsHtml = (inputString: string) => {
  // Set up MathJax with an adaptor
  const adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);

  const mathjaxInstance = mathjax.document('', {
    InputJax: new TeX({ packages: AllPackages }),
    OutputJax: new SVG(),
  });

  // Process LaTeX formulas: convert both inline and block formulas
  const processedString = inputString
    .replace(BLOCK_LATEX_REGEX, (_, tex) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      const node: LiteElement = mathjaxInstance.convert(tex, { display: true });

      return `<div class="block-math">${adaptor.innerHTML(node)}</div>`; // Render block math
    })
    .replace(LATEX_REGEX, (_, tex) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      const node: LiteElement = mathjaxInstance.convert(tex, {
        display: false,
      });

      return `<span class="inline-math">${adaptor.innerHTML(node)}</span>`; // Render inline math
    });

  return processedString;
};
