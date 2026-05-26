import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QueryBus } from '@nestjs/cqrs';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { UserRole } from 'prisma/client/client';
import { getWebsocketCorsOptions } from '../../../../core/http/cors/cors.config';
import {
  JwtTokenType,
  JwtUser,
} from '../../../auth/infra/http/request/jwt-user.dto';
import { NewFlightEvent } from '../http/request/event.dto';
import { ListEventsQuery } from '../../application/query/events/list-events.query';
import { FlightSubscriptionDto } from './request/flight-subscription.dto';

export type AuthedSocket = Socket & {
  data: {
    user: JwtUser;
    buffering?: boolean;
    buffer?: NewFlightEvent[];
  };
};

const flightRoom = (flightId: string) => `flight:${flightId}`;

const allowedRoles: ReadonlySet<string> = new Set(
  [UserRole.CabinCrew, UserRole.Operations].map((r) => r.toLowerCase()),
);

@WebSocketGateway({
  namespace: '/flight-events',
  cors: getWebsocketCorsOptions(),
})
export class FlightEventsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(FlightEventsGateway.name);

  @WebSocketServer() server!: Namespace;

  constructor(
    private readonly jwtService: JwtService,
    private readonly queryBus: QueryBus,
  ) {}

  async handleConnection(socket: AuthedSocket): Promise<void> {
    const token =
      (socket.handshake.auth?.token as string | undefined) ??
      this.bearerFromHeader(socket.handshake.headers.authorization);

    if (!token) {
      socket.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtUser>(token, {
        publicKey: process.env.JWT_PUBLIC_KEY,
      });

      if (payload.type !== JwtTokenType.Access) {
        socket.disconnect(true);
        return;
      }

      if (!allowedRoles.has(payload.role)) {
        socket.disconnect(true);
        return;
      }

      socket.data.user = payload;
    } catch {
      socket.disconnect(true);
    }
  }

  @SubscribeMessage('subscribe')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async onSubscribe(
    @ConnectedSocket() socket: AuthedSocket,
    @MessageBody() body: FlightSubscriptionDto,
  ): Promise<void> {
    const room = flightRoom(body.flightId);
    socket.data.buffering = true;
    socket.data.buffer = [];
    await socket.join(room);

    try {
      const history = await this.queryBus.execute(
        new ListEventsQuery(body.flightId),
      );
      socket.emit('flight.events', history);
    } catch (e) {
      socket.data.buffering = false;
      socket.data.buffer = undefined;
      await socket.leave(room);
      socket.emit('flight.subscribe.error', {
        flightId: body.flightId,
        message: e instanceof Error ? e.message : 'Unable to subscribe',
      });
      return;
    }

    const buffered = socket.data.buffer ?? [];
    socket.data.buffering = false;
    socket.data.buffer = undefined;
    for (const event of buffered) {
      socket.emit('flight.event', event);
    }
  }

  @SubscribeMessage('unsubscribe')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async onUnsubscribe(
    @ConnectedSocket() socket: AuthedSocket,
    @MessageBody() body: FlightSubscriptionDto,
  ): Promise<void> {
    await socket.leave(flightRoom(body.flightId));
  }

  async publishToFlight(event: NewFlightEvent): Promise<void> {
    const room = flightRoom(event.flightId);
    const sockets = (await this.server
      .in(room)
      .fetchSockets()) as unknown as AuthedSocket[];

    for (const socket of sockets) {
      if (socket.data.buffering) {
        (socket.data.buffer ??= []).push(event);
      } else {
        socket.emit('flight.event', event);
      }
    }
  }

  private bearerFromHeader(header: string | undefined): string | undefined {
    if (!header) return undefined;
    const [scheme, token] = header.split(' ');
    return scheme === 'Bearer' ? token : undefined;
  }
}
