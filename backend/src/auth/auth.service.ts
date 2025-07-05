import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService : JwtService) {};


    async login(email : string, password: string): Promise<{ ok: boolean; jwt: string }> {

        const hashedpassword = bcrypt.hashSync(password, 10);
        const user =  await this.prisma.user.findUnique({
            where: {
                email,
                password : hashedpassword, 
            },
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }
        const payload = {
            sub: user.id,
            email: user.email,
        };
        const jwt = await  this.jwtService.signAsync(payload);


        return {ok: true, jwt: jwt  };
    }

    
    async me()
    {
        return { ok: true };
    }
}
