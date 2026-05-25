import { useEffect, useMemo, useRef, useState } from 'react'
import { CommerceContext } from './commerce-context.js'
import { products } from './data'
import {
  firebaseReady,
  loadRemoteAccount,
  observeFirebaseAuthState,
  saveRemoteAccount,
  signInWithEmailPassword,
  signInWithGooglePopup,
  signOutFirebaseSession,
  signUpWithEmailPassword,
  updateFirebaseUserProfile,
} from './lib/firebase.js'

const STORAGE_KEYS = {
  cart: 'zayr-cart',
  wishlist: 'zayr-wishlist',
  user: 'zayr-user',
  orders: 'zayr-orders',
}

function deriveNameFromEmail(email = '') {
  const localPart = email.split('@')[0] ?? ''
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim()

  if (!cleaned) return 'Poetry Member'

  return cleaned.replace(/\b\w/g, (character) => character.toUpperCase())
}

function normalizeAccount(account = {}, currentUser = null) {
  const email = String(account.email ?? currentUser?.email ?? '').trim()
  const suppliedName = String(account.name ?? currentUser?.name ?? '').trim()

  return {
    name: suppliedName || deriveNameFromEmail(email),
    email,
    phone: String(account.phone ?? currentUser?.phone ?? '').trim(),
    location: String(account.location ?? currentUser?.location ?? '').trim(),
    bio: String(
      account.bio ??
        currentUser?.bio ??
        'Collector of wearable poetry, quiet rituals, and after-hours editions.',
    ).trim(),
    newsletter: Boolean(account.newsletter ?? currentUser?.newsletter ?? true),
    membership: String(account.membership ?? currentUser?.membership ?? 'Inner Circle'),
    photoURL: String(account.photoURL ?? currentUser?.photoURL ?? '').trim(),
  }
}

function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback

  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function persistStorage(key, value) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function normalizeItems(items, fallback = []) {
  return Array.isArray(items) ? items : fallback
}

function buildRemotePayload({ user, cart, wishlist, orders }) {
  return {
    profile: user,
    cart,
    wishlist,
    orders,
  }
}

function mergeRemoteState(remoteAccount, fallbackState) {
  if (!remoteAccount) return fallbackState

  return {
    user: normalizeAccount(remoteAccount.profile ?? {}, fallbackState.user),
    cart: normalizeItems(remoteAccount.cart, fallbackState.cart),
    wishlist: normalizeItems(remoteAccount.wishlist, fallbackState.wishlist),
    orders: normalizeItems(remoteAccount.orders, fallbackState.orders),
  }
}

export function CommerceProvider({ children }) {
  const getInitialUser = () => readStorage(STORAGE_KEYS.user, null)

  const [cart, setCart] = useState(() => readStorage(STORAGE_KEYS.cart, []))
  const [wishlist, setWishlist] = useState(() => readStorage(STORAGE_KEYS.wishlist, []))
  const [user, setUser] = useState(getInitialUser)
  const [orders, setOrders] = useState(() => readStorage(STORAGE_KEYS.orders, []))
  const [cartOpen, setCartOpen] = useState(false)
  const [lastOrder, setLastOrder] = useState(null)
  const [remoteReady, setRemoteReady] = useState(() => !firebaseReady || !getInitialUser()?.email)
  const latestStateRef = useRef({ user: getInitialUser(), cart: [], wishlist: [], orders: [] })

  const accountEmail = user?.email ?? ''

  useEffect(() => persistStorage(STORAGE_KEYS.cart, cart), [cart])
  useEffect(() => persistStorage(STORAGE_KEYS.wishlist, wishlist), [wishlist])
  useEffect(() => persistStorage(STORAGE_KEYS.user, user), [user])
  useEffect(() => persistStorage(STORAGE_KEYS.orders, orders), [orders])

  useEffect(() => {
    latestStateRef.current = { user, cart, wishlist, orders }
  }, [cart, orders, user, wishlist])

  useEffect(() => {
    if (!firebaseReady) return undefined

    return observeFirebaseAuthState((firebaseUser) => {
      if (firebaseUser?.email) {
        setUser((current) =>
          normalizeAccount(
            {
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
            },
            current,
          ),
        )
        setRemoteReady(false)
        return
      }

      const hadSignedInUser = Boolean(latestStateRef.current.user?.email)
      setUser(null)
      setRemoteReady(true)

      if (hadSignedInUser) {
        setCart([])
        setWishlist([])
        setOrders([])
        setLastOrder(null)
      }
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!firebaseReady || !accountEmail || remoteReady) {
      return undefined
    }

    void (async () => {
      try {
        const remoteAccount = await loadRemoteAccount(accountEmail)
        const fallbackState = latestStateRef.current

        if (cancelled) return

        if (remoteAccount) {
          const merged = mergeRemoteState(remoteAccount, fallbackState)
          setUser(merged.user)
          setCart(merged.cart)
          setWishlist(merged.wishlist)
          setOrders(merged.orders)
        } else {
          await saveRemoteAccount(
            accountEmail,
            buildRemotePayload({
              user: fallbackState.user,
              cart: fallbackState.cart,
              wishlist: fallbackState.wishlist,
              orders: fallbackState.orders,
            }),
          )
        }
      } catch (error) {
        console.error('Firebase account sync setup failed:', error)
      } finally {
        if (!cancelled) {
          setRemoteReady(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [accountEmail, remoteReady])

  useEffect(() => {
    if (!firebaseReady || !remoteReady || !accountEmail || !user) return

    void saveRemoteAccount(
      accountEmail,
      buildRemotePayload({
        user,
        cart,
        wishlist,
        orders,
      }),
    ).catch((error) => {
      console.error('Firebase account sync failed:', error)
    })
  }, [accountEmail, cart, orders, remoteReady, user, wishlist])

  const addToCart = (productId, size = null) => {
    const product = products.find((entry) => entry.id === productId)
    if (!product) return

    setCart((current) => {
      const existing = current.find((item) => item.id === productId && item.size === size)

      if (existing) {
        return current.map((item) =>
          item.id === productId && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...current, { id: productId, size, quantity: 1 }]
    })
    setCartOpen(true)
  }

  const updateCartItem = (productId, size, quantity) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((item) => !(item.id === productId && item.size === size)))
      return
    }

    setCart((current) =>
      current.map((item) =>
        item.id === productId && item.size === size ? { ...item, quantity } : item,
      ),
    )
  }

  const removeFromCart = (productId, size) => {
    setCart((current) => current.filter((item) => !(item.id === productId && item.size === size)))
  }

  const toggleWishlist = (productId) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    )
  }

  const signIn = async (account) => {
    if (firebaseReady) {
      const firebaseUser = await signInWithEmailPassword({
        email: String(account.email ?? ''),
        password: String(account.password ?? ''),
      })

      setRemoteReady(false)
      return firebaseUser
    }

    const nextUser = normalizeAccount(account, user)
    setUser(nextUser)
    setRemoteReady(!firebaseReady)
    return nextUser
  }

  const signUp = async (account) => {
    if (firebaseReady) {
      const firebaseUser = await signUpWithEmailPassword({
        email: String(account.email ?? ''),
        password: String(account.password ?? ''),
        displayName: String(account.name ?? ''),
      })

      setRemoteReady(false)
      return firebaseUser
    }

    const nextUser = normalizeAccount(account, user)
    setUser(nextUser)
    setRemoteReady(!firebaseReady)
    return nextUser
  }

  const signInWithGoogle = async () => {
    if (!firebaseReady) {
      const demoUser = normalizeAccount(
        {
          name: 'Google Member',
          email: 'google.member@gmail.com',
          bio: 'Signed in with the demo Google flow while Firebase is not configured yet.',
          membership: 'Google Access',
        },
        user,
      )

      setUser(demoUser)
      setRemoteReady(true)
      return demoUser
    }

    const firebaseUser = await signInWithGooglePopup()
    const nextUser = normalizeAccount(
      {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        bio: 'Signed in with Google through Firebase Authentication.',
        membership: 'Google Access',
      },
      user,
    )

    setUser(nextUser)
    setRemoteReady(false)
    return nextUser
  }

  const updateUserProfile = (updates) =>
    setUser((current) => {
      if (!current) return current

      const nextUser = normalizeAccount(
        firebaseReady ? { ...updates, email: current.email } : updates,
        current,
      )

      if (firebaseReady) {
        void updateFirebaseUserProfile({
          displayName: nextUser.name,
          photoURL: nextUser.photoURL,
        }).catch((error) => {
          console.error('Firebase profile update failed:', error)
        })
      }

      return nextUser
    })

  const signOut = async () => {
    if (firebaseReady) {
      const snapshot = latestStateRef.current

      if (snapshot.user?.email) {
        await saveRemoteAccount(
          snapshot.user.email,
          buildRemotePayload({
            user: snapshot.user,
            cart: snapshot.cart,
            wishlist: snapshot.wishlist,
            orders: snapshot.orders,
          }),
        ).catch((error) => {
          console.error('Firebase pre-signout sync failed:', error)
        })
      }

      await signOutFirebaseSession().catch((error) => {
        console.error('Firebase sign out failed:', error)
      })

      return
    }

    setUser(null)
    setRemoteReady(true)
  }

  const checkoutOrder = (customer) => {
    const orderItems = cart
      .map((item) => {
        const product = products.find((entry) => entry.id === item.id)
        if (!product) return null
        return {
          ...product,
          size: item.size,
          quantity: item.quantity,
        }
      })
      .filter(Boolean)

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const order = {
      id: `TP-${Date.now().toString().slice(-6)}`,
      items: orderItems,
      total,
      customer,
      status: 'Preparing',
      createdAt: new Date().toISOString(),
    }

    setOrders((current) => [order, ...current])
    setLastOrder(order)
    setCart([])
    setCartOpen(false)
    return order
  }

  const cartItemsDetailed = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find((entry) => entry.id === item.id)
          if (!product) return null
          return {
            ...product,
            size: item.size,
            quantity: item.quantity,
          }
        })
        .filter(Boolean),
    [cart],
  )

  const wishlistItems = useMemo(
    () => wishlist.map((id) => products.find((entry) => entry.id === id)).filter(Boolean),
    [wishlist],
  )

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlist.length
  const cartTotal = cartItemsDetailed.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const value = {
    addToCart,
    cart,
    cartCount,
    cartItemsDetailed,
    cartOpen,
    cartTotal,
    checkoutOrder,
    firebaseReady,
    lastOrder,
    orders,
    remoteReady,
    removeFromCart,
    setCartOpen,
    signIn,
    signInWithGoogle,
    signOut,
    signUp,
    toggleWishlist,
    updateCartItem,
    updateUserProfile,
    user,
    wishlist,
    wishlistCount,
    wishlistItems,
  }

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>
}
