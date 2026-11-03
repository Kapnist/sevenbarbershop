import type { Service } from "../data/services";
import { useI18n } from "../i18n";

interface ServiceCardProps {
  service: Service;
  heading?: "h2" | "h3";
}

function ServiceCard({ service, heading: Heading = "h3" }: ServiceCardProps) {
  const { t, formatPrice } = useI18n();
  const text = t.services.items[service.number];

  let detail = service.place;
  if (Array.isArray(service.duration)) {
    detail = t.format.range(
      t.format.duration(service.duration[0]),
      t.format.duration(service.duration[1]),
    );
  } else if (service.duration) {
    detail = t.format.duration(service.duration);
  }

  const label = service.price
    ? [formatPrice(service.price), detail].filter(Boolean).join(" · ")
    : t.services.appointmentOnly;

  return (
    <article className="service-card">
      <span className="service-number">{service.number}</span>
      <div>
        <Heading>{text.name}</Heading>
        <p>{text.description}</p>
      </div>
      <span className="service-label">{label}</span>
    </article>
  );
}

export default ServiceCard;
