import { Injectable, NotFoundException } from '@nestjs/common';
import { RotationsRepository } from './rotations.repository';
import {
  CreateRotationRequest,
  CreateRotationResponse,
  UpdateRotationRequest,
} from './dto/create-rotation.dto';
import { RotationId } from './entities/rotation.entity';

@Injectable()
export class RotationsService {
  constructor(private readonly rotationsRepository: RotationsRepository) {}

  async create(
    request: CreateRotationRequest,
  ): Promise<CreateRotationResponse> {
    const created = await this.rotationsRepository.create(request);
    return { ...created, id: created.id as RotationId };
  }

  async getAll(): Promise<CreateRotationResponse[]> {
    const rotations = await this.rotationsRepository.findAll();
    return rotations.map((rotation) => ({
      ...rotation,
      id: rotation.id as RotationId,
    }));
  }

  async getOneById(id: RotationId): Promise<CreateRotationResponse> {
    const rotation = await this.rotationsRepository.findOneById(id);

    if (!rotation) {
      throw new NotFoundException('Rotation with given ID not found');
    }

    return { ...rotation, id: rotation.id as RotationId };
  }

  async update(
    id: RotationId,
    request: UpdateRotationRequest,
  ): Promise<CreateRotationResponse> {
    const rotation = await this.rotationsRepository.update(id, request);
    return { ...rotation, id: rotation.id as RotationId };
  }

  async remove(id: RotationId) {
    await this.rotationsRepository.remove(id);
  }
}
