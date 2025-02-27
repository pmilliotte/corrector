import { userPool, userPoolClient } from './auth';
import {
  examBucket,
  examTable,
  openAiApiKey,
  openAiProjectId,
  organizationTable,
} from './storage';

enum Route {
  MainGet = 'GET /{proxy+}',
  MainPost = 'POST /{proxy+}',
  ExamGeneratePdf = 'POST /examGeneratePdf',
  ClassroomExamGeneratePdf = 'POST /classroomExamGeneratePdf',
  ExamConfigureProblems = 'POST /examConfigureProblems',
  ExamAnswersSplit = 'POST /examAnswersSplit',
  PdfSplitToImages = 'POST /pdfSplitToImages',
}

export const api = new sst.aws.ApiGatewayV2('api', {
  accessLog: {
    retention: '1 week',
  },
  cors: {
    allowHeaders: ['content-type', 'authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
  },
  link: [organizationTable, examTable, examBucket],
});
const jwtAuthorizer = api.addAuthorizer({
  name: 'cognitoAuthorizer',
  jwt: {
    issuer: $interpolate`https://cognito-idp.${aws.getRegionOutput().name}.amazonaws.com/${userPool.id}`,
    audiences: [userPoolClient.id],
  },
});

const resources = [
  organizationTable,
  examBucket,
  examTable,
  openAiApiKey,
  openAiProjectId,
];

const main = new sst.aws.Function('main', {
  handler: 'packages/functions/src/handlers/main.handler',
  link: resources,
  architecture: 'arm64',
});
api.route(Route.MainGet, main.arn, {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});
api.route(Route.MainPost, main.arn, {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});

const aiInterfaceFunction = new sst.aws.Function('ai-interface', {
  handler: 'packages/functions/src/handlers/aiInterface.handler',
  link: resources,
  timeout: '2 minutes',
  architecture: 'arm64',
});
api.route(Route.ExamConfigureProblems, aiInterfaceFunction.arn, {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});
api.route(Route.ExamAnswersSplit, aiInterfaceFunction.arn, {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});

const generatePdf = new sst.aws.Function('generate-pdf', {
  handler: 'packages/functions/src/handlers/generatePdf.handler',
  link: resources,
  memory: '10240 MB',
  architecture: 'x86_64',
  nodejs: {
    install: ['@sparticuz/chromium'],
  },
});
api.route(Route.ExamGeneratePdf, generatePdf.arn, {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});
api.route(Route.ClassroomExamGeneratePdf, generatePdf.arn, {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});

// const graphicsmagickLayer = new LayerVersion('graphicsmagick-layer', {
//   layerName: 'arn:aws:lambda:eu-west-1:175033217214:layer:graphicsmagick:2',
// });
// const ghostscriptLayer = new LayerVersion('ghostscript-layer', {
//   layerName: 'arn:aws:lambda:eu-west-1:764866452798:layer:ghostscript:15',
// });
const GM_PATH = $dev ? '/opt/homebrew/Cellar/graphicsmagick/1.3.45_1/bin/' : '';
const pdfSplitToImages = new sst.aws.Function('pdf-split-to-images', {
  handler: 'packages/functions/src/handlers/pdfSplitToImages.handler',
  link: resources,
  timeout: '3 minutes',
  architecture: 'x86_64',
  environment: {
    GM_PATH,
  },
  layers: [
    'arn:aws:lambda:eu-west-1:175033217214:layer:graphicsmagick:2',
    'arn:aws:lambda:eu-west-1:764866452798:layer:ghostscript:15',
  ],
});
api.route(Route.PdfSplitToImages, pdfSplitToImages.arn, {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});
