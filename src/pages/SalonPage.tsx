import { Link } from "react-router-dom";
import Lookbook from "../components/Lookbook";
import PageIntro from "../components/PageIntro";
import {
  photoSrc,
  photoSrcSet,
  realisations,
  salonDetails,
  salonInterior,
  teamPhotos,
} from "../data/photos";
import { useI18n } from "../i18n";

function SalonPage() {
  const { t } = useI18n();
  const page = t.salonPage;

  return (
    <>
      <PageIntro
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
      />
      <section className="page-section salon-story">
        <div className="wrap salon-story-grid">
          <div className="salon-story-copy">
            <p className="eyebrow">Trust your barber</p>
            <h2>{page.storyTitle}</h2>
            <p>{page.storyText}</p>
          </div>
          <figure className="lookbook-item photo-frame">
            <img
              src={photoSrc(salonInterior)}
              srcSet={photoSrcSet(salonInterior)}
              sizes="(max-width: 760px) 100vw, 60vw"
              alt={page.storyAlt}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </section>

      <section className="page-section" id="equipe">
        <div className="wrap">
          <div className="anatole-section-heading">
            <div>
              <p className="eyebrow">{page.teamEyebrow}</p>
              <h2>{page.teamTitle}</h2>
            </div>
            <p className="section-intro">{page.teamIntro}</p>
          </div>
          <Lookbook photos={teamPhotos} variant="mosaic" label={page.teamLabel} />
        </div>
      </section>

      <section className="page-section salon-story" id="realisations">
        <div className="wrap">
          <div className="anatole-section-heading">
            <div>
              <p className="eyebrow">{page.lookbookEyebrow}</p>
              <h2>{page.lookbookTitle}</h2>
            </div>
            <p className="section-intro">{page.lookbookIntro}</p>
          </div>
          <Lookbook photos={realisations} label={t.home.lookbookLabel} />
          <div className="page-cta">
            <p>{page.ctaText}</p>
            <Link className="button" to="/salons">
              {page.ctaButton}
            </Link>
          </div>
        </div>
      </section>

      <section className="page-section salon-gallery-section">
        <div className="wrap">
          <p className="eyebrow">{page.detailsEyebrow}</p>
          <h2>{page.detailsTitle}</h2>
          <Lookbook
            photos={salonDetails}
            variant="landscape"
            label={page.detailsLabel}
          />
        </div>
      </section>
    </>
  );
}

export default SalonPage;
