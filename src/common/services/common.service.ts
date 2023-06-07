import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from '../entities/credential.entity';
import axios from 'axios';

@Injectable()
export class CommonService {
  @Inject(ConfigService)
  private readonly config: ConfigService;
  constructor(
    @InjectRepository(Credential)
    private readonly credentials: Repository<Credential>,
  ) {}
  async createOrUpdateCredential(params: {
    token: string;
    refreshToken: string;
  }) {
    await this.credentials.save(Object.assign({ id: 1 }, params));
  }

  async getCredentials(): Promise<{ token: string; refreshToken: string }> {
    return await this.credentials.findOne({
      where: { id: 1 },
    });
  }

  async refreshCredentials(access_token: string, refresh_token: string) {
    try {
      const refreshToken = await axios.post(
        `${this.config.get<string>('OSU_BASE_API')}/oauth/token`,
        {
          client_id: this.config.get<string>('CLIENT_ID'),
          client_secret: this.config.get<string>('CLIENT_SECRET'),
          access_token,
          refresh_token,
          grant_type: 'refresh_token',
          scope: 'public',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      const params = {
        token: refreshToken.data?.access_token,
        refreshToken: refreshToken.data?.refresh_token,
      };
      await this.createOrUpdateCredential(params);
    } catch (e) {
      throw e;
    }
  }
}
