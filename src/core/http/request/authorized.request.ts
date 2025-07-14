import { JwtUser } from '../../../modules/auth/dto/jwt-user.dto';

export type AuthorizedRequest = Request & { user: JwtUser };
