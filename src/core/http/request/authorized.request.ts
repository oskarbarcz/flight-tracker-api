import { JwtUser } from '../../../modules/auth/infra/http/request/jwt-user.dto';

export type AuthorizedRequest = Request & { user: JwtUser };
