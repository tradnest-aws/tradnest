"use client"

import useEmblaCarousel from "embla-carousel-react"
import { ReactNode, useCallback, useEffect, useState } from "react"

import { ArrowLeftIcon, ArrowRightIcon } from "@/icons"

export const SimilarProductsRow = ({ slides }: { slides: ReactNode[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    direction: "rtl",
    slidesToScroll: 1,
  })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const sync = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    sync()
    emblaApi.on("reInit", sync).on("select", sync)
    return () => {
      emblaApi.off("reInit", sync).off("select", sync)
    }
  }, [emblaApi, sync])

  return (
    <div className="relative" data-testid="similar-products-carousel">
      <div className="overflow-hidden" ref={emblaRef} data-testid="similar-products-viewport">
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="embla__slide min-w-0 flex-[0_0_82%] pe-3 sm:flex-[0_0_48%] lg:flex-[0_0_32%] xl:flex-[0_0_24%]"
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label="הקודם"
        data-testid="similar-products-prev"
        disabled={!canPrev}
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute top-1/2 start-1 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-primary/15 bg-white text-primary shadow-sm disabled:opacity-40"
      >
        <ArrowRightIcon size={18} />
      </button>
      <button
        type="button"
        aria-label="הבא"
        data-testid="similar-products-next"
        disabled={!canNext}
        onClick={() => emblaApi?.scrollNext()}
        className="absolute top-1/2 end-1 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-primary/15 bg-white text-primary shadow-sm disabled:opacity-40"
      >
        <ArrowLeftIcon size={18} />
      </button>
    </div>
  )
}
