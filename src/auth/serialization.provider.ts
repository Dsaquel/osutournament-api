import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }
  serializeUser(user: User, done: (err: Error, user: any) => void): any {
    done(null, { id: user.id, osuId: user.osuId });
  }

  async deserializeUser(
    payload: { id: number; osuId: number },
    done: (err: Error, payload: any) => void,
  ): Promise<any> {
    const user = await this.userService.findCurrent(payload.id, payload.osuId);
    done(null, user);
  }
}
