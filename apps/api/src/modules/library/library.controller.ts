import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/jwt.guard';
import { RolesGuard, Roles } from '../../common/roles.guard';
import { PrismaService } from '../../prisma/prisma.module';

@Controller('library')
@UseGuards(JwtGuard, RolesGuard)
@Roles('APPRENANT')
export class LibraryController {
  constructor(private prisma: PrismaService) {}
  @Get() async list(@Req() req: any) {
    const u = await this.prisma.user.findUniqueOrThrow({ where: { id: req.user.sub } });
    return this.prisma.resource.findMany({ where: { OR: [{ voie: u.voie }, { voie: null }] }, select: { id: true, titre: true, voie: true } });
  }
  /** TODO : renvoyer une URL présignée Cloudflare R2 (S3-compatible, expiration courte) via @aws-sdk/s3-request-presigner. */
  @Get(':id/url') async url(@Param('id') id: string) {
    const r = await this.prisma.resource.findUniqueOrThrow({ where: { id } });
    return { key: r.r2Key, url: null };
  }
}
