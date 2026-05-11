import { Play } from "lucide-react";
import type { Sim3dPreviewMeta } from "@/data/sim3d-previews";

interface Sim3dPreviewProps {
  meta: Sim3dPreviewMeta;
  /** Tailwind aspect / height classes for the wrapper */
  className?: string;
  /** Show the small "Anteprima 3D" overlay badge */
  showBadge?: boolean;
  /** Eager load if above the fold */
  priority?: boolean;
  sizes?: string;
}

/**
 * Responsive, optimized preview for the 5 3D scenarios.
 * - Serves WebP with JPG fallback via <picture>
 * - Lazy loads with async decoding by default
 * - Provides explicit width/height to prevent CLS
 * - Descriptive alt text for accessibility & SEO
 */
export const Sim3dPreview = ({
  meta,
  className = "h-36",
  showBadge = true,
  priority = false,
  sizes = "(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw",
}: Sim3dPreviewProps) => {
  return (
    <figure className={`relative overflow-hidden rounded-lg bg-muted ${className}`}>
      <picture>
        <source type="image/webp" srcSet={meta.webp} sizes={sizes} />
        <img
          src={meta.jpg}
          alt={meta.alt}
          width={meta.width}
          height={meta.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          sizes={sizes}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </picture>
      {showBadge && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border text-[11px] font-semibold shadow-sm">
          <Play className="w-3 h-3 text-primary" aria-hidden="true" />
          <span>Anteprima 3D</span>
        </div>
      )}
      <figcaption className="sr-only">{meta.caption}</figcaption>
    </figure>
  );
};
