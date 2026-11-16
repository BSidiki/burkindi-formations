import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtGuard } from '../../common/jwt.guard';
import { IpWhitelistGuard, clientIp } from '../../common/ip-whitelist.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() b: any) { return this.auth.register(b); }

  @Get('concours')
  concours(@Query('voie') voie?: string) { return this.auth.concours(voie); }

  @Get('referral/:code')   // vérification en temps réel du code parrain
  checkReferral(@Req() req: any) { return this.auth.checkReferral(req.params.code); }

  @Post('learner/login')
  learnerLogin(@Body() b: any, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    return this.auth.learnerLogin(b, clientIp(req), res);
  }

  @Post('admin/login') @UseGuards(IpWhitelistGuard)
  adminLogin(@Body() b: any, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    return this.auth.adminLogin(b, clientIp(req), res);
  }

  @Post('refresh')
  refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) { return this.auth.refresh(req, res); }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) { res.clearCookie('access'); res.clearCookie('refresh'); return { ok: true }; }

  @Get('me') @UseGuards(JwtGuard)
  me(@Req() req: any) { return this.auth.me(req.user.sub, clientIp(req)); }
}
