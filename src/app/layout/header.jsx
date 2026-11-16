import { Link, useLocation } from 'react-router-dom'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import gsap from 'gsap'

const navLinks = [
  { label: 'خانه', path: '/' },
  { label: 'درباره ما', path: '/about' },
  { label: 'وبلاگ', path: '/blog' },
  { label: 'پروژه‌ها', path: '/projects' },
]

const CONTACT_PATH = '/contact'

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// چقدر بوردر بعد از گوشه‌ی گرد، روی لبه‌ی عمودی ادامه پیدا کنه (۰ تا ۱ از بخش صاف لبه)
const TAIL = 0.5

// حلقه‌ی گرادیانی ۱.۵ پیکسلی که دقیقاً شکل قرص رو دنبال می‌کنه (پایین سبز، بالا محو)
const PILL_RING = {
  padding: 1.5,
  background: 'linear-gradient(to top, var(--color-primary), var(--color-border) 55%, transparent)',
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  maskComposite: 'exclude',
}
const isPathActive = (pathname, path) => (path === '/' ? pathname === '/' : pathname.startsWith(path))
const getInitialTheme = () => {
  try {
    return localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]'

/* ───────────── دکمه‌ی دارک/لایت: آیکون ماه و خورشید با GSAP جابه‌جا می‌شن ───────────── */
function ThemeToggle({ theme, onToggle, ...rest }) {
  const sunRef = useRef(null)
  const moonRef = useRef(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    const isLight = theme === 'light'
    const duration = first.current || prefersReduced() ? 0 : 0.6
    first.current = false
    gsap.to(sunRef.current, {
      rotate: isLight ? 0 : 120,
      scale: isLight ? 1 : 0,
      opacity: isLight ? 1 : 0,
      duration,
      ease: 'power3.out',
    })
    gsap.to(moonRef.current, {
      rotate: isLight ? -120 : 0,
      scale: isLight ? 0 : 1,
      opacity: isLight ? 0 : 1,
      duration,
      ease: 'power3.out',
    })
  }, [theme])

  const iconWrap = 'absolute inset-0 flex items-center justify-center'
  const svgProps = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
      className={`relative h-10 w-10 shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition-colors duration-300 hover:border-[var(--color-primary)] ${focusRing}`}
      {...rest}
    >
      <span ref={sunRef} className={iconWrap}>
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      </span>
      <span ref={moonRef} className={iconWrap}>
        <svg {...svgProps}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  )
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [theme, setTheme] = useState(getInitialTheme)
  const location = useLocation()

  const headerRef = useRef(null)
  const panelRef = useRef(null)
  const topPathRef = useRef(null)
  const bottomPathRef = useRef(null)
  const pathInfo = useRef({ topLen: 0, bottomLen: 0 })
  const progress = useRef({ top: 0, bottom: 0 })
  const scrollTl = useRef(null)

  const pillRef = useRef(null)
  const itemRefs = useRef([])
  const placedOnce = useRef(false)

  const contactWrapRef = useRef(null)
  const contactRef = useRef(null)

  const activeIndex = navLinks.findIndex((l) => isPathActive(location.pathname, l.path))

  /* ───────────── تم ───────────── */
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggleTheme = (e) => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const commit = () => {
      document.documentElement.dataset.theme = next
      flushSync(() => setTheme(next))
    }

    if (!document.startViewTransition || prefersReduced()) {
      commit()
      return
    }

    // دایره‌ای از وسط دکمه باز می‌شه و تم جدید رو نشون می‌ده
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    document.startViewTransition(commit).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' }
      )
    })
  }

  /* ───────────── اسکرول ───────────── */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && setIsOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  /* ───────────── GSAP: ورود اولیه‌ی هدر (از راست به چپ پشت سر هم) ───────────── */
  useLayoutEffect(() => {
    if (prefersReduced()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-intro]', {
        y: -18,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.07,
        delay: 0.1,
        clearProps: 'transform',
      })
    }, headerRef)
    return () => ctx.revert()
  }, [])

  /* ───────────── GSAP: بوردرها (مسیر SVG که گوشه‌ی گرد هدر رو دنبال می‌کنه) ───────────── */
  const applyDash = useCallback(() => {
    const items = [
      [topPathRef.current, pathInfo.current.topLen, progress.current.top],
      [bottomPathRef.current, pathInfo.current.bottomLen, progress.current.bottom],
    ]
    items.forEach(([path, len, p]) => {
      if (!path) return
      path.style.strokeDasharray = `${len} ${len * 2 + 10}`
      path.style.strokeDashoffset = `${(len + 2) * (1 - p)}` // +2 تا سر گرد خط وقتی صفره دیده نشه
    })
  }, [])

  const drawGeometry = useCallback(() => {
    const header = headerRef.current
    const panel = panelRef.current
    const top = topPathRef.current
    const bottom = bottomPathRef.current
    if (!header || !panel || !top || !bottom) return

    const w = header.offsetWidth
    const h = header.offsetHeight
    const cssRadius = parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 16 // همون radius پنل
    const r = Math.min(cssRadius, w / 2, h / 2)
    const tail = Math.max(0, (h - 2 * r) * TAIL)

    // بالا: از چپ به راست، بعد دور گوشه‌ی بالا-راست می‌پیچه و کمی میاد پایین
    top.setAttribute('d', `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} v ${tail}`)
    // پایین: از راست به چپ، بعد دور گوشه‌ی پایین-چپ می‌پیچه و کمی میره بالا
    bottom.setAttribute('d', `M ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} v ${-tail}`)

    pathInfo.current = { topLen: top.getTotalLength(), bottomLen: bottom.getTotalLength() }
    applyDash()
  }, [applyDash])

  useLayoutEffect(() => {
    progress.current = { top: 0, bottom: 0 }

    const ro = new ResizeObserver(drawGeometry) // عرض/ارتفاع هدر موقع اسکرول عوض می‌شه
    ro.observe(headerRef.current)
    drawGeometry()

    const ctx = gsap.context(() => {
      gsap.set(panelRef.current, { opacity: 0 })

      scrollTl.current = gsap
        .timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .to(panelRef.current, { opacity: 1, duration: 0.45 }, 0)
        .to(progress.current, { top: 1, duration: 1, onUpdate: applyDash }, 0)
        .to(progress.current, { bottom: 1, duration: 1, onUpdate: applyDash }, 0.12)
    }, headerRef)

    return () => {
      ro.disconnect()
      ctx.revert()
    }
  }, [drawGeometry, applyDash])

  useEffect(() => {
    const tl = scrollTl.current
    if (!tl) return
    if (prefersReduced()) tl.timeScale(100)
    else tl.timeScale(isScrolled ? 1 : 1.6)
    if (isScrolled) tl.play()
    else tl.reverse()
  }, [isScrolled])

  /* ───────────── GSAP: قرص متحرک زیر لینک‌ها (دنبال موس می‌ره، برمی‌گرده سر لینک فعال) ───────────── */
  const movePill = useCallback((index, instant = false) => {
    const pill = pillRef.current
    if (!pill) return
    const el = itemRefs.current[index]
    if (!el) {
      gsap.to(pill, { opacity: 0, duration: instant ? 0 : 0.25, overwrite: 'auto' })
      return
    }
    gsap.to(pill, {
      x: el.offsetLeft,
      width: el.offsetWidth,
      opacity: 1,
      duration: instant || prefersReduced() ? 0 : 0.5,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }, [])

  useLayoutEffect(() => {
    movePill(activeIndex, !placedOnce.current)
    placedOnce.current = true
    const onResize = () => movePill(activeIndex, true)
    window.addEventListener('resize', onResize)
    document.fonts?.ready.then(onResize) // بعد از لود شدن Lalezar عرض‌ها عوض می‌شه
    return () => window.removeEventListener('resize', onResize)
  }, [activeIndex, movePill])

  /* ───────────── GSAP: دکمه‌ی تماس با ما کمی دنبال موس می‌کشه (magnetic) ───────────── */
  useLayoutEffect(() => {
    const el = contactRef.current
    const wrap = contactWrapRef.current
    if (!el || !wrap || prefersReduced()) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.45)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.45)' })

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3)
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4)
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      gsap.set(el, { clearProps: 'transform' })
    }
  }, [])

  const logo = (
    <span
      dir="ltr"
      className="flex items-center gap-2 text-2xl font-bold tracking-wider text-[var(--color-text)]"
      style={{ fontFamily: 'var(--font-Michroma), sans-serif' }}
    >
      Siryx
      <span
        aria-hidden="true"
        className="h-2 w-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_12px_var(--color-primary)]"
      />
    </span>
  )

  return (
    <>
      <header
        ref={headerRef}
        dir="rtl"
        className={`fixed left-1/2 top-0 z-40 mt-2 w-[95%] -translate-x-1/2 font-[Lalezar] transition-[width,margin-top] duration-500 ${
          isScrolled ? 'md:mt-4 md:w-[85%]' : ''
        }`}
      >
        {/* شیشه‌ی پشت هدر (با GSAP ظاهر می‌شه) */}
        <div
          ref={panelRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[color-mix(in_srgb,var(--color-bg)_70%,transparent)] opacity-0 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        />
        {/* بوردر بالا: از چپ به راست */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="siryx-line-top" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" style={{ stopColor: 'var(--color-border)', stopOpacity: 0 }} />
              <stop offset="0.25" style={{ stopColor: 'var(--color-border)' }} />
              <stop offset="1" style={{ stopColor: 'var(--color-primary)' }} />
            </linearGradient>
            <linearGradient id="siryx-line-bottom" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" style={{ stopColor: 'var(--color-border)', stopOpacity: 0 }} />
              <stop offset="0.25" style={{ stopColor: 'var(--color-border)' }} />
              <stop offset="1" style={{ stopColor: 'var(--color-primary)' }} />
            </linearGradient>
          </defs>
          <path ref={topPathRef} fill="none" stroke="url(#siryx-line-top)" strokeWidth="1.5" strokeLinecap="round" />
          <path ref={bottomPathRef} fill="none" stroke="url(#siryx-line-bottom)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        <nav
          className={`relative flex items-center justify-between px-4 text-[var(--color-text)] transition-[padding] duration-500 md:px-6 ${
            isScrolled ? 'py-2.5' : 'py-3.5'
          }`}
        >
          <div className="flex items-center gap-6 lg:gap-10">
            <Link
              to="/"
              data-intro
              className={`rounded-lg text-2xl uppercase tracking-wider text-[var(--color-text)] ${focusRing}`}
            >
              {logo}
            </Link>

            <ul
              className="relative hidden items-center gap-1 md:flex"
              onMouseLeave={() => movePill(activeIndex)}
              onBlur={() => movePill(activeIndex)}
            >
              <span
                ref={pillRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 h-full w-0 rounded-full bg-[var(--color-surface)] opacity-0 shadow-[0_8px_18px_-10px_color-mix(in_srgb,var(--color-primary)_70%,transparent)]"
              >
                <span aria-hidden="true" className="absolute inset-0 rounded-full" style={PILL_RING} />
              </span>

              {navLinks.map((item, i) => {
                const isActive = i === activeIndex
                return (
                  <li key={item.path} ref={(el) => (itemRefs.current[i] = el)} data-intro>
                    <Link
                      to={item.path}
                      aria-current={isActive ? 'page' : undefined}
                      onMouseEnter={() => movePill(i)}
                      onFocus={() => movePill(i)}
                      className={`relative z-10 block rounded-full px-5 py-2 text-base transition-colors duration-300 hover:text-[var(--color-text)] ${focusRing} ${
                        isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <div ref={contactWrapRef} data-intro className="hidden md:block">
              <Link
                ref={contactRef}
                to={CONTACT_PATH}
                className={`block rounded-full bg-[var(--color-primary)] px-6 py-2 text-base text-[var(--color-on-primary)] shadow-[0_0_24px_var(--color-glow)] transition-[box-shadow,filter] duration-300 hover:shadow-[0_0_32px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] hover:brightness-110 ${focusRing}`}
              >
                تماس با ما
              </Link>
            </div>

            <button
              type="button"
              data-intro
              onClick={() => setIsOpen(true)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)] md:hidden ${focusRing}`}
              aria-label="باز کردن منو"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>

            <ThemeToggle data-intro theme={theme} onToggle={toggleTheme} />
          </div>
        </nav>
      </header>

      {/* ───────────── منوی موبایل ───────────── */}
      <div
        id="mobile-menu"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="منوی اصلی"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[999] flex min-h-screen w-full flex-col bg-[var(--color-bg)] px-6 py-6 font-[Lalezar] text-[var(--color-text)] transition-[opacity,visibility] duration-300 md:hidden ${
          isOpen ? 'visible pointer-events-auto opacity-100' : 'invisible pointer-events-none opacity-0'
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-glow),transparent_60%)]"
        />

        <div className="relative flex items-center justify-between">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="text-2xl uppercase tracking-wider text-[var(--color-text)]"
          >
            {logo}
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-3xl leading-none text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)] ${focusRing}`}
              aria-label="بستن منو"
            >
              ×
            </button>
          </div>
        </div>

        <div className="relative mt-16 flex flex-col">
          {navLinks.map((item, i) => {
            const isActive = i === activeIndex
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`border-b border-[var(--color-border)] py-5 text-3xl transition-all duration-300 ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
                } ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
                style={{ transitionDelay: isOpen ? `${i * 50}ms` : '0ms' }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <Link
          to={CONTACT_PATH}
          onClick={() => setIsOpen(false)}
          className="relative mb-6 mt-auto block rounded-full bg-[var(--color-primary)] py-3.5 text-center text-lg text-[var(--color-on-primary)] shadow-[0_0_24px_var(--color-glow)]"
        >
          تماس با ما
        </Link>
      </div>
    </>
  )
}