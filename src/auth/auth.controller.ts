import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/auth.guard';
import { LoggedInGuard } from './guards/logged-in.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  addUser(@Body() code: string, @Session() session: Record<string, any>) {
    return { message: 'successfully login' };
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    return req.session.destroy((err) => {
      if (err) {
        req.session = null;
      }
      res.end();
    });
  }
}
