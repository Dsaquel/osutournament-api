import { Injectable } from '@nestjs/common';
import { OsuService } from 'src/osu/osu.service';

@Injectable()
export class AuthService {
  constructor(private osuService: OsuService) {}

  async validateUser(code: string) {
    return await this.osuService.verifUser(code);
  }
}
