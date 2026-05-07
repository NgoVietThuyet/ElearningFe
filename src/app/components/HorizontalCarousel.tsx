import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalCarouselProps {
  children: React.ReactNode[];
  itemWidth?: number;
}

export default function HorizontalCarousel({ children, itemWidth = 300 }: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, children]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? itemWidth * 4 : -(itemWidth * 4), behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-orange-600 hover:shadow-orange-100 transition-all border border-gray-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Scrollable Track */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {/* Right Arrow */}
      {canScrollRight && children.length > 4 && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-orange-600 hover:shadow-orange-100 transition-all border border-gray-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
