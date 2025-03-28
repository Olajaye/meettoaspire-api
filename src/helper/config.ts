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
    type: 'service_account',
    project_id: 'eyrienobra',
    private_key_id: "4d2d045865835f86f7b671872191fb3637fb1a84",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDryyi7RghHqeSf\nF+nA6yJIJrGfJ+R/qjxsxBMvQ8UYxkswj5akRQH+kq+/ndNWH/Ruq6X2n638uzuB\nzrXvEbnIHY+gN+9awIbOPCKelPn5v5ZYnSJfg4GHYTTmdkEu6MHDnT7rrQ0L5nVm\nB0bv2oacx+YNq2MXHWv2F2w7WLgdj+KSjRrAODbxrz8p6ftTRIbZYXOxYTbR+XLf\nRrT2IESAs/6/DoNnf/QZTnRch6vfofVv80rHkQVggaufy75YuWWTZT05uDVa/DXA\nzTx7XQEVSA5loXgHIrikdRK0ugeO1Gh6wCjtSWsJmleTdpi3czvI/2u4vnMsIjJg\nZH+fllzBAgMBAAECggEAQt1XHRgkc/IFD2pwEpF7JLu4RdpBrURAo1VM3WvZ4gcl\nPk2Rmd6pzJ+bL/rY+cTRA2swgonQhGkx3EMai4NazBk55+TEvtb2w1gBNzgm1QBT\n6agRncVEf3f80Ne670r423hlZd6qYvQE2Zx5rL2qy53SKpEt5dmlimElA4VKnLLr\n1A8qXQtG6pCHnm3fNUK2RwPtsGEOlPdtEM8n4AXSEyuTOiPwZib8N8eYwJKA9jZM\nuixnjJ2ki6SzrSHHvbPSoNGvpiyVEC3LP7QJ4HwZ10PLsZut9eEFUe/EiikHgix5\nPrqMpVaqUycS0ox0ANoEAY/Qo5rYoULSNug/j+HXiwKBgQD9VdrL/udga92EE1vg\nA4LZL6gY2DP1vWmRR7ehrGsS/fVN1+WrY+uB+gJR/H6BlN6EpNEBAiuyAzGnk0Fm\n/F7kJh5LyA1I0GeRAruWQdnuNB4fGnQUsxsmDT3nT34oGtAIOayEDA3zxX5INwBE\nAT5ufdswunlrC6gD7Wv9VTXJ8wKBgQDuRhIH1sZxILLE5z7J7zPNlU6I0WI4JZ9G\nNSsg/dNxGIuKDgJpRrFf+h8XAGnmLA439WL+J0OTKn5UX3ICdZMU3WFGOwa5QrZD\nIGPuxRt7W3Zp5g6uyVSGAgSkuBNGnh7RbRjqKY2fx9VsLMbL39c3kqZMH5rsCc+y\nTKuKwOCXewKBgQDeGBmUQ+m2x3nRI2OldY6ON1CIT2rmImNdgWFEtLK+WLRoxUDN\nS/EY5wSHufNySP/3i8LLvopuKoyqm9d3oQLTw3NF/qFe144kPCAWr66OPVS28esY\nhpjjeDJwCmnQYQlGXMGYljTZJKf8SXPLKsf/+AhkpOZzaSmoH8pPsxdP7wKBgQCd\nmsGQZ9Lovz0gGukgPtVgFXNV8lFqXBBHKyH094/lTdv2nB+iLP1kQ5hO6Zoigl+B\nShGJlMUQ0dmvy1YpJEX+VhRilOZ0ohjWu9T9+WidJrljgKWTnV4IKcuSfKNbYXl3\nAxeow4WG+3JC1DdGYTAE9T6EOZ+Ko067XBVXeQ7VgwKBgDWvcRm5noY2wnaLVjmj\nj2upLeWbDMXHOmfR5aBq16i8HoFUxtGnL2Lsz8YeGhIJYxDISzNq4AAJ2IV/acSN\n+4MAeulOmwe+17cjcjeqTCUg7vBokcW7ln1lx6ympUwwXYHaO9xGlTfkWVaC/Rmk\nG/Tpuh90is0K/sDZqt8WpUH8\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-50a2v@eyrienobra.iam.gserviceaccount.com",
    client_id:"112457282973872521151",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-50a2v%40eyrienobra.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  }),
  redis: {
    host: () => Utils.env('REDIS_HOST', 'localhost'),
    port: () => parseInt(Utils.env('REDIS_PORT') ?? '6379'),
    password: () => Utils.env('REDIS_PASSWORD'),
    tls: () => Utils.env('REDIS_TLS'),
  },
  mono: {
    baseurl: () => Utils.env('MONO_BASE_URL', 'https://api.withmono.com/v2'),
    baseurlV3: () =>
      Utils.env('MONO_BASE_URL_V3', 'https://api.withmono.com/v3'),
    publicKey: () =>
      Utils.env('MONO_PUBLIC_KEY', 'test_pk_t4rnxtv04yuegis7rcf0'),
    secretKey: () =>
      Utils.env('MONO_SECRET_KEY', 'test_sk_ox030g8vc48of8la76wi'),
    lookup: {
      publicKey: () =>
        Utils.env('MONO_LOOKUP_PUBLIC_KEY', 'test_pk_trmi1u88kwwygexcsi50'),
      secretKey: () =>
        Utils.env('MONO_LOOKUP_SECRET_KEY', 'test_sk_i7llfmsin9hftq4kivd1'),
    },
  },
};

export default Config;
