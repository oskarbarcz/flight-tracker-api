import { JwtUser } from '../../auth/dto/jwt-user.dto';

export type AuthorizedRequest = Request & { user: JwtUser };
