/* eslint-disable max-lines */
import chromium from '@sparticuz/chromium';
import { LiteElement } from 'mathjax-full/js/adaptors/lite/Element';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import puppeteer from 'puppeteer-core';
import sanitizeHtml from 'sanitize-html';

const LATEX_REGEX = /\$([^$]+)\$/g; // Inline math $...$
const BLOCK_LATEX_REGEX = /\$\$([^$]+)\$\$/g; // Block math $$...$$
const HTML_TAGS_REGEX = /<[^>]*>/g;

const HEADER_HEIGHT_IN_PX = 80;
const CONTENT_MARGIN_TOP_IN_PX = HEADER_HEIGHT_IN_PX + 16;
const FOOTER_HEIGHT_IN_PX = 56;
const FONT_FAMILY = 'Arial, sans-serif';
const FONT_SIZE_IN_PX = '16px';
const LINE_CONTAINER_HEIGHT_IN_PX = 20;

type Statement =
  | {
      type: 'statement';
      text: string;
    }
  | {
      type: 'question';
      text: string;
      index: number;
      numberOfLines: number;
    };

export const generatePdfWithPuppeteer = async (
  {
    problems,
    mark,
    src,
    examName,
    schoolPseudo,
    firstName,
    lastName,
    executablePath,
  }: {
    problems: { content: Statement[] }[];
    mark: number;
    src: string;
    examName: string;
    schoolPseudo: string;
    firstName: string;
    lastName: string;
    executablePath: string;
  },
  // outputPath: string,
): Promise<Buffer> => {
  const innerHtml = problems
    .map(
      (problem, index) =>
        `
<div class="problem">
  <h4 class="title">Exercice ${index + 1}</h4>
  ${problem.content
    .map(statement => {
      const sanitizedInput = getSanitizedInputString(statement.text);
      const htmlString = getStringAsHtml(sanitizedInput);
      switch (statement.type) {
        case 'statement':
          return `<div class="text statement">${htmlString}</div>`;
        case 'question': {
          const numberOfLines = statement.numberOfLines;
          let htmlLines = '';
          for (let i = 0; i < numberOfLines; i++) {
            htmlLines += `<div class="line-container">
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
              <div style="height: calc(${LINE_CONTAINER_HEIGHT_IN_PX}px / 4 - 1px)"></div>
            </div>`;
          }

          return `<div class="statement">
            <div class="text">${statement.index}) ${htmlString}</div>
            <div class="answer-container">
              ${htmlLines}
              <div class="line"></div>
            </div>
          </div>`;
        }
      }

      return `<div>${htmlString}</div>`;
    })
    .join('')}
</div>`,
    )
    .join('');

  // npx @puppeteer/browsers install chromium@latest --path /tmp/localChromium à la racine
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
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
                .text { padding: 2px 0; }
                .title { text-decoration: underline; margin-bottom: 16px; }

                .line {
                  box-sizing: border-box;
                  border-bottom: 1px solid #f5f5f5;
                  height: calc(${LINE_CONTAINER_HEIGHT_IN_PX}px / 4)
                }
                .line-container {
                  box-sizing: border-box;
                  border-bottom: 1px solid #bebebe;
                  height: ${LINE_CONTAINER_HEIGHT_IN_PX}px;
                }
                
                .answer-container {
                  position: relative;
                  border: solid 1px black;
                  width: 100%;
                  box-sizing: border-box;
                  padding: 8px 8px 4px;
                }

                .problem { margin-bottom: 8px; }
                .problem:not(:first-child) { margin-top: 32px; }
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
        justify-content: space-between;
        height: ${HEADER_HEIGHT_IN_PX}px;
        box-sizing: border-box;
        padding: 0 32px; 
        margin: 0; 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact;
        border-bottom: 1px solid;
        width: 100%; 
        font-size: ${FONT_SIZE_IN_PX};
        font-family: ${FONT_FAMILY};
    }
    .left-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .right-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .name {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        text-align: end;
    }
    .qr-code {
        height: 48px;
        width: 48px;
        border: 1px solid;
        box-sizing: border-box;
        padding: 1px;
        content: url("${src}");
    }
    .mark {
        height: 48px;
        width: 96px;
        box-sizing: border-box;
        border: 1px solid;
        text-align: end;
        display: flex;
        align-items: end;
        justify-content: flex-end;
        padding: 8px;
    }
  </style>
  <div class="header">
    <div class="left-content">
      <div class="qr-code"></div>
      <div class="exam">
        <div>${schoolPseudo}</div>
        <div>${examName}</div>
      </div>
    </div>
    <div class="right-content">
      <div class="name">
        <div>${firstName}</div>
        <div>${lastName}</div>
      </div>
      <div class="mark">
        <div>/ ${mark}</div>
      </div>
    </div>
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
