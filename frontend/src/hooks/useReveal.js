import { useEffect, useRef } from 'react'

/**
 * Attaches an IntersectionObserver to the returned ref.
 * When the element scrolls into view it gets the `is-visible` class added,
 * which pairs with the .anim-* CSS classes to trigger the transition.
 *
 * @param {number} delay  ms to wait before adding the visible class (stagger)
 * @param {number} threshold  how much of the element must be visible (0–1)
 */
export function useReveal(delay = 0, threshold = 0.12) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('is-visible'), delay)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, threshold])

  return ref
}
