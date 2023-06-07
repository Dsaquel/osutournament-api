import { Controller, Get, Post, Param } from '@nestjs/common';
import { OsuService } from './osu.service';

@Controller('beatmap')
export class BeatmapController {
  constructor(private readonly osuService: OsuService) {}

  @Get(':id')
  async findWinner(@Param('id') id: string) {
    return await this.osuService.getBeatmap(+id);
  }
}
