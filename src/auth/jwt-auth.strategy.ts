import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from '../database/database.service';
import Config from '../helper/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly databaseService: DatabaseService) {
    const jwtClientSecret = Config.jwt.clientSecret();
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
      secretOrKey: jwtClientSecret,
    });
  }

  private static extractJWT(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }

  async validate(payload: { id: string; email: string }) {
    const user = await this.databaseService.user.findUnique({
      where: {
        id: payload.id,
        email: payload.email,
        deletedAt: null
      },
    });

    if (!user) {
      throw new ForbiddenException();
    }

    return { id: user.id, email: user.email };
  }
}
