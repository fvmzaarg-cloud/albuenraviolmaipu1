import React, { useState, useEffect, useRef } from 'react'
import {
  Home, ShoppingCart, User, MapPin, Search, Plus, Minus, ChevronLeft,
  Trash2, Clock, CheckCircle, XCircle, Package, LayoutDashboard,
  ListOrdered, Settings, Store, MenuSquare, Truck, LogOut, Sparkles,
  Send, X, ArrowUp, ArrowDown, KeyRound,
} from 'lucide-react'
import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore'

const GOOGLE_MAPS_API_KEY = "AIzaSyBmiPXxoPbC5Y-cVaemlJnha8qLn4wCR9Q";

// --- CONFIGURACIÓN DEL LOCAL ---
const SHOP_PHONE = '5492613426085'
const SHOP_ADDRESS = 'Centro Comercial Plaza Michelo, Palma y Maza, Maipú, Mendoza'
const SHOP_LOGO = 'https://i.postimg.cc/TYHsxqMV/Copia_de_Logo_al_buen_raviol_(2).png'
const CHEF_ICON = 'https://i.postimg.cc/vB77k5rp/chef.png'

// --- DATOS POR DEFECTO ---
const INITIAL_CATEGORIES = [
  { id: 1, name: 'Ravioles', order: 1 },
  { id: 2, name: 'Sorrentinos', order: 2 },
  { id: 3, name: 'Tallarines', order: 3 },
  { id: 4, name: 'Salsas', order: 4 },
  { id: 5, name: 'Combos', order: 5 },
]

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Ravioles de Carne y Verdura', description: 'Clásicos ravioles caseros rellenos de carne premium y espinaca fresca.', price: 4500, categoryId: 1, featured: true, active: true, unitType: 'unidad', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=400' },
  { id: 2, name: 'Ravioles de Ricota', description: 'Suaves ravioles de ricota magra y nuez.', price: 4500, categoryId: 1, featured: false, active: true, unitType: 'unidad', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=400' },
  { id: 3, name: 'Sorrentinos de Jamón y Queso', description: 'Abundante relleno de jamón cocido y muzzarella.', price: 5200, categoryId: 2, featured: true, active: true, unitType: 'unidad', image: 'https://images.unsplash.com/photo-1621996311239-53cbdf018245?auto=format&fit=crop&q=80&w=400' },
  { id: 4, name: 'Tallarines al Huevo', description: 'Fideos frescos cortados a cuchillo.', price: 3000, categoryId: 3, featured: false, active: true, unitType: 'peso', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=400' },
]

const INITIAL_SHIPPING_CONFIG = {
  tier1: 1000, tier2: 1500, tier3: 2000, extra: 500, shopLocation: { lat: -32.9850886, lng: -68.7986076 },
}

const INITIAL_SCHEDULE = {
  0: [], 
  1: [{ open: '09:30', close: '23:30' }], 
  2: [{ open: '09:30', close: '23:30' }], 
  3: [{ open: '09:30', close: '23:30' }], 
  4: [{ open: '09:30', close: '23:30' }], 
  5: [{ open: '09:30', close: '23:30' }], 
  6: [{ open: '09:30', close: '23:30' }], 
}

const INITIAL_ADMIN_AUTH = { email: 'albuenraviolmaipu@gmail.com', passHash: '', recoveryHash: '', isConfigured: false, geminiKey: '' }
const INITIAL_MANUAL_STATUS = { isClosed: false, message: '¡Estamos tomando pedidos! 🔥', chefPrompt: 'Reglas del local: 2 planchas de ravioles rinden para 3 personas. Sugerir siempre llevar una salsa para acompañar.' } 

// ==================================================
// 🔥 CONFIGURACIÓN DE FIREBASE 
// ==================================================
const LOCAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAu-6398vfb_Fz3jDvvmAprisBTZa8DAOs",
  authDomain: "abrmaipu-pastas.firebaseapp.com",
  projectId: "abrmaipu-pastas",
  storageBucket: "abrmaipu-pastas.firebasestorage.app",
  messagingSenderId: "335783544635",
  appId: "1:335783544635:web:c54b41b2cfac3c014c591e"
};

let firebaseApp, auth, firestoreDb, appId
try {
  const finalConfig = LOCAL_FIREBASE_CONFIG;
  if (finalConfig) {
    firebaseApp = initializeApp(finalConfig)
    auth = getAuth(firebaseApp)
    firestoreDb = getFirestore(firebaseApp)
    appId = 'al-buen-raviol-maipu-v2' 
  }
} catch (e) {
  console.error('Error inicializando Firebase:', e)
}

// --- UTILIDADES ---
let isGoogleMapsLoading = false
const loadGoogleMaps = callback => {
  if (window.google && window.google.maps) {
    callback()
    return
  }
  if (isGoogleMapsLoading) {
    setTimeout(() => loadGoogleMaps(callback), 100)
    return
  }
  isGoogleMapsLoading = true
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
  script.async = true
  script.defer = true
  script.onload = () => {
    isGoogleMapsLoading = false
    callback()
  }
  document.head.appendChild(script)
}

const formatCurrency = amount =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371 
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

const hashPassword = async password => {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ACÁ LE DECIMOS QUE USE LA CLAVE DE LA BASE DE DATOS Y LEA EL HISTORIAL COMPLETO
const callGemini = async (chatHistory, systemInstruction = 'Eres un asistente útil.', apiKey = '') => {
  if (!apiKey) return 'Falta la clave API. El administrador debe configurarla en el panel de Seguridad.';
  
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  // 1. Limpiamos cualquier mensaje de error previo para que no viaje a la nube
  let cleanHistory = chatHistory.filter(msg => !msg.text.includes('Error') && !msg.text.includes('problema conectándome'));

  // 2. Google EXIGE que la charla empiece con el usuario
  while (cleanHistory.length > 0 && cleanHistory[0].role !== 'user') {
    cleanHistory.shift();
  }

  // 3. Google EXIGE turnos alternados estrictamente (Usuario -> IA -> Usuario)
  let formattedContents = [];
  for (let msg of cleanHistory) {
    let mappedRole = msg.role === 'assistant' ? 'model' : 'user';

    if (formattedContents.length === 0) {
      formattedContents.push({ role: mappedRole, parts: [{ text: msg.text || 'Hola' }] });
    } else {
      let lastMsg = formattedContents[formattedContents.length - 1];
      if (lastMsg.role === mappedRole) {
        lastMsg.parts[0].text += " \n " + (msg.text || '');
      } else {
        formattedContents.push({ role: mappedRole, parts: [{ text: msg.text || 'Hola' }] });
      }
    }
  }

  // Si nos quedamos sin mensajes, mandamos un salvavidas
  if (formattedContents.length === 0) {
    formattedContents.push({ role: 'user', parts: [{ text: 'Hola' }] });
  }

  // 🔥 ARREGLO CRÍTICO: system_instruction con guion bajo y sin mezclar roles
  const payload = {
    contents: formattedContents,
    system_instruction: {
      parts: [{ text: systemInstruction }]
    }
  };

  try {
    const response = await fetch(url, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
    
    const data = await response.json();
    
    // 🔥 MODO CHISMOSO: Si Google lo rebota, mostramos el motivo exacto en el chat
    if (!response.ok) {
      console.error("❌ Rechazo de Google:", data);
      return `Error de Google: ${data.error?.message || 'Desconocido'}.`;
    }
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'El Chef se quedó sin palabras.';
  } catch (error) {
    console.error("❌ Falló el fetch:", error);
    return `Error de red local: ${error.message}. Revisá tu conexión a internet.`;
  }
}

// ==========================================
// COMPONENTE PRINCIPAL BLINDADO
// ==========================================
export default function App() {
  const [appMode, setAppMode] = useState('client');
  const [user, setUser] = useState(null);
  const [dbState, setDbState] = useState(null);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, currentUser => {
        if (currentUser) {
          setUser(currentUser);
        } else {
          signInAnonymously(auth).catch(error => {
            console.log("Forzando entrada local...", error);
            setUser({ uid: 'usuario-local' }); 
          });
        }
      });
      return () => unsubscribe();
    } else {
       setUser({ uid: 'usuario-local' });
    }
  }, []);

  useEffect(() => {
    if (firestoreDb && user) {
      const docRef = doc(firestoreDb, 'artifacts', appId, 'public', 'data', 'store_data', 'main')
      const unsubscribe = onSnapshot(
        docRef,
        docSnap => {
          if (docSnap.exists()) {
            // 🔥 CANDADO: Le ponemos la etiqueta secreta indicando que son DATOS REALES
            setDbState({ ...docSnap.data(), _isCloudSecured: true })
          } else {
            // Si la base de datos está realmente vacía por primera vez, la creamos y la validamos
            const initialData = {
              categories: INITIAL_CATEGORIES,
              products: INITIAL_PRODUCTS,
              shippingConfig: INITIAL_SHIPPING_CONFIG,
              schedule: INITIAL_SCHEDULE,
              orders: [],
              adminAuth: INITIAL_ADMIN_AUTH,
              manualStatus: INITIAL_MANUAL_STATUS, 
              _isCloudSecured: true
            }
            setDoc(docRef, initialData).catch(console.error)
            setDbState(initialData)
          }
        },
        error => {
          console.error('Error Firestore', error)
          loadFallback()
        }
      )
      return () => unsubscribe()
    } else if (!firestoreDb && user) {
      loadFallback()
    }
  }, [user])

  const loadFallback = () => {
    if (!dbState) {
      // 🛑 DATOS DE EMERGENCIA: Se cargan SIN la etiqueta secreta. El candado queda cerrado.
      setDbState({
        categories: INITIAL_CATEGORIES,
        products: INITIAL_PRODUCTS,
        shippingConfig: INITIAL_SHIPPING_CONFIG,
        schedule: INITIAL_SCHEDULE,
        orders: [],
        adminAuth: INITIAL_ADMIN_AUTH,
        manualStatus: INITIAL_MANUAL_STATUS,
        _isCloudSecured: false 
      })
    }
  }

  function updateDbState(updater) {
    setDbState(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater
      
      // 🛡️ CANDADO MAESTRO EN ACCIÓN: Solo guarda en Firebase si los datos tienen la etiqueta de seguridad
      if (firestoreDb && user && prev._isCloudSecured) {
        const dataToSave = { ...newState }
        delete dataToSave._isCloudSecured // Le sacamos la etiqueta antes de subirlo para que no ensucie la base de datos
        const docRef = doc(firestoreDb, 'artifacts', appId, 'public', 'data', 'store_data', 'main')
        setDoc(docRef, dataToSave).catch(console.error)
      } else if (!prev._isCloudSecured) {
        console.warn("🛡️ SISTEMA BLINDADO: Se evitó sobreescribir Firebase porque la app no logró leer la nube correctamente.");
      }
      
      return newState
    })
  }

  if (!dbState) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#cc292b] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-gray-600 animate-pulse">Cocinando los ravioles...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-gray-100 flex justify-center font-sans text-gray-800">
      <div className="w-full max-w-md bg-white shadow-2xl relative overflow-hidden flex flex-col h-[100dvh]">
        {appMode === 'client' ? (
          <ClientApp db={dbState} setDb={updateDbState} switchMode={() => setAppMode('admin')} />
        ) : (
          <AdminApp db={dbState} setDb={updateDbState} switchMode={() => setAppMode('client')} />
        )}
      </div>
    </div>
  )
}

// ==========================================
// ÁREA CLIENTE
// ==========================================
function ClientApp({ db, setDb, switchMode }) {
  const [route, setRoute] = useState('home')
  const [cart, setCart] = useState([])
  const [showAssistant, setShowAssistant] = useState(false)

  const addToCart = product => {
    const step = product.unitType === 'peso' ? 0.25 : 1;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing)
        return prev.map(item => (item.product.id === product.id ? { ...item, quantity: item.quantity + step } : item))
      return [...prev, { product, quantity: step }]
    })
  }

  const updateQuantity = (productId, direction) => {
    setCart(prev =>
      prev.map(item => {
          if (item.product.id === productId) {
            const step = item.product.unitType === 'peso' ? 0.25 : 1; 
            const newQ = item.quantity + (direction * step);
            return newQ > 0 ? { ...item, quantity: newQ } : null
          }
          return item
        }).filter(Boolean)
    )
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      <div className="flex-1 overflow-hidden relative">
        {route === 'home' && (
          <ClientHome
            db={db}
            addToCart={addToCart}
            switchMode={switchMode}
            cartItemsCount={cartItemsCount}
            cartTotal={cartTotal}
            setRoute={setRoute}
            cart={cart}
            updateQuantity={updateQuantity}
          />
        )}
        {route === 'cart' && (
          <ClientCart cart={cart} updateQuantity={updateQuantity} setRoute={setRoute} cartTotal={cartTotal} />
        )}
        {route === 'checkout' && (
          <ClientCheckout
            cart={cart}
            cartTotal={cartTotal}
            db={db}
            setDb={setDb}
            setRoute={setRoute}
            clearCart={() => setCart([])}
          />
        )}
      </div>

      <div className="bg-white border-t border-gray-200 flex justify-around p-2 pb-4 shrink-0 text-xs z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <ClientNavBtn Icon={Store} label="Menú" active={route === 'home'} onClick={() => setRoute('home')} />
        <ClientNavBtn
          Icon={ShoppingCart}
          label="Carrito"
          active={route === 'cart' || route === 'checkout'}
          onClick={() => setRoute('cart')}
          badge={cartItemsCount}
        />
        <ClientNavBtn
          Icon={CHEF_ICON}
          label="Chef IA"
          active={showAssistant}
          onClick={() => setShowAssistant(true)}
        />
      </div>

      {showAssistant && <ChefAssistant db={db} onClose={() => setShowAssistant(false)} />}
    </div>
  )
}

function ClientNavBtn({ Icon, iconSrc, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 p-2 w-16 transition-colors ${
        active ? 'text-[#c82a2a]' : 'text-gray-500 hover:text-gray-800'
      }`}
    >
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={label}
          className="w-[22px] h-[22px] object-contain"
        />
      ) : (
        <Icon size={22} />
      )}

      <span className="font-medium" style={{ fontSize: '0.65rem' }}>
        {label}
      </span>

      {badge > 0 && (
        <span className="absolute top-1 right-2 bg-[#c82a2a] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
          {badge}
        </span>
      )}
    </button>
  )
}

function ClientHome({ db, addToCart, switchMode, cartItemsCount, cartTotal, setRoute, cart, updateQuantity }) {
  const [activeCategory, setActiveCategory] = useState(null)
  const [storeStatus, setStoreStatus] = useState({ isOpen: false, isForcedClosed: false, isTimeClosed: false, nextOpen: '', customMessage: '' })
  const [showScrollTop, setShowScrollTop] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date()
      const day = now.getDay()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const currentTime = `${hours}:${minutes}`

      const todayShifts = db.schedule[day] || []
      let isTimeOpen = false

      for (let shift of todayShifts) {
        if (currentTime >= shift.open && currentTime <= shift.close) {
          isTimeOpen = true
          break
        }
      }

      let nextOpen = ''
      if (!isTimeOpen && todayShifts.length > 0) {
        const nextShift = todayShifts.find(s => s.open > currentTime)
        if (nextShift) nextOpen = `Abre hoy a las ${nextShift.open}`
      }

      const isForcedClosed = db.manualStatus?.isClosed || false;
      const customMessage = db.manualStatus?.message || '';

      setStoreStatus({ 
        isOpen: !isForcedClosed && isTimeOpen, 
        isForcedClosed,
        isTimeClosed: !isTimeOpen,
        nextOpen: nextOpen || 'Cerrado por hoy',
        customMessage
      })
    }
    checkStatus()
    const interval = setInterval(checkStatus, 60000)
    return () => clearInterval(interval)
  }, [db.schedule, db.manualStatus])

  const handleScroll = e => {
    if (e.target.scrollTop > 300) setShowScrollTop(true)
    else setShowScrollTop(false)
  }

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 🔥 ACÁ ESTÁ EL ARREGLO: Agregamos el sort() para que el cliente vea el orden que elegiste.
  const featuredProducts = db.products
    .filter(p => p.featured && p.active)
    .sort((a, b) => (a.order || 0) - (b.order || 0)); // Ordena recomendados

  const filteredProducts = activeCategory
    ? db.products.filter(p => p.categoryId === activeCategory && p.active).sort((a, b) => (a.order || 0) - (b.order || 0)) // Ordena por categoría
    : db.products.filter(p => p.active).sort((a, b) => (a.order || 0) - (b.order || 0)); // Ordena si se ven "Todos"

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto pb-32 relative hide-scrollbar">
      <div className="relative bg-[#cc292b] pt-8 pb-8 flex flex-col items-center justify-center shrink-0 shadow-inner min-h-[12rem]">
        {SHOP_LOGO ? (
          <img
            src={SHOP_LOGO}
            alt="Al Buen Raviol Logo"
            className="w-full h-full object-contain max-h-40 px-4 drop-shadow-md"
          />
        ) : (
          <h1 className="text-4xl font-serif font-black text-white text-center">Al Buen Raviol</h1>
        )}
        <button
          onClick={switchMode}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-all z-20"
        >
          <Settings size={20} />
        </button>
      </div>

      {storeStatus.isForcedClosed ? (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 shadow-sm flex items-center justify-center shrink-0">
          <span className="font-bold text-red-600 tracking-wide text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Cerrado momentáneamente
          </span>
        </div>
      ) : storeStatus.isTimeClosed ? (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 shadow-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span className="font-bold text-red-600 text-sm">CERRADO</span>
          </div>
          <span className="text-xs text-red-500 font-medium">{storeStatus.nextOpen}</span>
        </div>
      ) : (
        <div className="bg-[#e8f5e9] border-b border-[#c8e6c9] px-4 py-3 shadow-sm flex items-center justify-center shrink-0">
          <span className="font-bold text-[#2e7d32] text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
            {storeStatus.customMessage || 'ABIERTO AHORA'}
          </span>
        </div>
      )}

      <div className="bg-white py-4 sticky top-0 z-10 shadow-sm shrink-0">
        <div className="flex overflow-x-auto px-4 gap-2 hide-scrollbar pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === null ? 'bg-[#c82a2a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todo
          </button>
          {db.categories
            .sort((a, b) => a.order - b.order)
            .map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeCategory === cat.id ? 'bg-[#c82a2a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {!activeCategory && featuredProducts.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Store size={20} className="text-[#c82a2a]" /> Recomendados del chef
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {featuredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAdd={addToCart} 
                  storeOpen={storeStatus.isOpen} 
                  cartItem={cart.find(item => item.product.id === product.id)}
                  updateQuantity={updateQuantity}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">
            {activeCategory ? db.categories.find(c => c.id === activeCategory)?.name : 'Nuestro Menú'}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAdd={addToCart} 
                storeOpen={storeStatus.isOpen} 
                cartItem={cart.find(item => item.product.id === product.id)}
                updateQuantity={updateQuantity}
              />
            ))}
            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-500 py-8">No hay productos en esta categoría.</p>
            )}
          </div>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 bg-gray-900 text-white p-3 rounded-full shadow-xl z-40 animate-fadeIn"
        >
          <ArrowUp size={24} />
        </button>
      )}

      {cartItemsCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-30 animate-fadeIn">
          <button
            onClick={() => setRoute('cart')}
            className="w-full bg-[#c82a2a] text-white p-4 rounded-xl shadow-lg flex items-center justify-between font-bold hover:bg-red-800 transition-all"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} />
              <span>Ver carrito</span>
            </div>
            <span>{formatCurrency(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, onAdd, storeOpen, cartItem, updateQuantity }) {
  const quantity = cartItem ? cartItem.quantity : 0;
  const step = product.unitType === 'peso' ? 0.25 : 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex h-32">
      <div className="w-1/3 h-full">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="w-2/3 p-3 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-gray-800 leading-tight">{product.name}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-black text-[#c82a2a] flex items-end gap-1">
            {formatCurrency(product.price)}
            {product.unitType === 'peso' && <span className="text-[10px] text-gray-500 font-normal mb-0.5">/ kg</span>}
          </span>
          
          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-2 py-1 animate-fadeIn">
              <button
                disabled={!storeOpen}
                onClick={() => updateQuantity(product.id, -1)}
                className="text-[#c82a2a] p-1 active:scale-90 transition-transform"
              >
                {quantity <= step ? <Trash2 size={14} /> : <Minus size={14} />}
              </button>
              <span className="font-bold text-sm w-6 text-center text-[#c82a2a]">
                {quantity}
              </span>
              <button
                disabled={!storeOpen}
                onClick={() => updateQuantity(product.id, 1)}
                className="text-[#c82a2a] p-1 active:scale-90 transition-transform"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              disabled={!storeOpen}
              onClick={() => onAdd(product)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                storeOpen ? 'bg-red-50 text-[#c82a2a] hover:bg-red-100' : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ChefAssistant({ db, onClose }) {
  const [query, setQuery] = useState('')
  // Le damos un saludo inicial para que arranque la charla
  const [chat, setChat] = useState([
    { role: 'assistant', text: '¡Hola! Soy el Chef Virtual de Al Buen Raviol. ¿En qué te puedo ayudar hoy?'},
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  const handleSend = async () => {
    if (!query.trim()) return
    const userMsg = query
    setQuery('')
    
    // Guardamos el historial nuevo INCLUYENDO lo que acaba de escribir el usuario
    const newHistory = [...chat, { role: 'user', text: userMsg }]
    setChat(newHistory)
    setIsLoading(true)

    const menuContext = db.products
      .filter(p => p.active)
      .map(p => `${p.name} ($${p.price} ${p.unitType==='peso'?'por kg':'por unidad'}): ${p.description}`)
      .join(' | ')
      
    const customRules = db.manualStatus?.chefPrompt || 'Regla de porciones: 2 planchas rinden para 3 personas.';
    const sysPrompt = `Eres el Chef Experto de 'Al Buen Raviol', fábrica de pastas en Mendoza. Menú: ${menuContext}. Habla amigable y argentino (usa 'vos'). Recomienda SOLO productos del menú. \nREGLAS ESTRICTAS DEL LOCAL: ${customRules}. Mantén tus respuestas breves y concisas.`

    // 🔥 ACÁ ESTÁ LA MAGIA: Le pasamos "newHistory" (todo el chat) en vez de solo el último mensaje
    const response = await callGemini(newHistory, sysPrompt, db.adminAuth?.geminiKey)
    
    setChat(prev => [...prev, { role: 'assistant', text: response }])
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center animate-fadeIn p-4 sm:p-0">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col h-[80vh] sm:h-[600px] overflow-hidden">
        <div className="bg-[#cc292b] p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#fbb03b]" />
            <h3 className="font-bold text-lg">Chef IA</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-red-800 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-red-50/30">
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[#cc292b] text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && <div className="text-gray-500 text-sm pl-2">El Chef está pensando...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
          <input
            type="text"
            placeholder="Ej: Somos 4 personas, ¿qué llevo?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-red-200 rounded-xl px-4 py-3 text-sm outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !query.trim()}
            className="bg-[#cc292b] text-white p-3 rounded-xl disabled:bg-red-300 hover:bg-red-800"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
function ClientCart({ cart, updateQuantity, setRoute, cartTotal }) {
  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex items-center p-4 border-b border-gray-100 bg-white shrink-0 z-10 sticky top-0">
        <button onClick={() => setRoute('home')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-gray-800 ml-2">Tu Pedido</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 mt-20">
            <ShoppingCart size={48} className="opacity-50" />
            <p className="font-medium">Tu carrito está vacío</p>
            <button
              onClick={() => setRoute('home')}
              className="mt-4 px-6 py-2 bg-red-50 text-[#c82a2a] rounded-full font-bold"
            >
              Ver menú
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.product.id} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <img src={item.product.image} alt="" className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1 flex flex-col justify-between">
                  <h4 className="font-bold text-sm text-gray-800">{item.product.name}</h4>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-gray-600 text-sm">{formatCurrency(item.product.price * item.quantity)}</span>
                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-2 py-1">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="text-red-500 p-1">
                        {item.quantity <= (item.product.unitType === 'peso' ? 0.25 : 1) ? <Trash2 size={14} /> : <Minus size={14} />}
                      </button>
                      <span className="font-bold text-sm w-10 text-center">
                        {item.quantity} {item.product.unitType === 'peso' ? 'kg' : 'u'}
                      </span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="text-red-500 p-1">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-[0_-10px_15px_rgba(0,0,0,0.05)] z-20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium">Subtotal</span>
            <span className="text-xl font-black text-gray-800">{formatCurrency(cartTotal)}</span>
          </div>
          <button
            onClick={() => setRoute('checkout')}
            className="w-full bg-[#c82a2a] text-white p-4 rounded-xl font-bold shadow-md hover:bg-red-800"
          >
            Continuar pago
          </button>
        </div>
      )}
    </div>
  )
}

function ClientCheckout({ cart, cartTotal, db, setDb, setRoute, clearCart }) {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', notes: '' })
  const [orderType, setOrderType] = useState('retiro')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [cashAmount, setCashAmount] = useState('')
  const [deliveryCoords, setDeliveryCoords] = useState(null)
  const [shippingDistance, setShippingDistance] = useState(0)
  const [whatsappLink, setWhatsappLink] = useState(null)
  const [formError, setFormError] = useState('')
  const [invalidFields, setInvalidFields] = useState([])

  const calculateShippingCost = distance => {
    if (distance <= 0) return 0
    const { tier1, tier2, tier3, extra } = db.shippingConfig
    if (distance <= 3) return tier1
    if (distance <= 4) return tier2
    if (distance <= 5) return tier3
    return tier3 + Math.ceil(distance - 5) * extra
  }

  const shippingCost = orderType === 'delivery' ? calculateShippingCost(shippingDistance) : 0
  const finalTotal = cartTotal + shippingCost

  const handleConfirm = () => {
    setFormError('')
    setInvalidFields([])
    const errors = []
    if (!formData.name.trim()) errors.push('name')
    if (!formData.phone.trim()) errors.push('phone')
    
    // Exigimos que existan las coordenadas si es delivery
    if (orderType === 'delivery' && (!formData.address.trim() || !deliveryCoords)) errors.push('address')
    
    // Solo pedimos calcular el vuelto si es Delivery Y paga en efectivo
    if (paymentMethod === 'efectivo' && orderType === 'delivery') {
      const amount = parseFloat(cashAmount)
      if (isNaN(amount) || amount < finalTotal) errors.push('cashAmount')
    }

    if (errors.length > 0) {
      setInvalidFields(errors)
      if (errors.includes('address') && orderType === 'delivery' && !deliveryCoords) {
        setFormError('Por favor seleccioná tu dirección de la lista de Google Maps o usá el botón de ubicación.')
      } else {
        setFormError('Por favor completa los campos marcados en rojo.')
      }
      return
    }

    // Preparamos el texto del pago para guardarlo en el ticket
    let paymentString = '';
    if (paymentMethod === 'transferencia') {
      paymentString = 'Transferencia';
    } else if (orderType === 'retiro') {
      paymentString = 'Pago en local';
    } else {
      paymentString = `Efectivo (Abona con ${formatCurrency(Number(cashAmount))})`;
    }

    const newOrder = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      // 🔥 ACÁ LA MAGIA: Guardamos las coordenadas exactas de forma invisible
      customer: { ...formData, coords: deliveryCoords }, 
      type: orderType,
      items: cart,
      subtotal: cartTotal,
      shippingCost,
      total: finalTotal,
      status: 'Recibido',
      paymentDetails: paymentString, 
    }
    setDb(prev => ({ ...prev, orders: [newOrder, ...prev.orders] }))

    let text = `*Hola Al Buen Raviol Maipú! Quiero hacer un pedido*\n\n*Cliente:* ${formData.name}\n*Tel:* ${
      formData.phone
    }\n*Tipo:* ${orderType === 'retiro' ? '🏪 Retiro por local' : '🛵 Delivery'}\n`
    if (orderType === 'delivery') {
      text += `*Dirección:* ${formData.address}\n`
      if (deliveryCoords) text += `*Mapa:* https://maps.google.com/?q=${deliveryCoords.lat},${deliveryCoords.lng}\n`
    }
    
    if (formData.notes.trim()) {
      text += `*Aclaraciones:* ${formData.notes.trim()}\n`
    }

    text += `\n*Detalle:*\n`
    cart.forEach(
      item => {
        const unitLabel = item.product.unitType === 'peso' ? 'kg' : 'un'
        text += `- ${item.quantity} ${unitLabel} x ${item.product.name} (${formatCurrency(item.product.price * item.quantity)})\n`
      }
    )
    text += `\n*Subtotal:* ${formatCurrency(cartTotal)}\n`
    if (orderType === 'delivery') text += `*Envío:* ${formatCurrency(shippingCost)}\n`
    text += `*TOTAL A PAGAR: ${formatCurrency(finalTotal)}*\n\n`

    // Armamos el texto del pago según si es retiro o delivery
    if (paymentMethod === 'transferencia') {
      text += `*Método de Pago:* 🏦 Transferencia\n*(El cliente enviará comprobante de transferencia)*\n`
    } else if (orderType === 'retiro') {
      text += `*Método de Pago:* 🏪 Pago en el local (Efectivo/Tarjeta/MP)\n`
    } else {
      text += `*Método de Pago:* 💵 Efectivo\n*Abona con:* ${formatCurrency(Number(cashAmount))}\n`
      const vuelto = Number(cashAmount) - finalTotal
      if (vuelto > 0) text += `*Vuelto a entregar:* ${formatCurrency(vuelto)}\n`
    }

    setWhatsappLink(`https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(text)}`)
    clearCart()
  }

  if (whatsappLink) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white p-6 text-center animate-fadeIn">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">¡Pedido Guardado!</h2>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
          Toca el botón para <span className="font-bold text-gray-800">abrir WhatsApp</span> y enviarnos el detalle.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setTimeout(() => setRoute('home'), 1000)}
          className="bg-[#25D366] text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg flex items-center gap-2 hover:bg-green-600 transition-all w-full justify-center max-w-sm mb-4"
        >
          <Send size={24} /> Enviar WhatsApp ahora
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <div className="flex items-center p-4 border-b border-gray-200 bg-white shrink-0 z-10 sticky top-0">
        <button onClick={() => setRoute('cart')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-gray-800 ml-2">Finalizar Pedido</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <User size={18} className="text-red-500" /> Mis Datos
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Tu Nombre *"
              value={formData.name}
              onChange={e => {
                setFormData({ ...formData, name: e.target.value })
                setInvalidFields(p => p.filter(f => f !== 'name'))
              }}
              className={`w-full rounded-lg px-4 py-3 text-sm outline-none transition-all ${
                invalidFields.includes('name')
                  ? 'bg-red-50 border border-red-500 ring-1 ring-red-500'
                  : 'bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500'
              }`}
            />
            <input
              type="tel"
              placeholder="Tu Teléfono (ej: 261...) *"
              value={formData.phone}
              onChange={e => {
                setFormData({ ...formData, phone: e.target.value })
                setInvalidFields(p => p.filter(f => f !== 'phone'))
              }}
              className={`w-full rounded-lg px-4 py-3 text-sm outline-none transition-all ${
                invalidFields.includes('phone')
                  ? 'bg-red-50 border border-red-500 ring-1 ring-red-500'
                  : 'bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500'
              }`}
            />
            <textarea
              placeholder="ACLARACIONES (Ej: Manzana/Casa, Porton, Timbre, sin queso, etc.) - Opcional"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-red-500 resize-none h-20"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Package size={18} className="text-red-500" /> Retiro o Delivery
          </h3>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setOrderType('retiro')}
              className={`flex-1 py-2 text-sm font-bold rounded-md ${
                orderType === 'retiro' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
              }`}
            >
              Retiro en Local
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`flex-1 py-2 text-sm font-bold rounded-md ${
                orderType === 'delivery' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
              }`}
            >
              Delivery
            </button>
          </div>
          {orderType === 'retiro' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 animate-fadeIn">
              <p className="font-bold flex items-center gap-1">
                <MapPin size={16} /> Dirección de retiro:
              </p>
              <p className="mt-1">{SHOP_ADDRESS}</p>
            </div>
          )}
          {orderType === 'delivery' && (
            <div className="mt-4 animate-fadeIn">
              <MapPicker
                address={formData.address}
                shopLocation={db.shippingConfig.shopLocation}
                onAddressChange={val => {
                  setFormData({ ...formData, address: val })
                  setInvalidFields(p => p.filter(f => f !== 'address'))
                }}
                onLocationSelect={(coords, dist) => {
                  setDeliveryCoords(coords)
                  setShippingDistance(dist)
                }}
                isInvalid={invalidFields.includes('address')}
              />
              {shippingDistance > 0 && (
                <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-2 rounded text-center">
                  Distancia de manejo: <span className="font-bold">{shippingDistance.toFixed(1)} km</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3">💳 Método de Pago</h3>
          <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
            <button
              onClick={() => setPaymentMethod('efectivo')}
              className={`flex-1 py-2 text-sm font-bold rounded-md ${
                paymentMethod === 'efectivo' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
              }`}
            >
              {orderType === 'retiro' ? 'Pago en Local' : 'Efectivo'}
            </button>
            <button
              onClick={() => setPaymentMethod('transferencia')}
              className={`flex-1 py-2 text-sm font-bold rounded-md ${
                paymentMethod === 'transferencia' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
              }`}
            >
              Transferencia
            </button>
          </div>
          
          {paymentMethod === 'transferencia' ? (
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100 animate-fadeIn">
              <p>
                Alias: <span className="font-black text-lg">ABRMAIPU</span>
              </p>
              <p>Titular: Franco Vanneschi</p>
              <p className="mt-2 text-xs font-bold text-blue-600">⚠️ Adjuntá el comprobante de pago por WhatsApp.</p>
            </div>
          ) : (
            orderType === 'delivery' ? (
              <div className="animate-fadeIn">
                <label className="text-sm font-bold text-gray-700 block mb-2">¿Con cuánto vas a abonar?</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    placeholder={`Ej: ${finalTotal + 1000}`}
                    value={cashAmount}
                    onChange={e => {
                      setCashAmount(e.target.value)
                      setInvalidFields(p => p.filter(f => f !== 'cashAmount'))
                    }}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm outline-none transition-all ${
                      invalidFields.includes('cashAmount')
                        ? 'bg-red-50 border border-red-500 ring-1 ring-red-500'
                        : 'bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500'
                    }`}
                  />
                </div>
                {Number(cashAmount) >= finalTotal && (
                  <div className="mt-3 bg-green-50 text-green-700 p-2 rounded text-sm text-center border border-green-100">
                    <span className="font-bold">Tu vuelto será de:</span>{' '}
                    {formatCurrency(Number(cashAmount) - finalTotal)}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800 border border-green-100 animate-fadeIn text-center">
                <p className="font-bold">Abonás tu pedido al retirarlo.</p>
                <p className="text-xs mt-1 opacity-80">Aceptamos efectivo, tarjetas y MercadoPago en el mostrador.</p>
              </div>
            )
          )}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <ListOrdered size={18} className="text-red-500" /> Resumen del Pedido
          </h3>
          <div className="space-y-2 mb-4 border-b border-gray-100 pb-4">
            {cart.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity} {item.product.unitType === 'peso' ? 'kg' : 'u'} x {item.product.name}
                </span>
                <span className="font-medium text-gray-800">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal productos</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            {orderType === 'delivery' && (
              <div className="flex justify-between text-gray-600">
                <span>Costo de envío</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-200 mt-2">
              <span>Total a pagar</span>
              <span className="text-[#c82a2a]">{formatCurrency(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {formError && (
        <div className="absolute bottom-[90px] left-4 right-4 bg-red-600 text-white text-xs font-bold py-3 px-4 rounded-xl text-center shadow-2xl animate-bounce flex items-center justify-center gap-2 z-50">
          <XCircle size={18} /> {formError}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-[0_-10px_15px_rgba(0,0,0,0.05)] z-40 bg-white">
        <button
          onClick={handleConfirm}
          className="w-full bg-[#25D366] text-white p-4 rounded-xl font-bold shadow-lg hover:bg-green-600 active:scale-95 flex items-center justify-center gap-2"
        >
          Confirmar Pedido <CheckCircle size={20} />
        </button>
      </div>
    </div>
  )
}

function MapPicker({ address, shopLocation, onAddressChange, onLocationSelect, isInvalid }) {
  const mapRef = useRef(null)
  const inputRef = useRef(null)
  const mapInstance = useRef(null)
  const markerInstance = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [locError, setLocError] = useState('')

  useEffect(() => {
    loadGoogleMaps(() => setMapLoaded(true))
  }, [])

  const calculateDrivingDistance = (lat, lng) => {
    if (!window.google) return
    const service = new window.google.maps.DirectionsService()
    service.route({ origin: shopLocation, destination: { lat, lng }, travelMode: 'DRIVING' }, (response, status) => {
      if (status === 'OK' && response.routes[0] && response.routes[0].legs[0]) {
        onLocationSelect({ lat, lng }, response.routes[0].legs[0].distance.value / 1000)
        setLocError('')
      } else {
        setLocError(`Google Maps: No se pudo calcular la ruta exacta. Calculando distancia en línea recta...`)
        onLocationSelect({ lat, lng }, getDistanceFromLatLonInKm(shopLocation.lat, shopLocation.lng, lat, lng))
      }
    })
  }

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !inputRef.current) return
    if (mapInstance.current) return

    const map = new google.maps.Map(mapRef.current, {
      center: shopLocation,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'cooperative', // <-- ESTA ES LA SOLUCIÓN
    })
    const marker = new google.maps.Marker({ position: shopLocation, map: map, draggable: true })

    marker.addListener('dragend', () => {
      const pos = marker.getPosition()
      calculateDrivingDistance(pos.lat(), pos.lng())
      new google.maps.Geocoder().geocode({ location: { lat: pos.lat(), lng: pos.lng() } }, (results, status) => {
        if (status === 'OK' && results[0]) onAddressChange(results[0].formatted_address)
      })
    })

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ar' },
    })
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry || !place.geometry.location) return
      map.setCenter(place.geometry.location)
      map.setZoom(15)
      marker.setPosition(place.geometry.location)
      calculateDrivingDistance(place.geometry.location.lat(), place.geometry.location.lng())
      onAddressChange(place.formatted_address || place.name)
    })

    mapInstance.current = map
    markerInstance.current = marker
  }, [mapLoaded, shopLocation])

  const handleUseMyLocation = () => {
    setLocError('')
    if (!navigator.geolocation) return setLocError('Tu navegador no soporta geolocalización.')
    setIsLocating(true)
    
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        if (mapInstance.current && markerInstance.current) {
          const newLatLng = new window.google.maps.LatLng(lat, lng)
          markerInstance.current.setPosition(newLatLng)
          mapInstance.current.setCenter(newLatLng)
          mapInstance.current.setZoom(15)
          calculateDrivingDistance(lat, lng)
          new window.google.maps.Geocoder().geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) onAddressChange(results[0].formatted_address)
            else onAddressChange('Ubicación actual en el mapa')
          })
        }
        setIsLocating(false)
      },
      () => {
        setLocError('Permiso de ubicación denegado o bloqueado. Habilitalo en el navegador.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return (
    <div className="mt-4 flex flex-col gap-2 relative">
      {locError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">{locError}</div>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            // 🔥 1. Le cambiamos el texto fantasma para que sepa qué poner
            placeholder="Tu calle y número (Ej: Palma 123)"
            value={address || ''}
            onChange={e => onAddressChange(e.target.value)}
            className={`w-full bg-white rounded-lg pl-10 pr-4 py-3 text-sm z-20 relative transition-all ${
              isInvalid
                ? 'border border-red-500 bg-red-50 ring-1 ring-red-500 placeholder-red-400'
                : 'border border-gray-300 focus:ring-2 focus:ring-red-500'
            }`}
          />
          <Search
            size={18}
            className={`absolute left-3 top-3.5 z-30 transition-colors ${isInvalid ? 'text-red-400' : 'text-gray-400'}`}
          />
        </div>
        <button
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="bg-blue-50 text-blue-600 p-3 rounded-lg border border-blue-100 hover:bg-blue-100 flex-shrink-0"
          title="Usar mi ubicación actual"
        >
          <MapPin size={22} className={isLocating ? 'animate-pulse' : ''} />
        </button>
      </div>
      {/* 🔥 2. Le clavamos este cartelito rojo para que no borre la calle */}
      <p className="text-[11px] text-[#c82a2a] font-bold mt-1 leading-tight">
        ⚠️ IMPORTANTE: No borres el nombre de la calle. Si vivís en un barrio, poné la Manzana y Casa en las "ACLARACIONES" arriba.
      </p>
      <p className="text-xs text-gray-500 mb-1 mt-1">Puedes arrastrar el pin rojo para más exactitud.</p>
      <div ref={mapRef} className="w-full h-48 rounded-lg border border-gray-200 bg-gray-100 relative z-0">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Cargando Google Maps...
          </div>
        )}
      </div>
    </div>
  )
}

// ==========================================
// ÁREA ADMINISTRADOR
// ==========================================
function AdminApp({ db, setDb, switchMode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminRoute, setAdminRoute] = useState('dashboard')
  const [newOrderPopup, setNewOrderPopup] = useState(false) 

  const cantidadPedidosRef = useRef(db?.orders?.length || 0);
  const cargaInicialRef = useRef(true); 

  useEffect(() => {
    if (isAuthenticated && db && db.orders) {
      const actuales = db.orders.length;
      
      if (cargaInicialRef.current) {
        cargaInicialRef.current = false;
        cantidadPedidosRef.current = actuales;
        return;
      }

      if (actuales > cantidadPedidosRef.current) {
        try {
          if ('Notification' in window && window.Notification) {
            if (Notification.permission === 'granted') {
              new Notification('🥟 ¡Nuevo pedido en Al Buen Raviol!', { body: 'Revisá la pestaña de pedidos.' });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission();
            }
          }
        } catch (err) {
          console.log("Navegador bloqueó notificación nativa.");
        }

        let parlante = document.getElementById('parlante-invencible');
        if (!parlante) {
          parlante = document.createElement('audio');
          parlante.id = 'parlante-invencible';
          parlante.src = 'https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/bell_ring.mp3';
          document.body.appendChild(parlante);
        }
        parlante.currentTime = 0;
        parlante.play().catch(e => console.log('Sonido bloqueado temporalmente'));

        setNewOrderPopup(true);
      }
      
      cantidadPedidosRef.current = actuales;
    }
  }, [db?.orders, isAuthenticated]);
  
  if (!isAuthenticated)
    return <AdminLogin db={db} setDb={setDb} onLogin={() => setIsAuthenticated(true)} switchMode={switchMode} />

  const renderView = () => {
    switch (adminRoute) {
      case 'dashboard': return <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
      case 'pedidos': return <AdminPedidos db={db} setDb={setDb} />
      case 'catalogo': return <AdminCatalogo db={db} setDb={setDb} />
      case 'categorias': return <AdminCategorias db={db} setDb={setDb} />
      case 'horarios': return <AdminHorarios db={db} setDb={setDb} />
      case 'envios': return <AdminEnvios db={db} setDb={setDb} />
      case 'seguridad': return <AdminSeguridad db={db} setDb={setDb} />
      default: return <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
        
        <div className="flex items-center gap-2">
          {adminRoute !== 'dashboard' && (
            <button onClick={() => setAdminRoute('dashboard')} className="text-gray-400 hover:text-white p-1 transition-colors">
              <ChevronLeft size={22} />
            </button>
          )}
          <h1 className="font-bold tracking-wide text-sm flex items-center gap-2">
            <Settings size={16} className="text-[#fbb03b]" /> ADMIN
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              let parlante = document.getElementById('parlante-invencible');
              if (!parlante) {
                parlante = document.createElement('audio');
                parlante.id = 'parlante-invencible';
                parlante.src = 'https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/bell_ring.mp3';
                document.body.appendChild(parlante);
              }
              parlante.currentTime = 0;
              parlante.play()
                .then(() => alert("¡Campanita lista para recibir pedidos!"))
                .catch(e => alert("Navegador dice: " + e.message));
            }}
            className="bg-[#c82a2a] px-2 py-1 rounded-lg text-xs font-bold shadow-sm hover:bg-red-700 transition-colors"
          >
            🔔 Activar Sonido
          </button>

          <button onClick={() => setAdminRoute('seguridad')} className="text-gray-400 hover:text-white" title="Seguridad">
            <User size={16} />
          </button>
          <button onClick={() => { setIsAuthenticated(false); switchMode() }} className="text-gray-400 hover:text-white flex items-center gap-1 text-xs">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {/* 👇 ACÁ ESTÁ INTEGRADO EL RESPALDO 👇 */}
        {(adminRoute === 'dashboard' || adminRoute === 'seguridad') && (
          <AdminBackup db={db} setDb={setDb} />
        )}
        {/* 👆 FIN DEL RESPALDO 👆 */}
        
        {renderView()}
      </div>

      <div className="bg-white border-t border-gray-200 flex justify-around p-2 pb-6 shrink-0 text-xs shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <NavBtn Icon={LayoutDashboard} label="Panel" active={adminRoute === 'dashboard'} onClick={() => setAdminRoute('dashboard')} />
        <NavBtn Icon={ListOrdered} label="Pedidos" active={adminRoute === 'pedidos'} onClick={() => setAdminRoute('pedidos')} />
        <NavBtn Icon={MenuSquare} label="Catálogo" active={adminRoute === 'catalogo'} onClick={() => setAdminRoute('catalogo')} />
        <NavBtn Icon={Truck} label="Envíos" active={adminRoute === 'envios'} onClick={() => setAdminRoute('envios')} />
      </div>

      {newOrderPopup && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center transform transition-all border-4 border-[#c82a2a]">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Store size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">¡NUEVO PEDIDO! 🥟</h2>
            <p className="text-gray-600 mb-6 font-medium">Acaba de ingresar un nuevo pedido al sistema. ¡A la cocina!</p>
            <div className="flex gap-3">
              <button
                onClick={() => setNewOrderPopup(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setNewOrderPopup(false);
                  setAdminRoute('pedidos'); 
                }}
                className="flex-1 bg-[#c82a2a] text-white font-bold py-3 rounded-xl hover:bg-red-800"
              >
                Ver Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
function NavBtn({ Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${
        active ? 'text-[#c82a2a]' : 'text-gray-500 hover:text-gray-800'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium" style={{ fontSize: '0.65rem' }}>
        {label}
      </span>
    </button>
  )
}

function AdminLogin({ db, setDb, onLogin, switchMode }) {
  const [email, setEmail] = useState(db.adminAuth?.email || '')
  const [pass, setPass] = useState('')
  const [recoveryWord, setRecoveryWord] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isRecovering, setIsRecovering] = useState(false)

  const isConfigured = db.adminAuth?.isConfigured

  const handleSetup = async e => {
    e.preventDefault()
    setErrorMsg('')
    if (pass.length < 6) return setErrorMsg('La contraseña debe tener al menos 6 caracteres.')
    if (recoveryWord.trim().length < 3) return setErrorMsg('Elige una palabra secreta de al menos 3 letras.')

    const hashedPass = await hashPassword(pass)
    const hashedRecovery = await hashPassword(recoveryWord.toLowerCase().trim())

    setDb(prev => ({
      ...prev,
      adminAuth: { email: email, passHash: hashedPass, recoveryHash: hashedRecovery, isConfigured: true, geminiKey: '' },
    }))
    onLogin()
  }

  const handleLogin = async e => {
    e.preventDefault()
    setErrorMsg('')
    const hashed = await hashPassword(pass)
    if (email.trim() === db.adminAuth.email && hashed === db.adminAuth.passHash) onLogin()
    else setErrorMsg('Credenciales incorrectas.')
  }

  const handleRecover = async e => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    if (pass.length < 6) return setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.')

    const hashedInputRecovery = await hashPassword(recoveryWord.toLowerCase().trim())
    if (email.trim() === db.adminAuth.email && hashedInputRecovery === db.adminAuth.recoveryHash) {
      const newHashedPass = await hashPassword(pass)
      setDb(prev => ({ ...prev, adminAuth: { ...prev.adminAuth, passHash: newHashedPass } }))
      setSuccessMsg('¡Contraseña restablecida con éxito!')
      setIsRecovering(false)
      setPass('')
      setRecoveryWord('')
    } else {
      setErrorMsg('El email o la palabra secreta son incorrectos.')
    }
  }

  if (isRecovering) {
    return (
      <div className="flex flex-col h-full bg-gray-900 items-center justify-center p-6 text-white relative">
        <button
          onClick={() => {
            setIsRecovering(false)
            setErrorMsg('')
          }}
          className="absolute top-6 left-6 text-gray-400 flex items-center gap-2 text-sm"
        >
          <ChevronLeft size={16} /> Volver
        </button>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="bg-[#fbb03b] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <KeyRound size={32} className="text-gray-900" />
            </div>
            <h1 className="text-2xl font-bold">Recuperar Acceso</h1>
          </div>
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center font-medium animate-fadeIn">
              {errorMsg}
            </div>
          )}
          <form onSubmit={handleRecover} className="space-y-4">
            <input
              type="email"
              placeholder="Email del local"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#fbb03b]"
            />
            <input
              type="text"
              placeholder="Palabra secreta"
              value={recoveryWord}
              onChange={e => setRecoveryWord(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#fbb03b]"
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={pass}
              onChange={e => setPass(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#fbb03b]"
            />
            <button
              type="submit"
              className="w-full bg-[#fbb03b] text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-500 shadow-lg"
            >
              Restablecer Contraseña
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 items-center justify-center p-6 text-white relative">
      <button onClick={switchMode} className="absolute top-6 left-6 text-gray-400 flex items-center gap-2 text-sm">
        <ChevronLeft size={16} /> Volver al local
      </button>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="bg-[#cc292b] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/50">
            <Settings size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">{isConfigured ? 'Acceso Restringido' : 'Configuración Inicial'}</h1>
          {!isConfigured && (
            <p className="text-sm text-gray-400 mt-2">
              Crea tu contraseña y palabra secreta de recuperación (todo será encriptado).
            </p>
          )}
        </div>
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center font-medium animate-fadeIn">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm text-center font-medium animate-fadeIn">
            {successMsg}
          </div>
        )}
        <form onSubmit={isConfigured ? handleLogin : handleSetup} className="space-y-4">
          <input
            type="email"
            placeholder="Email del local"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#fbb03b]"
          />
          <input
            type="password"
            placeholder={isConfigured ? 'Contraseña' : 'Crea una contraseña (mín 6 letras)'}
            value={pass}
            onChange={e => setPass(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#fbb03b]"
          />
          {!isConfigured && (
            <div className="pt-2 border-t border-gray-700">
              <label className="text-xs text-gray-400 font-bold mb-1 block">
                Palabra secreta (Ej: nombre de tu primera mascota)
              </label>
              <input
                type="text"
                placeholder="Palabra de recuperación"
                value={recoveryWord}
                onChange={e => setRecoveryWord(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#fbb03b]"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-[#cc292b] text-white font-bold py-3 rounded-lg hover:bg-red-800 shadow-lg mt-2"
          >
            {isConfigured ? 'Ingresar' : 'Guardar y Entrar'}
          </button>
        </form>
        {isConfigured && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRecovering(true)
                setErrorMsg('')
                setSuccessMsg('')
                setPass('')
              }}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminSeguridad({ db, setDb }) {
  const [email, setEmail] = useState(db.adminAuth.email)
  const [newPass, setNewPass] = useState('')
  const [newRecovery, setNewRecovery] = useState('')
  // EL NUEVO ESTADO PARA LA CLAVE DE GEMINI
  const [geminiKey, setGeminiKey] = useState(db.adminAuth.geminiKey || '')
  
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSave = async () => {
    setErrorMsg('')
    let authUpdate = { ...db.adminAuth, email, geminiKey }
    if (newPass.trim()) {
      if (newPass.length < 6) return setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.')
      authUpdate.passHash = await hashPassword(newPass)
    }
    if (newRecovery.trim()) {
      if (newRecovery.trim().length < 3) return setErrorMsg('La nueva palabra secreta debe tener al menos 3 letras.')
      authUpdate.recoveryHash = await hashPassword(newRecovery.toLowerCase().trim())
    }
    setDb(prev => ({ ...prev, adminAuth: authUpdate }))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setNewPass('')
    setNewRecovery('')
  }

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <User size={24} /> Seguridad
      </h2>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <p className="text-sm text-gray-500 mb-4">
          Tus datos están encriptados. Deja en blanco los campos que no desees cambiar.
        </p>
        {errorMsg && <div className="p-2 bg-red-50 text-red-600 text-xs font-bold rounded">{errorMsg}</div>}
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1">Email de acceso</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="pt-2 border-t">
          <label className="text-sm font-bold text-gray-700 block mb-1">Nueva Contraseña (opcional)</label>
          <input
            type="password"
            placeholder="Escribe para cambiarla..."
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="pt-2 border-t">
          <label className="text-sm font-bold text-gray-700 block mb-1">Nueva Palabra Secreta (opcional)</label>
          <input
            type="text"
            placeholder="Escribe para cambiarla..."
            value={newRecovery}
            onChange={e => setNewRecovery(e.target.value)}
            className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        
        {/* LA ZONA DEL CHEF IA */}
        <div className="pt-4 border-t border-gray-200 mt-4">
          <h3 className="text-sm font-bold text-[#c82a2a] flex items-center gap-2 mb-2">
            <Sparkles size={16} /> Clave API del Chef IA
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            Pegá acá tu clave de Gemini. Al guardarla en esta base de datos, Google no la bloqueará.
          </p>
          <input
            type="password"
            placeholder="Empieza con AIzaSy..."
            value={geminiKey}
            onChange={e => setGeminiKey(e.target.value)}
            className="w-full border rounded p-2 text-sm outline-none focus:border-[#c82a2a] bg-red-50"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 flex justify-center gap-2 mt-4"
        >
          {saved ? (
            <>
              <CheckCircle size={18} /> Guardado
            </>
          ) : (
            'Guardar Cambios'
          )}
        </button>
      </div>
    </div>
  )
}

function AdminDashboard({ db, setDb, setRoute }) {
  const today = new Date().toISOString().split('T')[0]
  const todaysOrders = db.orders.filter(o => o.date.startsWith(today))
  const totalSales = todaysOrders.reduce((acc, o) => acc + (o.status !== 'Cancelado' ? o.total : 0), 0)

  const manualStatus = db.manualStatus || INITIAL_MANUAL_STATUS

  const handleToggleClose = () => {
    setDb(prev => ({
      ...prev,
      manualStatus: { ...prev.manualStatus, isClosed: !prev.manualStatus?.isClosed }
    }))
  }
  const handleMessageChange = (e) => {
    setDb(prev => ({
      ...prev,
      manualStatus: { ...prev.manualStatus, message: e.target.value }
    }))
  }
  
  const handlePromptChange = (e) => {
    setDb(prev => ({
      ...prev,
      manualStatus: { ...prev.manualStatus, chefPrompt: e.target.value }
    }))
  }

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <h2 className="text-xl font-bold text-gray-800">Resumen de Hoy</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-bold uppercase">Ventas Hoy</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-bold uppercase">Pedidos Hoy</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{todaysOrders.length}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Store size={20} /> Estado Operativo</h3>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#c82a2a] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 text-sm">Cerrado momentáneamente</p>
              <p className="text-xs text-gray-500">Bloquea pedidos al instante.</p>
            </div>
            <button 
              onClick={handleToggleClose}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none shadow-inner ${manualStatus.isClosed ? 'bg-red-500' : 'bg-green-500'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${manualStatus.isClosed ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <label className="block text-xs font-bold text-gray-600 mb-1">Mensaje para clientes (cuando está ABIERTO):</label>
            <input 
              type="text" 
              placeholder="Ej: ¡Hoy promo en sorrentinos! 🔥"
              value={manualStatus.message || ''} 
              onChange={handleMessageChange}
              className="block w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 focus:ring-1 focus:ring-[#c82a2a] outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Sparkles size={20} className="text-[#fbb03b]"/> Entrenar al Chef IA</h3>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#fbb03b]">
          <label className="block text-xs font-bold text-gray-600 mb-2">Instrucciones y Reglas (Ej: Porciones, Trato, Promos):</label>
          <textarea 
            value={manualStatus.chefPrompt || ''} 
            onChange={handlePromptChange}
            placeholder="Ej: 2 planchas rinden para 3 personas. Ofrecer siempre queso rallado."
            className="block w-full border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 focus:ring-1 focus:ring-[#fbb03b] outline-none resize-none h-28"
          />
          <p className="text-xs text-gray-400 mt-2">El Chef leerá esto antes de responder a cualquier cliente.</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-gray-700 mb-3">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setRoute('horarios')}
            className="bg-orange-50 text-orange-700 p-3 rounded-lg text-sm font-bold border border-orange-100 flex flex-col gap-2"
          >
            <Clock size={20} /> Editar Horarios
          </button>
          <button
            onClick={() => setRoute('categorias')}
            className="bg-purple-50 text-purple-700 p-3 rounded-lg text-sm font-bold border border-purple-100 flex flex-col gap-2"
          >
            <MenuSquare size={20} /> Categorías
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminPedidos({ db, setDb }) {
  const [ticketToPrint, setTicketToPrint] = useState(null)

  const updateStatus = (id, newStatus) =>
    setDb(prev => ({ ...prev, orders: prev.orders.map(o => (o.id === id ? { ...o, status: newStatus } : o)) }))
  
  const statusColors = {
    Recibido: 'bg-yellow-100 text-yellow-800',
    Entregado: 'bg-green-100 text-green-800',
    Cancelado: 'bg-red-100 text-red-800',
  }

  // 🔥 PANTALLA EXCLUSIVA DE IMPRESIÓN
  if (ticketToPrint) {
    const order = ticketToPrint;
    // Calculamos el subtotal de los productos
    const subtotal = order.items.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);

    return (
      <div className="fixed inset-0 bg-white z-[99999] overflow-y-auto print:overflow-visible">
        <style>{`
          @media print {
            @page { margin: 0; size: 58mm auto; }
            body { margin: 0; padding: 0; background: white; }
            * { font-weight: 900 !important; color: #000 !important; }
            .ocultar-en-ticket { display: none !important; }
          }
        `}</style>

        <div className="ocultar-en-ticket flex gap-2 p-4 bg-gray-100 border-b sticky top-0 shadow-sm">
          <button 
            onClick={() => setTicketToPrint(null)}
            className="bg-gray-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <ChevronLeft size={20} /> Volver
          </button>
          <button 
            onClick={() => window.print()}
            className="flex-1 bg-[#25D366] text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            🖨️ MANDAR A TICKETERA
          </button>
        </div>

        <div style={{ 
          width: '100%', 
          maxWidth: '58mm', 
          margin: '0 auto', 
          padding: '2mm',
          fontFamily: 'Calibri, Arial, sans-serif', 
          fontSize: '14px', 
          color: '#000', 
          lineHeight: '1.2' 
        }}>
          <div style={{ textAlign: 'center', fontSize: '18px' }}>AL BUEN RAVIOL</div>
          <div style={{ textAlign: 'center', fontSize: '12px' }}>Maipú, Mendoza</div>
          <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>
          
          <div style={{ textAlign: 'center' }}>
            <div>Pedido: #{order.id}</div>
            <div>Fecha: {new Date(order.date).toLocaleString('es-AR')}</div>
            <div style={{ marginTop: '3px' }}>Cliente: {order.customer.name}</div>
            <div>Tel: {order.customer.phone}</div>
            
            <div style={{ fontSize: '16px', marginTop: '5px' }}>
              Tipo: {order.type.toUpperCase()}
            </div>
            {order.paymentDetails && (
              <div style={{ fontSize: '14px', marginTop: '4px', borderBottom: '1px solid #000', paddingBottom: '2px', fontWeight: 'bold' }}>
                💰 Pago: {order.paymentDetails}
              </div>
            )}
            {order.type === 'delivery' && (
              <div style={{ marginTop: '2px', fontSize: '13px' }}>
                Dir: {order.customer.address}
              </div>
            )}
            
            {order.customer.notes && (
              <div style={{ marginTop: '4px', border: '2px solid #000', padding: '2px', borderRadius: '4px' }}>
                Nota: {order.customer.notes}
              </div>
            )}
          </div>
          
          <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>
          <div style={{ fontSize: '12px', marginBottom: '6px', textAlign: 'center' }}>
            CANT - PRODUCTO - SUBTOTAL
          </div>
          
          {order.items.map((i, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
              <span style={{ flex: 1, textAlign: 'left', paddingRight: '5px' }}>
                {i.quantity}{i.product.unitType === 'peso' ? 'kg' : 'u'} {i.product.name}
              </span>
              <span>{formatCurrency(i.product.price * i.quantity)}</span>
            </div>
          ))}
          
          <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>
          
          {/* 👇 FILA DEL SUBTOTAL 👇 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '2px' }}>
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {order.type === 'delivery' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>Envío:</span>
              <span>{formatCurrency(order.shippingCost || 0)}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', marginTop: '6px' }}>
            <span>TOTAL:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          
          <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>
          <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '12px' }}>¡Gracias por su compra!</div>
          <div style={{ textAlign: 'center', fontSize: '12px' }}>---</div>
        </div>
      </div>
    );
  }

  // 📋 LISTA NORMAL DE PEDIDOS
  return (
    <div className="space-y-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-800">Gestión de Pedidos</h2>
      {db.orders.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No hay pedidos registrados.</p>
      ) : (
        <div className="space-y-4">
          {db.orders.map(order => {
            const subtotal = order.items.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);
            
            return (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">#{order.id}</span>
                    <p className="font-bold text-gray-800 mt-1">{order.customer.name}</p>
                    <p className="text-xs text-gray-500">{new Date(order.date).toLocaleString('es-AR')}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 items-end">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-full outline-none cursor-pointer ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <option value="Recibido">Recibido</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                    
                    <button 
                      onClick={() => setTicketToPrint(order)}
                      className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                    >
                      🖨️ Imprimir
                    </button>
                  </div>
                </div>

                <div className="text-sm bg-gray-50 p-2 rounded mb-2">
                  <p><strong>Tel:</strong> {order.customer.phone}</p>
                  <p><strong>Tipo:</strong> {order.type.toUpperCase()}</p>
                  {order.type === 'delivery' && (
                    <div className="flex flex-col gap-1 mt-1">
                      <p>
                        <strong>Dir:</strong> {order.customer.address}{' '}
                        <span className="text-xs text-gray-500">({order.distance ? order.distance.toFixed(1) : 0} km)</span>
                      </p>
                      {/* 🔥 EL BOTÓN SALVAVIDAS: Abre la coordenada exacta */}
                      {order.customer.coords && (
                        <a 
                          href={`https://maps.google.com/?q=${order.customer.coords.lat},${order.customer.coords.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 self-start mt-1 transition-colors border border-blue-200"
                        >
                          📍 Abrir ubicación exacta del cliente
                        </a>
                      )}
                    </div>
                  )}
                  {order.customer.notes && (
                    <p className="text-red-600 font-bold mt-1">📝 Nota: {order.customer.notes}</p>
                  )}
                </div>
                
                <div className="text-xs space-y-1 mb-2">
                  {order.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-gray-600">
                      <span>
                        {i.quantity} {i.product.unitType === 'peso' ? 'kg' : 'u'} x {i.product.name}
                      </span>
                      <span>{formatCurrency(i.product.price * i.quantity)}</span>
                    </div>
                  ))}
                  
                  {/* 👇 FILA DEL SUBTOTAL EN LA TARJETA 👇 */}
                  <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-100 mt-2 font-bold">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  {order.type === 'delivery' && (
                    <div className="flex justify-between text-gray-500 pt-1">
                      <span>Costo de envío</span>
                      <span>{formatCurrency(order.shippingCost || 0)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-500">Total:</span>
                  <span className="font-black text-gray-900">{formatCurrency(order.total)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

function AdminCatalogo({ db, setDb }) {
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(null)
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false)
  
  // 🔥 ESTADO NUEVO PARA CONTROLAR QUÉ CATEGORÍAS ESTÁN DESPLEGADAS
  const [expandedCats, setExpandedCats] = useState({})

  const toggleCat = (catId) => {
    setExpandedCats(prev => ({ ...prev, [catId]: prev[catId] === false ? true : false }))
  }

  const startEdit = prod => {
    setFormData(
      prod
        ? { ...prod, unitType: prod.unitType || 'unidad' } 
        : {
            id: Date.now(),
            name: '',
            description: '',
            price: 0,
            categoryId: db.categories[0]?.id || 1,
            image: '',
            unitType: 'unidad', 
            featured: false,
            active: true,
          }
    )
    setEditingId(prod ? prod.id : 'new')
  }

  const saveProduct = () => {
    // Si es nuevo, le ponemos como orden el final de su categoría
    let newOrder = 0;
    if (editingId === 'new') {
      const catProds = db.products.filter(p => p.categoryId === formData.categoryId);
      newOrder = catProds.length > 0 ? Math.max(...catProds.map(p => p.order || 0)) + 1 : 1;
    }

    setDb(prev => ({
      ...prev,
      products:
        editingId === 'new'
          ? [...prev.products, { ...formData, order: newOrder }]
          : prev.products.map(p => (p.id === formData.id ? formData : p)),
    }))
    setEditingId(null)
  }

  const deleteProduct = id => {
    if (window.confirm('¿Eliminar producto?'))
      setDb(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }))
  }

  const toggleActive = id =>
    setDb(prev => ({ ...prev, products: prev.products.map(p => (p.id === id ? { ...p, active: !p.active } : p)) }))

  const generateAIAssistantDescription = async () => {
    if (!formData.name) return alert('Por favor, ingresa el nombre del producto primero.')
    setIsGeneratingDesc(true)
    const response = await callGemini(
      `Escribe una descripción comercial y apetitosa (max 2 líneas) para un plato llamado: "${formData.name}". Destaca su calidad casera.`,
      'Eres un copywriter gastronómico.',
      db.adminAuth?.geminiKey
    )
    setFormData(prev => ({ ...prev, description: response.replace(/"/g, '') }))
    setIsGeneratingDesc(false)
  }

  // 🔥 MOTOR MEJORADO PARA MOVER PRODUCTOS (A PRUEBA DE ERRORES)
  const moveProduct = (productId, direction) => {
    setDb(prev => {
      const productToMove = prev.products.find(p => p.id === productId);
      if (!productToMove) return prev;

      // 1. Agarramos todos los de esa categoría y los forzamos a tener un orden numérico limpio (0, 1, 2, 3...)
      let catProducts = prev.products
        .filter(p => p.categoryId === productToMove.categoryId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((p, i) => ({ ...p, order: i }));

      const index = catProducts.findIndex(p => p.id === productId);

      // 2. Intercambiamos los números de orden
      if (direction === -1 && index > 0) {
        catProducts[index].order = index - 1;
        catProducts[index - 1].order = index;
      } else if (direction === 1 && index < catProducts.length - 1) {
        catProducts[index].order = index + 1;
        catProducts[index + 1].order = index;
      } else {
        return prev; // No se puede mover más
      }

      // 3. Devolvemos la lista general actualizada
      const newProducts = prev.products.map(p => {
        const updatedP = catProducts.find(cp => cp.id === p.id);
        return updatedP ? updatedP : p;
      });

      return { ...prev, products: newProducts };
    });
  };

  // PANTALLA DE EDICIÓN
  if (editingId) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-fadeIn">
        <h3 className="font-bold text-lg mb-4">{editingId === 'new' ? 'Nuevo Producto' : 'Editar Producto'}</h3>
        <div className="space-y-3">
          <input
            className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Nombre"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="border rounded p-2 focus-within:ring-2 focus-within:ring-purple-500 bg-white transition-all">
            <div className="flex justify-between items-center mb-1 pb-1 border-b border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase">Descripción</span>
              <button
                onClick={e => {
                  e.preventDefault()
                  generateAIAssistantDescription()
                }}
                disabled={isGeneratingDesc}
                className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-bold flex items-center gap-1"
              >
                <Sparkles size={12} /> {isGeneratingDesc ? 'Generando...' : 'IA'}
              </button>
            </div>
            <textarea
              className="w-full text-sm outline-none resize-none h-16 pt-1 text-gray-700"
              placeholder="Escribe o genera descripción..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              className="w-1/2 border rounded p-2 text-sm outline-none"
              placeholder="Precio"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
            />
            <select
              className="w-1/2 border rounded p-2 text-sm outline-none"
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value) })}
            >
              {db.categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="pt-1">
            <label className="text-xs font-bold text-gray-600 block mb-1">Forma de Venta</label>
            <select
              className="w-full border rounded p-2 text-sm outline-none bg-gray-50"
              value={formData.unitType}
              onChange={e => setFormData({ ...formData, unitType: e.target.value })}
            >
              <option value="unidad">Venta por Unidad ( Plancha )</option>
              <option value="peso">Venta por Peso (Suma de a 0.250 Kg)</option>
            </select>
          </div>

          <input
            className="w-full border rounded p-2 text-sm outline-none mt-1"
            placeholder="URL Imagen"
            value={formData.image}
            onChange={e => setFormData({ ...formData, image: e.target.value })}
          />
          <div className="flex gap-4 py-2">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
              />{' '}
              Destacado
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={e => setFormData({ ...formData, active: e.target.checked })}
              />{' '}
              Activo
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={saveProduct} className="flex-1 bg-green-500 text-white py-2 rounded font-bold">
              Guardar
            </button>
            <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-200 py-2 rounded font-bold">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // PANTALLA DEL CATÁLOGO (CATEGORÍAS PLEGABLES)
  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Catálogo</h2>
        <button
          onClick={() => startEdit()}
          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold flex gap-1 items-center"
        >
          <Plus size={16} /> Crear Producto
        </button>
      </div>

      <div className="space-y-4">
        {db.categories
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(cat => {
            // Filtramos y ordenamos los productos de ESTA categoría
            const catProducts = db.products
              .filter(p => p.categoryId === cat.id)
              .sort((a, b) => (a.order || 0) - (b.order || 0));

            // Por defecto están abiertas (true), a menos que las toquemos
            const isExpanded = expandedCats[cat.id] !== false;

            return (
              <div key={cat.id} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                
                {/* CABECERA PLEGABLE */}
                <div 
                  className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleCat(cat.id)}
                >
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    {cat.name} 
                    <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">
                      {catProducts.length}
                    </span>
                  </h3>
                  <span className="text-gray-400">
                    {isExpanded ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                  </span>
                </div>
                
                {/* LISTA DE PRODUCTOS (Solo se ve si está expandido) */}
                {isExpanded && (
                  <div className="p-3 space-y-2 border-t border-gray-100 bg-gray-50/50">
                    {catProducts.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No hay productos cargados en {cat.name}.</p>
                    ) : (
                      catProducts.map((p, index) => (
                        <div
                          key={p.id}
                          className={`flex gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm ${
                            !p.active ? 'opacity-50 grayscale' : ''
                          }`}
                        >
                          {/* BOTONES PARA MOVER ARRIBA/ABAJO */}
                          <div className="flex flex-col items-center justify-center mr-1 border-r pr-2 border-gray-50">
                            <button 
                              onClick={() => moveProduct(p.id, -1)} 
                              disabled={index === 0}
                              className={`pb-1 ${index === 0 ? 'text-gray-200' : 'text-gray-400 hover:text-gray-800'}`}
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button 
                              onClick={() => moveProduct(p.id, 1)} 
                              disabled={index === catProducts.length - 1}
                              className={`pt-1 ${index === catProducts.length - 1 ? 'text-gray-200' : 'text-gray-400 hover:text-gray-800'}`}
                            >
                              <ArrowDown size={16} />
                            </button>
                          </div>

                          <img src={p.image} className="w-14 h-14 object-cover rounded" alt="" />
                          <div className="flex-1">
                            <h4 className="font-bold text-sm leading-tight">{p.name}</h4>
                            <p className="font-bold text-red-600 text-sm mt-1">
                              {formatCurrency(p.price)} 
                              {p.unitType === 'peso' && <span className="text-gray-400 font-normal text-xs ml-1">/kg</span>}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 justify-center items-end">
                            <div className="flex gap-1">
                              <button
                                onClick={() => toggleActive(p.id)}
                                className={`p-1.5 rounded flex items-center gap-1 text-xs font-bold ${
                                  p.active ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'
                                }`}
                              >
                                {p.active ? <CheckCircle size={14} /> : <Minus size={14} />}
                              </button>
                              <button onClick={() => startEdit(p)} className="text-blue-500 bg-blue-50 p-1.5 rounded">
                                <Settings size={16} />
                              </button>
                              <button onClick={() => deleteProduct(p.id)} className="text-red-500 bg-red-50 p-1.5 rounded">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

function AdminCategorias({ db, setDb }) {
  // ACÁ ESTABA EL ERROR TONTO, YA ESTÁ CORREGIDO:
  const [newCatName, setNewCatName] = useState('')

  const handleAdd = () => {
    if (!newCatName.trim()) return
    const newOrder = db.categories.length > 0 ? Math.max(...db.categories.map(c => c.order)) + 1 : 1
    setDb(prev => ({
      ...prev,
      categories: [...prev.categories, { id: Date.now(), name: newCatName.trim(), order: newOrder }],
    }))
    setNewCatName('')
  }

  const handleEditName = (id, newName) =>
    setDb(prev => ({ ...prev, categories: prev.categories.map(c => (c.id === id ? { ...c, name: newName } : c)) }))

  const handleDelete = id => {
    if (db.products.some(p => p.categoryId === id)) return alert('Hay productos en esta categoría.')
    if (window.confirm('¿Eliminar categoría?'))
      setDb(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }))
  }

  const moveCat = (index, direction) => {
    setDb(prev => {
      const sorted = [...prev.categories].sort((a, b) => a.order - b.order)
      if (direction === -1 && index > 0)
        [sorted[index].order, sorted[index - 1].order] = [sorted[index - 1].order, sorted[index].order]
      else if (direction === 1 && index < sorted.length - 1)
        [sorted[index].order, sorted[index + 1].order] = [sorted[index + 1].order, sorted[index].order]
      return { ...prev, categories: sorted }
    })
  }

  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      <h2 className="text-xl font-bold text-gray-800">Categorías</h2>
      <div className="flex gap-2 bg-white p-3 rounded-xl border border-gray-200">
        <input
          type="text"
          placeholder="Nueva categoría..."
          value={newCatName}
          onChange={e => setNewCatName(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm outline-none"
        />
        <button onClick={handleAdd} className="bg-purple-600 text-white px-4 py-2 rounded font-bold">
          <Plus size={16} />
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        {db.categories
          .sort((a, b) => a.order - b.order)
          .map((cat, index) => (
            <div key={cat.id} className="p-3 border-b flex justify-between items-center">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex flex-col">
                  <button onClick={() => moveCat(index, -1)} disabled={index === 0}>
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => moveCat(index, 1)} disabled={index === db.categories.length - 1}>
                    <ArrowDown size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  value={cat.name}
                  onChange={e => handleEditName(cat.id, e.target.value)}
                  className="font-bold text-gray-700 bg-transparent w-full outline-none"
                />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                  {db.products.filter(p => p.categoryId === cat.id).length} prods
                </span>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

function AdminHorarios({ db, setDb }) {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const [schedule, setSchedule] = useState(db.schedule)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setDb(prev => ({ ...prev, schedule }))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const addShift = dayIdx =>
    setSchedule(prev => ({ ...prev, [dayIdx]: [...(prev[dayIdx] || []), { open: '09:00', close: '13:00' }] }))
  const removeShift = (dayIdx, shiftIdx) =>
    setSchedule(prev => ({ ...prev, [dayIdx]: prev[dayIdx].filter((_, i) => i !== shiftIdx) }))
  const updateShift = (dayIdx, shiftIdx, field, value) =>
    setSchedule(prev => {
      const newShifts = [...prev[dayIdx]]
      newShifts[shiftIdx] = { ...newShifts[shiftIdx], [field]: value }
      return { ...prev, [dayIdx]: newShifts }
    })

  return (
    <div className="space-y-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-800">Horarios</h2>
      <div className="space-y-3 pb-4">
        {days.map((day, idx) => {
          const shifts = schedule[idx] || []
          return (
            <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col gap-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-sm text-gray-700">{day}</span>
                <button
                  onClick={() => addShift(idx)}
                  className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold flex gap-1"
                >
                  <Plus size={12} /> Turno
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {shifts.length === 0 ? (
                  <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded self-start">CERRADO</span>
                ) : (
                  shifts.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <input
                        type="time"
                        value={s.open}
                        onChange={e => updateShift(idx, i, 'open', e.target.value)}
                        className="border rounded p-1 text-sm bg-white"
                      />
                      <span className="text-gray-400">a</span>
                      <input
                        type="time"
                        value={s.close}
                        onChange={e => updateShift(idx, i, 'close', e.target.value)}
                        className="border rounded p-1 text-sm bg-white"
                      />
                      <button onClick={() => removeShift(idx, i)} className="ml-auto text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg flex justify-center gap-2 mb-8"
      >
        {saved ? 'Guardado' : 'Guardar Horarios'}
      </button>
    </div>
  )
}

function AdminEnvios({ db, setDb }) {
  const [config, setConfig] = useState(db.shippingConfig)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setDb(prev => ({ ...prev, shippingConfig: config }))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-800 flex gap-2">
        <Truck size={24} /> Envíos
      </h2>
      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
        <h3 className="font-bold text-gray-700 flex gap-2">
          <MapPin size={18} className="text-red-500" /> Punto Cero (Local)
        </h3>
        <p className="text-xs text-gray-500">Arrastra el pin para establecer desde dónde se calcula el envío.</p>
        <AdminLocationPicker
          location={config.shopLocation}
          onChange={newCoords => setConfig({ ...config, shopLocation: newCoords })}
        />
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
        {[
          { label: '0 a 3 km', key: 'tier1' },
          { label: '3 a 4 km', key: 'tier2' },
          { label: '4 a 5 km', key: 'tier3' },
          { label: 'Extra por Km (> 5km)', key: 'extra' },
        ].map(tier => (
          <div key={tier.key} className="flex justify-between items-center border-b pb-2">
            <label className="text-sm font-bold text-gray-700 w-1/2">{tier.label}</label>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                value={config[tier.key]}
                onChange={e => setConfig({ ...config, [tier.key]: Number(e.target.value) })}
                className="border rounded p-1 w-20 text-right font-bold outline-none"
              />
            </div>
          </div>
        ))}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg flex justify-center gap-2"
        >
          {saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

function AdminLocationPicker({ location, onChange }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerInstance = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    loadGoogleMaps(() => setMapLoaded(true))
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    if (mapInstance.current) return

    const google = window.google
    const map = new google.maps.Map(mapRef.current, {
      center: location,
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
    })

    const marker = new google.maps.Marker({
      position: location,
      map: map,
      draggable: true,
    })

    marker.addListener('dragend', () => {
      const pos = marker.getPosition()
      onChange({ lat: pos.lat(), lng: pos.lng() })
    })

    mapInstance.current = map
    markerInstance.current = marker
    
    setTimeout(() => {
      if (mapInstance.current && window.google) {
        window.google.maps.event.trigger(mapInstance.current, 'resize')
      }
    }, 200)

  }, [mapLoaded, location])

  return (
    <div className="mt-2">
      <div ref={mapRef} className="w-full h-48 rounded-lg border bg-gray-100 relative z-0">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Cargando Maps...
          </div>
        )}
      </div>
    </div>
  )
}

function AdminBackup({ db, setDb }) {
  const exportarBackup = () => {
    // Exportamos la base de datos completa (productos, horarios, IA, etc.)
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "backup_maestro_al_buen_raviol.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importarBackup = (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function(e) {
      try {
        const contenido = JSON.parse(e.target.result);
        setDb(contenido); // ¡Esto actualiza el sistema y lo guarda en Firebase al instante!
        alert("¡El sistema fue restaurado con éxito! Ya tenés todo tu menú de vuelta.");
      } catch (error) {
        alert("Error al leer el archivo. Asegurate de que sea el archivo .json correcto.");
      }
    };
    lector.readAsText(archivo);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mt-6 mb-6">
      <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
        <Package size={20} className="text-[#c82a2a]"/> Copia de Seguridad
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Descargá todo tu catálogo de pastas frescas, precios y configuraciones a tu computadora. Si se borra algo, podés restaurarlo desde acá.
      </p>
      <div className="flex flex-col gap-3">
        <button 
          onClick={exportarBackup}
          className="bg-[#2e7d32] text-white p-3 rounded-lg font-bold flex justify-center items-center gap-2 active:scale-95 transition-transform"
        >
          <ArrowDown size={18} /> Descargar Archivo Maestro
        </button>
        
        <div className="relative">
          <input 
            type="file" 
            accept=".json" 
            onChange={importarBackup} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button className="w-full bg-[#c82a2a] text-white p-3 rounded-lg font-bold flex justify-center items-center gap-2">
            <ArrowUp size={18} /> Restaurar desde Archivo
          </button>
        </div>
      </div>
    </div>
  )
}