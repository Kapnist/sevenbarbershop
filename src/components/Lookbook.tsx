import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { photoSrc, photoSrcSet, type Photo } from "../data/photos";
import { useI18n } from "../i18n";

interface LookbookProps {
  photos: Photo[];
  variant?: "grid" | "mosaic" | "landscape";
  label: string;
}

function Lookbook({ photos, variant = "grid", label }: LookbookProps) {
  const { t, dir } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const current = openIndex === null ? null : photos[openIndex];
  const currentText = current ? t.photos[current.id] : null;

  function open(index: number) {
    setOpenIndex(index);
    dialogRef.current?.showModal();
  }

  function step(direction: 1 | -1) {
    setOpenIndex((index) =>
      index === null ? null : (index + direction + photos.length) % photos.length,
    );
  }

  // En arabe (droite à gauche), la flèche gauche mène à la photo suivante.
  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (event.key === forward) step(1);
    if (event.key === backward) step(-1);
  }

  // Un clic sur le fond (hors du contenu) ferme la visionneuse.
  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      dialogRef.current.close();
    }
  }

  return (
    <>
      <div className={`lookbook lookbook-${variant}`} aria-label={label} role="list">
        {photos.map((photo, index) => {
          const text = t.photos[photo.id];
          return (
            <figure className="lookbook-item" key={photo.base} role="listitem">
              <button
                className="lookbook-trigger"
                type="button"
                onClick={() => open(index)}
                aria-label={t.lightbox.enlarge(text.title)}
              >
                <img
                  src={photoSrc(photo)}
                  srcSet={photoSrcSet(photo)}
                  sizes={
                    (variant === "mosaic" && index === 0) || variant === "landscape"
                      ? "(max-width: 760px) 100vw, 50vw"
                      : "(max-width: 760px) 50vw, 33vw"
                  }
                  alt={text.alt}
                  style={{ objectPosition: photo.position }}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <figcaption>
                <span className="lookbook-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="lookbook-title">{text.title}</span>
                {text.caption && (
                  <span className="lookbook-caption">{text.caption}</span>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>

      <dialog
        className="lightbox"
        ref={dialogRef}
        aria-label={label}
        onClose={() => setOpenIndex(null)}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
      >
        {current && currentText && openIndex !== null && (
          <div className="lightbox-inner">
            <img
              className="lightbox-image"
              src={photoSrc(current, "large")}
              alt={currentText.alt}
            />
            <div className="lightbox-panel">
              <button
                className="lightbox-close"
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label={t.lightbox.close}
              >
                ×
              </button>
              <div>
                <p className="eyebrow">
                  {String(openIndex + 1).padStart(2, "0")} /{" "}
                  {String(photos.length).padStart(2, "0")}
                </p>
                <h3>{currentText.title}</h3>
                {currentText.caption && <p>{currentText.caption}</p>}
              </div>
              {photos.length > 1 && (
                <div className="lightbox-nav">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label={t.lightbox.previous}
                  >
                    <span aria-hidden="true">←</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label={t.lightbox.next}
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

export default Lookbook;
