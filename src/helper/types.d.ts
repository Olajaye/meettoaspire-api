declare namespace Express {
  export interface Request {
    user?: any;
    admin_user?: { sub: number; email: string };
  }
  export interface Response {
    user: any;
  }
}
