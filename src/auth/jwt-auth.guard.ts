import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../helper/decorators/public-access.decorator';
import { Observable } from 'rxjs';
import { OPTIONAL_AUTH } from '../helper/decorators/optional-auth-guard.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY,
      context.getHandler()
    );
    
    if(isPublic){ return true }
    
    const request = context.switchToHttp().getRequest();

    const authIsOptional = this.reflector.getAllAndOverride<boolean>(OPTIONAL_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Check for presence of authorization header
    if (!request.headers.authorization && authIsOptional) {
      return true; // Allow access if no authorization header is present (optional)
    }
    return super.canActivate(context);
  }
}
