import Utils from './utils';
import SMTPConnection from 'nodemailer/lib/smtp-connection';

const Config = {
  mail: () =>
    <SMTPConnection.Options>{
      host: Utils.env('MAIL_HOST'),
      port: Number(Utils.env('MAIL_PORT')),
      auth: {
        user: Utils.env('MAIL_USERNAME'),
        pass: Utils.env('MAIL_PASSWORD'),
      },
  },
  api: {
    version: () => Utils.env('API_VERSION', '1'),
  },
  app: {
    env: () => Utils.env('APP_ENV', 'local'),
    port: () => Utils.env('PORT') ?? 3500,
    name: () => Utils.env('APP_NAME', 'Meet to Aspire'),
    description: Utils.env(
      'APP_DESCRIPTION',
      'An all-in-one online',
    ),
    url: () => Utils.env('APP_URL'),
    mailFromAddress: () => Utils.env('MAIL_FROM_ADDRESS'),
    customerAppDomain: () =>
      Utils.isProductionEnv() ? 'www.meettoaspire.com' : 'meettoaspire.vercel.app',
  },
  database: {
    url: () => Utils.env('DATABASE_URL'),
  },
  jwt: {
    clientSecret: () => Utils.env('JWT_CLIENT_SECRET', '-'),
    expiresIn: () => Utils.env('JWT_EXPIRES_IN') ?? '1h',
  },
  verification: {
    TTL: 1440, // Email verification token Time-To-Live in minutes
  },
  // google: {
  //   clientId: () => Utils.env('GOOGLE_CLIENT_ID', '-'),
  //   clientSecret: () => Utils.env('GOOGLE_CLIENT_SECRET', ''),
  //   callbackUrl: () => Config.app.url() + '/v1/auth/google/redirect',
  // },
  firebase: () => ({
    type: Utils.env('FIREBASE_TYPE'),
    project_id: Utils.env('FIREBASE_PROJECT_ID'),
    private_key_id: Utils.env('FIREBASE_PRIVATE_KEY_ID'),
    private_key: Utils.env('FIREBASE_PRIVATE_KEY'),
    client_email: Utils.env('FIREBASE_CLIENT_EMAIL'),
    client_id: Utils.env('FIREBASE_CLIENT_ID'),
    auth_uri: Utils.env('FIREBASE_AUTH_URL'),
    token_uri: Utils.env('FIREBASE_TOKEN_URL'),
    auth_provider_x509_cert_url: Utils.env('FIREBASE_AUTH_PROVIDER_CERT_URL'),
    client_x509_cert_url: Utils.env('FIREBASE_CLIENT_CERT_URL'),
    universe_domain: Utils.env('FIREBASE_UNIVERSAL_DOMAIN'),
  }),
  // redis: {
  //   host: () => Utils.env('REDIS_HOST', 'localhost'),
  //   port: () => parseInt(Utils.env('REDIS_PORT') ?? '6379'),
  //   password: () => Utils.env('REDIS_PASSWORD'),
  //   tls: () => Utils.env('REDIS_TLS'),
  // },
  // mono: {
  //   baseurl: () => Utils.env('MONO_BASE_URL', 'https://api.withmono.com/v2'),
  //   baseurlV3: () =>
  //     Utils.env('MONO_BASE_URL_V3', 'https://api.withmono.com/v3'),
  //   publicKey: () =>
  //     Utils.env('MONO_PUBLIC_KEY', 'test_pk_t4rnxtv04yuegis7rcf0'),
  //   secretKey: () =>
  //     Utils.env('MONO_SECRET_KEY', 'test_sk_ox030g8vc48of8la76wi'),
  //   lookup: {
  //     publicKey: () =>
  //       Utils.env('MONO_LOOKUP_PUBLIC_KEY', 'test_pk_trmi1u88kwwygexcsi50'),
  //     secretKey: () =>
  //       Utils.env('MONO_LOOKUP_SECRET_KEY', 'test_sk_i7llfmsin9hftq4kivd1'),
  //   },
  // },
};

export default Config;
