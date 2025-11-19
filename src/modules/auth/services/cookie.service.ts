import { Injectable } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/cookie';

@Injectable()
export class CookieService {
    setCookie(res: FastifyReply, name: string, value: string) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.setCookie(name, value, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            maxAge: 14 * 24 * 60 * 60,
        });
    }

    getCookie(req: FastifyRequest, name: string): string | null {
        return req.cookies?.[name] ?? null;
    }

    clearCookie(res: FastifyReply, name: string) {
        res.clearCookie(name, { path: '/' });
    }
}
