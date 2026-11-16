import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Trajectory } from '@/components/Trajectory';
import { InstallPrompt } from '@/components/InstallPrompt';
import { IOffline, IShield, ICheck, IWhatsapp } from '@/components/Icons';
import { CONTACT, TARIFS, fcfa } from '@/lib/config';

export default function Home() {
  return (<>
    <div className="wrap">
      <section className="hero">
        <div className="stack-6">
          <Logo height={76} />
          <h1>Réussissez votre concours de la fonction publique.</h1>
          <p className="muted">QCM corrigés, examens blancs chronométrés et annales, pour les concours directs et professionnels. Révisez sur votre téléphone, même quand la connexion est faible.</p>
          <div className="stack-3" style={{ maxWidth: 380 }}>
            <Link className="btn btn-primary btn-block" href="/inscription">Créer mon compte</Link>
            <Link className="btn btn-secondary btn-block" href="/apprenant/login">J'ai déjà un compte</Link>
            <InstallPrompt />
          </div>
        </div>
        <div className="hero-visuel">
          <h2 style={{ fontSize: 'var(--t-md)' }}>Votre progression, session après session</h2>
          <Trajectory scores={[38, 46, 55, 61, 72]} labels={['S1', 'S2', 'S3', 'S4', 'S5']} objective={70} />
          <p className="small muted">Chaque examen blanc fait monter la courbe vers votre objectif.</p>
        </div>
      </section>

      <section className="section stack-4">
        <h2>Choisissez votre voie</h2>
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <article className="card card-or stack-3">
            <h3>Concours directs</h3>
            <p className="muted">Pour les titulaires du CEP, du BEPC, du baccalauréat, d'une licence ou d'un master.</p>
            <p className="prix">{fcfa(TARIFS.DIRECT)} <small>à l'inscription</small></p>
          </article>
          <article className="card card-or stack-3">
            <h3>Concours professionnels</h3>
            <p className="muted">Pour les agents déjà en poste, des catégories A à D.</p>
            <p className="prix">{fcfa(TARIFS.PROFESSIONNEL)} <small>à l'inscription</small></p>
          </article>
        </div>
      </section>

      <section className="section stack-4">
        <h2>Comment s'inscrire</h2>
        <ol className="etapes">
          <li><span><b>Créez votre compte</b><br /><span className="muted">Deux minutes suffisent : voie, concours visés, coordonnées.</span></span></li>
          <li><span><b>Payez par Orange Money ou Moov Money</b><br /><span className="muted">Le montant et le numéro s'affichent à la fin de l'inscription.</span></span></li>
          <li><span><b>Envoyez la preuve de paiement sur WhatsApp</b><br /><span className="muted">Un message pré-rempli s'ouvre en un clic.</span></span></li>
          <li><span><b>Révisez dès l'activation de votre compte</b><br /><span className="muted">Nous validons votre paiement à la main.</span></span></li>
        </ol>
      </section>

      <section className="section stack-4">
        <h2>Pensé pour votre téléphone</h2>
        <div className="stack-3">
          <div className="row" style={{ alignItems: 'flex-start' }}><IOffline /><p><b>Révisez sans réseau.</b> Vos réponses sont enregistrées et envoyées au retour de la connexion.</p></div>
          <div className="row" style={{ alignItems: 'flex-start' }}><ICheck /><p><b>Chaque réponse est expliquée.</b> Vous comprenez l'erreur, pas seulement la bonne case.</p></div>
          <div className="row" style={{ alignItems: 'flex-start' }}><IShield /><p><b>Un seul appareil par compte.</b> Vos résultats restent les vôtres.</p></div>
        </div>
      </section>

      <footer className="footer stack-3">
        <a className="btn btn-secondary" href={`https://wa.me/${CONTACT.whatsapp}`}><IWhatsapp size={20} />Une question ? Écrivez-nous sur WhatsApp</a>
        <p>BURKINDI Formations · Votre réussite commence ici !</p>
      </footer>
    </div>
  </>);
}
