// import { CfnUserPool } from 'aws-cdk-lib/aws-cognito';
import { Api, Cognito, Function, StackContext, Table } from 'sst/constructs';

import { getDomain } from './utils/constants';

// const EMAIL_SENDING_ADRESS = 'pierre@corrector.com';

enum Route {
  UserCreate = 'POST /userCreate',
  OrganizationsGet = 'GET /organizationsGet',
}

export const Core = ({
  stack,
  app,
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
  usersTable: Table;
} => {
  const usersTable = new Table(stack, 'user', {
    fields: {
      id: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
  });

  const preTokenGenerationTrigger = new Function(stack, 'PreTokenGeneration', {
    handler: 'packages/functions/src/core/functions/preTokenGeneration.handler',
  });
  preTokenGenerationTrigger.bind([usersTable]);

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
        selfSignUpEnabled: app.stage !== 'staging',
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
    customDomain:
      app.stage === 'local' ? undefined : `api.${getDomain(app.stage)}`,
    accessLog: {
      retention: 'one_week',
    },
    cors: {
      allowHeaders: ['content-type', 'authorization'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      allowOrigins: [
        app.stage === 'local'
          ? 'http://localhost:5173'
          : `https://${getDomain(app.stage)}`,
      ],
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
      [Route.UserCreate]: {
        function: {
          handler: 'packages/functions/src/core/functions/index.handler',
          environment: { USER_POOL_ID: auth.userPoolId },
          permissions: ['cognito-idp:AdminCreateUser'],
          bind: [usersTable, auth],
        },
      },
      [Route.OrganizationsGet]: {
        function: {
          handler: 'packages/functions/src/core/functions/index.handler',
          bind: [usersTable],
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
    usersTable,
  };
};
