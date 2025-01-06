import { Api, Cognito, Function, StackContext, Table } from 'sst/constructs';

import {
  LSI1,
  LSI1_SK,
  PARTITION_KEY,
  SORT_KEY,
} from '@corrector/backend-shared';

enum Route {
  OrganizationList = 'GET /organizationList',
  ClassroomList = 'GET /classroomList',
  ClassroomCreate = 'POST /classroomCreate',
}

export const Core = ({
  stack,
}: StackContext): {
  api: Api<{
    jwt: {
      type: 'user_pool';
      userPool: {
        id: string;
        clientIds: string[];
      };
    };
  }>;
  auth: Cognito;
  organizationTable: Table;
} => {
  const organizationTable = new Table(stack, 'organization-table', {
    fields: {
      [PARTITION_KEY]: 'string',
      [SORT_KEY]: 'string',
      [LSI1_SK]: 'string',
    },
    primaryIndex: { partitionKey: PARTITION_KEY, sortKey: SORT_KEY },
    localIndexes: {
      [LSI1]: { sortKey: LSI1_SK },
    },
  });

  const preTokenGenerationTrigger = new Function(stack, 'PreTokenGeneration', {
    handler: 'packages/functions/src/core/functions/preTokenGeneration.handler',
  });
  preTokenGenerationTrigger.bind([organizationTable]);

  const auth = new Cognito(stack, 'users', {
    login: ['email'],
    triggers: { preTokenGeneration: preTokenGenerationTrigger },
    cdk: {
      userPool: {
        standardAttributes: {
          familyName: { required: true, mutable: true },
          givenName: { required: true, mutable: true },
          email: { required: true, mutable: false },
        },
        userInvitation: {
          emailSubject: 'Bienvenue sur corrector !',
          emailBody: `Hello {username},<br/><br/>
          Tu peux désormais te connecter sur https://app.corrector.fr avec ton adresse email et le mot de passe suivant : {####}<br/><br/>
          Tu trouveras une vidéo explicative de l'application sur https://corrector.fr.<br/><br/>
          Cet accès gratuit est temporaire, n'hésite pas à me faire rapidement des retours sur ce qu'on peut améliorer !<br/><br/>
          Bonnes révisions !`,
        },
        userVerification: {
          emailSubject: 'Pour confirmer ton inscription...',
          emailBody: `Bienvenue sur corrector !<br/><br/>
          Tu peux confirmer ton inscription sur https://app.corrector.fr/login?state=confirmSignup avec ton adresse email et le code de vérification suivant : {####}<br/><br/>
          Tu trouveras une vidéo explicative de l'application sur https://corrector.fr.<br/><br/>
          Cet accès gratuit est temporaire, n'hésite pas à me faire rapidement des retours sur ce qu'on peut améliorer !<br/><br/>
          Bonnes révisions !`,
        },
      },
    },
  });

  // const userPoolCfn = auth.cdk.userPool.node.defaultChild as CfnUserPool;
  // userPoolCfn.emailConfiguration = {
  //   sourceArn: `arn:aws:ses:${stack.region}:${stack.account}:identity/${EMAIL_SENDING_ADRESS}`,
  // };

  const api = new Api(stack, 'api', {
    // customDomain:
    //   app.stage === 'local' ? undefined : `api.${getDomain(app.stage)}`,
    accessLog: {
      retention: 'one_week',
    },
    cors: {
      allowHeaders: ['content-type', 'authorization'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      // allowOrigins: [
      //   app.stage === 'local'
      //     ? 'http://localhost:5173'
      //     : `https://${getDomain(app.stage)}`,
      // ],
    },
    authorizers: {
      jwt: {
        type: 'user_pool',
        userPool: {
          id: auth.userPoolId,
          clientIds: [auth.userPoolClientId],
        },
      },
    },
    defaults: {
      authorizer: 'jwt',
    },
    routes: {
      [Route.OrganizationList]: {
        function: {
          handler: 'packages/functions/src/core/functions/index.handler',
          bind: [organizationTable],
        },
      },
      [Route.ClassroomList]: {
        function: {
          handler: 'packages/functions/src/core/functions/index.handler',
          bind: [organizationTable],
        },
      },
      [Route.ClassroomCreate]: {
        function: {
          handler: 'packages/functions/src/core/functions/index.handler',
          bind: [organizationTable],
        },
      },
    },
  });

  auth.attachPermissionsForAuthUsers(stack, [api]);

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl ?? api.url,
    UserPoolId: auth.userPoolId,
    IdentityPoolId: auth.cognitoIdentityPoolId,
    UserPoolClientId: auth.userPoolClientId,
  });

  return {
    api,
    auth,
    organizationTable,
  };
};
