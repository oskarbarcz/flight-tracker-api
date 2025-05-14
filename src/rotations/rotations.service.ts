import { Injectable } from '@nestjs/common';
import { RotationsRepository } from './rotations.repository';
import { CreateRotationDto } from './dto/create-rotation.dto';
import { UpdateRotationDto } from './dto/update-rotation.dto';
import { FlightsService } from '../flights/flights.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventType } from '../common/events/event';
import {
  FlightAlreadyInRotationError,
  FlightDoesNotExistError,
  RotationDoesNotExistError,
  UserAlreadyHasCurrentRotationError,
  UserDoesNotOwnRotationError,
} from './dto/errors.dto';

@Injectable()
export class RotationsService {
  constructor(
    private readonly rotationsRepository: RotationsRepository,
    private readonly flightsService: FlightsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, createRotationDto: CreateRotationDto) {
    const rotation = await this.rotationsRepository.create(userId, createRotationDto);

    this.eventEmitter.emit(EventType.RotationWasCreated, {
      rotationId: rotation.id,
      userId,
    } as RotationWasCreatedPayload);

    return rotation;
  }

  async findAll() {
    return this.rotationsRepository.findAll();
  }

  async findAllByUserId(userId: string) {
    return this.rotationsRepository.findAllByUserId(userId);
  }

  async findOne(id: string) {
    const rotation = await this.rotationsRepository.findOneBy({ id });
    if (!rotation) {
      throw new RotationDoesNotExistError(id);
    }
    return rotation;
  }

  async update(id: string, userId: string, updateRotationDto: UpdateRotationDto) {
    const rotation = await this.rotationsRepository.findOneBy({ id });
    if (!rotation) {
      throw new RotationDoesNotExistError(id);
    }

    if (rotation.userId !== userId) {
      throw new UserDoesNotOwnRotationError(userId, id);
    }

    return this.rotationsRepository.update(id, updateRotationDto);
  }

  async remove(id: string, userId: string) {
    const rotation = await this.rotationsRepository.findOneBy({ id });
    if (!rotation) {
      throw new RotationDoesNotExistError(id);
    }

    if (rotation.userId !== userId) {
      throw new UserDoesNotOwnRotationError(userId, id);
    }

    // Remove rotation from all flights
    for (const flight of rotation.flights) {
      await this.rotationsRepository.removeFlight(flight.id);
    }

    // Clear current rotation if this is the current rotation
    const user = await this.rotationsRepository.findOneBy({ id: rotation.userId });
    if (user && user.user?.currentRotationId === id) {
      await this.rotationsRepository.clearCurrentRotation(userId);
    }

    await this.rotationsRepository.remove(id);
  }

  async addFlight(rotationId: string, userId: string, flightId: string) {
    const rotation = await this.rotationsRepository.findOneBy({ id: rotationId });
    if (!rotation) {
      throw new RotationDoesNotExistError(rotationId);
    }

    if (rotation.userId !== userId) {
      throw new UserDoesNotOwnRotationError(userId, rotationId);
    }

    const flight = await this.flightsService.find(flightId);
    if (!flight) {
      throw new FlightDoesNotExistError(flightId);
    }

    // Check if flight is already in a rotation
    if (flight.rotation) {
      throw new FlightAlreadyInRotationError(flightId, flight.rotation.id);
    }

    await this.rotationsRepository.addFlight(rotationId, flightId);
    return this.findOne(rotationId);
  }

  async removeFlight(rotationId: string, userId: string, flightId: string) {
    const rotation = await this.rotationsRepository.findOneBy({ id: rotationId });
    if (!rotation) {
      throw new RotationDoesNotExistError(rotationId);
    }

    if (rotation.userId !== userId) {
      throw new UserDoesNotOwnRotationError(userId, rotationId);
    }

    const flight = await this.flightsService.find(flightId);
    if (!flight) {
      throw new FlightDoesNotExistError(flightId);
    }

    // Check if flight is in this rotation
    const flightInRotation = rotation.flights.some((f) => f.id === flightId);
    if (!flightInRotation) {
      throw new FlightDoesNotExistError(flightId);
    }

    await this.rotationsRepository.removeFlight(flightId);
    return this.findOne(rotationId);
  }

  async setCurrentRotation(userId: string, rotationId: string) {
    const rotation = await this.rotationsRepository.findOneBy({ id: rotationId });
    if (!rotation) {
      throw new RotationDoesNotExistError(rotationId);
    }

    if (rotation.userId !== userId) {
      throw new UserDoesNotOwnRotationError(userId, rotationId);
    }

    // Check if user already has a current rotation
    const user = await this.rotationsRepository.findOneBy({ userId });
    if (user && user.user?.currentRotationId && user.user.currentRotationId !== rotationId) {
      throw new UserAlreadyHasCurrentRotationError(userId, user.user.currentRotationId);
    }

    await this.rotationsRepository.setCurrentRotation(userId, rotationId);

    this.eventEmitter.emit(EventType.RotationWasSetAsCurrent, {
      rotationId,
      userId,
    } as RotationWasSetAsCurrentPayload);

    return this.findOne(rotationId);
  }

  async clearCurrentRotation(userId: string) {
    await this.rotationsRepository.clearCurrentRotation(userId);

    this.eventEmitter.emit(EventType.RotationWasCleared, {
      userId,
    } as RotationWasClearedPayload);
  }
}
