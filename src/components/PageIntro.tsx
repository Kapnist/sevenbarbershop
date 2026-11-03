interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="page-intro">
      <div className="wrap">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-intro-copy">{description}</p>
      </div>
    </section>
  );
}

export default PageIntro;
