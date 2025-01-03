import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByCredentials(email, password);

    if (user === null) {
      throw new UnauthorizedException('Credentials are incorrect.');
    }

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
    };

    const token = await this.jwtService.signAsync(payload);

    return { token };
  }
}
