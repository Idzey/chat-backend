import { Socket as IOSocket } from 'socket.io';
import { UserPayload } from './auth/userPayload';

export interface AuthenticatedSocket extends IOSocket {
  data: {
    user: UserPayload;
  };
}
