import { Injectable, NotImplementedException } from '@nestjs/common';

/** Vérification FIDO2/WebAuthn (clef matérielle) de l'administrateur.
 *  À implémenter avec @simplewebauthn/server. Tant que FIDO_ENFORCE != "true", la vérification est ignorée. */
@Injectable()
export class FidoService {
  async verify(_userId: string, _assertion: unknown): Promise<boolean> {
    if (process.env.FIDO_ENFORCE !== 'true') return true;
    throw new NotImplementedException('Vérification WebAuthn à brancher');
  }
}
