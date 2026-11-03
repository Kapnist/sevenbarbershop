import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import ServiceCard from "../components/ServiceCard";
import { services } from "../data/services";
import { useI18n } from "../i18n";

function ServicesPage() {
  const { t } = useI18n();

  return (
    <>
      <PageIntro
        eyebrow={t.services.eyebrow}
        title={t.services.title}
        description={t.services.description}
      />
      <section className="page-section">
        <div className="wrap">
          <div className="services-grid">
            {services.map((service) => (
              <ServiceCard service={service} heading="h2" key={service.number} />
            ))}
          </div>
          <div className="page-cta">
            <p>{t.services.ctaText}</p>
            <Link className="button" to="/salons">
              {t.services.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default ServicesPage;
