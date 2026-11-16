import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WS_EVENTS } from '@burkindi/shared-types';

@WebSocketGateway({ cors: { origin: process.env.WEB_ORIGIN?.split(','), credentials: true } })
export class SessionsGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;
  constructor(private jwt: JwtService) {}

  /** L'identité vient du cookie HttpOnly « access », jamais d'un paramètre fourni par le client. */
  handleConnection(client: Socket) {
    const cookie = client.handshake.headers.cookie ?? '';
    const token = /(?:^|;\s*)access=([^;]+)/.exec(cookie)?.[1];
    try {
      const p = this.jwt.verify(decodeURIComponent(token ?? ''), { secret: process.env.JWT_ACCESS_SECRET });
      client.join(`user:${p.sub}`);
    } catch { client.disconnect(true); }
  }
  forceLogout(userId: string) { this.server.to(`user:${userId}`).emit(WS_EVENTS.FORCE_LOGOUT); }
}
