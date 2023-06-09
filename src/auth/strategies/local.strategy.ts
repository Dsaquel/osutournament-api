import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'code',
      passwordField: 'code',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, code: string, headers: Headers) {
    const user = await this.authService.validateUser(code);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
