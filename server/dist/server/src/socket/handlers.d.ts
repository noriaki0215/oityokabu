import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types';
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
export declare function setupSocketHandlers(io: TypedServer): void;
export {};
//# sourceMappingURL=handlers.d.ts.map