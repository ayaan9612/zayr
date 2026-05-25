import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  CreditCard,
  Heart,
  LogOut,
  Lock,
  Mail,
  MapPin,
  Menu,
  Minus,
  Moon,
  Pause,
  Play,
  Plus,
  Search,
  Shield,
  ShoppingBag,
  Star,
  Sun,
  User,
  X,
} from 'lucide-react'
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  ebooks,
  faqs,
  podcasts,
  poems,
  products,
  reviews,
  storeStats,
} from './data'
import { CommerceProvider } from './store.jsx'
import { useCommerce } from './use-commerce.js'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/poetry', label: 'Poetry' },
  { to: '/shop', label: 'Shop' },
  { to: '/podcasts', label: 'Podcasts' },
  { to: '/ebooks', label: 'E-books' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const sectionMotion = {
  hidden: { opacity: 0, y: 44, filter: 'blur(18px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

const THEME_STORAGE_KEY = 'zayr-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return storedTheme === 'light' ? 'light' : 'dark'
}

function getFirstName(name = '') {
  return name.trim().split(/\s+/)[0] || 'Member'
}

function getInitials(name = '') {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return initials || 'TP'
}

function getAuthErrorMessage(error) {
  const code = error?.code

  if (code === 'auth/account-exists-with-different-credential')
    return 'That email already exists with a different sign-in method.'
  if (code === 'auth/email-already-in-use') return 'That email is already being used by another account.'
  if (code === 'auth/invalid-email') return 'Enter a valid email address.'
  if (code === 'auth/invalid-credential') return 'Your email or password is incorrect.'
  if (code === 'auth/operation-not-allowed')
    return 'This sign-in method is not enabled in Firebase yet. Enable it in Authentication > Sign-in method.'
  if (code === 'auth/popup-blocked') return 'Popup was blocked by the browser. Allow popups and try again.'
  if (code === 'auth/popup-closed-by-user') return 'Google sign in was closed before it finished.'
  if (code === 'auth/too-many-requests') return 'Too many attempts right now. Please wait and try again.'
  if (code === 'auth/unauthorized-domain')
    return 'This domain is not authorized in Firebase. Add localhost and 127.0.0.1 in Authentication > Settings.'
  if (code === 'auth/weak-password') return 'Choose a stronger password before continuing.'
  if (code === 'auth/user-not-found') return 'No account was found with that email.'
  if (code === 'auth/wrong-password') return 'Your email or password is incorrect.'

  return error?.message || 'Something went wrong. Please try again.'
}

function App() {
  return (
    <CommerceProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </CommerceProvider>
  )
}

function AppShell() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState(getInitialTheme)
  const cursorX = useMotionValue(50)
  const cursorY = useMotionValue(50)
  const glowX = useSpring(cursorX, { stiffness: 120, damping: 20 })
  const glowY = useSpring(cursorY, { stiffness: 120, damping: 20 })
  const glowColor = theme === 'dark' ? 'rgba(245, 239, 228, 0.18)' : 'rgba(168, 142, 111, 0.18)'
  const glowMask = useMotionTemplate`radial-gradient(480px at ${glowX}% ${glowY}%, ${glowColor}, transparent 65%)`

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 950)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setMenuOpen(false), 0)
    window.scrollTo(0, 0)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setScrolled(currentY > 24)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePointerMove = (event) => {
    const x = (event.clientX / window.innerWidth) * 100
    const y = (event.clientY / window.innerHeight) * 100
    cursorX.set(x)
    cursorY.set(y)
  }

  return (
    <div className="app-shell" data-theme={theme} onPointerMove={handlePointerMove}>
      <motion.div className="cursor-glow" style={{ backgroundImage: glowMask }} />
      <AnimatePresence>
        {!ready && <LoadingScreen />}
      </AnimatePresence>
      <SiteHeader
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        scrolled={scrolled}
        theme={theme}
        toggleTheme={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
      />
      <CartDrawer />
      <MobileMenu
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        theme={theme}
        toggleTheme={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
      />
      <AnimatedRoutes />
      <SiteFooter />
    </div>
  )
}

function LoadingScreen() {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <motion.div
        className="loading-mark"
        initial={{ scale: 0.85, opacity: 0.3 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.2 }}
      >
        <span>ZAYR</span>
        <small>luxury stories in motion</small>
      </motion.div>
    </motion.div>
  )
}

function SiteHeader({ menuOpen, setMenuOpen, scrolled, theme, toggleTheme }) {
  const { cartCount, wishlistCount, setCartOpen, user } = useCommerce()

  return (
    <header
      className={[
        'site-header',
        scrolled ? 'is-scrolled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Link className="brand-lockup" to="/">
        <span className="brand-overline">ZAYR</span>
        <span className="brand-wordmark">ZAYR</span>
      </Link>

      <nav className="desktop-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink key={item.to} className="nav-link" to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <NavLink className="icon-button" to="/wishlist" aria-label="Wishlist">
          <Heart size={18} />
          {wishlistCount > 0 && <span className="count-pill">{wishlistCount}</span>}
        </NavLink>
        <button
          type="button"
          className="icon-button"
          aria-label="Open cart"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag size={18} />
          {cartCount > 0 && <span className="count-pill">{cartCount}</span>}
        </button>
        <NavLink className="icon-button" to={user ? '/profile' : '/signin'} aria-label="Account">
          <User size={18} />
        </NavLink>
        <button
          type="button"
          className="icon-button mobile-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  )
}

function ThemeToggle({ theme, onToggle, wide = false }) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className={`theme-toggle ${wide ? 'is-wide' : ''}`}
      aria-label={`Switch to ${nextTheme} theme`}
      onClick={onToggle}
    >
      <span className="theme-toggle-icon">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</span>
      <span className="theme-toggle-copy">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}

function MobileMenu({ menuOpen, setMenuOpen, theme, toggleTheme }) {
  const { user } = useCommerce()

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          className="mobile-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="mobile-menu-panel"
            initial={{ y: -32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -32, opacity: 0 }}
          >
            <div className="mobile-menu-copy">
              <span className="eyebrow">inside the universe</span>
              <h2>Editorial navigation for every screen.</h2>
            </div>
            <div className="mobile-menu-meta">
              <ThemeToggle theme={theme} onToggle={toggleTheme} wide />
            </div>
            <nav className="mobile-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  className="mobile-nav-link"
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{item.label}</span>
                  <ArrowRight size={18} />
                </NavLink>
              ))}
              <NavLink className="mobile-nav-link" to="/cart" onClick={() => setMenuOpen(false)}>
                <span>Cart</span>
                <ArrowRight size={18} />
              </NavLink>
              <NavLink
                className="mobile-nav-link"
                to={user ? '/profile' : '/signin'}
                onClick={() => setMenuOpen(false)}
              >
                <span>{user ? 'Profile' : 'Sign in'}</span>
                <ArrowRight size={18} />
              </NavLink>
              <NavLink className="mobile-nav-link" to="/dashboard" onClick={() => setMenuOpen(false)}>
                <span>Dashboard</span>
                <ArrowRight size={18} />
              </NavLink>
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CartDrawer() {
  const { cartItemsDetailed, cartTotal, cartOpen, setCartOpen, updateCartItem, removeFromCart } =
    useCommerce()

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          className="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCartOpen(false)}
        >
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <span className="eyebrow">shopping bag</span>
                <h3>Your selections</h3>
              </div>
              <button type="button" className="icon-button" onClick={() => setCartOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {cartItemsDetailed.length === 0 ? (
                <div className="empty-state">
                  <ShoppingBag size={24} />
                  <h4>The cart is quiet for now.</h4>
                  <p>Add a piece, a poem, or a soundscape to start your ritual.</p>
                  <Link className="button button-primary" to="/shop" onClick={() => setCartOpen(false)}>
                    Explore the shop
                  </Link>
                </div>
              ) : (
                cartItemsDetailed.map((item) => (
                  <article className="drawer-item" key={`${item.id}-${item.size}`}>
                    <img src={item.images[0]} alt={item.name} />
                    <div className="drawer-item-copy">
                      <div>
                        <h4>{item.name}</h4>
                        <p>
                          {item.category} {item.size ? ` | ${item.size}` : ''}
                        </p>
                      </div>
                      <span>${item.price}</span>
                      <div className="quantity-stepper">
                        <button
                          type="button"
                          onClick={() => updateCartItem(item.id, item.size, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartItem(item.id, item.size, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => removeFromCart(item.id, item.size)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="drawer-footer">
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>${cartTotal.toFixed(2)}</strong>
              </div>
              <div className="drawer-actions">
                <Link className="button button-secondary" to="/cart" onClick={() => setCartOpen(false)}>
                  View cart
                </Link>
                <Link className="button button-primary" to="/checkout" onClick={() => setCartOpen(false)}>
                  Checkout
                </Link>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:productId" element={<ProductPage key={location.pathname} />} />
        <Route path="/poetry" element={<PoetryArchivePage />} />
        <Route path="/poetry/:poemSlug" element={<PoemPage />} />
        <Route path="/podcasts" element={<PodcastPage />} />
        <Route path="/ebooks" element={<EbookPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/terms" element={<LegalPage variant="terms" />} />
        <Route path="/privacy" element={<LegalPage variant="privacy" />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}

function PageTransition({ children, className = 'page-shell' }) {
  return (
    <motion.main
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  )
}

function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      variants={sectionMotion}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

function SectionHeading({ eyebrow, title, body, action }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <div className="section-heading-meta">
        <p>{body}</p>
        {action}
      </div>
    </div>
  )
}

function MagneticButton({ to, href, children, className = 'button button-primary' }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const translateX = useSpring(x, { stiffness: 180, damping: 16 })
  const translateY = useSpring(y, { stiffness: 180, damping: 16 })

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) * 0.14)
    y.set((event.clientY - rect.top - rect.height / 2) * 0.14)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  const content = (
    <motion.span className={className} style={{ x: translateX, y: translateY }}>
      {children}
    </motion.span>
  )

  if (to) {
    return (
      <Link to={to} onMouseMove={handleMove} onMouseLeave={handleLeave}>
        {content}
      </Link>
    )
  }

  return (
    <a href={href} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {content}
    </a>
  )
}

function HomePage() {
  return (
    <PageTransition className="home-page">
      <HeroSection />
      <section className="section-block home-panel">
        <Reveal>
          <SectionHeading
            eyebrow="featured poems"
            title="A living archive of letters, longing, and language."
            body="Short reads from the brand's private archive."
            action={
              <Link className="text-link" to="/poetry">
                Browse the archive <ArrowRight size={16} />
              </Link>
            }
          />
        </Reveal>
        <div className="poetry-grid">
          {poems.slice(0, 3).map((poem, index) => (
            <PoemCard key={poem.slug} poem={poem} delay={index * 0.1} />
          ))}
        </div>
      </section>

      <section className="section-block home-panel">
        <Reveal>
          <SectionHeading
            eyebrow="featured collection"
            title="Clothing cut like memory, finished like a statement piece."
            body="Quiet silhouettes, premium texture, limited drops."
            action={
              <Link className="text-link" to="/shop">
                Explore collection <ArrowRight size={16} />
              </Link>
            }
          />
        </Reveal>
        <div className="product-grid featured-grid">
          {products.slice(0, 4).map((product, index) => (
            <ProductCard key={product.id} product={product} delay={index * 0.08} />
          ))}
        </div>
      </section>

      <section className="section-block home-panel">
        <Reveal>
          <SectionHeading
            eyebrow="sound and ritual"
            title="Audio experiences dressed in ambient glow and cinematic rhythm."
            body="Private listening, spoken word, and softer pacing."
            action={
              <Link className="text-link" to="/podcasts">
                Listen now <ArrowRight size={16} />
              </Link>
            }
          />
        </Reveal>
        <div className="podcast-grid">
          {podcasts.slice(0, 2).map((podcast, index) => (
            <PodcastCard key={podcast.id} podcast={podcast} delay={index * 0.1} compact />
          ))}
          <Reveal className="membership-panel" delay={0.2}>
            <span className="eyebrow">membership</span>
            <h3>Inner Circle</h3>
            <p>Private audio, early drops, exclusive archive notes.</p>
            <ul className="feature-list">
              <li>Monthly audio letters</li>
              <li>First access to limited apparel</li>
              <li>Exclusive archive readings</li>
            </ul>
            <MagneticButton to="/signup" className="button button-primary">
              Join the circle
            </MagneticButton>
          </Reveal>
        </div>
      </section>

      <section className="section-block home-panel">
        <Reveal>
          <SectionHeading
            eyebrow="digital editions"
            title="E-books and prints with tactile depth and collector energy."
            body="Collector-ready editions for quieter reading moments."
            action={
              <Link className="text-link" to="/ebooks">
                Enter the store <ArrowRight size={16} />
              </Link>
            }
          />
        </Reveal>
        <div className="ebook-grid">
          {ebooks.slice(0, 3).map((book, index) => (
            <EbookCard key={book.id} book={book} delay={index * 0.1} />
          ))}
        </div>
      </section>

      <section className="section-block home-panel">
        <Reveal>
          <SectionHeading
            eyebrow="reader notes"
            title="What the universe feels like in other people's words."
            body="A few words from readers and listeners."
          />
        </Reveal>
        <TestimonialMarquee />
      </section>

      <section className="section-block home-panel home-newsletter">
        <NewsletterSection />
      </section>
    </PageTransition>
  )
}

function HeroSection() {
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const y = useMotionValue(0)
  const headlineY = useTransform(y, [0, 1], [0, -14])
  const heroProduct = products[0]
  const heroStats = storeStats.slice(0, 2)

  useEffect(() => {
    const handleScroll = () => {
      y.set(Math.min(window.scrollY / 480, 1))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [y])

  const particles = Array.from({ length: 12 }, (_, index) => ({
    id: index,
    left: `${8 + index * 7}%`,
    top: `${12 + (index % 4) * 18}%`,
    duration: 4.5 + index * 0.4,
  }))

  return (
    <section
      className="hero-section"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setGlow({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        })
      }}
      style={{
        '--hero-glow-x': `${glow.x}%`,
        '--hero-glow-y': `${glow.y}%`,
      }}
    >
      <div className="hero-lights" />
      <div className="hero-grain" />
      <div className="hero-particles" aria-hidden="true">
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="particle"
            style={{ left: particle.left, top: particle.top }}
            animate={{ y: [-16, 16, -16], opacity: [0.2, 0.75, 0.2], scale: [0.8, 1.1, 0.8] }}
            transition={{ repeat: Infinity, duration: particle.duration, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="hero-content">
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          poetry, fashion, sound
        </motion.span>
        <motion.h1
          className="hero-title"
          style={{ y: headlineY }}
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        >
          Poetry You Can Wear.
          <br />
          Stories You Can Feel.
        </motion.h1>
        <motion.p
          className="hero-copy"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          A calmer store for apparel, poems, and sound.
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.75 }}
        >
          <MagneticButton to="/shop" className="button button-primary">
            Explore collection
          </MagneticButton>
          <MagneticButton to="/poetry" className="button button-secondary">
            Read poetry
          </MagneticButton>
          <MagneticButton to="/podcasts" className="button button-tertiary">
            Listen to podcast
          </MagneticButton>
        </motion.div>
        <motion.div
          className="hero-metrics"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.75 }}
        >
          {heroStats.map((stat) => (
            <article className="hero-stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="hero-editorial-card"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <div className="hero-editorial-image">
          <img src={heroProduct.images[0]} alt={heroProduct.name} />
        </div>
        <span className="eyebrow">latest chapter</span>
        <h3>{heroProduct.name}</h3>
        <p>{heroProduct.description}</p>
        <div className="hero-chip-row">
          <span>{heroProduct.tag}</span>
          <span>${heroProduct.price}</span>
        </div>
        <Link className="text-link" to="/shop/midnight-linen-hoodie">
          View piece <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  )
}

function ProductCard({ product, delay = 0 }) {
  const { addToCart, toggleWishlist, wishlist } = useCommerce()
  const liked = wishlist.includes(product.id)

  return (
    <Reveal delay={delay}>
      <article className="product-card">
        <Link className="product-media" to={`/shop/${product.id}`}>
          <img className="primary-image" src={product.images[0]} alt={product.name} />
          <img className="secondary-image" src={product.images[1]} alt={product.name} />
          <span className="product-badge">{product.tag}</span>
        </Link>
        <div className="product-content">
          <div className="product-meta">
            <span>{product.category}</span>
            <strong>${product.price}</strong>
          </div>
          <Link className="product-title" to={`/shop/${product.id}`}>
            {product.name}
          </Link>
          <p>{product.description}</p>
          <div className="product-actions">
            <button type="button" className="button button-secondary" onClick={() => addToCart(product.id, product.sizes?.[0] ?? null)}>
              Add to cart
            </button>
            <button
              type="button"
              className={`icon-button ${liked ? 'is-active' : ''}`}
              onClick={() => toggleWishlist(product.id)}
              aria-label="Toggle wishlist"
            >
              <Heart size={18} />
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

function PoemCard({ poem, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <article className="poem-card">
        <span className="eyebrow">{poem.collection}</span>
        <h3>{poem.title}</h3>
        <p>{poem.excerpt}</p>
        <Link className="text-link" to={`/poetry/${poem.slug}`}>
          Read the full piece <ArrowRight size={16} />
        </Link>
      </article>
    </Reveal>
  )
}

function PodcastCard({ podcast, compact = false, delay = 0 }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(12)

  useEffect(() => {
    if (!playing) return undefined

    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) return 0
        return value + 1
      })
    }, 120)

    return () => window.clearInterval(timer)
  }, [playing])

  return (
    <Reveal delay={delay}>
      <article className={`podcast-card ${compact ? 'is-compact' : ''}`}>
        <div className="podcast-topline">
          <span className="eyebrow">{podcast.series}</span>
          <span>{podcast.duration}</span>
        </div>
        <h3>{podcast.title}</h3>
        <p>{podcast.description}</p>
        <div className="visualizer" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <motion.span
              key={index}
              animate={{ height: playing ? [10, 32, 18, 24] : [12, 12, 12] }}
              transition={{
                repeat: Infinity,
                duration: 1.3 + index * 0.05,
                ease: 'easeInOut',
                delay: index * 0.04,
              }}
            />
          ))}
        </div>
        <div className="progress-shell">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="podcast-actions">
          <button type="button" className="button button-primary" onClick={() => setPlaying((value) => !value)}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing ? 'Pause' : 'Play'}
          </button>
          <Link className="button button-tertiary" to="/signup">
            Members only
          </Link>
        </div>
      </article>
    </Reveal>
  )
}

function EbookCard({ book, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <article className="ebook-card">
        <div className="ebook-cover">
          <div className="ebook-spine" />
          <div className="ebook-face">
            <span className="eyebrow">{book.format}</span>
            <h3>{book.title}</h3>
            <p>{book.subtitle}</p>
          </div>
        </div>
        <div className="ebook-details">
          <span>${book.price}</span>
          <p>{book.description}</p>
          <Link className="text-link" to="/ebooks">
            Preview edition <ArrowRight size={16} />
          </Link>
        </div>
      </article>
    </Reveal>
  )
}

function TestimonialMarquee() {
  const marqueeItems = [...reviews, ...reviews]

  return (
    <div className="marquee-shell">
      <motion.div
        className="marquee-track"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 28 }}
      >
        {marqueeItems.map((review, index) => (
          <article className="review-card" key={`${review.name}-${index}`}>
            <div className="review-stars">
              {Array.from({ length: 5 }, (_, starIndex) => (
                <Star key={starIndex} size={14} fill="currentColor" />
              ))}
            </div>
            <p>{review.quote}</p>
            <strong>{review.name}</strong>
          </article>
        ))}
      </motion.div>
    </div>
  )
}

function NewsletterSection() {
  const [status, setStatus] = useState('idle')

  const handleSubmit = (event) => {
    event.preventDefault()
    setStatus('success')
    event.currentTarget.reset()
  }

  return (
    <Reveal className="newsletter-panel">
      <div>
        <span className="eyebrow">newsletter</span>
        <h2>Letters for people who like beauty with a pulse.</h2>
        <p>
          New drops, unreleased poems, private listening sessions, and early access invitations delivered with restraint.
        </p>
      </div>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <label>
          <span>Email address</span>
          <input name="email" type="email" placeholder="Enter your email" required />
        </label>
        <button type="submit" className="button button-primary">
          Subscribe
        </button>
        {status === 'success' && (
          <p className="success-copy">
            <Check size={16} />
            You're on the list.
          </p>
        )}
      </form>
    </Reveal>
  )
}

function ShopPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const deferredQuery = useDeferredValue(query)

  const categories = ['All', 'Hoodies', 'Oversized T-Shirts', 'Limited Edition', 'Poetry Wearables', 'Membership']

  const filteredProducts = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase()
    const nextItems = products.filter((product) => {
      const matchesCategory = category === 'All' || product.category === category
      const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase()
      const matchesQuery = !normalized || haystack.includes(normalized)
      return matchesCategory && matchesQuery
    })

    if (sortBy === 'price-low') return [...nextItems].sort((a, b) => a.price - b.price)
    if (sortBy === 'price-high') return [...nextItems].sort((a, b) => b.price - a.price)
    return nextItems
  }, [category, deferredQuery, sortBy])

  return (
    <PageTransition>
      <PageHero
        eyebrow="shop"
        title="Editorial pieces designed to be worn, kept, and collected."
        body="Luxury layering, poetic graphics, and limited drops across apparel, prints, and digital editions."
      />
      <section className="section-block section-tight">
        <div className="filter-bar">
          <label className="search-field">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="chip-row">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${item === category ? 'is-active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="sort-field">
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
            </select>
          </label>
        </div>
        <div className="product-grid">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} delay={index * 0.04} />
          ))}
        </div>
      </section>
    </PageTransition>
  )
}

function ProductPage() {
  const { productId } = useParams()
  const { addToCart, toggleWishlist, wishlist } = useCommerce()
  const navigate = useNavigate()
  const product = products.find((entry) => entry.id === productId)
  const [selectedImage, setSelectedImage] = useState(product?.images?.[0] ?? '')
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] ?? null)

  if (!product) return <NotFoundPage />

  const related = products.filter((entry) => entry.id !== product.id).slice(0, 3)

  return (
    <PageTransition>
      <section className="section-block product-detail">
        <div className="product-gallery">
          <div className="product-gallery-main">
            <img src={selectedImage} alt={product.name} />
          </div>
          <div className="product-thumbs">
            {product.images.map((image) => (
              <button
                key={image}
                type="button"
                className={image === selectedImage ? 'is-active' : ''}
                onClick={() => setSelectedImage(image)}
              >
                <img src={image} alt={product.name} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-summary">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="price-line">${product.price}</p>
          <p>{product.longDescription}</p>
          {product.sizes && (
            <div className="size-picker">
              <span>Choose a size</span>
              <div className="chip-row">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`chip ${selectedSize === size ? 'is-active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="detail-actions">
            <button type="button" className="button button-primary" onClick={() => addToCart(product.id, selectedSize)}>
              Add to cart
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                addToCart(product.id, selectedSize)
                navigate('/checkout')
              }}
            >
              Buy now
            </button>
            <button
              type="button"
              className={`icon-button ${wishlist.includes(product.id) ? 'is-active' : ''}`}
              onClick={() => toggleWishlist(product.id)}
              aria-label="Toggle wishlist"
            >
              <Heart size={18} />
            </button>
          </div>
          <div className="meta-list">
            <div>
              <span>Material</span>
              <strong>{product.material}</strong>
            </div>
            <div>
              <span>Edition</span>
              <strong>{product.tag}</strong>
            </div>
            <div>
              <span>Shipping</span>
              <strong>Worldwide in 4 to 8 days</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block section-tight">
        <SectionHeading
          eyebrow="related pieces"
          title="More from the collection"
          body="Curated companions from the same dark-luxury universe."
        />
        <div className="product-grid">
          {related.map((item, index) => (
            <ProductCard key={item.id} product={item} delay={index * 0.05} />
          ))}
        </div>
      </section>
    </PageTransition>
  )
}

function PoetryArchivePage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="archive"
        title="A catalog of midnight scenes, intimate confessions, and quiet aftermaths."
        body="Every piece is treated like a printed spread, unfolding through light, pause, and negative space."
      />
      <section className="section-block section-tight">
        <div className="poetry-grid">
          {poems.map((poem, index) => (
            <PoemCard key={poem.slug} poem={poem} delay={index * 0.06} />
          ))}
        </div>
      </section>
    </PageTransition>
  )
}

function PoemPage() {
  const { poemSlug } = useParams()
  const poem = poems.find((entry) => entry.slug === poemSlug)

  if (!poem) return <NotFoundPage />

  return (
    <PageTransition>
      <section className="section-block reading-page">
        <div className="reading-intro">
          <span className="eyebrow">{poem.collection}</span>
          <h1>{poem.title}</h1>
          <p>{poem.meta}</p>
        </div>
        <article className="reading-body">
          {poem.body.split('\n').map((line, index) => (
            <p key={`${poem.slug}-${index}`}>{line}</p>
          ))}
        </article>
      </section>
    </PageTransition>
  )
}

function PodcastPage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="podcast salon"
        title="Audio poetry, private listening, and soft cinematic pressure."
        body="Episodes designed like after-hours broadcasts, with ambient visuals and premium pacing."
      />
      <section className="section-block section-tight">
        <div className="podcast-grid podcast-page-grid">
          {podcasts.map((podcast, index) => (
            <PodcastCard key={podcast.id} podcast={podcast} delay={index * 0.06} />
          ))}
        </div>
      </section>
    </PageTransition>
  )
}

function EbookPage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="digital editions"
        title="Portable libraries for readers who keep beauty close."
        body="E-books, poetry print bundles, and collector-ready downloads in an elevated storefront."
      />
      <section className="section-block section-tight">
        <div className="ebook-grid ebook-page-grid">
          {ebooks.map((book, index) => (
            <EbookCard key={book.id} book={book} delay={index * 0.06} />
          ))}
        </div>
      </section>
    </PageTransition>
  )
}

function AboutPage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="about the brand"
        title="A luxury poetry imprint built for feeling, fashion, and memory."
        body="Part storefront, part personal archive, part atmospheric magazine: every detail is designed to feel timeless."
      />
      <section className="section-block about-grid">
        <Reveal className="about-copy">
          <p>
            ZAYR began as a private language of late-night notes, voice memos, and fragments saved between garments and books.
          </p>
          <p>
            It has become a universe where clothing, audio, and digital editions hold the same emotional charge as a carefully kept line of verse.
          </p>
        </Reveal>
        <Reveal className="about-panel">
          <span className="eyebrow">house notes</span>
          <div className="stat-grid">
            {storeStats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </PageTransition>
  )
}

function ContactPage() {
  const [sent, setSent] = useState(false)

  return (
    <PageTransition>
      <PageHero
        eyebrow="contact"
        title="Let the next conversation arrive with intention."
        body="Editorial partnerships, press requests, wholesale notes, and intimate brand collaborations are all welcome."
      />
      <section className="section-block contact-grid">
        <Reveal className="contact-panel">
          <form
            className="contact-form"
            onSubmit={(event) => {
              event.preventDefault()
              setSent(true)
              event.currentTarget.reset()
            }}
          >
            <label>
              <span>Name</span>
              <input type="text" name="name" placeholder="Your name" required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" name="email" placeholder="Your email" required />
            </label>
            <label>
              <span>Message</span>
              <textarea name="message" rows="5" placeholder="Tell us about your project" required />
            </label>
            <button type="submit" className="button button-primary">
              Send message
            </button>
            {sent && (
              <p className="success-copy">
                <Check size={16} />
                Message sent. We'll reply soon.
              </p>
            )}
          </form>
        </Reveal>
        <Reveal className="map-panel">
          <div className="map-visual">
            <span className="map-grid" />
            <span className="map-pin">
              <MapPin size={18} />
            </span>
          </div>
          <div className="map-copy">
            <h3>Creative studio</h3>
            <p>Remote-first, globally shipped, grounded in intimate storytelling.</p>
            <a href="mailto:hello@zayr.store">hello@zayr.store</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram journal
            </a>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  )
}

function FaqPage() {
  const [openItem, setOpenItem] = useState(0)

  return (
    <PageTransition>
      <PageHero
        eyebrow="faq"
        title="Questions answered with the same calm pace as the brand."
        body="Shipping, memberships, digital delivery, and the details behind the experience."
      />
      <section className="section-block section-tight">
        <div className="faq-list">
          {faqs.map((item, index) => {
            const open = openItem === index
            return (
              <article className={`faq-item ${open ? 'is-open' : ''}`} key={item.question}>
                <button type="button" onClick={() => setOpenItem(open ? -1 : index)}>
                  <span>{item.question}</span>
                  <ChevronDown size={18} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <p>{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            )
          })}
        </div>
      </section>
    </PageTransition>
  )
}

function AccountAccessState({ title, body }) {
  return (
    <div className="empty-state account-access-card">
      <Shield size={24} />
      <h3>{title}</h3>
      <p>{body}</p>
      <div className="success-actions">
        <Link className="button button-primary" to="/signin">
          Sign in
        </Link>
        <Link className="button button-secondary" to="/signup">
          Create account
        </Link>
      </div>
    </div>
  )
}

function AuthLayout({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionTo,
  panelTitle,
  panelBody,
  panelFeatures,
  panelStats,
  children,
}) {
  return (
    <PageTransition>
      <section className="auth-shell">
        <div className="auth-visual">
          <div className="auth-visual-content">
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
            <div className="auth-feature-list">
              {panelFeatures.map((feature) => (
                <div className="auth-feature-item" key={feature}>
                  <Check size={16} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className="auth-panel-copy">
              <span className="eyebrow">inside your account</span>
              <h2>{panelTitle}</h2>
              <p>{panelBody}</p>
            </div>
            <div className="auth-stat-grid">
              {panelStats.map((stat) => (
                <article className="auth-panel-stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
            <Link className="text-link" to={actionTo}>
              {actionLabel} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="auth-form-shell">{children}</div>
      </section>
    </PageTransition>
  )
}

function AuthGoogleButton({ label, onClick }) {
  return (
    <button type="button" className="auth-google-button" onClick={onClick}>
      <span className="google-mark" aria-hidden="true">
        G
      </span>
      <span>{label}</span>
    </button>
  )
}

function SignUpPage() {
  const { signInWithGoogle, signUp } = useCommerce()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  return (
    <AuthLayout
      eyebrow="membership access"
      title="Create an account that feels part storefront, part private archive."
      subtitle="Save favorites, track orders, and keep your profile ready for faster checkouts and future drops."
      actionLabel="Already have an account?"
      actionTo="/signin"
      panelTitle="Everything you save stays close."
      panelBody="Wishlists, delivery details, and your collector history live in one calm account space."
      panelFeatures={[
        'Save favorite pieces and return later',
        'Move faster through checkout',
        'Keep order history and member details together',
      ]}
      panelStats={[
        { value: '1 tap', label: 'to open your profile later' },
        { value: '24/7', label: 'access to saved orders and wishlist' },
      ]}
    >
      <form
        className="auth-form"
        onSubmit={async (event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          const password = String(data.get('password') ?? '')
          const confirmPassword = String(data.get('confirmPassword') ?? '')

          if (password !== confirmPassword) {
            setError('Passwords need to match before the account can be created.')
            return
          }

          setError('')
          try {
            await signUp({
              name: data.get('name'),
              email: data.get('email'),
              password,
              newsletter: data.get('newsletter') === 'on',
            bio: 'New member inside the ZAYR archive.',
            })
            navigate('/profile')
          } catch (authError) {
            setError(getAuthErrorMessage(authError))
          }
        }}
      >
        <div className="auth-form-header">
          <span className="eyebrow">create account</span>
          <h2>Start your profile</h2>
          <p>Use any details you want for now. This is a demo-ready account flow and you can edit everything later.</p>
        </div>
        <AuthGoogleButton
          label="Sign up with Google"
          onClick={async () => {
            setError('')
            try {
              await signInWithGoogle()
              navigate('/profile')
            } catch (firebaseError) {
              setError(getAuthErrorMessage(firebaseError))
            }
          }}
        />
        <div className="auth-divider">
          <span>or continue with email</span>
        </div>
        <label>
          <span>Full name</span>
          <input type="text" name="name" placeholder="Your name" required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" name="email" placeholder="you@example.com" required />
        </label>
        <div className="auth-inline-fields">
          <label>
            <span>Password</span>
            <input type="password" name="password" placeholder="Create a password" required />
          </label>
          <label>
            <span>Confirm password</span>
            <input type="password" name="confirmPassword" placeholder="Repeat your password" required />
          </label>
        </div>
        <label className="checkbox-field">
          <input type="checkbox" name="newsletter" defaultChecked />
          <span>Send me product drops, collector notes, and new release updates.</span>
        </label>
        {error && <p className="auth-note auth-note-error">{error}</p>}
        <button type="submit" className="button button-primary auth-submit">
          Create account
        </button>
      </form>
    </AuthLayout>
  )
}

function SignInPage() {
  const { signIn, signInWithGoogle } = useCommerce()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  return (
    <PageTransition>
      <section className="auth-shell auth-shell-simple">
        <div className="auth-form-shell auth-form-shell-simple">
          <form
            className="auth-form"
            onSubmit={async (event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              setError('')
              try {
                await signIn({
                  email: data.get('email'),
                  password: data.get('password'),
                })
                navigate('/profile')
              } catch (authError) {
                setError(getAuthErrorMessage(authError))
              }
            }}
          >
            <div className="auth-form-header">
              <span className="eyebrow">sign in</span>
              <h2>Sign in</h2>
            </div>
            <AuthGoogleButton
              label="Sign in with Google"
              onClick={async () => {
                setError('')
                try {
                  await signInWithGoogle()
                  navigate('/profile')
                } catch (firebaseError) {
                  setError(getAuthErrorMessage(firebaseError))
                }
              }}
            />
            <div className="auth-divider">
              <span>or continue with email</span>
            </div>
            <label>
              <span>Email</span>
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" name="password" placeholder="Your password" required />
            </label>
            {error && <p className="auth-note auth-note-error">{error}</p>}
            <button type="submit" className="button button-primary auth-submit">
              Sign in
            </button>
            <p className="auth-note">
              Don&apos;t have an account?{' '}
              <Link className="text-link" to="/signup">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </section>
    </PageTransition>
  )
}

function CartPage() {
  const { cartItemsDetailed, cartTotal, updateCartItem, removeFromCart } = useCommerce()

  return (
    <PageTransition>
      <PageHero
        eyebrow="cart"
        title="A brief pause before these pieces become yours."
        body="Review garments, editions, and audio before moving to a secure, payment-ready checkout."
      />
      <section className="section-block cart-layout">
        <div className="cart-list">
          {cartItemsDetailed.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={24} />
              <h3>Your cart is empty.</h3>
              <p>Start with a hoodie, a poem, or a digital edition.</p>
              <Link className="button button-primary" to="/shop">
                Go to shop
              </Link>
            </div>
          ) : (
            cartItemsDetailed.map((item) => (
              <article className="cart-item" key={`${item.id}-${item.size}`}>
                <img src={item.images[0]} alt={item.name} />
                <div className="cart-item-copy">
                  <h3>{item.name}</h3>
                  <p>
                    {item.category}
                    {item.size ? ` | ${item.size}` : ''}
                  </p>
                  <div className="quantity-stepper">
                    <button type="button" onClick={() => updateCartItem(item.id, item.size, item.quantity - 1)}>
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateCartItem(item.id, item.size, item.quantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button type="button" className="text-button" onClick={() => removeFromCart(item.id, item.size)}>
                    Remove
                  </button>
                </div>
                <strong>${(item.price * item.quantity).toFixed(2)}</strong>
              </article>
            ))
          )}
        </div>
        <aside className="order-summary">
          <h3>Order summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>${cartTotal.toFixed(2)}</strong>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <strong>{cartItemsDetailed.length ? '$18.00' : '$0.00'}</strong>
          </div>
          <div className="summary-row total-row">
            <span>Total</span>
            <strong>${(cartTotal + (cartItemsDetailed.length ? 18 : 0)).toFixed(2)}</strong>
          </div>
          <Link className="button button-primary" to="/checkout">
            Continue to checkout
          </Link>
        </aside>
      </section>
    </PageTransition>
  )
}

function CheckoutPage() {
  const { cartItemsDetailed, cartTotal, checkoutOrder } = useCommerce()
  const navigate = useNavigate()

  return (
    <PageTransition>
      <PageHero
        eyebrow="checkout"
        title="Secure, elegant, and ready for payment integration."
        body="A premium checkout flow designed for easy handoff to Stripe, Razorpay, or your preferred gateway."
      />
      <section className="section-block cart-layout">
        <form
          className="checkout-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (!cartItemsDetailed.length) return
            const data = new FormData(event.currentTarget)
            checkoutOrder({
              name: data.get('name'),
              email: data.get('email'),
              address: data.get('address'),
            })
            navigate('/order-success')
          }}
        >
          <div className="form-section">
            <h3>Contact</h3>
            <label>
              <span>Full name</span>
              <input type="text" name="name" required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" name="email" required />
            </label>
            <label>
              <span>Address</span>
              <textarea name="address" rows="4" required />
            </label>
          </div>
          <div className="form-section">
            <h3>Payment</h3>
            <div className="payment-card">
              <CreditCard size={18} />
              <span>Card module placeholder</span>
            </div>
            <div className="payment-note">
              <Lock size={16} />
              <p>Ready for gateway integration with secure tokenization and order confirmation hooks.</p>
            </div>
          </div>
          <button type="submit" className="button button-primary" disabled={!cartItemsDetailed.length}>
            Place order
          </button>
        </form>

        <aside className="order-summary">
          <h3>Order summary</h3>
          {cartItemsDetailed.map((item) => (
            <div className="summary-row" key={`${item.id}-${item.size}`}>
              <span>
                {item.name} x{item.quantity}
              </span>
              <strong>${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
          ))}
          <div className="summary-row total-row">
            <span>Total</span>
            <strong>${cartTotal.toFixed(2)}</strong>
          </div>
        </aside>
      </section>
    </PageTransition>
  )
}

function WishlistPage() {
  const { wishlistItems } = useCommerce()

  return (
    <PageTransition>
      <PageHero
        eyebrow="wishlist"
        title="Saved pieces worth returning to slowly."
        body="A private place for favorites, future gifts, and limited editions you do not want to forget."
      />
      <section className="section-block section-tight">
        {wishlistItems.length === 0 ? (
          <div className="empty-state">
            <Heart size={24} />
            <h3>Your wishlist is still empty.</h3>
            <p>Save pieces as you wander through the collection.</p>
            <Link className="button button-primary" to="/shop">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {wishlistItems.map((product, index) => (
              <ProductCard key={product.id} product={product} delay={index * 0.05} />
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  )
}

function ProfilePage() {
  const { cartCount, orders, signOut, updateUserProfile, user, wishlistItems } = useCommerce()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  if (!user) {
    return (
      <PageTransition>
        <PageHero
          eyebrow="profile"
          title="A profile unlocks your saved pieces and collector details."
          body="Sign in or create an account to manage your information, wishlist, and order history."
        />
        <section className="section-block section-tight">
          <AccountAccessState
            title="Sign in to manage your profile."
            body="Your account stores names, contact details, wishlist picks, and a cleaner path through checkout."
          />
        </section>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <PageHero
        eyebrow="profile"
        title={`${getFirstName(user.name)}, your profile is ready.`}
        body="Update account details, save contact information, and keep your storefront identity polished."
      />
      <section className="section-block profile-layout">
        <Reveal className="profile-summary-card">
          <div className="profile-avatar">{getInitials(user.name)}</div>
          <span className="eyebrow">profile overview</span>
          <h2>{user.name}</h2>
          <p>{user.bio}</p>
          <div className="profile-contact-lines">
            <span>
              <Mail size={16} />
              {user.email}
            </span>
            <span>
              <MapPin size={16} />
              {user.location || 'Add your city or shipping region'}
            </span>
            <span>
              <Shield size={16} />
              {user.membership}
            </span>
          </div>
          <div className="profile-mini-stats">
            <article className="profile-mini-stat">
              <strong>{orders.length}</strong>
              <span>Orders</span>
            </article>
            <article className="profile-mini-stat">
              <strong>{wishlistItems.length}</strong>
              <span>Wishlist</span>
            </article>
            <article className="profile-mini-stat">
              <strong>{cartCount}</strong>
              <span>Cart items</span>
            </article>
          </div>
          <div className="profile-summary-actions">
            <Link className="button button-secondary" to="/dashboard">
              View dashboard
            </Link>
            <button
              type="button"
              className="button button-tertiary"
              onClick={() => {
                signOut()
                navigate('/signin')
              }}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </Reveal>

        <Reveal className="profile-form-card" delay={0.08}>
          <div className="profile-section-heading">
            <span className="eyebrow">edit details</span>
            <h2>Keep your profile current</h2>
            <p>Everything here is saved locally for this storefront demo, including contact details and preferences.</p>
          </div>

          <form
            className="profile-form"
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)

              updateUserProfile({
                name: data.get('name'),
                email: data.get('email'),
                phone: data.get('phone'),
                location: data.get('location'),
                bio: data.get('bio'),
                newsletter: data.get('newsletter') === 'on',
              })
              setSaved(true)
            }}
          >
            <div className="auth-inline-fields">
              <label>
                <span>Full name</span>
                <input type="text" name="name" defaultValue={user.name} required />
              </label>
              <label>
                <span>Email</span>
                <input type="email" name="email" defaultValue={user.email} required />
              </label>
            </div>
            <div className="auth-inline-fields">
              <label>
                <span>Phone</span>
                <input type="text" name="phone" defaultValue={user.phone ?? ''} placeholder="+91 98765 43210" />
              </label>
              <label>
                <span>Location</span>
                <input
                  type="text"
                  name="location"
                  defaultValue={user.location ?? ''}
                  placeholder="City, country"
                />
              </label>
            </div>
            <label>
              <span>Bio</span>
              <textarea
                name="bio"
                rows="5"
                defaultValue={user.bio ?? ''}
                placeholder="Tell the store a little about your style or reading mood."
              />
            </label>
            <label className="checkbox-field">
              <input type="checkbox" name="newsletter" defaultChecked={Boolean(user.newsletter)} />
              <span>Keep me subscribed to future releases, archive notes, and limited drop alerts.</span>
            </label>
            <div className="profile-form-actions">
              <button type="submit" className="button button-primary">
                Save profile
              </button>
              <Link className="button button-secondary" to="/shop">
                Continue shopping
              </Link>
            </div>
            {saved && (
              <p className="success-copy">
                <Check size={16} />
                Profile updated and saved.
              </p>
            )}
          </form>
        </Reveal>
      </section>
    </PageTransition>
  )
}

function DashboardPage() {
  const { user, orders, wishlistItems } = useCommerce()

  if (!user) {
    return (
      <PageTransition>
        <PageHero
          eyebrow="dashboard"
          title="Your dashboard opens once you sign in."
          body="Create an account to save wishlist items, track orders, and manage your profile from one place."
        />
        <section className="section-block section-tight">
          <AccountAccessState
            title="Account access required"
            body="Sign in first, then this dashboard will show your orders, saved pieces, and account insights."
          />
        </section>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <PageHero
        eyebrow="dashboard"
        title={`Welcome ${getFirstName(user.name)} inside the private archive.`}
        body="Track orders, revisit saved products, and stay close to your membership and collector history."
      />
      <section className="section-block dashboard-grid">
        <Reveal className="dashboard-card">
          <span className="eyebrow">profile</span>
          <h3>{user.email}</h3>
          <p>Manage your profile, contact details, and subscriptions from one cleaner account section.</p>
          <Link className="text-link" to="/profile">
            Open profile <ArrowRight size={16} />
          </Link>
        </Reveal>
        <Reveal className="dashboard-card">
          <span className="eyebrow">saved pieces</span>
          <h3>{wishlistItems.length}</h3>
          <p>Items sitting in your wishlist, waiting for a better moment to become part of your collection.</p>
        </Reveal>
        <Reveal className="dashboard-card">
          <span className="eyebrow">membership</span>
          <h3>Inner Circle</h3>
          <p>Private audio letters, early access drops, and members-only readings.</p>
        </Reveal>
      </section>
      <section className="section-block section-tight">
        <SectionHeading
          eyebrow="order history"
          title="Your recent rituals"
          body="Placed orders appear here with polished summaries and status markers."
        />
        <div className="order-history">
          {orders.length === 0 ? (
            <div className="empty-state">
              <Shield size={24} />
              <h3>No orders yet.</h3>
              <p>Your future purchases will appear here after checkout.</p>
            </div>
          ) : (
            orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div>
                  <span className="eyebrow">order {order.id}</span>
                  <h3>{order.customer.name}</h3>
                  <p>{order.items.map((item) => item.name).join(', ')}</p>
                </div>
                <div className="order-meta">
                  <strong>${order.total.toFixed(2)}</strong>
                  <span>{order.status}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </PageTransition>
  )
}

function LegalPage({ variant }) {
  const pages = {
    terms: {
      eyebrow: 'terms',
      title: 'Terms shaped for a premium storefront experience.',
      body: 'Purchases, digital access, and membership participation are covered with clear, minimal language.',
    },
    privacy: {
      eyebrow: 'privacy',
      title: 'Privacy written with restraint and transparency.',
      body: 'Customer data, payment preparation, and newsletter consent are handled with a simple, modern standard.',
    },
  }

  const content = pages[variant]

  return (
    <PageTransition>
      <PageHero eyebrow={content.eyebrow} title={content.title} body={content.body} />
      <section className="section-block legal-copy">
        <p>
          This demo storefront is structured to support future production policies. Replace this placeholder copy with your
          operating terms, payment handling details, shipping commitments, digital delivery language, and jurisdiction notes.
        </p>
        <p>
          The layout is already designed for long-form legal pages with readable spacing, strong contrast, and mobile-friendly
          typography.
        </p>
      </section>
    </PageTransition>
  )
}

function OrderSuccessPage() {
  const { lastOrder } = useCommerce()

  return (
    <PageTransition>
      <section className="section-block success-panel">
        <div className="success-icon">
          <Check size={26} />
        </div>
        <span className="eyebrow">order complete</span>
        <h1>Your order has entered the archive beautifully.</h1>
        <p>
          {lastOrder
            ? `Order ${lastOrder.id} is confirmed and will move into fulfillment shortly.`
            : 'A confirmation summary will appear here after checkout.'}
        </p>
        <div className="success-actions">
          <Link className="button button-primary" to="/dashboard">
            View dashboard
          </Link>
          <Link className="button button-secondary" to="/shop">
            Continue shopping
          </Link>
        </div>
      </section>
    </PageTransition>
  )
}

function NotFoundPage() {
  return (
    <PageTransition>
      <section className="section-block success-panel">
        <span className="eyebrow">not found</span>
        <h1>This page drifted out of the collection.</h1>
        <p>Use the navigation to return to the main experience.</p>
        <Link className="button button-primary" to="/">
          Go home
        </Link>
      </section>
    </PageTransition>
  )
}

function PageHero({ eyebrow, title, body }) {
  return (
    <section className="page-hero">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{body}</p>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <span className="eyebrow">ZAYR</span>
          <h3>Fashion, language, and sound held in one luxurious atmosphere.</h3>
        </div>
        <div className="footer-links">
          <Link to="/shop">Shop</Link>
          <Link to="/poetry">Poetry</Link>
          <Link to="/podcasts">Podcasts</Link>
          <Link to="/ebooks">E-books</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div className="footer-links">
          <a href="mailto:hello@zayr.store">
            <Mail size={16} />
            hello@zayr.store
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <Camera size={16} />
            Instagram
          </a>
          <a href="https://spotify.com" target="_blank" rel="noreferrer">
            <AudioLines size={16} />
            Spotify
          </a>
          <a href="https://substack.com" target="_blank" rel="noreferrer">
            <BookOpen size={16} />
            Journal
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Copyright 2026 ZAYR. All rights reserved.</span>
        <span>Built as an immersive luxury storefront concept.</span>
      </div>
    </footer>
  )
}

export default App
