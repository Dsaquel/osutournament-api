import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { OsuService } from './osu.service';
import { Credential } from '../common/entities/credential.entity';
import { CommonModule } from 'src/common/common.module';
import { BeatmapController } from './beatmap.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Credential]), UserModule, CommonModule],
  controllers: [BeatmapController],
  providers: [OsuService],
  exports: [OsuService],
})
export class OsuModule {}
