import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { DraftDto, UpdateDraftDto } from '../dto/draft.dto';
import { Draft } from '../entities/draft/draft.entity';

@Injectable()
export class DraftService {
  constructor(
    @InjectRepository(Draft)
    private readonly drafts: Repository<Draft>,
  ) {}

  async findOne(id: number) {
    try {
      return await this.drafts.findOne({
        where: { id },
      });
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async findAllDraftUnStarted() {
    try {
      return await this.drafts.find({
        where: { tournament: { isPublic: false }, isPublic: true },
        relations: { owner: true },
        take: 25,
      });
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async create(user: User, draftDto: DraftDto): Promise<Draft> {
    try {
      const draft = this.drafts.create(draftDto);
      draft.owner = user;
      draft.ownerId = user.id;
      return await draft.save();
    } catch (e) {
      throw new ConflictException(
        { cause: new Error(), description: e },
        'Cannot insert draft',
      );
    }
  }

  async update(user: User, id: number, updateDraftDto: UpdateDraftDto) {
    try {
      const draft = await this.drafts.findOne({
        where: { id, ownerId: user.id },
      });
      Object.assign(draft, updateDraftDto);
      return await draft.save();
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  // async findAllDraftUser(user: User): Promise<Draft[]> {
  //   try {
  //     return await this.drafts.find({
  //       where: { ownerId: user.id },
  //     });
  //   } catch (e) {
  //     throw new NotFoundException(e);
  //   }
  // }

  async findDraft(draftId: number) {
    try {
      const draft = await this.drafts.findOne({
        where: { id: draftId },
      });
      if (!draft) throw new NotFoundException('no draft');
      return draft;
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async findAllDraftUser(ownerId: number): Promise<Draft[]> {
    try {
      return await this.drafts.find({
        where: { ownerId },
        order: { id: 'DESC' },
      });
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async updatePrivacy(id: number, isPublic: boolean) {
    try {
      const draft = await this.drafts.findOne({ where: { id } });
      draft.isPublic = isPublic;
      return await draft.save();
    } catch (e) {
      throw new NotFoundException(e);
    }
  }
}
