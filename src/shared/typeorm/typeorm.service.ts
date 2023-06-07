import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  @Inject(ConfigService)
  private readonly config: ConfigService;
  public createTypeOrmOptions(): TypeOrmModuleOptions {
    console.log(this.config.get<string>('NODE_ENV') !== 'production')
    return {
      type: 'postgres',
      // dont break url line
      url: `postgres://${this.config.get<string>('DATABASE_USER')}:${this.config.get<string>('DATABASE_PASSWORD')}@${this.config.get<string>('DATABASE_HOST')}:${this.config.get<number>('DATABASE_PORT')}/${this.config.get<string>('DATABASE_NAME')}?connect_timeout=10`,
      entities: ['dist/**/*.entity.{ts,js}'],
      migrations: ['dist/migrations/*.{ts,js}'],
      subscribers: ['dist/**/*.subscriber.{ts,js}'],
      logging: true,
      synchronize: this.config.get<string>('NODE_ENV') !== 'production',
      migrationsRun: true
    };
  }
}
