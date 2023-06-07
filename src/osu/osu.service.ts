import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CommonService } from 'src/common/services/common.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OsuService {
  @Inject(ConfigService)
  private readonly config: ConfigService;
  constructor(
    private readonly userService: UserService,
    private readonly commonService: CommonService,
  ) {}
  async verifUser(code: string): Promise<User> {
    try {
      const res = await axios.post(
        `${this.config.get<string>('OSU_BASE_API')}/oauth/token`,
        {
          code,
          client_id: this.config.get<string>('CLIENT_ID'),
          client_secret: this.config.get<string>('CLIENT_SECRET'),
          redirect_uri: this.config.get<string>('REDIRECT_URI'),
          grant_type: this.config.get<string>('GRANT_TYPE'),
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      return this.getUser({
        token: res?.data?.access_token,
        refreshToken: res?.data?.refresh_token,
      });
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
  async getUser(params: {
    token: string;
    refreshToken: string;
  }): Promise<User> {
    try {
      // update or create token & refreshToken
      await this.commonService.createOrUpdateCredential(params);
      const getUser = await axios.get(
        `${this.config.get<string>('OSU_BASE_API')}/api/v2/me/osu`,
        {
          headers: {
            Authorization: 'Bearer ' + params.token,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      const payload = {
        osuId: getUser?.data?.id,
        avatarUrl: getUser?.data?.avatar_url,
        rank: getUser?.data?.statistics?.global_rank,
        username: getUser?.data?.username,
        discord: getUser?.data?.discord,
      };
      return await this.userService.createOrUpdateUser(payload);
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async getScores(match: number, isRetry: boolean = false) {
    // require token in db
    const { token, refreshToken } = await this.commonService.getCredentials();
    try {
      const call = await axios.get(
        `${this.config.get<string>('OSU_BASE_API')}/api/v2/matches/${match}`,
        {
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      return call?.data?.events;
    } catch (e) {
      try {
        if (isRetry) return e;
        console.log('retry');
        await this.commonService.refreshCredentials(token, refreshToken);
        return await this.getScores(match, true);
      } catch (ee) {
        return ee;
      }
    }
  }

  async getBeatmap(beatmapId: number, isRetry: boolean = false) {
    const { token, refreshToken } = await this.commonService.getCredentials();
    try {
      const call = await axios.get(
        `${this.config.get<string>(
          'OSU_BASE_API',
        )}/api/v2/beatmaps/${beatmapId}`,
        {
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      return call?.data;
    } catch (e) {
      try {
        if (isRetry) return e;
        console.log('retry');
        await this.commonService.refreshCredentials(token, refreshToken);
        return await this.getBeatmap(beatmapId, true);
      } catch (ee) {
        return ee;
      }
    }
  }
}
