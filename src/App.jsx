import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  ShoppingCart,
  User,
  MapPin,
  Search,
  Plus,
  Minus,
  ChevronLeft,
  History,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  LayoutDashboard,
  ListOrdered,
  Settings,
  Store,
  MenuSquare,
  Truck,
  LogOut,
  Sparkles,
  Send,
  X,
  ArrowUp,
  ArrowDown,
  KeyRound,
  Calculator,
  Banknote,
  CreditCard,
  Boxes,
  Wallet,
  Settings2,
  Percent,
  Smartphone,
  Printer,
  Save,
  FileText,
  Barcode,
  Tag,
  Image as ImageIcon,
  TrendingUp,
  Calendar,
  AlertTriangle,
  QrCode,
  HandCoins,
  Landmark,
  ArrowRightLeft,
  SmartphoneNfc,
  ChevronDown,
  ChevronUp,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const GOOGLE_MAPS_API_KEY = "AIzaSyBmiPXxoPbC5Y-cVaemlJnha8qLn4wCR9Q";

// --- CONFIGURACIÓN DEL LOCAL ---
const SHOP_PHONE = "5492613426085";
const SHOP_ADDRESS =
  "Centro Comercial Plaza Michelo, Palma y Maza, Maipú, Mendoza";
const SHOP_LOGO =
  "https://i.postimg.cc/TYHsxqMV/Copia_de_Logo_al_buen_raviol_(2).png";
const CHEF_AVATAR = "https://i.postimg.cc/vB77k5rp/chef.png";

// --- DATOS POR DEFECTO ---
const INITIAL_CATEGORIES = [
  { id: 1, name: "Ravioles", order: 1 },
  { id: 2, name: "Sorrentinos", order: 2 },
  { id: 3, name: "Tallarines", order: 3 },
  { id: 4, name: "Salsas", order: 4 },
  { id: 5, name: "Combos", order: 5 },
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Ravioles de Carne y Verdura",
    description:
      "Clásicos ravioles caseros rellenos de carne premium y espinaca fresca.",
    cost: 1800,
    margin: 150,
    price: 4500,
    categoryId: 1,
    featured: true,
    active: true,
    showInWeb: true,
    showInPOS: true,
    unitType: "unidad",
    stock: 100,
    trackStock: false,
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=400",
    barcode: "",
    sku: "",
  },
  {
    id: 2,
    name: "Ravioles de Ricota",
    description: "Suaves ravioles de ricota magra y nuez.",
    cost: 1800,
    margin: 150,
    price: 4500,
    categoryId: 1,
    featured: false,
    active: true,
    showInWeb: true,
    showInPOS: true,
    unitType: "unidad",
    stock: 50,
    trackStock: false,
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=400",
    barcode: "",
    sku: "",
  },
  {
    id: 3,
    name: "Sorrentinos de Jamón y Queso",
    description: "Abundante relleno de jamón cocido y muzzarella.",
    cost: 2080,
    margin: 150,
    price: 5200,
    categoryId: 2,
    featured: true,
    active: true,
    showInWeb: true,
    showInPOS: true,
    unitType: "unidad",
    stock: 30,
    trackStock: true,
    image:
      "https://images.unsplash.com/photo-1621996311239-53cbdf018245?auto=format&fit=crop&q=80&w=400",
    barcode: "",
    sku: "",
  },
  {
    id: 4,
    name: "Tallarines al Huevo",
    description: "Fideos frescos cortados a cuchillo.",
    cost: 1200,
    margin: 150,
    price: 3000,
    categoryId: 3,
    featured: false,
    active: true,
    showInWeb: true,
    showInPOS: true,
    unitType: "peso",
    stock: 10,
    trackStock: false,
    image:
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=400",
    barcode: "",
    sku: "",
  },
];

const INITIAL_SHIPPING_CONFIG = {
  tier1: 1000,
  tier2: 1500,
  tier3: 2000,
  extra: 500,
  shopLocation: { lat: -32.9850886, lng: -68.7986076 },
};
const INITIAL_SCHEDULE = {
  0: [],
  1: [{ open: "09:30", close: "23:30" }],
  2: [{ open: "09:30", close: "23:30" }],
  3: [{ open: "09:30", close: "23:30" }],
  4: [{ open: "09:30", close: "23:30" }],
  5: [{ open: "09:30", close: "23:30" }],
  6: [{ open: "09:30", close: "23:30" }],
};

// --- NUEVA ESTRUCTURA DE MEDIOS DE PAGO ---
const INITIAL_PAYMENT_METHODS = [
  {
    id: "efvo",
    name: "Efectivo",
    active: true,
    showInDelivery: true,
    showInPickup: false,
    showInPOS: true,
    type: "cash",
    details: "",
  },
  {
    id: "transf",
    name: "Transferencia",
    active: true,
    showInDelivery: true,
    showInPickup: true,
    showInPOS: true,
    type: "transfer",
    details: "Alias: ABRMAIPU",
  },
  {
    id: "tarj",
    name: "Pago en Local (Efectivo/Tarjeta/MP)",
    active: true,
    showInDelivery: false,
    showInPickup: true,
    showInPOS: true,
    type: "local",
    details: "",
  },
];

const INITIAL_ADMIN_AUTH = {
  email: "albuenraviolmaipu@gmail.com",
  passHash: "",
  recoveryHash: "",
  isConfigured: false,
  geminiKey: "",
};
const INITIAL_MANUAL_STATUS = {
  isClosed: false,
  message: "¡Estamos tomando pedidos! 🔥",
  chefPrompt: "Reglas del local: 2 planchas rinden para 3 personas.",
};

// ==================================================
// 🔥 CONFIGURACIÓN DE FIREBASE (Ajustado para entorno Canvas)
// ==================================================
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : {
        apiKey: "AIzaSyAu-6398vfb_Fz3jDvvmAprisBTZa8DAOs",
        authDomain: "abrmaipu-pastas.firebaseapp.com",
        projectId: "abrmaipu-pastas",
        storageBucket: "abrmaipu-pastas.firebasestorage.app",
        messagingSenderId: "335783544635",
        appId: "1:335783544635:web:c54b41b2cfac3c014c591e",
      };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestoreDb = getFirestore(app);
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// --- UTILIDADES ---
let isGoogleMapsLoading = false;
const loadGoogleMaps = (callback) => {
  if (window.google && window.google.maps) {
    callback();
    return;
  }
  if (isGoogleMapsLoading) {
    setTimeout(() => loadGoogleMaps(callback), 100);
    return;
  }
  isGoogleMapsLoading = true;
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    isGoogleMapsLoading = false;
    callback();
  };
  document.head.appendChild(script);
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const callGemini = async (
  chatHistory,
  systemInstruction = "Eres un asistente útil.",
  apiKey = ""
) => {
  if (!apiKey) return "Falta la clave API. Configurarla en Seguridad.";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  let cleanHistory = chatHistory.filter((msg) => !msg.text.includes("Error"));
  while (cleanHistory.length > 0 && cleanHistory[0].role !== "user")
    cleanHistory.shift();
  let formattedContents = [];
  for (let msg of cleanHistory) {
    let mappedRole = msg.role === "assistant" ? "model" : "user";
    if (formattedContents.length === 0)
      formattedContents.push({
        role: mappedRole,
        parts: [{ text: msg.text || "Hola" }],
      });
    else {
      let lastMsg = formattedContents[formattedContents.length - 1];
      if (lastMsg.role === mappedRole)
        lastMsg.parts[0].text += " \n " + (msg.text || "");
      else
        formattedContents.push({
          role: mappedRole,
          parts: [{ text: msg.text || "Hola" }],
        });
    }
  }
  if (formattedContents.length === 0)
    formattedContents.push({ role: "user", parts: [{ text: "Hola" }] });
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: formattedContents,
        system_instruction: { parts: [{ text: systemInstruction }] },
      }),
    });
    const data = await response.json();
    if (!response.ok) return `Error: ${data.error?.message}`;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
  } catch (error) {
    return `Error local: ${error.message}`;
  }
};

const PaymentIcon = ({ type, size = 18, className = "" }) => {
  switch (type) {
    case "cash":
      return <Banknote size={size} className={className} />;
    case "bank":
      return <Landmark size={size} className={className} />;
    case "transfer":
      return <ArrowRightLeft size={size} className={className} />;
    case "card":
      return <CreditCard size={size} className={className} />;
    case "qr":
      return <QrCode size={size} className={className} />;
    case "store":
      return <Store size={size} className={className} />;
    case "pos":
      return <SmartphoneNfc size={size} className={className} />;
    default:
      return <CreditCard size={size} className={className} />;
  }
};
// ==========================================
// COMPONENTES GLOBALES (ALERTAS Y CONFIRMS)
// ==========================================
function CustomConfirm({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[999999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeIn border-4 border-[#c82a2a]">
        <h3 className="text-lg font-bold text-gray-800 mb-6 text-center leading-tight">
          {message}
        </h3>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="flex-1 bg-[#c82a2a] text-white py-3 rounded-xl font-bold shadow-md hover:bg-red-800"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomAlert({ isOpen, message, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[999999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeIn border-4 border-yellow-400">
        <div className="flex justify-center mb-3">
          <AlertTriangle size={32} className="text-yellow-500" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-6 text-center leading-tight">
          {message}
        </h3>
        <button
          onClick={onClose}
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold shadow-md hover:bg-black"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  const [appMode, setAppMode] = useState("client");
  const [user, setUser] = useState(null);
  const [dbState, setDbState] = useState(null);

  // --- NUEVO ESTADO DE SEGURIDAD (Por defecto arranca como empleado) ---
  const [userRole, setUserRole] = useState("empleado");

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const docRef = doc(
      firestoreDb,
      "artifacts",
      appId,
      "public",
      "data",
      "store_data",
      "main"
    );
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          // --- Migración de datos viejos de Medios de Pago a los nuevos ---
          if (!data.paymentMethods) {
            data.paymentMethods = INITIAL_PAYMENT_METHODS;
          } else {
            data.paymentMethods = data.paymentMethods.map((pm) => {
              if (pm.showInWeb !== undefined) {
                const updatedPm = {
                  ...pm,
                  showInDelivery: pm.showInWeb !== false,
                  showInPickup: pm.showInWeb !== false,
                  showInPOS: pm.showInPOS !== false,
                };
                delete updatedPm.showInWeb;
                return updatedPm;
              }
              return pm;
            });
          }

          if (!data.savedTickets) data.savedTickets = [];
          if (!data.printerConfig)
            data.printerConfig = { paperSize: "58mm", type: "system" };
          setDbState({ ...data, _isCloudSecured: true });
        } else {
          const initialData = {
            categories: INITIAL_CATEGORIES,
            products: INITIAL_PRODUCTS,
            shippingConfig: INITIAL_SHIPPING_CONFIG,
            schedule: INITIAL_SCHEDULE,
            paymentMethods: INITIAL_PAYMENT_METHODS,
            orders: [],
            adminAuth: INITIAL_ADMIN_AUTH,
            manualStatus: INITIAL_MANUAL_STATUS,
            savedTickets: [],
            printerConfig: { paperSize: "58mm", type: "system" },
            _isCloudSecured: true,
          };
          setDoc(docRef, initialData).catch(console.error);
          setDbState(initialData);
        }
      },
      (error) => loadFallback()
    );
    return () => unsubscribe();
  }, [user]);

  const loadFallback = () => {
    if (!dbState)
      setDbState({
        categories: INITIAL_CATEGORIES,
        products: INITIAL_PRODUCTS,
        shippingConfig: INITIAL_SHIPPING_CONFIG,
        schedule: INITIAL_SCHEDULE,
        paymentMethods: INITIAL_PAYMENT_METHODS,
        orders: [],
        adminAuth: INITIAL_ADMIN_AUTH,
        manualStatus: INITIAL_MANUAL_STATUS,
        savedTickets: [],
        printerConfig: { paperSize: "58mm", type: "system" },
        _isCloudSecured: false,
      });
  };

  function updateDbState(updater) {
    setDbState((prev) => {
      const newState = typeof updater === "function" ? updater(prev) : updater;
      if (firestoreDb && user && prev._isCloudSecured) {
        const dataToSave = { ...newState };
        delete dataToSave._isCloudSecured;
        const docRef = doc(
          firestoreDb,
          "artifacts",
          appId,
          "public",
          "data",
          "store_data",
          "main"
        );
        setDoc(docRef, dataToSave).catch(console.error);
      }
      return newState;
    });
  }

  if (!dbState)
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#cc292b] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-gray-600 animate-pulse">
          Cargando sistema...
        </p>
      </div>
    );

  return (
    <div className="min-h-[100dvh] bg-gray-100 font-sans text-gray-800">
      <div className="w-full bg-white relative overflow-hidden flex flex-col h-[100dvh]">
        {appMode === "client" ? (
          <ClientApp
            db={dbState}
            setDb={updateDbState}
            switchMode={() => setAppMode("admin")}
          />
        ) : (
          <AdminApp
            db={dbState}
            setDb={updateDbState}
            switchMode={() => setAppMode("client")}
            userRole={userRole} // <-- PASAMOS EL ROL A LA VISTA ADMIN
            setUserRole={setUserRole} // <-- PASAMOS LA FUNCIÓN PARA DESBLOQUEAR
          />
        )}
      </div>
    </div>
  );
}

// ==========================================
// TICKET PRINTER (COMPARTIDO)
// ==========================================
function PrintTicket({ order, isComanda, onClose, db }) {
  const items = order.items || [];
  const customer = order.customer || order.customerInfo || {};
  const subtotal = items.reduce(
    (acc, i) => acc + (i.product?.price || 0) * (i.quantity || 1),
    0
  );
  const paperWidth = db?.printerConfig?.paperSize || "58mm";

  return (
    <div className="fixed inset-0 bg-white z-[99999] overflow-y-auto print:overflow-visible flex flex-col">
      <style>{`@media print { @page { margin: 0; size: ${paperWidth} auto; } body { margin: 0; padding: 0; background: white; } * { font-weight: 900 !important; color: #000 !important; } .ocultar-en-ticket { display: none !important; } }`}</style>
      <div className="ocultar-en-ticket flex gap-2 p-4 bg-gray-100 border-b sticky top-0 shadow-sm shrink-0">
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <ChevronLeft size={20} /> Volver
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 bg-[#25D366] text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          🖨️ MANDAR A TICKETERA
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div
          style={{
            width: "100%",
            maxWidth: paperWidth,
            margin: "0 auto",
            fontFamily: "Calibri, Arial, sans-serif",
            fontSize: "14px",
            color: "#000",
            lineHeight: "1.2",
          }}
        >
          {isComanda && (
            <div
              style={{
                textAlign: "center",
                border: "3px solid #000",
                padding: "4px",
                marginBottom: "8px",
                fontWeight: "900",
                fontSize: "16px",
              }}
            >
              *** PENDIENTE DE PAGO ***
              <br />
              (COMANDA)
            </div>
          )}
          <div
            style={{
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            AL BUEN RAVIOL MAIPÚ
          </div>
          <div style={{ borderTop: "2px dashed #000", margin: "8px 0" }}></div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "900",
                margin: "4px 0",
                padding: "4px 0",
                borderTop: "2px solid #000",
                borderBottom: "2px solid #000",
              }}
            >
              #{order.id}
            </div>
            <div>
              Fecha:{" "}
              {order.date
                ? new Date(order.date).toLocaleString("es-AR")
                : new Date().toLocaleString("es-AR")}
            </div>
            <div style={{ marginTop: "3px" }}>
              Cliente: {customer.name || "Mostrador"}
            </div>
            {customer.phone && customer.phone !== "-" && (
              <div>Tel: {customer.phone}</div>
            )}
            <div
              style={{ fontSize: "16px", marginTop: "5px", fontWeight: "bold" }}
            >
              Tipo: {(order.type || "Local").toUpperCase()}
            </div>
            {order.type === "delivery" && customer.address && (
              <div style={{ marginTop: "3px" }}>Dir: {customer.address}</div>
            )}
          </div>
          <div style={{ borderTop: "2px dashed #000", margin: "8px 0" }}></div>
          {items.map((i, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              <span style={{ flex: 1, paddingRight: "5px" }}>
                {Number(i.quantity)
                  .toFixed(3)
                  .replace(/\.000$/, "")}{" "}
                {i.product?.unitType === "peso" ? "kg" : "u"} x{" "}
                {i.product?.name || i.name}
              </span>
              <span>
                {formatCurrency((i.product?.price || 0) * i.quantity)}
              </span>
            </div>
          ))}
          <div style={{ borderTop: "2px dashed #000", margin: "8px 0" }}></div>
          <div style={{ fontSize: "14px", marginBottom: "6px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2px",
              }}
            >
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "2px",
                }}
              >
                <span>Descuento:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            {order.type === "delivery" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "2px",
                }}
              >
                <span>Envío:</span>
                <span>{formatCurrency(order.shippingCost || 0)}</span>
              </div>
            )}
          </div>
          <div style={{ borderTop: "2px dashed #000", margin: "8px 0" }}></div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "18px",
              marginTop: "6px",
              fontWeight: "bold",
            }}
          >
            <span>TOTAL:</span>
            <span>{formatCurrency(order.total || 0)}</span>
          </div>

          {order.paymentDetails && (
            <div
              style={{
                fontSize: "14px",
                marginTop: "4px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              Medio de Pago: {order.paymentDetails}
            </div>
          )}

          {customer.notes && (
            <>
              <div
                style={{ borderTop: "2px dashed #000", margin: "8px 0" }}
              ></div>
              <div
                style={{
                  fontSize: "14px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                NOTA: {customer.notes}
              </div>
            </>
          )}

          {isComanda && (
            <div
              style={{
                textAlign: "center",
                border: "3px solid #000",
                padding: "4px",
                marginTop: "8px",
                fontWeight: "900",
                fontSize: "16px",
              }}
            >
              *** PENDIENTE DE PAGO ***
              <br />
              (COMANDA)
            </div>
          )}
          {!isComanda && (
            <div
              style={{
                textAlign: "center",
                marginTop: "15px",
                fontSize: "12px",
              }}
            >
              ¡Gracias por su compra!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MÓDULO ARQUEO Y TESORERÍA
// ==========================================
function AdminArqueoCaja({ db, setDb }) {
  // PARCHE: Detectamos si es la versión vieja (si no tiene "estado"). Si es vieja, la reseteamos.
  const tesoreria =
    db.tesoreria && db.tesoreria.estado
      ? db.tesoreria
      : {
          estado: "cerrada",
          fondoInicial: 0,
          fechaApertura: null,
          movimientos: [],
          historialCierres: [],
        };

  const [montoApertura, setMontoApertura] = useState("");
  const [efectivoReal, setEfectivoReal] = useState("");
  const [modoCierre, setModoCierre] = useState(false);
  const [showTesoreria, setShowTesoreria] = useState(false);
  const [formTesoreria, setFormTesoreria] = useState({
    tipo: "egreso",
    monto: "",
    motivo: "",
  });
  const [verHistorial, setVerHistorial] = useState(false);

  // 1. CÁLCULOS DEL TURNO ACTUAL
  let pedidosTurno = [];
  let cobrosPorMetodo = {};
  let totalEfectivoVentas = 0;

  if (tesoreria.estado === "abierta" && tesoreria.fechaApertura) {
    pedidosTurno = (db.orders || []).filter((o) => {
      const fechaValida = new Date(o.date) >= new Date(tesoreria.fechaApertura);

      // La plata entra al cajón físico si se cumple alguna de estas dos:
      const cobroLocal = o.type === "local" && o.status === "Entregado";
      const cobroDelivery = o.type === "delivery" && o.status === "Rendido";

      return fechaValida && (cobroLocal || cobroDelivery);
    });

    pedidosTurno.forEach((o) => {
      const pm = (db.paymentMethods || []).find(
        (p) => o.paymentDetails && o.paymentDetails.includes(p.name)
      );
      const nombreMetodo = pm ? pm.name : o.paymentDetails || "Otro";
      const esEfectivo = pm
        ? pm.type === "cash"
        : nombreMetodo.toLowerCase().includes("efectivo");

      cobrosPorMetodo[nombreMetodo] =
        (cobrosPorMetodo[nombreMetodo] || 0) + o.total;
      if (esEfectivo) totalEfectivoVentas += o.total;
    });
  }

  const totalIngresosTesoreria = (tesoreria.movimientos || [])
    .filter((m) => m.tipo === "ingreso")
    .reduce((acc, curr) => acc + curr.monto, 0);
  const totalEgresosTesoreria = (tesoreria.movimientos || [])
    .filter((m) => m.tipo === "egreso")
    .reduce((acc, curr) => acc + curr.monto, 0);

  const efectivoTeorico =
    tesoreria.fondoInicial +
    totalEfectivoVentas +
    totalIngresosTesoreria -
    totalEgresosTesoreria;
  const diferenciaCaja = Number(efectivoReal) - efectivoTeorico;

  // 2. FUNCIONES DE ACCIÓN
  const handleAbrirCaja = (e) => {
    e.preventDefault();
    if (!montoApertura) return;
    setDb((prev) => ({
      ...prev,
      tesoreria: {
        ...tesoreria,
        estado: "abierta",
        fondoInicial: Number(montoApertura),
        fechaApertura: new Date().toISOString(),
        movimientos: [],
      },
    }));
    setMontoApertura("");
  };

  const handleCerrarCaja = () => {
    const nuevoCierre = {
      id: Date.now(),
      fechaApertura: tesoreria.fechaApertura,
      fechaCierre: new Date().toISOString(),
      fondoInicial: tesoreria.fondoInicial,
      ventasEfectivo: totalEfectivoVentas,
      ingresosExtra: totalIngresosTesoreria,
      egresosExtra: totalEgresosTesoreria,
      efectivoTeorico: efectivoTeorico,
      efectivoReal: Number(efectivoReal),
      diferencia: diferenciaCaja,
      cobrosPorMetodo: { ...cobrosPorMetodo },
    };

    setDb((prev) => ({
      ...prev,
      tesoreria: {
        ...tesoreria,
        estado: "cerrada",
        fondoInicial: 0,
        fechaApertura: null,
        movimientos: [],
        historialCierres: [nuevoCierre, ...(tesoreria.historialCierres || [])],
      },
    }));
    setModoCierre(false);
    setEfectivoReal("");
  };

  const handleGuardarTesoreria = (e) => {
    e.preventDefault();
    if (!formTesoreria.monto || !formTesoreria.motivo) return;
    const nuevoMov = {
      id: Date.now(),
      tipo: formTesoreria.tipo,
      monto: Number(formTesoreria.monto),
      motivo: formTesoreria.motivo,
      hora: new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setDb((prev) => ({
      ...prev,
      tesoreria: {
        ...tesoreria,
        movimientos: [...(tesoreria.movimientos || []), nuevoMov],
      },
    }));
    setFormTesoreria({ tipo: "egreso", monto: "", motivo: "" });
    setShowTesoreria(false);
  };

  const formatearDinero = (monto) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(monto || 0);

  // VISTA A: CAJA CERRADA
  if (tesoreria.estado === "cerrada") {
    if (verHistorial) {
      return (
        <div className="h-full overflow-y-auto p-4 space-y-4 bg-gray-50 pb-24 animate-fadeIn">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Historial de Cierres
            </h2>
            <button
              onClick={() => setVerHistorial(false)}
              className="text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-lg"
            >
              Volver
            </button>
          </div>
          {!tesoreria.historialCierres ||
          tesoreria.historialCierres.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No hay cierres registrados aún.
            </p>
          ) : (
            tesoreria.historialCierres.map((cierre) => (
              <div
                key={cierre.id}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2"
              >
                <div className="flex justify-between border-b pb-2">
                  <span className="text-xs text-gray-500 font-bold">
                    {new Date(cierre.fechaCierre).toLocaleString("es-AR")}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      cierre.diferencia === 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    Dif: {formatearDinero(cierre.diferencia)}
                  </span>
                </div>
                <div className="grid grid-cols-2 text-sm gap-2">
                  <div>
                    <span className="text-gray-500">Apertura:</span>{" "}
                    <span className="font-bold">
                      {formatearDinero(cierre.fondoInicial)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Efvo. Ventas:</span>{" "}
                    <span className="font-bold">
                      {formatearDinero(cierre.ventasEfectivo)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Efvo. Teórico:</span>{" "}
                    <span className="font-bold">
                      {formatearDinero(cierre.efectivoTeorico)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Efvo. Real:</span>{" "}
                    <span className="font-bold">
                      {formatearDinero(cierre.efectivoReal)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50 animate-fadeIn">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-full max-w-sm text-center space-y-6">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-800">Caja Cerrada</h2>
          <p className="text-sm text-gray-500">
            Ingresá el fondo inicial para abrir el turno.
          </p>

          <form onSubmit={handleAbrirCaja} className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 font-bold">
                $
              </span>
              <input
                type="number"
                required
                placeholder="Monto de apertura"
                value={montoApertura}
                onChange={(e) => setMontoApertura(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 pl-8 pr-4 font-bold text-lg text-center outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-xl shadow-md transition-all"
            >
              ABRIR CAJA
            </button>
          </form>
          <button
            onClick={() => setVerHistorial(true)}
            className="w-full text-blue-600 font-bold text-sm pt-4 border-t border-gray-100"
          >
            Ver historial de cierres
          </button>
        </div>
      </div>
    );
  }

  // VISTA B: CAJA ABIERTA
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 bg-gray-50 pb-24 animate-fadeIn">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Caja Abierta</h2>
          <p className="text-xs text-gray-500">
            Desde:{" "}
            {new Date(tesoreria.fechaApertura).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            hs
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400">
            EFECTIVO TEÓRICO
          </p>
          <p className="text-2xl font-black text-green-600">
            {formatearDinero(efectivoTeorico)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
            <Calculator size={16} /> Cobros del Turno
          </h3>
          <div className="space-y-2">
            {Object.keys(cobrosPorMetodo).length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                No hay ventas registradas en este turno.
              </p>
            ) : (
              Object.entries(cobrosPorMetodo).map(([metodo, total]) => (
                <div key={metodo} className="flex justify-between text-sm">
                  <span className="capitalize">{metodo}:</span>
                  <span className="font-bold">{formatearDinero(total)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowTesoreria(!showTesoreria)}
            className="w-full bg-white border-2 border-blue-500 text-blue-600 p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowRightLeft size={18} /> Ingreso / Egreso Extra
          </button>
          <button
            onClick={() => setModoCierre(true)}
            className="w-full bg-gray-900 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <CheckCircle size={18} /> Realizar Cierre de Caja
          </button>
        </div>
      </div>

      {showTesoreria && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 animate-fadeIn">
          <form onSubmit={handleGuardarTesoreria} className="space-y-3">
            <div className="flex gap-2">
              <select
                value={formTesoreria.tipo}
                onChange={(e) =>
                  setFormTesoreria({ ...formTesoreria, tipo: e.target.value })
                }
                className="border rounded-lg p-2 text-sm font-bold"
              >
                <option value="egreso">Egreso (Salida)</option>
                <option value="ingreso">Ingreso (Entrada)</option>
              </select>
              <input
                type="number"
                required
                placeholder="Monto $"
                value={formTesoreria.monto}
                onChange={(e) =>
                  setFormTesoreria({ ...formTesoreria, monto: e.target.value })
                }
                className="flex-1 border rounded-lg p-2 text-sm font-bold"
              />
            </div>
            <input
              type="text"
              required
              placeholder="Motivo del movimiento..."
              value={formTesoreria.motivo}
              onChange={(e) =>
                setFormTesoreria({ ...formTesoreria, motivo: e.target.value })
              }
              className="w-full border rounded-lg p-2 text-sm"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold"
            >
              Registrar Movimiento
            </button>
          </form>
        </div>
      )}

      {modoCierre && (
        <div className="bg-[#c82a2a] p-5 rounded-xl text-white animate-fadeIn shadow-2xl">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <AlertTriangle /> Cierre de Caja Final
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/20 pb-2">
              <span>Efectivo esperado:</span>
              <span className="text-xl font-black">
                {formatearDinero(efectivoTeorico)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
              <span className="font-bold">Efectivo REAL en mano:</span>
              <input
                autoFocus
                type="number"
                value={efectivoReal}
                onChange={(e) => setEfectivoReal(e.target.value)}
                className="w-32 bg-white text-gray-900 rounded p-2 font-black text-right outline-none text-lg"
                placeholder="$ 0"
              />
            </div>

            {efectivoReal !== "" && (
              <div
                className={`p-3 rounded-lg flex justify-between font-black ${
                  diferenciaCaja === 0 ? "bg-green-500" : "bg-orange-500"
                }`}
              >
                <span>
                  {diferenciaCaja === 0
                    ? "Caja Cuadrada Perfecta"
                    : "Diferencia:"}
                </span>
                <span>{formatearDinero(diferenciaCaja)}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModoCierre(false)}
                className="flex-1 bg-red-950 py-3 rounded-lg font-bold text-sm"
              >
                Cancelar
              </button>
              <button
                disabled={efectivoReal === ""}
                onClick={handleCerrarCaja}
                className="flex-1 bg-white text-red-700 py-3 rounded-lg font-black text-sm disabled:opacity-50"
              >
                CONFIRMAR CIERRE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ==========================================
// MÓDULO PUNTO DE VENTA (CAJA COMPLETA)
// ==========================================
// ACORDATE DE AGREGAR adminRole ACÁ ARRIBA:
function AdminCajaTabs({ db, setDb, adminRole }) {
  const [activeTab, setActiveTab] = useState("ventas");
  const [cart, setCart] = useState([]);
  const [ticketName, setTicketName] = useState("");

  // ACÁ ESTÁ LA CLAVE QUE FALTABA: Creamos la "memoria" del pedido pendiente
  const [pendingOrderId, setPendingOrderId] = useState(null);

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Botonera superior con las pestañas */}
      <div className="flex bg-white shadow-sm shrink-0 border-b border-gray-200 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("ventas")}
          className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold flex justify-center items-center gap-1 sm:gap-2 transition-colors ${
            activeTab === "ventas"
              ? "text-[#c82a2a] border-b-2 border-[#c82a2a]"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Calculator size={16} /> VENTAS
        </button>
        <button
          onClick={() => setActiveTab("arqueo")}
          className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold flex justify-center items-center gap-1 sm:gap-2 transition-colors ${
            activeTab === "arqueo"
              ? "text-[#c82a2a] border-b-2 border-[#c82a2a]"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Wallet size={16} /> ARQUEO
        </button>
        <button
          onClick={() => setActiveTab("recibos")}
          className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold flex justify-center items-center gap-1 sm:gap-2 transition-colors ${
            activeTab === "recibos"
              ? "text-[#c82a2a] border-b-2 border-[#c82a2a]"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <FileText size={16} /> RECIBOS
        </button>
        <button
          onClick={() => setActiveTab("articulos")}
          className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold flex justify-center items-center gap-1 sm:gap-2 transition-colors ${
            activeTab === "articulos"
              ? "text-[#c82a2a] border-b-2 border-[#c82a2a]"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Boxes size={16} /> CATÁLOGO
        </button>
      </div>

      {/* Vistas */}
      <div className="flex-1 overflow-y-auto relative pb-10">
        {activeTab === "ventas" && (
          <AdminCajaVentas
            db={db}
            setDb={setDb}
            cart={cart}
            setCart={setCart}
            ticketName={ticketName}
            setTicketName={setTicketName}
            pendingOrderId={pendingOrderId} // LE PASAMOS LA MEMORIA A VENTAS
            setPendingOrderId={setPendingOrderId} // LE PASAMOS LA FUNCIÓN
          />
        )}
        {activeTab === "arqueo" && <AdminArqueoCaja db={db} setDb={setDb} />}
        {activeTab === "recibos" && (
          <AdminCajaRecibos
            db={db}
            setDb={setDb}
            setActiveTab={setActiveTab}
            setCart={setCart}
            setTicketName={setTicketName}
            adminRole={adminRole}
            setPendingOrderId={setPendingOrderId} // ¡ACÁ LE PASAMOS LA FUNCIÓN A RECIBOS PARA QUE NO EXPLOTE!
          />
        )}
        {activeTab === "articulos" && (
          <AdminCatalogo db={db} setDb={setDb} isTPV={true} />
        )}
      </div>
    </div>
  );
}
function AdminCajaVentas({
  db,
  setDb,
  cart,
  setCart,
  ticketName,
  setTicketName,
  pendingOrderId, // <-- RECIBE EL ID DEL PEDIDO PENDIENTE
  setPendingOrderId, // <-- PARA LIMPIARLO AL TERMINAR
}) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [weightPromptProduct, setWeightPromptProduct] = useState(null);
  const [customWeight, setCustomWeight] = useState("");
  const [ticketToPrint, setTicketToPrint] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [discount, setDiscount] = useState({ type: "$", value: "" });
  const [completedOrder, setCompletedOrder] = useState(null);

  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [isMultiPayment, setIsMultiPayment] = useState(false);
  const [multiPaymentAmounts, setMultiPaymentAmounts] = useState({});

  const [alertMsg, setAlertMsg] = useState("");
  const [confirmObj, setConfirmObj] = useState(null);

  const tesoreria = db.tesoreria || { estado: "cerrada" };

  if (tesoreria.estado !== "abierta") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-5 bg-gray-50 animate-fadeIn">
        <div className="bg-orange-100 p-6 rounded-full text-orange-600 shadow-sm border-4 border-white">
          <AlertTriangle size={56} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800">
            Ventas Bloqueadas
          </h2>
          <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm leading-relaxed">
            Por seguridad, el TPV está deshabilitado. Primero debés realizar la{" "}
            <b>Apertura de Caja</b> en la pestaña de Arqueo.
          </p>
        </div>
      </div>
    );
  }

  const paymentOptions =
    db.paymentMethods?.filter(
      (p) => p.active !== false && p.showInPOS !== false
    ) || [];

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      if (product.trackStock && currentQty + qty > product.stock) {
        setAlertMsg(
          `¡Ups! Solo nos quedan ${product.stock} en stock de ${product.name}.`
        );
        return prev;
      }
      if (existing)
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      return [...prev, { product, quantity: qty }];
    });
    setWeightPromptProduct(null);
    setCustomWeight("");
    setSearchQuery("");
  };

  const handleProductClick = (product) => {
    if (product.unitType === "peso") {
      setWeightPromptProduct(product);
      setCustomWeight("");
    } else addToCart(product, 1);
  };

  const removeFromCart = (productId) =>
    setCart((prev) => prev.filter((item) => item.product.id !== productId));

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discountVal = Number(discount.value) || 0;
  const discountAmount =
    discount.type === "%" ? cartSubtotal * (discountVal / 100) : discountVal;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  const totalPagado = Object.values(multiPaymentAmounts).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );
  const saldoRestante = cartTotal - totalPagado;

  const handleGenerarVentaMultiple = () => {
    if (Math.abs(saldoRestante) > 0.05) {
      setAlertMsg(
        "El monto total pagado debe coincidir con el total a cobrar."
      );
      return;
    }

    const detailsArray = [];
    paymentOptions.forEach((pm) => {
      const amt = parseFloat(multiPaymentAmounts[pm.id]) || 0;
      if (amt > 0) {
        detailsArray.push(`${pm.name}: $${amt}`);
      }
    });

    const paymentDetails = "Dividido (" + detailsArray.join(" + ") + ")";
    handleGenerarVenta("Entregado", paymentDetails);

    setIsMultiPayment(false);
    setMultiPaymentAmounts({});
  };

  const getNextOrderId = () =>
    db.orders.length > 0 && !isNaN(parseInt(db.orders[0].id))
      ? parseInt(db.orders[0].id) + 1
      : 1000 + db.orders.length + 1;

  const handleGuardarTicket = () => {
    if (cart.length === 0) return;
    const name =
      ticketName.trim() || `Ticket ${db.savedTickets?.length + 1 || 1}`;
    const newTicket = { id: Date.now().toString(), name, cart };
    setDb((prev) => ({
      ...prev,
      savedTickets: [...(prev.savedTickets || []), newTicket],
    }));
    setCart([]);
    setTicketName("");
    setDiscount({ type: "$", value: "" });
    setIsCartExpanded(false);
  };

  const doCargarTicket = (ticket) => {
    const updatedCart = ticket.cart.map((item) => {
      const currentProd = db.products.find((p) => p.id === item.product.id);
      return currentProd
        ? {
            ...item,
            product: {
              ...item.product,
              price: currentProd.price,
              name: currentProd.name,
            },
          }
        : item;
    });
    setCart(updatedCart);
    setTicketName(ticket.name);
    setDb((prev) => ({
      ...prev,
      savedTickets: prev.savedTickets.filter((t) => t.id !== ticket.id),
    }));
    setIsCartExpanded(true);
  };

  const handleCargarTicket = (ticket) => {
    if (cart.length > 0) {
      setConfirmObj({
        msg: "Tenés productos en el carrito actual. ¿Reemplazarlos por este ticket guardado?",
        action: () => doCargarTicket(ticket),
      });
    } else {
      doCargarTicket(ticket);
    }
  };

  const handleImprimirComanda = () => {
    if (cart.length === 0) return;
    const dummyOrder = {
      id: getNextOrderId().toString(),
      date: new Date().toISOString(),
      customer: { name: ticketName || "Mostrador" },
      type: "local",
      items: cart,
      subtotal: cartSubtotal,
      discount: discountAmount,
      shippingCost: 0,
      total: cartTotal,
    };
    setTicketToPrint({ order: dummyOrder, isComanda: true });
    setIsCartExpanded(false);
  };

  // --- ACÁ OCURRE LA MAGIA DEL COBRO ---
  const handleGenerarVenta = (estado, paymentDetails) => {
    if (cart.length === 0) return;

    setDb((prev) => {
      let updatedProducts = [...prev.products];
      let updatedOrders = [...prev.orders];
      let orderParaImprimir = null;

      // SI VIENE DE UN PEDIDO PENDIENTE DE LA PESTAÑA RECIBOS:
      if (pendingOrderId && estado === "Entregado") {
        const orderIndex = updatedOrders.findIndex(
          (o) => o.id === pendingOrderId
        );

        if (orderIndex > -1) {
          // 1. Actualizamos el pedido existente en lugar de crear uno nuevo
          updatedOrders[orderIndex] = {
            ...updatedOrders[orderIndex],
            status: estado,
            paymentDetails: paymentDetails,
            items: cart, // Por si agregaron algo a último momento en la caja
            subtotal: cartSubtotal,
            discount: discountAmount,
            total: cartTotal,
            // Opcional: Actualizar la fecha al momento exacto del cobro
            // date: new Date().toISOString()
          };

          orderParaImprimir = updatedOrders[orderIndex];

          // 2. Descontamos el stock de los productos que no se habían descontado al ponerlo "Pendiente"
          // (Si tu sistema descontaba stock al poner Pendiente, podes omitir este paso para no descontar doble).
          cart.forEach((cartItem) => {
            const pIndex = updatedProducts.findIndex(
              (p) => p.id === cartItem.product.id
            );
            if (pIndex > -1 && updatedProducts[pIndex].trackStock) {
              updatedProducts[pIndex].stock = Math.max(
                0,
                updatedProducts[pIndex].stock - cartItem.quantity
              );
            }
          });
        }
      } else {
        // SI ES UNA VENTA NUEVA DE MOSTRADOR O UN PENDIENTE NUEVO:
        const newOrder = {
          id: getNextOrderId().toString(),
          date: new Date().toISOString(),
          customer: {
            name: ticketName || "Mostrador",
            phone: "-",
            address: "-",
          },
          type: "local",
          items: cart,
          subtotal: cartSubtotal,
          discount: discountAmount,
          shippingCost: 0,
          total: cartTotal,
          status: estado,
          paymentDetails: paymentDetails,
        };

        updatedOrders = [newOrder, ...updatedOrders];
        orderParaImprimir = newOrder;

        // Descontamos stock
        cart.forEach((cartItem) => {
          const pIndex = updatedProducts.findIndex(
            (p) => p.id === cartItem.product.id
          );
          if (pIndex > -1 && updatedProducts[pIndex].trackStock) {
            updatedProducts[pIndex].stock = Math.max(
              0,
              updatedProducts[pIndex].stock - cartItem.quantity
            );
          }
        });
      }

      // Preparamos la pantalla de éxito
      setCompletedOrder({
        order: orderParaImprimir,
        isPendiente: estado === "Pendiente",
      });

      return {
        ...prev,
        orders: updatedOrders,
        products: updatedProducts,
      };
    });

    // Limpiamos la caja
    setCart([]);
    setTicketName("");
    setShowPaymentOptions(false);
    setIsMultiPayment(false);
    setMultiPaymentAmounts({});
    setIsCartExpanded(false);

    // Y LO MÁS IMPORTANTE: Soltamos el ID pendiente para no afectar la siguiente venta
    if (setPendingOrderId) setPendingOrderId(null);
  };
  // ------------------------------------

  const isVisibleInPOS = (p) => p.showInPOS !== false && p.active !== false;
  let filteredProducts = db.products.filter(isVisibleInPOS);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  } else if (activeCategory) {
    filteredProducts = filteredProducts.filter(
      (p) => p.categoryId === activeCategory
    );
  }

  if (ticketToPrint)
    return (
      <PrintTicket
        order={ticketToPrint.order}
        isComanda={ticketToPrint.isComanda}
        onClose={() => setTicketToPrint(null)}
        db={db}
      />
    );

  if (completedOrder) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center p-6 text-center animate-fadeIn z-50">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            completedOrder.isPendiente ? "bg-yellow-100" : "bg-green-100"
          }`}
        >
          {completedOrder.isPendiente ? (
            <Clock size={40} className="text-yellow-600" />
          ) : (
            <CheckCircle size={40} className="text-green-500" />
          )}
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          {completedOrder.isPendiente ? "Ticket Pendiente" : "¡Venta Cobrada!"}
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          {completedOrder.isPendiente
            ? "El pedido guardó la reserva de stock y aguarda pago."
            : "El pago fue registrado correctamente en el sistema."}
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() =>
              setTicketToPrint({
                order: completedOrder.order,
                isComanda: false,
              })
            }
            className="w-full bg-[#c82a2a] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg active:scale-95 transition-transform"
          >
            <Printer size={24} /> Imprimir Ticket
          </button>
          <button
            onClick={() => {
              setCompletedOrder(null);
              setDiscount({ type: "$", value: "" });
            }}
            className="w-full bg-gray-100 text-gray-800 font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Plus size={20} /> Nueva Venta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative animate-fadeIn bg-gray-100">
      <CustomAlert
        isOpen={!!alertMsg}
        message={alertMsg}
        onClose={() => setAlertMsg("")}
      />
      <CustomConfirm
        isOpen={!!confirmObj}
        message={confirmObj?.msg}
        onConfirm={confirmObj?.action}
        onCancel={() => setConfirmObj(null)}
      />

      {weightPromptProduct && (
        <div className="absolute inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-xs shadow-2xl flex flex-col gap-4 animate-fadeIn border-4 border-[#c82a2a]">
            <h3 className="font-bold text-lg text-gray-800 text-center leading-tight">
              Balanza: {weightPromptProduct.name}
            </h3>
            <p className="text-xs text-gray-500 text-center">
              Ingresá KILOGRAMOS (Ej: 0.350)
            </p>
            <div className="relative">
              <input
                type="number"
                autoFocus
                step="0.001"
                value={customWeight}
                onChange={(e) => setCustomWeight(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl p-4 text-center text-3xl font-black outline-none focus:border-[#c82a2a] focus:ring-4 focus:ring-red-100"
                placeholder="0.000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                KG
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setWeightPromptProduct(null)}
                className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const w = parseFloat(customWeight);
                  if (w > 0) addToCart(weightPromptProduct, w);
                  else setAlertMsg("Peso inválido");
                }}
                className="flex-1 bg-[#c82a2a] text-white font-bold py-3 rounded-xl hover:bg-red-800"
              >
                Cargar
              </button>
            </div>
          </div>
        </div>
      )}

      {db.savedTickets && db.savedTickets.length > 0 && (
        <div className="bg-orange-50 px-2 py-2 flex gap-2 overflow-x-auto border-b border-orange-200 hide-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-orange-800 flex items-center shrink-0 uppercase mr-1">
            <Save size={14} className="mr-1" /> En Espera:
          </span>
          {db.savedTickets.map((t) => (
            <button
              key={t.id}
              onClick={() => handleCargarTicket(t)}
              className="bg-white border border-orange-300 text-orange-800 text-xs font-bold px-3 py-1.5 rounded shadow-sm whitespace-nowrap active:scale-95"
            >
              {t.name} ({t.cart.length} art)
            </button>
          ))}
        </div>
      )}

      {/* Cartelito si estamos cobrando un pedido pendiente */}
      {pendingOrderId && (
        <div className="bg-orange-100 border-b border-orange-200 p-2 flex justify-between items-center px-4 shrink-0 shadow-sm z-20 relative">
          <div className="flex items-center gap-2 text-orange-800 text-xs font-bold">
            <Clock size={16} />
            Cobrando Pedido Pendiente #{pendingOrderId}
          </div>
          <button
            onClick={() => {
              if (setPendingOrderId) setPendingOrderId(null);
              setCart([]);
              setTicketName("");
            }}
            className="text-red-500 hover:text-red-700 p-1"
            title="Cancelar cobro"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="p-3 shrink-0 bg-white shadow-sm z-10 border-b border-gray-200">
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Buscar producto, cód. barras o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c82a2a] font-medium"
          />
          <Barcode
            size={18}
            className="absolute left-3 top-2.5 text-gray-400"
          />
        </div>
        {!searchQuery && (
          <div className="relative">
            <select
              value={activeCategory || ""}
              onChange={(e) =>
                setActiveCategory(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full bg-red-50 text-[#c82a2a] border border-red-200 rounded-lg px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#c82a2a] appearance-none shadow-sm cursor-pointer"
            >
              <option value="">Todas las Categorías</option>
              {db.categories.map((cat) => {
                const hasVisible = db.products.some(
                  (p) => p.categoryId === cat.id && isVisibleInPOS(p)
                );
                if (!hasVisible) return null;
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#c82a2a]">
              <ChevronLeft size={18} className="transform -rotate-90" />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 pb-24 hide-scrollbar">
        <div className="grid grid-cols-3 gap-2 content-start">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.trackStock && p.stock <= 0;
            return (
              <button
                key={p.id}
                disabled={isOutOfStock}
                onClick={() => handleProductClick(p)}
                className={`bg-white border rounded-xl p-2 flex flex-col items-center justify-between h-24 shadow-sm transition-all relative ${
                  isOutOfStock
                    ? "opacity-50 grayscale border-gray-100"
                    : "border-gray-200 hover:border-[#c82a2a] active:scale-95"
                }`}
              >
                {isOutOfStock && (
                  <span className="absolute top-1 right-1 text-[8px] bg-red-600 text-white px-1 rounded uppercase font-black">
                    S/Stock
                  </span>
                )}
                <span className="text-[11px] font-bold text-gray-700 leading-tight text-center line-clamp-2 mt-1">
                  {p.name}
                </span>
                <span className="text-sm font-black text-[#c82a2a] mt-1">
                  {formatCurrency(p.price)}{" "}
                  {p.unitType === "peso" && (
                    <span className="text-[10px] text-gray-500 font-normal">
                      /kg
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- PANEL INFERIOR DESPLEGABLE --- */}
      <div className="absolute bottom-0 left-0 right-0 bg-white shadow-[0_-15px_30px_rgba(0,0,0,0.15)] flex flex-col z-40 rounded-t-2xl transition-all duration-300">
        <button
          onClick={() => {
            if (cart.length > 0 || isCartExpanded) {
              setIsCartExpanded(!isCartExpanded);
              setShowPaymentOptions(false);
              setIsMultiPayment(false);
            }
          }}
          className={`w-full flex justify-between items-center p-4 rounded-t-2xl transition-colors ${
            isCartExpanded
              ? "bg-gray-100 border-b border-gray-200 text-gray-800"
              : "bg-[#c82a2a] text-white active:bg-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <span className="font-bold text-sm">
              {cart.length === 0
                ? "Carrito vacío"
                : `${cart.reduce(
                    (acc, item) =>
                      acc +
                      (item.product.unitType === "peso" ? 1 : item.quantity),
                    0
                  )} Artículos`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`font-black text-xl ${
                isCartExpanded ? "text-[#c82a2a]" : "text-white"
              }`}
            >
              {formatCurrency(cartSubtotal)}
            </span>
            {cart.length > 0 &&
              (isCartExpanded ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronUp size={20} />
              ))}
          </div>
        </button>

        {isCartExpanded && (
          <div className="flex flex-col bg-white max-h-[65vh]">
            {!showPaymentOptions && (
              <div className="overflow-y-auto p-3 space-y-1 bg-gray-50 border-b border-gray-200 flex-shrink max-h-48">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-800 text-white font-bold px-2 py-0.5 rounded text-xs min-w-[3rem] text-center">
                        {item.product.unitType === "peso"
                          ? Number(item.quantity).toFixed(3)
                          : item.quantity}{" "}
                        {item.product.unitType === "peso" ? "kg" : "u"}
                      </span>
                      <span className="font-bold text-gray-700 text-xs line-clamp-1">
                        {item.product.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-gray-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-400 p-1 hover:bg-red-50 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showPaymentOptions ? (
              <div className="p-3 bg-white animate-fadeIn flex-shrink-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {isMultiPayment ? "Dividir Pago:" : "Resumen de Cobro:"}
                  </span>
                  <div className="flex gap-2">
                    {isMultiPayment && (
                      <button
                        onClick={() => {
                          setIsMultiPayment(false);
                          setMultiPaymentAmounts({});
                        }}
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                      >
                        Volver
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowPaymentOptions(false);
                        setIsMultiPayment(false);
                        setMultiPaymentAmounts({});
                      }}
                      className="text-gray-400 p-1 bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {!isMultiPayment && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-2 rounded-lg mb-3">
                    <Tag size={16} className="text-blue-600" />
                    <label className="text-xs font-bold text-blue-800">
                      Descuento:
                    </label>
                    <div className="flex ml-auto bg-white border border-blue-200 rounded overflow-hidden shadow-sm">
                      <button
                        onClick={() => setDiscount({ ...discount, type: "$" })}
                        className={`px-3 py-1 text-xs font-black transition-colors ${
                          discount.type === "$"
                            ? "bg-blue-600 text-white"
                            : "text-gray-500"
                        }`}
                      >
                        $
                      </button>
                      <button
                        onClick={() => setDiscount({ ...discount, type: "%" })}
                        className={`px-3 py-1 text-xs font-black transition-colors ${
                          discount.type === "%"
                            ? "bg-blue-600 text-white"
                            : "text-gray-500"
                        }`}
                      >
                        %
                      </button>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={discount.value}
                      onChange={(e) =>
                        setDiscount({ ...discount, value: e.target.value })
                      }
                      className="w-20 bg-white border border-blue-200 rounded px-2 py-1 text-right font-black outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                )}

                <div className="flex justify-between items-end mb-3 border-b border-gray-100 pb-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold">
                      Subtotal: {formatCurrency(cartSubtotal)}
                    </span>
                    {discountAmount > 0 && (
                      <span className="text-xs font-bold text-green-600">
                        Desc: -{formatCurrency(discountAmount)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Total a Cobrar
                    </span>
                    <span className="text-3xl font-black text-[#c82a2a] leading-none">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                {!isMultiPayment ? (
                  <>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-2">
                      {paymentOptions.length === 0 ? (
                        <p className="text-xs text-red-500">
                          No hay medios de pago activos.
                        </p>
                      ) : (
                        paymentOptions.map((pm) => (
                          <button
                            key={pm.id}
                            onClick={() =>
                              handleGenerarVenta("Entregado", pm.name)
                            }
                            className="flex-1 min-w-[90px] bg-green-600 text-white font-bold py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 shadow-md active:scale-95"
                          >
                            <PaymentIcon
                              type={pm.type}
                              size={18}
                              className="text-white"
                            />
                            <span className="text-[10px] text-center leading-tight">
                              {pm.name}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                    {paymentOptions.length > 1 && (
                      <button
                        onClick={() => setIsMultiPayment(true)}
                        className="w-full bg-purple-50 text-purple-700 border border-purple-200 font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 active:scale-95 transition-transform"
                      >
                        <Calculator size={16} /> Pago Múltiple / Dividido
                      </button>
                    )}
                  </>
                ) : (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
                      {paymentOptions.map((pm) => (
                        <div
                          key={pm.id}
                          className="flex justify-between items-center bg-gray-50 border border-gray-200 p-2 rounded-lg"
                        >
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                            <PaymentIcon
                              type={pm.type}
                              size={14}
                              className="text-gray-500"
                            />
                            {pm.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-gray-500">
                              $
                            </span>
                            <input
                              type="number"
                              placeholder="0"
                              value={multiPaymentAmounts[pm.id] || ""}
                              onChange={(e) =>
                                setMultiPaymentAmounts({
                                  ...multiPaymentAmounts,
                                  [pm.id]: e.target.value,
                                })
                              }
                              className="w-24 bg-white border border-gray-300 rounded px-2 py-1 text-right font-black text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg border border-gray-200">
                      <span className="text-xs font-bold text-gray-500">
                        Saldo Restante:
                      </span>
                      <span
                        className={`text-xl font-black ${
                          saldoRestante === 0
                            ? "text-green-600"
                            : saldoRestante < 0
                            ? "text-red-500"
                            : "text-gray-800"
                        }`}
                      >
                        {formatCurrency(saldoRestante)}
                      </span>
                    </div>

                    <button
                      onClick={handleGenerarVentaMultiple}
                      disabled={Math.abs(saldoRestante) > 0.05}
                      className="w-full bg-[#c82a2a] text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:grayscale active:scale-95 transition-all"
                    >
                      <CheckCircle size={18} /> Confirmar Cobro Dividido
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-white space-y-3 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nombre (Mesa / Cliente)"
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    className="w-1/2 bg-gray-100 border border-gray-200 rounded p-2 text-sm outline-none font-bold focus:ring-2 focus:ring-orange-200"
                  />
                  <button
                    onClick={handleGuardarTicket}
                    disabled={cart.length === 0}
                    className="w-1/2 bg-orange-100 text-orange-800 font-bold text-xs rounded flex items-center justify-center gap-1 border border-orange-200 disabled:opacity-50 active:scale-95"
                  >
                    <Save size={14} /> Guardar Espera
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleImprimirComanda}
                    disabled={cart.length === 0}
                    className="flex-1 bg-blue-100 text-blue-800 font-bold text-xs py-3 rounded-lg border border-blue-200 flex flex-col items-center gap-1 disabled:opacity-50 active:scale-95"
                  >
                    <Printer size={16} /> Comanda
                  </button>
                  <button
                    onClick={() => handleGenerarVenta("Pendiente", "A Cobrar")}
                    disabled={cart.length === 0}
                    className="flex-1 bg-yellow-100 text-yellow-800 font-bold text-xs py-3 rounded-lg border border-yellow-300 flex flex-col items-center gap-1 disabled:opacity-50 active:scale-95"
                  >
                    <Clock size={16} /> Pendiente
                  </button>
                  <button
                    onClick={() => setShowPaymentOptions(true)}
                    disabled={cart.length === 0}
                    className="flex-[2] bg-[#c82a2a] text-white font-black text-sm py-3 rounded-lg flex flex-col items-center justify-center gap-1 shadow-lg disabled:opacity-50 active:scale-95"
                  >
                    <Calculator size={18} /> COBRAR
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
function AdminCajaRecibos({
  db,
  setDb,
  setActiveTab,
  setCart,
  setTicketName,
  adminRole,
  setPendingOrderId,
}) {
  const [ticketToPrint, setTicketToPrint] = useState(null);
  const [confirmObj, setConfirmObj] = useState(null);

  const deleteOrder = (orderId) => {
    setConfirmObj({
      msg: "¿Seguro que quieres eliminar este recibo permanentemente? El stock se devolverá.",
      action: () => {
        setDb((prev) => {
          const order = prev.orders.find((o) => o.id === orderId);
          if (!order) return prev;
          let updatedProducts = [...prev.products];

          if (order.status !== "Cancelado") {
            order.items.forEach((item) => {
              const prodIdx = updatedProducts.findIndex(
                (p) => p.id === item.product?.id
              );
              if (prodIdx > -1 && updatedProducts[prodIdx].trackStock)
                updatedProducts[prodIdx].stock += item.quantity;
            });
          }

          return {
            ...prev,
            orders: prev.orders.filter((o) => o.id !== orderId),
            products: updatedProducts,
          };
        });
        setConfirmObj(null);
      },
    });
  };

  if (ticketToPrint) {
    return (
      <PrintTicket
        order={ticketToPrint}
        isComanda={false}
        onClose={() => setTicketToPrint(null)}
        db={db}
      />
    );
  }

  // ¡ACÁ ESTÁ LA SOLUCIÓN! Ordenamos forzando la lectura de la fecha: el más nuevo arriba.
  const receipts = db.orders
    ? [...db.orders].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      <CustomConfirm
        isOpen={!!confirmObj}
        message={confirmObj?.msg}
        onConfirm={confirmObj?.action}
        onCancel={() => setConfirmObj(null)}
      />

      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        Últimos Recibos
      </h2>

      {receipts.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No hay ventas registradas todavía.
        </p>
      ) : (
        <div className="space-y-3">
          {receipts.map((order) => (
            <div
              key={order.id}
              className={`bg-white border rounded-xl p-3 shadow-sm ${
                order.status === "Pendiente"
                  ? "border-orange-300 bg-orange-50/30"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded">
                    #{order.id}
                  </span>
                  <p className="font-bold text-sm text-gray-800">
                    {order.customer?.name || "Venta de Mostrador"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {new Date(order.date).toLocaleString("es-AR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-blue-700">
                    {formatCurrency(order.total || 0)}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === "Cancelado"
                        ? "bg-red-100 text-red-700"
                        : order.status === "Pendiente"
                        ? "bg-orange-100 text-orange-800 border border-orange-200"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
                {order.status === "Pendiente" && (
                  <button
                    onClick={() => {
                      setCart(order.items || []);
                      setTicketName(order.customer?.name || "");
                      setPendingOrderId(order.id);
                      setActiveTab("ventas");
                    }}
                    className="flex-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold py-2 rounded-lg hover:bg-green-100 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Calculator size={14} /> Cobrar en Caja
                  </button>
                )}

                {order.status !== "Pendiente" && (
                  <button
                    onClick={() => setTicketToPrint(order)}
                    className="flex-1 bg-blue-50 text-blue-700 text-xs font-bold py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1"
                  >
                    <Printer size={14} /> Imprimir Ticket
                  </button>
                )}

                {adminRole === "propietario" && (
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                    title="Eliminar registro"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function AdminCatalogo({ db, setDb, isTPV = false }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [expandedCats, setExpandedCats] = useState({});
  const [confirmObj, setConfirmObj] = useState(null);

  const toggleCat = (catId) =>
    setExpandedCats((prev) => ({
      ...prev,
      [catId]: prev[catId] === false ? true : false,
    }));

  const startEdit = (prod) => {
    setFormData(
      prod
        ? {
            ...prod,
            cost: prod.cost || 0,
            margin: prod.margin || 0,
            stock: prod.stock || 0,
            trackStock: prod.trackStock || false,
            unitType: prod.unitType || "unidad",
            showInWeb: prod.showInWeb !== false,
            showInPOS: prod.showInPOS !== false,
            active: prod.active !== false,
            barcode: prod.barcode || "",
            sku: prod.sku || "",
            image: prod.image || "",
          }
        : {
            id: Date.now(),
            name: "",
            description: "",
            cost: 0,
            margin: 0,
            price: 0,
            categoryId: db.categories[0]?.id || 1,
            image: "",
            unitType: "unidad",
            stock: 0,
            trackStock: false,
            featured: false,
            active: true,
            showInWeb: true,
            showInPOS: true,
            barcode: "",
            sku: "",
          }
    );
    setEditingId(prod ? prod.id : "new");
  };

  const calcPrice = (cost, margin) => Math.round(cost * (1 + margin / 100));
  const calcMargin = (cost, price) =>
    cost > 0 ? Math.round((price / cost - 1) * 100) : 0;

  const saveProduct = () => {
    let newOrder = 0;
    if (editingId === "new") {
      const catProds = db.products.filter(
        (p) => p.categoryId === formData.categoryId
      );
      newOrder =
        catProds.length > 0
          ? Math.max(...catProds.map((p) => p.order || 0)) + 1
          : 1;
    }
    setDb((prev) => ({
      ...prev,
      products:
        editingId === "new"
          ? [...prev.products, { ...formData, order: newOrder }]
          : prev.products.map((p) => (p.id === formData.id ? formData : p)),
    }));
    setEditingId(null);
  };

  const deleteProduct = (id) => {
    setConfirmObj({
      msg: "¿Eliminar producto definitivamente?",
      action: () =>
        setDb((prev) => ({
          ...prev,
          products: prev.products.filter((p) => p.id !== id),
        })),
    });
  };

  const moveProduct = (productId, direction) => {
    setDb((prev) => {
      const productToMove = prev.products.find((p) => p.id === productId);
      if (!productToMove) return prev;
      let catProducts = prev.products
        .filter((p) => p.categoryId === productToMove.categoryId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((p, i) => ({ ...p, order: i }));
      const index = catProducts.findIndex((p) => p.id === productId);
      if (direction === -1 && index > 0) {
        catProducts[index].order = index - 1;
        catProducts[index - 1].order = index;
      } else if (direction === 1 && index < catProducts.length - 1) {
        catProducts[index].order = index + 1;
        catProducts[index + 1].order = index;
      } else return prev;
      const newProducts = prev.products.map((p) => {
        const updatedP = catProducts.find((cp) => cp.id === p.id);
        return updatedP ? updatedP : p;
      });
      return { ...prev, products: newProducts };
    });
  };

  const toggleProductActive = (productId) => {
    setDb((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? { ...p, active: p.active === false ? true : false }
          : p
      ),
    }));
  };

  if (editingId) {
    return (
      <div
        className={`bg-white p-4 animate-fadeIn ${
          isTPV
            ? "h-full overflow-y-auto pb-24"
            : "rounded-xl shadow-sm border border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="font-bold text-lg text-[#c82a2a]">
            {editingId === "new" ? "Nuevo Producto" : "Editar Producto"}
          </h3>
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
            <span
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shadow-inner ${
                formData.active ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
              />
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  formData.active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </span>
            <span
              className={`text-xs ${
                formData.active ? "text-green-600" : "text-red-600"
              }`}
            >
              {formData.active ? "ACTIVO" : "PAUSADO"}
            </span>
          </label>
        </div>

        <div className={`space-y-4 ${!formData.active ? "opacity-60" : ""}`}>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">
              Nombre
            </label>
            <input
              className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-[#c82a2a] mt-1 font-bold"
              placeholder="Ej: Ravioles de Verdura"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2 bg-gray-50 p-2 rounded border border-gray-200">
            <div className="w-1/2">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                <Barcode size={12} /> Cód. Barras
              </label>
              <input
                type="text"
                className="w-full border rounded p-1.5 text-xs outline-none focus:border-blue-500"
                placeholder="Ej: 779123..."
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
              />
            </div>
            <div className="w-1/2">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                <Boxes size={12} /> Nº Artículo (SKU)
              </label>
              <input
                type="text"
                className="w-full border rounded p-1.5 text-xs outline-none focus:border-blue-500"
                placeholder="Ej: RAV-VER-01"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">
                Categoría
              </label>
              <select
                className="w-full border rounded p-2 text-sm outline-none bg-gray-50 mt-1"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoryId: Number(e.target.value),
                  })
                }
              >
                {db.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">
                Venta Por
              </label>
              <select
                className="w-full border rounded p-2 text-sm outline-none bg-gray-50 mt-1"
                value={formData.unitType}
                onChange={(e) =>
                  setFormData({ ...formData, unitType: e.target.value })
                }
              >
                <option value="unidad">Unidad / Promo</option>
                <option value="peso">Peso (Kg)</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-3">
            <h4 className="font-bold text-xs text-blue-800 uppercase flex items-center gap-1">
              <Percent size={14} /> Precios y Rentabilidad
            </h4>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-500">
                  Costo ($)
                </label>
                <input
                  type="number"
                  className="w-full border rounded p-2 text-sm outline-none"
                  placeholder="0"
                  value={formData.cost}
                  onChange={(e) => {
                    const c = Number(e.target.value);
                    setFormData({
                      ...formData,
                      cost: c,
                      price: calcPrice(c, formData.margin),
                    });
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-500">
                  Margen (%)
                </label>
                <input
                  type="number"
                  className="w-full border rounded p-2 text-sm outline-none"
                  placeholder="150"
                  value={formData.margin}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setFormData({
                      ...formData,
                      margin: m,
                      price: calcPrice(formData.cost, m),
                    });
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-red-600">
                  Venta ($)
                </label>
                <input
                  type="number"
                  className="w-full border rounded p-2 text-sm outline-none font-bold text-red-600 border-red-200"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setFormData({
                      ...formData,
                      price: p,
                      margin: calcMargin(formData.cost, p),
                    });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-xs text-orange-800 uppercase flex items-center gap-1">
                <Boxes size={14} /> Stock Físico
              </h4>
              <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                <span
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none shadow-inner ${
                    formData.trackStock ? "bg-orange-500" : "bg-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.trackStock}
                    onChange={(e) =>
                      setFormData({ ...formData, trackStock: e.target.checked })
                    }
                  />
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                      formData.trackStock ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </span>
              </label>
            </div>
            {formData.trackStock ? (
              <div className="flex gap-2 items-center mt-2 bg-white p-2 rounded border border-orange-200">
                <span className="text-sm font-medium text-gray-600">
                  En Local:
                </span>
                <input
                  type="number"
                  step={formData.unitType === "peso" ? "0.001" : "1"}
                  className="border-b-2 border-orange-400 w-20 text-center text-lg font-black outline-none text-gray-800"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: Number(e.target.value) })
                  }
                />
                <span className="text-xs text-gray-500">
                  {formData.unitType === "peso" ? "Kilos" : "Unidades"}
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500">El stock es infinito.</p>
            )}
          </div>

          {!isTPV && (
            <div className="border rounded p-2 bg-white flex flex-col gap-2">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1 mb-1">
                  <ImageIcon size={12} /> Link de la Imagen
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2 text-xs outline-none focus:ring-1 focus:ring-[#c82a2a] text-gray-600"
                  placeholder="Ej: https://mis-imagenes.com/raviol.jpg"
                  value={formData.image || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">
                  Descripción Web
                </label>
                <textarea
                  className="w-full text-sm outline-none resize-none h-10 text-gray-700 border rounded p-1"
                  placeholder="Breve desc..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
            <h4 className="font-bold text-[10px] text-gray-600 uppercase flex items-center gap-1">
              Canales de Venta
            </h4>
            <div className="flex gap-4">
              <label className="flex items-center gap-1 text-xs font-bold cursor-pointer text-gray-800">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-blue-600"
                  checked={formData.showInWeb}
                  onChange={(e) =>
                    setFormData({ ...formData, showInWeb: e.target.checked })
                  }
                />{" "}
                <Smartphone size={14} className="text-blue-600" /> App Web
              </label>
              <label className="flex items-center gap-1 text-xs font-bold cursor-pointer text-gray-800">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-green-600"
                  checked={formData.showInPOS}
                  onChange={(e) =>
                    setFormData({ ...formData, showInPOS: e.target.checked })
                  }
                />{" "}
                <Calculator size={14} className="text-green-600" /> Caja TPV
              </label>
            </div>
            {!isTPV && (
              <label className="flex items-center gap-1 text-xs font-bold cursor-pointer text-orange-600 pt-2 border-t border-gray-200 mt-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-orange-600"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                />{" "}
                ⭐ Destacado en Web
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => setEditingId(null)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={saveProduct}
              className="flex-1 bg-[#c82a2a] text-white py-3 rounded-lg font-bold shadow-lg hover:bg-red-800"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`space-y-4 animate-fadeIn ${
        isTPV ? "h-full overflow-y-auto p-3 pb-24 bg-gray-100" : "pb-10"
      }`}
    >
      <CustomConfirm
        isOpen={!!confirmObj}
        message={confirmObj?.msg}
        onConfirm={confirmObj?.action}
        onCancel={() => setConfirmObj(null)}
      />

      <div className="flex justify-between items-center mb-2">
        {!isTPV && (
          <h2 className="text-xl font-bold text-gray-800">Catálogo Físico</h2>
        )}
        <button
          onClick={() => startEdit()}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex gap-2 items-center shadow-md ml-auto"
        >
          <Plus size={16} /> Crear Producto
        </button>
      </div>
      <div className="space-y-3">
        {db.categories
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((cat) => {
            const catProducts = db.products
              .filter((p) => p.categoryId === cat.id)
              .sort((a, b) => (a.order || 0) - (b.order || 0));
            const isExpanded = expandedCats[cat.id] !== false;
            return (
              <div
                key={cat.id}
                className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm"
              >
                <div
                  className="bg-white p-3 flex justify-between items-center cursor-pointer border-b border-gray-100"
                  onClick={() => toggleCat(cat.id)}
                >
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    {cat.name}{" "}
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">
                      {catProducts.length}
                    </span>
                  </h3>
                  <span className="text-gray-400">
                    {isExpanded ? (
                      <ArrowUp size={16} />
                    ) : (
                      <ArrowDown size={16} />
                    )}
                  </span>
                </div>
                {isExpanded && (
                  <div className="p-2 space-y-2 bg-gray-50">
                    {catProducts.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">
                        Categoría vacía
                      </p>
                    ) : (
                      catProducts.map((p, index) => (
                        <div
                          key={p.id}
                          className={`flex gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm ${
                            p.active === false
                              ? "opacity-50 grayscale bg-gray-100"
                              : ""
                          } ${
                            p.showInWeb === false &&
                            p.showInPOS === false &&
                            p.active !== false
                              ? "opacity-70"
                              : ""
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center mr-1">
                            <button
                              onClick={() => moveProduct(p.id, -1)}
                              disabled={index === 0}
                              className={`pb-2 ${
                                index === 0 ? "text-gray-200" : "text-gray-400"
                              }`}
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              onClick={() => moveProduct(p.id, 1)}
                              disabled={index === catProducts.length - 1}
                              className={`pt-2 ${
                                index === catProducts.length - 1
                                  ? "text-gray-200"
                                  : "text-gray-400"
                              }`}
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm leading-tight text-gray-800">
                              {p.name}{" "}
                              {p.active === false && (
                                <span className="text-[10px] text-red-600 border border-red-500 px-1 rounded ml-1">
                                  PAUSADO
                                </span>
                              )}
                            </h4>
                            <div className="flex gap-2 text-[9px] text-gray-500 mt-0.5">
                              {p.barcode && <span>CB: {p.barcode}</span>}{" "}
                              {p.sku && <span>SKU: {p.sku}</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="font-black text-[#c82a2a] text-sm">
                                {formatCurrency(p.price)}
                              </p>
                              {p.trackStock && (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    p.stock > 5
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {p.stock} {p.unitType === "peso" ? "kg" : "u"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 justify-center items-center shrink-0 border-l border-gray-100 pl-2">
                            <button
                              onClick={() => toggleProductActive(p.id)}
                              title={p.active === false ? "Activar" : "Pausar"}
                              className={`w-9 h-5 rounded-full relative transition-colors shadow-inner ${
                                p.active !== false
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                  p.active !== false ? "translate-x-4" : ""
                                }`}
                              ></span>
                            </button>
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEdit(p)}
                                className="text-gray-600 bg-gray-100 p-1.5 rounded border border-gray-200"
                              >
                                <Settings size={14} />
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="text-red-500 bg-red-50 p-1.5 rounded border border-red-100"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function AdminImpresora({ db, setDb }) {
  const [config, setConfig] = useState(
    db.printerConfig || { paperSize: "58mm", type: "system" }
  );
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setDb((prev) => ({ ...prev, printerConfig: config }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <h2 className="text-xl font-bold text-gray-800 flex gap-2">
        <Printer size={24} /> Ajustes de Impresora
      </h2>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-700 mb-2">
          Tamaño de Papel Térmico
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Ajusta los márgenes para que el ticket se adapte a tu máquina.
        </p>
        <select
          value={config.paperSize}
          onChange={(e) => setConfig({ ...config, paperSize: e.target.value })}
          className="w-full border rounded-lg p-3 text-sm bg-gray-50 outline-none font-bold text-gray-800"
        >
          <option value="58mm">
            Ticketera de 58mm (Chica / Bluetooth Celular)
          </option>
          <option value="80mm">Ticketera de 80mm (Grande de Mostrador)</option>
        </select>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100 text-blue-800 text-sm">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <Smartphone size={20} /> ¿Cómo conectar la ticketera?
        </h3>
        <p className="mb-3 text-xs leading-relaxed">
          El sistema utiliza la tecnología de impresión estándar. Sigue estos
          pasos según tu equipo:
        </p>
        <ul className="list-disc pl-5 space-y-3 text-xs">
          <li>
            <strong>Celulares y Tablets (Bluetooth):</strong>
            Vá a los ajustes Bluetooth del celular y vinculá tu ticketera
            térmica (ej: MTP-II o PT-210). Luego descargá en la Play Store la
            app <b>RawBT</b> o <b>ESC POS Print Service</b> para que el
            navegador sepa cómo enviarle la orden.
          </li>
          <li>
            <strong>Computadoras (USB):</strong>
            Asegurate de que Windows/Mac tenga los drivers de la ticketera
            instalados (se debe ver en "Dispositivos e Impresoras"). Cuando
            toques el botón "Imprimir Ticket", Chrome abrirá su ventana y ahí
            mismo la seleccionás.
          </li>
        </ul>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-[#c82a2a] shadow-lg text-white font-bold py-4 rounded-xl active:scale-95 transition-transform"
      >
        {saved ? "¡Ajustes Guardados!" : "Guardar Preferencias"}
      </button>
    </div>
  );
}

function AdminCategorias({ db, setDb }) {
  const [newCatName, setNewCatName] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [confirmObj, setConfirmObj] = useState(null);

  const handleAdd = () => {
    if (!newCatName.trim()) return;
    const newOrder =
      db.categories.length > 0
        ? Math.max(...db.categories.map((c) => c.order)) + 1
        : 1;
    setDb((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { id: Date.now(), name: newCatName.trim(), order: newOrder },
      ],
    }));
    setNewCatName("");
  };
  const handleEditName = (id, newName) =>
    setDb((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === id ? { ...c, name: newName } : c
      ),
    }));

  const handleDelete = (id) => {
    if (db.products.some((p) => p.categoryId === id))
      return setAlertMsg(
        "Hay productos en esta categoría. Mové los productos a otra categoría primero."
      );
    setConfirmObj({
      msg: "¿Seguro que querés eliminar esta categoría?",
      action: () =>
        setDb((prev) => ({
          ...prev,
          categories: prev.categories.filter((c) => c.id !== id),
        })),
    });
  };

  const moveCat = (index, direction) => {
    setDb((prev) => {
      const sorted = [...prev.categories].sort((a, b) => a.order - b.order);
      if (direction === -1 && index > 0)
        [sorted[index].order, sorted[index - 1].order] = [
          sorted[index - 1].order,
          sorted[index].order,
        ];
      else if (direction === 1 && index < sorted.length - 1)
        [sorted[index].order, sorted[index + 1].order] = [
          sorted[index + 1].order,
          sorted[index].order,
        ];
      return { ...prev, categories: sorted };
    });
  };
  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      <CustomAlert
        isOpen={!!alertMsg}
        message={alertMsg}
        onClose={() => setAlertMsg("")}
      />
      <CustomConfirm
        isOpen={!!confirmObj}
        message={confirmObj?.msg}
        onConfirm={confirmObj?.action}
        onCancel={() => setConfirmObj(null)}
      />

      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <MenuSquare size={24} /> Categorías
      </h2>
      <div className="flex gap-2 bg-white p-3 rounded-xl border border-gray-200">
        <input
          type="text"
          placeholder="Nueva..."
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={handleAdd}
          className="bg-purple-600 text-white px-4 py-2 rounded font-bold"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        {db.categories
          .sort((a, b) => a.order - b.order)
          .map((cat, index) => (
            <div
              key={cat.id}
              className="p-3 border-b flex justify-between items-center"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex flex-col">
                  <button
                    onClick={() => moveCat(index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp
                      size={16}
                      className={
                        index === 0 ? "text-gray-200" : "text-gray-500"
                      }
                    />
                  </button>
                  <button
                    onClick={() => moveCat(index, 1)}
                    disabled={index === db.categories.length - 1}
                  >
                    <ArrowDown
                      size={16}
                      className={
                        index === db.categories.length - 1
                          ? "text-gray-200"
                          : "text-gray-500"
                      }
                    />
                  </button>
                </div>
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => handleEditName(cat.id, e.target.value)}
                  className="font-bold text-gray-700 bg-transparent w-full outline-none focus:border-b border-purple-500"
                />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                  {db.products.filter((p) => p.categoryId === cat.id).length}{" "}
                  prods
                </span>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-red-400 p-1 bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function AdminHorarios({ db, setDb }) {
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const [schedule, setSchedule] = useState(db.schedule);
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setDb((prev) => ({ ...prev, schedule }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  const addShift = (dayIdx) =>
    setSchedule((prev) => ({
      ...prev,
      [dayIdx]: [...(prev[dayIdx] || []), { open: "09:00", close: "13:00" }],
    }));
  const removeShift = (dayIdx, shiftIdx) =>
    setSchedule((prev) => ({
      ...prev,
      [dayIdx]: prev[dayIdx].filter((_, i) => i !== shiftIdx),
    }));
  const updateShift = (dayIdx, shiftIdx, field, value) =>
    setSchedule((prev) => {
      const newShifts = [...prev[dayIdx]];
      newShifts[shiftIdx] = { ...newShifts[shiftIdx], [field]: value };
      return { ...prev, [dayIdx]: newShifts };
    });
  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Clock size={24} /> Horarios
      </h2>
      <div className="space-y-3 pb-4">
        {days.map((day, idx) => {
          const shifts = schedule[idx] || [];
          return (
            <div
              key={idx}
              className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col gap-2 shadow-sm"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-sm text-gray-700">{day}</span>
                <button
                  onClick={() => addShift(idx)}
                  className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold"
                >
                  <Plus size={12} /> Turno
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {shifts.length === 0 ? (
                  <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded self-start">
                    CERRADO
                  </span>
                ) : (
                  shifts.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100"
                    >
                      <input
                        type="time"
                        value={s.open}
                        onChange={(e) =>
                          updateShift(idx, i, "open", e.target.value)
                        }
                        className="border rounded p-1 text-sm bg-white"
                      />
                      <span>a</span>
                      <input
                        type="time"
                        value={s.close}
                        onChange={(e) =>
                          updateShift(idx, i, "close", e.target.value)
                        }
                        className="border rounded p-1 text-sm bg-white"
                      />
                      <button
                        onClick={() => removeShift(idx, i)}
                        className="ml-auto text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg"
      >
        {saved ? "Guardado" : "Guardar Horarios"}
      </button>
    </div>
  );
}

function AdminEnvios({ db, setDb }) {
  const [config, setConfig] = useState(db.shippingConfig);
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setDb((prev) => ({ ...prev, shippingConfig: config }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <h2 className="text-xl font-bold text-gray-800 flex gap-2">
        <Truck size={24} /> Envíos
      </h2>
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-700 flex gap-2">
          <MapPin size={18} className="text-red-500" /> Punto Cero (Local)
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          Ubicación exacta de tu negocio.
        </p>
        <AdminLocationPicker
          location={config.shopLocation}
          onChange={(newCoords) =>
            setConfig({ ...config, shopLocation: newCoords })
          }
        />
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4 shadow-sm">
        <h3 className="font-bold text-gray-700 border-b pb-2">Tarifas (Km)</h3>
        {[
          { label: "0 a 3 km", key: "tier1" },
          { label: "3 a 4 km", key: "tier2" },
          { label: "4 a 5 km", key: "tier3" },
          { label: "Extra x Km", key: "extra" },
        ].map((tier) => (
          <div
            key={tier.key}
            className="flex justify-between items-center border-b border-gray-50 pb-2"
          >
            <label className="text-sm font-bold text-gray-700">
              {tier.label}
            </label>
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded border">
              <span className="text-gray-500 font-bold ml-1">$</span>
              <input
                type="number"
                value={config[tier.key]}
                onChange={(e) =>
                  setConfig({ ...config, [tier.key]: Number(e.target.value) })
                }
                className="bg-transparent rounded p-1 w-20 text-right font-black text-gray-800 outline-none"
              />
            </div>
          </div>
        ))}{" "}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg"
        >
          {saved ? "Guardado" : "Guardar Tarifas"}
        </button>
      </div>
    </div>
  );
}

function AdminMediosPago({ db, setDb }) {
  const [methods, setMethods] = useState(
    db.paymentMethods || INITIAL_PAYMENT_METHODS
  );
  const [saved, setSaved] = useState(false);
  const [newMethodName, setNewMethodName] = useState("");
  const [newMethodType, setNewMethodType] = useState("transfer");
  const [confirmObj, setConfirmObj] = useState(null);

  const handleSave = () => {
    setDb((prev) => ({ ...prev, paymentMethods: methods }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  const updateMethod = (id, field, value) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleAdd = () => {
    if (!newMethodName.trim()) return;
    const newMethod = {
      id: "pm_" + Date.now(),
      name: newMethodName.trim(),
      active: true,
      showInDelivery: true,
      showInPickup: true,
      showInPOS: true,
      type: newMethodType,
      details: "",
    };
    setMethods((prev) => [...prev, newMethod]);
    setNewMethodName("");
  };

  const handleDelete = (id) => {
    setConfirmObj({
      msg: "¿Seguro que querés eliminar este medio de pago?",
      action: () => setMethods((prev) => prev.filter((m) => m.id !== id)),
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <CustomConfirm
        isOpen={!!confirmObj}
        message={confirmObj?.msg}
        onConfirm={confirmObj?.action}
        onCancel={() => setConfirmObj(null)}
      />

      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Wallet size={24} /> Medios de Pago
      </h2>
      <p className="text-xs text-gray-500">
        Configurá cómo te pueden pagar tus clientes en la web (retiro/delivery)
        y en la caja del local.
      </p>

      <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <label className="text-[10px] font-bold text-gray-500 uppercase">
          Agregar nuevo:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ej: Cuenta DNI..."
            value={newMethodName}
            onChange={(e) => setNewMethodName(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-green-500 font-medium"
          />
          <select
            value={newMethodType}
            onChange={(e) => setNewMethodType(e.target.value)}
            className="border border-gray-300 rounded px-2 py-2 text-sm outline-none font-medium text-gray-700 bg-gray-50"
          >
            <option value="cash">💵 Billetes</option>
            <option value="bank">🏛️ Banco (CBU/Alias)</option>
            <option value="transfer">↔️ Transferencia App</option>
            <option value="card">💳 Tarjeta Física</option>
            <option value="qr">🔲 Código QR</option>
            <option value="store">🏪 Pago en Local</option>
            <option value="pos">📶 Terminal Posnet</option>
          </select>
          <button
            onClick={handleAdd}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {methods.map((pm) => (
          <div
            key={pm.id}
            className={`bg-white p-4 rounded-xl border transition-all ${
              pm.active
                ? "border-green-300 shadow-sm"
                : "border-gray-200 opacity-60"
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 flex-1 mr-2">
                <PaymentIcon
                  type={pm.type}
                  size={20}
                  className={pm.active ? "text-[#c82a2a]" : "text-gray-400"}
                />
                <input
                  type="text"
                  value={pm.name}
                  onChange={(e) => updateMethod(pm.id, "name", e.target.value)}
                  className="font-bold text-gray-800 text-sm bg-transparent outline-none border-b border-dashed border-transparent hover:border-gray-300 focus:border-green-500 w-full pb-0.5"
                />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleDelete(pm.id)}
                  className="text-red-400 hover:bg-red-50 p-1.5 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                  <span
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shadow-inner ${
                      pm.active ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={pm.active}
                      onChange={(e) =>
                        updateMethod(pm.id, "active", e.target.checked)
                      }
                    />
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        pm.active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </span>
                </label>
              </div>
            </div>

            {pm.active && (
              <div className="space-y-3 animate-fadeIn">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 border-b border-gray-200 pb-1">
                    Habilitar en Canales:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-800">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-blue-600"
                        checked={pm.showInDelivery !== false}
                        onChange={(e) =>
                          updateMethod(
                            pm.id,
                            "showInDelivery",
                            e.target.checked
                          )
                        }
                      />{" "}
                      🛵 Delivery
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-orange-600"
                        checked={pm.showInPickup !== false}
                        onChange={(e) =>
                          updateMethod(pm.id, "showInPickup", e.target.checked)
                        }
                      />{" "}
                      🏪 Retiro Local
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer col-span-2 mt-1">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-green-600"
                        checked={pm.showInPOS !== false}
                        onChange={(e) =>
                          updateMethod(pm.id, "showInPOS", e.target.checked)
                        }
                      />{" "}
                      🖥️ Caja (Venta Presencial)
                    </label>
                  </div>
                </div>

                {(pm.type === "transfer" || pm.type === "local") && (
                  <div className="pt-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Mensaje Extra (Alias, CBU, Links):
                    </label>
                    <textarea
                      value={pm.details || ""}
                      onChange={(e) =>
                        updateMethod(pm.id, "details", e.target.value)
                      }
                      placeholder="Ej: Alias: ABRMAIPU..."
                      className="w-full bg-white border border-gray-200 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-green-500 resize-none h-16 font-medium text-gray-700"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        {saved ? (
          <>
            <CheckCircle size={20} /> Guardado Exitosamente
          </>
        ) : (
          "Guardar Configuraciones"
        )}
      </button>
    </div>
  );
}

function AdminLocationPicker({ location, onChange }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  useEffect(() => {
    loadGoogleMaps(() => setMapLoaded(true));
  }, []);
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    if (mapInstance.current) return;
    const google = window.google;
    const map = new google.maps.Map(mapRef.current, {
      center: location,
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
    });
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      draggable: true,
    });
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      onChange({ lat: pos.lat(), lng: pos.lng() });
    });
    mapInstance.current = map;
    markerInstance.current = marker;
    setTimeout(() => {
      if (mapInstance.current && window.google)
        window.google.maps.event.trigger(mapInstance.current, "resize");
    }, 200);
  }, [mapLoaded, location]);
  return (
    <div
      ref={mapRef}
      className="w-full h-48 rounded-lg border border-gray-300 bg-gray-100 relative z-0"
    >
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
          Cargando Maps...
        </div>
      )}
    </div>
  );
}

function AdminApp({ db, setDb, switchMode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminRole, setAdminRole] = useState("empleado"); // <-- NUEVO ESTADO (propietario o empleado)
  const [adminRoute, setAdminRoute] = useState("dashboard");
  const [newOrderPopup, setNewOrderPopup] = useState(false);
  const cantidadPedidosRef = useRef(db?.orders?.length || 0);
  const cargaInicialRef = useRef(true);
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    if (isAuthenticated && db && db.orders) {
      const actuales = db.orders.length;
      if (cargaInicialRef.current) {
        cargaInicialRef.current = false;
        cantidadPedidosRef.current = actuales;
        return;
      }
      if (actuales > cantidadPedidosRef.current) {
        const ultimoPedido = db.orders[0];
        if (ultimoPedido && ultimoPedido.type !== "local") {
          try {
            if (
              "Notification" in window &&
              window.Notification &&
              Notification.permission === "granted"
            )
              new Notification("🥟 ¡Nuevo pedido!", {
                body: "Revisá la pestaña de pedidos.",
              });
          } catch (err) {}
          let parlante = document.getElementById("parlante-invencible");
          if (!parlante) {
            parlante = document.createElement("audio");
            parlante.id = "parlante-invencible";
            parlante.src =
              "https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/bell_ring.mp3";
            document.body.appendChild(parlante);
          }
          parlante.currentTime = 0;
          parlante.play().catch((e) => console.log("Sonido bloqueado"));
          setNewOrderPopup(true);
        }
      }
      cantidadPedidosRef.current = actuales;
    }
  }, [db?.orders, isAuthenticated]);

  if (!isAuthenticated)
    return (
      <AdminLogin
        db={db}
        setDb={setDb}
        onLogin={(role) => {
          setIsAuthenticated(true);
          setAdminRole(role); // <-- GUARDAMOS EL ROL
        }}
        switchMode={switchMode}
      />
    );

  const renderView = () => {
    switch (adminRoute) {
      case "dashboard":
        return (
          <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
        );
      case "caja":
        return <AdminCajaTabs db={db} setDb={setDb} />;
      case "pedidos":
        return <AdminPedidos db={db} setDb={setDb} />;
      // RUTAS PROTEGIDAS:
      case "catalogo":
        return adminRole === "propietario" ? (
          <AdminCatalogo db={db} setDb={setDb} />
        ) : (
          <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
        );
      case "ajustes":
        return adminRole === "propietario" ? (
          <AdminAjustesMenu setRoute={setAdminRoute} />
        ) : (
          <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
        );
      case "metricas":
        return adminRole === "propietario" ? (
          <AdminMetricas db={db} />
        ) : (
          <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
        );
      case "categorias":
        return adminRole === "propietario" ? (
          <AdminCategorias db={db} setDb={setDb} />
        ) : (
          <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
        );
      case "horarios":
        return adminRole === "propietario" ? (
          <AdminHorarios db={db} setDb={setDb} />
        ) : (
          <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
        );
      case "envios":
        return adminRole === "propietario" ? (
          <AdminEnvios db={db} setDb={setDb} />
        ) : (
          <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
        );
      case "mediospago":
        return adminRole === "propietario" ? (
          <AdminMediosPago db={db} setDb={setDb} />
        ) : (
          <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
        );
      case "seguridad":
        return adminRole === "propietario" ? (
          <AdminSeguridad db={db} setDb={setDb} />
        ) : (
          <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
        );
      case "impresora":
        return adminRole === "propietario" ? (
          <AdminImpresora db={db} setDb={setDb} />
        ) : (
          <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
        );
      default:
        return (
          <AdminDashboard db={db} setDb={setDb} setRoute={setAdminRoute} />
        );
    }
  };

  const isSubView = [
    "categorias",
    "horarios",
    "envios",
    "mediospago",
    "seguridad",
    "impresora",
    "metricas",
  ].includes(adminRoute);

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <CustomAlert
        isOpen={!!alertMsg}
        message={alertMsg}
        onClose={() => setAlertMsg("")}
      />

      <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-2">
          {adminRoute !== "dashboard" && (
            <button
              onClick={() => setAdminRoute(isSubView ? "ajustes" : "dashboard")}
              className="text-gray-400 hover:text-white p-1 transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="font-bold tracking-wide text-sm flex items-center gap-2">
              <Settings size={16} className="text-[#fbb03b]" /> ADMIN
            </h1>
            {/* ETIQUETA VISUAL DEL ROL */}
            <span
              className={`text-[10px] px-2 py-0.5 mt-1 rounded-full font-bold w-fit ${
                adminRole === "propietario"
                  ? "bg-[#c82a2a] text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              MODO {adminRole.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              /* ... (código del parlante igual) ... */ setAlertMsg(
                "¡Sonido de prueba!"
              );
            }}
            className="bg-[#c82a2a] px-2 py-1 rounded-lg text-xs font-bold shadow-sm hover:bg-red-700 transition-colors"
          >
            🔔 Sonido
          </button>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setAdminRole("empleado");
              setAdminRoute("dashboard");
              switchMode();
            }}
            className="text-gray-400 hover:text-white flex items-center gap-1 text-xs"
          >
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {renderView()}
      </div>

      <div className="bg-white border-t border-gray-200 flex justify-around px-1 py-2 pb-6 shrink-0 text-xs shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <NavBtn
          Icon={LayoutDashboard}
          label="Panel"
          active={adminRoute === "dashboard"}
          onClick={() => setAdminRoute("dashboard")}
        />
        <NavBtn
          Icon={Calculator}
          label="Caja"
          active={adminRoute === "caja"}
          onClick={() => setAdminRoute("caja")}
        />
        <NavBtn
          Icon={ListOrdered}
          label="Pedidos"
          active={adminRoute === "pedidos"}
          onClick={() => setAdminRoute("pedidos")}
        />

        {/* ESTOS DOS BOTONES SOLO LOS VE EL DUEÑO */}
        {adminRole === "propietario" && (
          <NavBtn
            Icon={MenuSquare}
            label="Catálogo"
            active={adminRoute === "catalogo"}
            onClick={() => setAdminRoute("catalogo")}
          />
        )}
        {adminRole === "propietario" && (
          <NavBtn
            Icon={Settings2}
            label="Ajustes"
            active={adminRoute === "ajustes" || isSubView}
            onClick={() => setAdminRoute("ajustes")}
          />
        )}
      </div>

      {/* ... (Acá sigue el popup de newOrderPopup igual que antes) ... */}
      {newOrderPopup && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          {/* ... */}
          <button
            onClick={() => {
              setNewOrderPopup(false);
              setAdminRoute("pedidos");
            }}
            className="flex-1 bg-[#c82a2a] text-white font-bold py-3 rounded-xl hover:bg-red-800"
          >
            Ver Pedido
          </button>
        </div>
      )}
    </div>
  );
}

function NavBtn({ Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 min-w-[4rem] transition-colors ${
        active ? "text-[#c82a2a]" : "text-gray-500 hover:text-gray-800"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium" style={{ fontSize: "0.65rem" }}>
        {label}
      </span>
    </button>
  );
}

function AdminAjustesMenu({ setRoute }) {
  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Settings2 size={24} /> Ajustes del Sistema
      </h2>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={() => setRoute("metricas")}
          className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-2 shadow-sm hover:border-blue-400 text-blue-700 transition-all col-span-2"
        >
          <TrendingUp size={28} />{" "}
          <span className="font-bold text-sm">Métricas y Reportes</span>
        </button>
        <button
          onClick={() => setRoute("categorias")}
          className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-2 shadow-sm hover:border-purple-400 text-purple-700 transition-all"
        >
          <MenuSquare size={28} />{" "}
          <span className="font-bold text-sm">Categorías</span>
        </button>
        <button
          onClick={() => setRoute("mediospago")}
          className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-2 shadow-sm hover:border-green-400 text-green-700 transition-all"
        >
          <Wallet size={28} />{" "}
          <span className="font-bold text-sm">Medios de Pago</span>
        </button>
        <button
          onClick={() => setRoute("impresora")}
          className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-2 shadow-sm hover:border-red-400 text-red-700 transition-all"
        >
          <Printer size={28} />{" "}
          <span className="font-bold text-sm">Impresora</span>
        </button>
        <button
          onClick={() => setRoute("horarios")}
          className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-2 shadow-sm hover:border-orange-400 text-orange-700 transition-all"
        >
          <Clock size={28} />{" "}
          <span className="font-bold text-sm">Horarios</span>
        </button>
        <button
          onClick={() => setRoute("envios")}
          className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-2 shadow-sm hover:border-blue-400 text-blue-700 transition-all col-span-2"
        >
          <Truck size={28} />{" "}
          <span className="font-bold text-sm">Delivery & Mapa</span>
        </button>
        <button
          onClick={() => setRoute("seguridad")}
          className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-2 shadow-sm hover:border-gray-800 text-gray-800 transition-all col-span-2"
        >
          <User size={28} />{" "}
          <span className="font-bold text-sm">Seguridad, Backup y Chef IA</span>
        </button>
      </div>
    </div>
  );
}

function AdminLogin({ db, setDb, onLogin, switchMode }) {
  const [email, setEmail] = useState(db.adminAuth?.email || "");
  const [pass, setPass] = useState("");
  const [pin, setPin] = useState(""); // <-- NUEVO ESTADO PARA EL PIN
  const [recoveryWord, setRecoveryWord] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const isConfigured = db.adminAuth?.isConfigured;

  const handleSetup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (pass.length < 6)
      return setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
    if (pin.length < 4)
      return setErrorMsg("El PIN de cajero debe tener 4 números.");
    if (recoveryWord.trim().length < 3)
      return setErrorMsg("Elige una palabra secreta de al menos 3 letras.");

    const hashedPass = await hashPassword(pass);
    const hashedPin = await hashPassword(pin); // Encriptamos el PIN
    const hashedRecovery = await hashPassword(
      recoveryWord.toLowerCase().trim()
    );

    setDb((prev) => ({
      ...prev,
      adminAuth: {
        email: email,
        passHash: hashedPass,
        pinHash: hashedPin, // Guardamos el PIN
        recoveryHash: hashedRecovery,
        isConfigured: true,
        geminiKey: "",
      },
    }));
    onLogin("propietario"); // El que configura entra como dueño
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const hashed = await hashPassword(pass);

    // Verificamos si es el dueño
    if (
      email.trim() === db.adminAuth.email &&
      hashed === db.adminAuth.passHash
    ) {
      onLogin("propietario");
    }
    // Verificamos si es el empleado (usando la misma caja de texto pero comparando con el PIN)
    else if (
      email.trim() === db.adminAuth.email &&
      hashed === db.adminAuth.pinHash
    ) {
      onLogin("empleado");
    } else {
      setErrorMsg("Credenciales incorrectas.");
    }
  };

  const handleRecover = async (e) => {
    // ... (Mantené la función handleRecover exacta como la tenías)
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (pass.length < 6)
      return setErrorMsg(
        "La nueva contraseña debe tener al menos 6 caracteres."
      );
    const hashedInputRecovery = await hashPassword(
      recoveryWord.toLowerCase().trim()
    );
    if (
      email.trim() === db.adminAuth.email &&
      hashedInputRecovery === db.adminAuth.recoveryHash
    ) {
      const newHashedPass = await hashPassword(pass);
      setDb((prev) => ({
        ...prev,
        adminAuth: { ...prev.adminAuth, passHash: newHashedPass },
      }));
      setSuccessMsg("¡Contraseña restablecida!");
      setIsRecovering(false);
      setPass("");
      setRecoveryWord("");
    } else setErrorMsg("El email o la palabra secreta son incorrectos.");
  };

  if (isRecovering) {
    // ... (Mantené el return de isRecovering igual que antes)
    return (
      <div className="flex flex-col h-full bg-gray-900 items-center justify-center p-6 text-white relative">
        <button
          onClick={() => {
            setIsRecovering(false);
            setErrorMsg("");
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
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#fbb03b]"
            />
            <input
              type="text"
              placeholder="Palabra secreta"
              value={recoveryWord}
              onChange={(e) => setRecoveryWord(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#fbb03b]"
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
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
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 items-center justify-center p-6 text-white relative">
      <button
        onClick={switchMode}
        className="absolute top-6 left-6 text-gray-400 flex items-center gap-2 text-sm"
      >
        <ChevronLeft size={16} /> Volver al local
      </button>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="bg-[#cc292b] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/50">
            <Settings size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            {isConfigured ? "Acceso Restringido" : "Configuración Inicial"}
          </h1>
          {!isConfigured && (
            <p className="text-sm text-gray-400 mt-2">
              Crea tu contraseña maestra y un PIN para tu equipo.
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
        <form
          onSubmit={isConfigured ? handleLogin : handleSetup}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email del local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#fbb03b]"
          />

          <input
            type="password"
            placeholder={
              isConfigured
                ? "Contraseña o PIN"
                : "Crea tu contraseña (mín 6 letras)"
            }
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#fbb03b]"
          />

          {/* NUEVO CAMPO PARA EL PIN EN LA CONFIGURACIÓN INICIAL */}
          {!isConfigured && (
            <input
              type="password"
              placeholder="PIN para empleados (4 números)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              maxLength={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#fbb03b]"
            />
          )}

          {!isConfigured && (
            <div className="pt-2 border-t border-gray-700">
              <label className="text-xs text-gray-400 font-bold mb-1 block">
                Palabra secreta
              </label>
              <input
                type="text"
                placeholder="Para recuperar contraseña"
                value={recoveryWord}
                onChange={(e) => setRecoveryWord(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#fbb03b]"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-[#cc292b] text-white font-bold py-3 rounded-lg hover:bg-red-800 shadow-lg mt-2"
          >
            {isConfigured ? "Ingresar" : "Guardar y Entrar"}
          </button>
        </form>
        {isConfigured && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRecovering(true);
                setErrorMsg("");
                setSuccessMsg("");
                setPass("");
              }}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminSeguridad({ db, setDb }) {
  const [email, setEmail] = useState(db.adminAuth.email);
  const [newPass, setNewPass] = useState("");
  const [newPin, setNewPin] = useState(""); // <-- NUEVO ESTADO PARA EDITAR EL PIN
  const [newRecovery, setNewRecovery] = useState("");
  const [geminiKey, setGeminiKey] = useState(db.adminAuth.geminiKey || "");
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    setErrorMsg("");
    let authUpdate = { ...db.adminAuth, email, geminiKey };

    if (newPass.trim()) {
      if (newPass.length < 6)
        return setErrorMsg("Mín 6 caracteres para contraseña maestra.");
      authUpdate.passHash = await hashPassword(newPass);
    }
    if (newPin.trim()) {
      if (newPin.length !== 4)
        return setErrorMsg(
          "El PIN de cajero debe tener exactamente 4 números."
        );
      authUpdate.pinHash = await hashPassword(newPin);
    }
    if (newRecovery.trim()) {
      if (newRecovery.trim().length < 3)
        return setErrorMsg("Mín 3 letras para recuperación.");
      authUpdate.recoveryHash = await hashPassword(
        newRecovery.toLowerCase().trim()
      );
    }

    setDb((prev) => ({ ...prev, adminAuth: authUpdate }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setNewPass("");
    setNewPin("");
    setNewRecovery("");
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <p className="text-sm text-gray-500 mb-4">
          Deja en blanco los campos que no desees cambiar.
        </p>
        {errorMsg && (
          <div className="p-2 bg-red-50 text-red-600 text-xs font-bold rounded">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1">
            Email de acceso
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="pt-2 border-t">
          <label className="text-sm font-bold text-gray-700 block mb-1">
            Nueva Contraseña Maestra
          </label>
          <input
            type="password"
            placeholder="Escribe para cambiarla..."
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* CAMPO PARA ACTUALIZAR EL PIN */}
        <div className="pt-2 border-t">
          <label className="text-sm font-bold text-gray-700 block mb-1">
            Nuevo PIN de Cajero (4 números)
          </label>
          <input
            type="password"
            placeholder="Escribe para cambiar el PIN..."
            value={newPin}
            maxLength={4}
            onChange={(e) => setNewPin(e.target.value)}
            className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="pt-2 border-t">
          <label className="text-sm font-bold text-gray-700 block mb-1">
            Nueva Palabra Secreta
          </label>
          <input
            type="text"
            placeholder="Escribe para cambiarla..."
            value={newRecovery}
            onChange={(e) => setNewRecovery(e.target.value)}
            className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="pt-4 border-t border-gray-200 mt-4">
          <h3 className="text-sm font-bold text-[#c82a2a] flex items-center gap-2 mb-2">
            <Sparkles size={16} /> Clave API del Chef IA
          </h3>
          <input
            type="password"
            placeholder="Empieza con AIzaSy..."
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            className="w-full border rounded p-2 text-sm outline-none focus:border-[#c82a2a] bg-red-50"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-black flex justify-center gap-2 mt-4"
        >
          {saved ? (
            <>
              <CheckCircle size={18} /> Guardado
            </>
          ) : (
            "Guardar Cambios"
          )}
        </button>
      </div>
      <AdminBackup db={db} setDb={setDb} />
    </div>
  );
}

function AdminBackup({ db, setDb }) {
  const [alertMsg, setAlertMsg] = useState("");
  const exportarBackup = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "backup_maestro.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  const importarBackup = (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function (e) {
      try {
        const contenido = JSON.parse(e.target.result);
        setDb(contenido);
        setAlertMsg("¡Sistema restaurado con éxito desde el archivo maestro!");
      } catch (error) {
        setAlertMsg(
          "Error al leer el archivo. Asegurate de que sea el JSON correcto."
        );
      }
    };
    lector.readAsText(archivo);
  };
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <CustomAlert
        isOpen={!!alertMsg}
        message={alertMsg}
        onClose={() => setAlertMsg("")}
      />
      <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
        <Package size={20} className="text-[#c82a2a]" /> Copia de Seguridad
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Descargá todo tu catálogo de pastas frescas a tu computadora.
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
  );
}

// ==========================================
// MÓDULOS DE PANEL LIMPIO Y MÉTRICAS NUEVAS
// ==========================================
function AdminDashboard({ db, setDb, setRoute }) {
  const manualStatus = db.manualStatus || INITIAL_MANUAL_STATUS;
  const handleToggleClose = () =>
    setDb((prev) => ({
      ...prev,
      manualStatus: {
        ...prev.manualStatus,
        isClosed: !prev.manualStatus?.isClosed,
      },
    }));
  const handleMessageChange = (e) =>
    setDb((prev) => ({
      ...prev,
      manualStatus: { ...prev.manualStatus, message: e.target.value },
    }));
  const handlePromptChange = (e) =>
    setDb((prev) => ({
      ...prev,
      manualStatus: { ...prev.manualStatus, chefPrompt: e.target.value },
    }));

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">Panel Principal</h2>
      </div>

      <div className="mt-2">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Store size={20} /> Estado Operativo del Local
        </h3>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#c82a2a] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 text-sm">
                Cerrar local momentáneamente
              </p>
              <p className="text-xs text-gray-500">
                Bloquea pedidos online al instante, ideal si colapsa la cocina.
              </p>
            </div>
            <button
              onClick={handleToggleClose}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none shadow-inner ${
                manualStatus.isClosed ? "bg-red-500" : "bg-green-500"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                  manualStatus.isClosed ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Cartel luminoso para clientes (Solo visible si está abierto):
            </label>
            <input
              type="text"
              placeholder="Ej: ¡Hoy promo en sorrentinos! 🔥"
              value={manualStatus.message || ""}
              onChange={handleMessageChange}
              className="block w-full border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 focus:ring-2 focus:ring-[#c82a2a] outline-none font-medium"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <img
            src={CHEF_AVATAR}
            alt="Perfil Chef"
            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
          />
          Entrenar al Chef IA
        </h3>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#fbb03b]">
          <label className="block text-xs font-bold text-gray-600 mb-2">
            Instrucciones y Reglas de la casa para el robot:
          </label>
          <textarea
            value={manualStatus.chefPrompt || ""}
            onChange={handlePromptChange}
            placeholder="Ej: 2 planchas rinden para 3 personas..."
            className="block w-full border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 focus:ring-2 focus:ring-[#fbb03b] outline-none resize-none h-32"
          />
        </div>
      </div>
    </div>
  );
}

function AdminMetricas({ db }) {
  const getStartOfMonth = () => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  };
  const getToday = () => new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(getStartOfMonth());
  const [endDate, setEndDate] = useState(getToday());

  const pedidosFiltrados = db.orders.filter((o) => {
    if (!o.date) return false;
    const orderDate = o.date.split("T")[0];
    return orderDate >= startDate && orderDate <= endDate;
  });

  let ventasTotales = 0;
  let cantidadPedidosExitosos = 0;
  const ventasPorProducto = {};
  const ventasPorCategoria = {};

  pedidosFiltrados.forEach((o) => {
    if (o.status !== "Cancelado") {
      ventasTotales += o.total || 0;
      cantidadPedidosExitosos++;
      const items = o.items || [];
      items.forEach((item) => {
        const prod = item.product || {};
        const catId = prod.categoryId || 0;
        const qty = item.quantity || 0;
        const subtotalItem = (prod.price || 0) * qty;
        if (!ventasPorProducto[prod.id])
          ventasPorProducto[prod.id] = {
            nombre: prod.name || item.name || "Desconocido",
            cantidad: 0,
            total: 0,
            unidad: prod.unitType === "peso" ? "kg" : "u",
          };
        ventasPorProducto[prod.id].cantidad += qty;
        ventasPorProducto[prod.id].total += subtotalItem;
        if (!ventasPorCategoria[catId]) {
          const catInfo = db.categories.find((c) => c.id === catId);
          ventasPorCategoria[catId] = {
            nombre: catInfo ? catInfo.name : "Sin Categoría",
            total: 0,
          };
        }
        ventasPorCategoria[catId].total += subtotalItem;
      });
    }
  });

  const productosOrdenados = Object.values(ventasPorProducto).sort(
    (a, b) => b.total - a.total
  );
  const categoriasOrdenadas = Object.values(ventasPorCategoria).sort(
    (a, b) => b.total - a.total
  );

  const exportarCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent +=
      "ID Pedido,Fecha,Cliente,Tipo,Estado,Subtotal,Descuento,Envio,Total Cobrado,Medio de Pago\n";
    pedidosFiltrados.forEach((o) => {
      const row = [
        o.id,
        new Date(o.date).toLocaleString("es-AR"),
        `"${o.customer?.name || "Mostrador"}"`,
        o.type,
        o.status,
        o.subtotal || 0,
        o.discount || 0,
        o.shippingCost || 0,
        o.total,
        `"${o.paymentDetails || ""}"`,
      ].join(",");
      csvContent += row + "\r\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `reporte_ventas_${startDate}_al_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp size={24} /> Métricas
        </h2>
        <button
          onClick={exportarCSV}
          disabled={pedidosFiltrados.length === 0}
          className="bg-[#2e7d32] disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-green-800 active:scale-95 flex items-center gap-2"
          title="Descargar CSV para Excel"
        >
          <FileText size={16} /> Exportar Excel
        </button>
      </div>

      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-2">
        <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
          <Calendar size={12} /> Rango de fechas a analizar
        </span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-2 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-bold"
          />
          <span className="text-gray-400 font-bold">a</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-2 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
            Facturación Total
          </p>
          <p className="text-2xl font-black text-green-600">
            {formatCurrency(ventasTotales)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
            Tickets Exitosos
          </p>
          <p className="text-3xl font-black text-blue-600">
            {cantidadPedidosExitosos}
          </p>
        </div>
      </div>

      {cantidadPedidosExitosos > 0 ? (
        <>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-2 space-y-3">
            <h3 className="text-xs text-gray-500 font-bold uppercase mb-2 border-b pb-2 flex items-center gap-1">
              <MenuSquare size={14} /> Ventas por Categoría
            </h3>
            {categoriasOrdenadas.map((cat, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-gray-700 font-bold">{cat.nombre}</span>
                <span className="font-black text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                  {formatCurrency(cat.total)}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-2 space-y-3">
            <h3 className="text-xs text-gray-500 font-bold uppercase mb-2 border-b pb-2 flex items-center gap-1">
              🏆 Top Productos (Más Recaudación)
            </h3>
            {productosOrdenados.map((prod, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0"
              >
                <div className="flex flex-col">
                  <span className="text-gray-800 font-bold leading-tight">
                    {prod.nombre}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">
                    Despachado:{" "}
                    {Number(prod.cantidad)
                      .toFixed(3)
                      .replace(/\.000$/, "")}{" "}
                    {prod.unidad}
                  </span>
                </div>
                <span className="font-black text-[#c82a2a]">
                  {formatCurrency(prod.total)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-400 mt-4">
          No hay ventas registradas en las fechas seleccionadas.
        </div>
      )}
    </div>
  );
}

function AdminPedidos({ db, setDb, adminRole }) {
  const [ticketToPrint, setTicketToPrint] = useState(null);
  const [confirmObj, setConfirmObj] = useState(null);

  const updateStatus = (orderId, newStatus) => {
    setDb((prev) => {
      const orderIndex = prev.orders.findIndex((o) => o.id === orderId);
      if (orderIndex === -1) return prev;
      const order = prev.orders[orderIndex];
      const oldStatus = order.status;
      let updatedProducts = [...prev.products];
      if (newStatus === "Cancelado" && oldStatus !== "Cancelado") {
        order.items.forEach((item) => {
          const prodIdx = updatedProducts.findIndex(
            (p) => p.id === item.product.id
          );
          if (prodIdx > -1 && updatedProducts[prodIdx].trackStock)
            updatedProducts[prodIdx].stock += item.quantity;
        });
      } else if (oldStatus === "Cancelado" && newStatus !== "Cancelado") {
        order.items.forEach((item) => {
          const prodIdx = updatedProducts.findIndex(
            (p) => p.id === item.product.id
          );
          if (prodIdx > -1 && updatedProducts[prodIdx].trackStock)
            updatedProducts[prodIdx].stock = Math.max(
              0,
              updatedProducts[prodIdx].stock - item.quantity
            );
        });
      }
      const updatedOrders = [...prev.orders];
      updatedOrders[orderIndex] = { ...order, status: newStatus };
      return { ...prev, orders: updatedOrders, products: updatedProducts };
    });
  };

  const deleteOrder = (orderId) => {
    setConfirmObj({
      msg: "¿Seguro que quieres eliminar este pedido permanentemente? El stock se devolverá.",
      action: () => {
        setDb((prev) => {
          const order = prev.orders.find((o) => o.id === orderId);
          if (!order) return prev;
          let updatedProducts = [...prev.products];
          if (order.status !== "Cancelado") {
            order.items.forEach((item) => {
              const prodIdx = updatedProducts.findIndex(
                (p) => p.id === item.product?.id
              );
              if (prodIdx > -1 && updatedProducts[prodIdx].trackStock)
                updatedProducts[prodIdx].stock += item.quantity;
            });
          }
          return {
            ...prev,
            orders: prev.orders.filter((o) => o.id !== orderId),
            products: updatedProducts,
          };
        });
      },
    });
  };

  const statusColors = {
    Recibido: "bg-yellow-100 text-yellow-800",
    Pendiente: "bg-orange-100 text-orange-800",
    Entregado: "bg-green-100 text-green-800",
    Rendido: "bg-purple-100 text-purple-800", // Color para el estado rendido
    Cancelado: "bg-red-100 text-red-800 line-through",
  };

  const reenviarACadete = (pedido) => {
    const cliente = pedido.customer || pedido.customerInfo || {};
    const items = pedido.items || [];
    let texto = `🛵 *NUEVO ENVÍO*\n      *📦 PEDIDO #${
      pedido.id
    } 📦*\n\n*Cliente:* ${cliente.name || "Sin nombre"} (${
      cliente.phone || "Sin teléfono"
    })\n*Dirección:* ${cliente.address || "Falta dirección"}\n`;
    if (cliente.coords)
      texto += `*Ubicación GPS:* http://maps.google.com/?q=${cliente.coords.lat},${cliente.coords.lng}\n`;
    if (cliente.notes) texto += `*Aclaraciones:* ${cliente.notes}\n`;
    texto += `\n*Detalle del pedido:*\n`;
    items.forEach((item) => {
      texto += `- ${Number(item.quantity)
        .toFixed(3)
        .replace(/\.000$/, "")} ${
        item.product?.unitType === "peso" ? "kg" : "u"
      } x ${item.product?.name || item.name || "Producto"}\n`;
    });
    const subtotal =
      pedido.subtotal ||
      items.reduce(
        (acc, i) => acc + (i.product?.price || 0) * (i.quantity || 1),
        0
      );
    texto += `\n*Subtotal:* ${formatCurrency(subtotal)}\n`;
    if (pedido.type === "delivery")
      texto += `*Envío:* ${formatCurrency(pedido.shippingCost || 0)}\n`;
    texto += `*TOTAL A COBRAR:* ${formatCurrency(pedido.total || 0)}\n`;
    if (pedido.paymentDetails) texto += `*Pago:* ${pedido.paymentDetails}\n`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`,
      "_blank"
    );
  };

  if (ticketToPrint)
    return (
      <PrintTicket
        order={ticketToPrint}
        isComanda={false}
        onClose={() => setTicketToPrint(null)}
        db={db}
      />
    );

  const borrarTodosLosPedidos = () => {
    setConfirmObj({
      msg: "⚠️ ¿Estás totalmente seguro de borrar TODOS los pedidos? Se restaurará el stock de los no anulados.",
      action: () => {
        setDb((prev) => {
          let updatedProducts = [...prev.products];
          prev.orders.forEach((order) => {
            if (order.status !== "Cancelado") {
              order.items.forEach((item) => {
                const prodIdx = updatedProducts.findIndex(
                  (p) => p.id === item.product?.id
                );
                if (prodIdx > -1 && updatedProducts[prodIdx].trackStock)
                  updatedProducts[prodIdx].stock += item.quantity;
              });
            }
          });
          return { ...prev, orders: [], products: updatedProducts };
        });
      },
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-10">
      <CustomConfirm
        isOpen={!!confirmObj}
        message={confirmObj?.msg}
        onConfirm={confirmObj?.action}
        onCancel={() => setConfirmObj(null)}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Pedidos</h2>
        {/* BLOQUEO APLICADO AQUÍ: Solo el propietario ve Borrar Todo */}
        {adminRole === "propietario" && db.orders && db.orders.length > 0 && (
          <button
            onClick={borrarTodosLosPedidos}
            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-bold flex gap-2 items-center border border-red-200"
          >
            <Trash2 size={16} /> Borrar Todo
          </button>
        )}
      </div>

      {!db.orders || db.orders.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No hay pedidos registrados.
        </p>
      ) : (
        <div className="space-y-4">
          {db.orders.map((order) => {
            const items = order.items || [];
            const customer = order.customer || order.customerInfo || {};
            const subtotal = items.reduce(
              (acc, i) => acc + (i.product?.price || 0) * (i.quantity || 1),
              0
            );

            return (
              <div
                key={order.id || Math.random()}
                className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 ${
                  order.status === "Cancelado" ? "opacity-60" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      #{order.id || "???"}
                    </span>
                    <p
                      className={`font-bold text-gray-800 mt-1 ${
                        order.status === "Cancelado" ? "line-through" : ""
                      }`}
                    >
                      {customer.name || "Cliente anónimo"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.date
                        ? new Date(order.date).toLocaleString("es-AR")
                        : "Fecha desconocida"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status || "Recibido"}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-full outline-none cursor-pointer border ${
                          statusColors[order.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <option value="Recibido">Recibido</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Entregado">Entregado</option>

                        {/* Solo mostramos RENDIDO si es delivery y el pago es en efectivo */}
                        {order.type === "delivery" &&
                          (order.paymentType === "cash" ||
                            (order.paymentDetails &&
                              order.paymentDetails
                                .toLowerCase()
                                .includes("efectivo"))) && (
                            <option value="Rendido">Rendido</option>
                          )}
                      </select>
                    </div>
                    <div className="flex gap-2 w-full justify-end">
                      {/* BLOQUEO APLICADO AQUÍ: Solo el propietario puede eliminar un pedido individual */}
                      {adminRole === "propietario" && (
                        <button
                          onClick={() => deleteOrder(order.id)}
                          title="Eliminar pedido"
                          className="text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded flex items-center transition-colors border border-red-100"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => setTicketToPrint(order)}
                        className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                      >
                        🖨️ Imprimir
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-sm bg-gray-50 p-2 rounded mb-2">
                  <p>
                    <strong>Tel:</strong> {customer.phone || "No dejó"}
                  </p>
                  <p>
                    <strong>Tipo:</strong>{" "}
                    {(order.type || "retiro").toUpperCase()}
                  </p>
                  <p className="text-blue-700 font-bold mt-1">
                    💳 Pago: {order.paymentDetails || "No especificado"}
                  </p>
                  {order.type === "delivery" && (
                    <div className="flex flex-col gap-1 mt-1">
                      <p>
                        <strong>Dir:</strong>{" "}
                        {customer.address || "Sin especificar"}{" "}
                        <span className="text-xs text-gray-500">
                          ({order.distance ? order.distance.toFixed(1) : 0} km)
                        </span>
                      </p>
                    </div>
                  )}
                  {customer.notes && (
                    <p className="text-red-600 font-bold mt-1">
                      📝 Nota: {customer.notes}
                    </p>
                  )}
                </div>

                <div className="text-xs space-y-1 mb-2">
                  {items.map((i, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-gray-600"
                    >
                      <span>
                        {Number(i.quantity)
                          .toFixed(3)
                          .replace(/\.000$/, "")}{" "}
                        {i.product?.unitType === "peso" ? "kg" : "u"} x{" "}
                        {i.product?.name || i.name || "Producto"}
                      </span>
                      <span>
                        {formatCurrency((i.product?.price || 0) * i.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-100 mt-2 font-bold">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {order.type === "delivery" && (
                    <div className="flex justify-between text-gray-500 pt-1">
                      <span>Costo de envío</span>
                      <span>{formatCurrency(order.shippingCost || 0)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-500">
                    Total:
                  </span>
                  <span
                    className={`font-black text-gray-900 ${
                      order.status === "Cancelado" ? "line-through" : ""
                    }`}
                  >
                    {formatCurrency(order.total || 0)}
                  </span>
                </div>

                {order.type === "delivery" && customer?.coords && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm">
                    <span className="font-bold text-blue-800 flex items-center gap-1 mb-1">
                      📍 Ubicación GPS:
                    </span>
                    <a
                      href={`http://maps.google.com/?q=${customer.coords.lat},${customer.coords.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline font-bold flex items-center gap-1"
                    >
                      Abrir en Google Maps
                    </a>
                  </div>
                )}

                {/* BOTÓN 1: ENVIAR A DELIVERY */}
                {order.type === "delivery" && order.status !== "Cancelado" && (
                  <button
                    onClick={() => reenviarACadete(order)}
                    className="mt-4 w-full bg-[#25D366] hover:bg-[#20b858] text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-sm active:scale-[0.98]"
                  >
                    <Truck size={20} /> Enviar a Delivery
                  </button>
                )}

                {/* BOTÓN 2: ENVIAR A CAJA (NUEVO) */}
                {order.type === "retiro" &&
                  (order.paymentType === "store" ||
                    (order.paymentDetails &&
                      order.paymentDetails.toLowerCase().includes("local"))) &&
                  order.status !== "Pendiente" &&
                  order.status !== "Cancelado" && (
                    <button
                      onClick={() => updateStatus(order.id, "Pendiente")}
                      className="mt-4 w-full bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 p-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-sm active:scale-[0.98]"
                    >
                      <Calculator size={20} /> Enviar a Caja (Pendiente)
                    </button>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// MÓDULO CLIENTE WEB
// ==========================================
function ClientApp({ db, setDb, switchMode }) {
  const [route, setRoute] = useState("home");
  const [cart, setCart] = useState([]);
  const [showAssistant, setShowAssistant] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const addToCart = (product) => {
    const step = product.unitType === "peso" ? 0.25 : 1;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      if (product.trackStock && currentQty + step > product.stock) {
        setAlertMsg(
          `¡Ups! Solo nos quedan ${product.stock} ${
            product.unitType === "peso" ? "kg" : "unidades"
          } de ${product.name}.`
        );
        return prev;
      }
      if (existing)
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + step }
            : item
        );
      return [...prev, { product, quantity: step }];
    });
  };

  const updateQuantity = (productId, direction) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const step = item.product.unitType === "peso" ? 0.25 : 1;
            const newQ = item.quantity + direction * step;
            if (
              direction > 0 &&
              item.product.trackStock &&
              newQ > item.product.stock
            ) {
              setAlertMsg(
                `¡Ups! Solo nos quedan ${item.product.stock} ${
                  item.product.unitType === "peso" ? "kg" : "unidades"
                }.`
              );
              return item;
            }
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      <CustomAlert
        isOpen={!!alertMsg}
        message={alertMsg}
        onClose={() => setAlertMsg("")}
      />

      <div className="flex-1 overflow-hidden relative">
        {route === "home" && (
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
        {route === "cart" && (
          <ClientCart
            cart={cart}
            updateQuantity={updateQuantity}
            setRoute={setRoute}
            cartTotal={cartTotal}
          />
        )}
        {route === "checkout" && (
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
        <ClientNavBtn
          Icon={Store}
          label="Menú"
          active={route === "home"}
          onClick={() => setRoute("home")}
        />
        <ClientNavBtn
          Icon={ShoppingCart}
          label="Carrito"
          active={route === "cart" || route === "checkout"}
          onClick={() => setRoute("cart")}
          badge={cartItemsCount}
        />
        <ClientNavBtn
          Icon={CHEF_AVATAR}
          label="Chef IA"
          active={showAssistant}
          onClick={() => setShowAssistant(true)}
        />
      </div>
      {showAssistant && (
        <ChefAssistant db={db} onClose={() => setShowAssistant(false)} />
      )}
    </div>
  );
}

function ClientNavBtn({ Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 p-2 w-16 transition-colors ${
        active ? "text-[#c82a2a]" : "text-gray-500 hover:text-gray-800"
      }`}
    >
      {typeof Icon === "string" ? (
        <img
          src={Icon}
          alt={label}
          className={`w-6 h-6 rounded-full object-cover ${
            active ? "border-2 border-[#c82a2a]" : "opacity-70 grayscale-[50%]"
          }`}
        />
      ) : (
        <Icon size={22} />
      )}
      <span className="font-medium" style={{ fontSize: "0.65rem" }}>
        {label}
      </span>
      {badge > 0 && (
        <span className="absolute top-1 right-2 bg-[#c82a2a] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function ClientHome({
  db,
  addToCart,
  switchMode,
  cartItemsCount,
  cartTotal,
  setRoute,
  cart,
  updateQuantity,
}) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [storeStatus, setStoreStatus] = useState({
    isOpen: false,
    isForcedClosed: false,
    isTimeClosed: false,
    nextOpen: "",
    customMessage: "",
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;
      const todayShifts = db.schedule[day] || [];
      let isTimeOpen = false;
      for (let shift of todayShifts) {
        if (currentTime >= shift.open && currentTime <= shift.close) {
          isTimeOpen = true;
          break;
        }
      }
      let nextOpen = "";
      if (!isTimeOpen && todayShifts.length > 0) {
        const nextShift = todayShifts.find((s) => s.open > currentTime);
        if (nextShift) nextOpen = `Abre hoy a las ${nextShift.open}`;
      }
      const isForcedClosed = db.manualStatus?.isClosed || false;
      const customMessage = db.manualStatus?.message || "";
      setStoreStatus({
        isOpen: !isForcedClosed && isTimeOpen,
        isForcedClosed,
        isTimeClosed: !isTimeOpen,
        nextOpen: nextOpen || "Cerrado por hoy",
        customMessage,
      });
    };
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [db.schedule, db.manualStatus]);
  const handleScroll = (e) => {
    if (e.target.scrollTop > 300) setShowScrollTop(true);
    else setShowScrollTop(false);
  };
  const scrollToTop = () =>
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  const isVisibleInWeb = (p) => p.active !== false && p.showInWeb !== false;
  const featuredProducts = db.products
    .filter((p) => p.featured && isVisibleInWeb(p))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const filteredProducts = activeCategory
    ? db.products
        .filter((p) => p.categoryId === activeCategory && isVisibleInWeb(p))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    : db.products
        .filter((p) => isVisibleInWeb(p))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto pb-32 relative hide-scrollbar"
    >
      <div className="relative bg-[#cc292b] pt-8 pb-8 flex flex-col items-center justify-center shrink-0 shadow-inner min-h-[12rem]">
        {SHOP_LOGO ? (
          <img
            src={SHOP_LOGO}
            alt="Logo"
            className="w-full h-full object-contain max-h-40 px-4 drop-shadow-md"
          />
        ) : (
          <h1 className="text-4xl font-serif font-black text-white text-center">
            Al Buen Raviol
          </h1>
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
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>{" "}
            Cerrado momentáneamente
          </span>
        </div>
      ) : storeStatus.isTimeClosed ? (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 shadow-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span className="font-bold text-red-600 text-sm">CERRADO</span>
          </div>
          <span className="text-xs text-red-500 font-medium">
            {storeStatus.nextOpen}
          </span>
        </div>
      ) : (
        <div className="bg-[#e8f5e9] border-b border-[#c8e6c9] px-4 py-3 shadow-sm flex items-center justify-center shrink-0">
          <span className="font-bold text-[#2e7d32] text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
            {storeStatus.customMessage || "ABIERTO AHORA"}
          </span>
        </div>
      )}
      <div className="bg-white py-4 sticky top-0 z-10 shadow-sm shrink-0">
        <div className="flex overflow-x-auto px-4 gap-2 hide-scrollbar pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === null
                ? "bg-[#c82a2a] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todo
          </button>
          {db.categories
            .sort((a, b) => a.order - b.order)
            .map((cat) => {
              const hasVisibleProducts = db.products.some(
                (p) => p.categoryId === cat.id && isVisibleInWeb(p)
              );
              if (!hasVisibleProducts) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeCategory === cat.id
                      ? "bg-[#c82a2a] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
        </div>
      </div>
      <div className="px-4 py-4 space-y-6">
        {!activeCategory && featuredProducts.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Store size={20} className="text-[#c82a2a]" /> Recomendados
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                  storeOpen={storeStatus.isOpen}
                  cartItem={cart.find((item) => item.product.id === product.id)}
                  updateQuantity={updateQuantity}
                />
              ))}
            </div>
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">
            {activeCategory
              ? db.categories.find((c) => c.id === activeCategory)?.name
              : "Menú"}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={addToCart}
                storeOpen={storeStatus.isOpen}
                cartItem={cart.find((item) => item.product.id === product.id)}
                updateQuantity={updateQuantity}
              />
            ))}
            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No hay productos.
              </p>
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
            onClick={() => setRoute("cart")}
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
  );
}

function ProductCard({ product, onAdd, storeOpen, cartItem, updateQuantity }) {
  const quantity = cartItem ? cartItem.quantity : 0;
  const step = product.unitType === "peso" ? 0.25 : 1;
  const isOutOfStock = product.trackStock && product.stock <= 0;
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex h-32 relative ${
        isOutOfStock ? "opacity-70 grayscale-[30%]" : ""
      }`}
    >
      <div className="w-1/3 h-full relative">
        <img
          src={
            product.image || "https://via.placeholder.com/150?text=Sin+Imagen"
          }
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider transform -rotate-12">
              Agotado
            </span>
          </div>
        )}
      </div>
      <div className="w-2/3 p-3 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-gray-800 leading-tight pr-2">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="font-black text-[#c82a2a] flex items-end gap-1 leading-none">
              {formatCurrency(product.price)}
              {product.unitType === "peso" && (
                <span className="text-[10px] text-gray-500 font-normal mb-0.5">
                  / kg
                </span>
              )}
            </span>
          </div>
          {isOutOfStock ? (
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
              Sin Stock
            </span>
          ) : quantity > 0 ? (
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
                storeOpen
                  ? "bg-red-50 text-[#c82a2a] hover:bg-red-100"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChefAssistant({ db, onClose }) {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([
    {
      role: "assistant",
      text: "¡Hola! Soy el Chef Virtual. ¿En qué te puedo ayudar hoy?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);
  const handleSend = async () => {
    if (!query.trim()) return;
    const userMsg = query;
    setQuery("");
    setChat([...chat, { role: "user", text: userMsg }]);
    setIsLoading(true);
    const menuContext = db.products
      .filter(
        (p) =>
          p.showInWeb !== false &&
          p.active !== false &&
          (!p.trackStock || p.stock > 0)
      )
      .map(
        (p) =>
          `${p.name} ($${p.price} ${
            p.unitType === "peso" ? "por kg" : "por unidad"
          }): ${p.description}`
      )
      .join(" | ");
    const customRules =
      db.manualStatus?.chefPrompt ||
      "Regla de porciones: 2 planchas rinden para 3 personas.";
    const sysPrompt = `Eres el Chef Experto de 'Al Buen Raviol', fábrica de pastas en Mendoza. Menú disponible: ${menuContext}. Habla amigable y argentino (usa 'vos'). Recomienda SOLO productos del menú disponible. \nREGLAS ESTRICTAS DEL LOCAL: ${customRules}. Mantén tus respuestas breves y concisas.`;
    const response = await callGemini(
      [...chat, { role: "user", text: userMsg }],
      sysPrompt,
      db.adminAuth?.geminiKey
    );
    setChat((prev) => [...prev, { role: "assistant", text: response }]);
    setIsLoading(false);
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center animate-fadeIn p-4 sm:p-0">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col h-[80vh] sm:h-[600px] overflow-hidden">
        <div className="bg-[#cc292b] p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={CHEF_AVATAR}
              alt="Chef IA"
              className="w-14 h-14 object-contain drop-shadow-md"
            />
            <h3 className="font-bold text-xl">Chef IA</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-red-50/30">
          {chat.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <img
                  src={CHEF_AVATAR}
                  alt="Chef"
                  className="w-10 h-10 object-contain drop-shadow-sm self-end mb-1 shrink-0"
                />
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-[#cc292b] text-white rounded-br-sm"
                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-gray-500 text-sm pl-2">Pensando...</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
          <input
            type="text"
            placeholder="Ej: Somos 4 personas, ¿qué llevo?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="flex-1 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-red-200 rounded-xl px-4 py-3 text-sm outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !query.trim()}
            className="bg-[#cc292b] text-white p-3 rounded-xl disabled:bg-red-300 hover:bg-red-800 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientCart({ cart, updateQuantity, setRoute, cartTotal }) {
  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex items-center p-4 border-b border-gray-100 bg-white shrink-0 z-10 sticky top-0">
        <button
          onClick={() => setRoute("home")}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-800"
        >
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
              onClick={() => setRoute("home")}
              className="mt-4 px-6 py-2 bg-red-50 text-[#c82a2a] rounded-full font-bold"
            >
              Ver menú
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100"
              >
                <img
                  src={
                    item.product.image ||
                    "https://via.placeholder.com/150?text=Sin+Imagen"
                  }
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <h4 className="font-bold text-sm text-gray-800">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-gray-600 text-sm">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="text-red-500 p-1"
                      >
                        {item.quantity <=
                        (item.product.unitType === "peso" ? 0.25 : 1) ? (
                          <Trash2 size={14} />
                        ) : (
                          <Minus size={14} />
                        )}
                      </button>
                      <span className="font-bold text-sm w-10 text-center">
                        {item.quantity}{" "}
                        {item.product.unitType === "peso" ? "kg" : "u"}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="text-red-500 p-1"
                      >
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
            <span className="text-xl font-black text-gray-800">
              {formatCurrency(cartTotal)}
            </span>
          </div>
          <button
            onClick={() => setRoute("checkout")}
            className="w-full bg-[#c82a2a] text-white p-4 rounded-xl font-bold shadow-md hover:bg-red-800"
          >
            Continuar pago
          </button>
        </div>
      )}
    </div>
  );
}

function ClientCheckout({ cart, cartTotal, db, setDb, setRoute, clearCart }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [orderType, setOrderType] = useState("retiro");

  // --- AHORA FILTRAMOS LOS MEDIOS DE PAGO SEGÚN EL TIPO DE PEDIDO ELEGIDO ---
  const paymentOptions =
    db.paymentMethods?.filter((p) => {
      if (p.active === false) return false;
      if (orderType === "delivery") return p.showInDelivery !== false;
      if (orderType === "retiro") return p.showInPickup !== false;
      return false;
    }) || [];

  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  useEffect(() => {
    if (
      paymentOptions.length > 0 &&
      !paymentOptions.find((p) => p.id === selectedPaymentId)
    ) {
      setSelectedPaymentId(paymentOptions[0].id);
    }
  }, [orderType, paymentOptions]);

  const selectedPayment = paymentOptions.find(
    (p) => p.id === selectedPaymentId
  );
  const [cashAmount, setCashAmount] = useState("");
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [shippingDistance, setShippingDistance] = useState(0);
  const [whatsappLink, setWhatsappLink] = useState(null);
  const [formError, setFormError] = useState("");
  const [invalidFields, setInvalidFields] = useState([]);
  const calculateShippingCost = (distance) => {
    if (distance <= 0) return 0;
    const { tier1, tier2, tier3, extra } = db.shippingConfig;
    if (distance <= 3) return tier1;
    if (distance <= 4) return tier2;
    if (distance <= 5) return tier3;
    return tier3 + Math.ceil(distance - 5) * extra;
  };
  const shippingCost =
    orderType === "delivery" ? calculateShippingCost(shippingDistance) : 0;
  const finalTotal = cartTotal + shippingCost;
  const handleConfirm = () => {
    setFormError("");
    setInvalidFields([]);
    const errors = [];
    if (!formData.name.trim()) errors.push("name");
    if (!formData.phone.trim()) errors.push("phone");
    if (!selectedPayment) errors.push("payment");
    if (
      orderType === "delivery" &&
      (!formData.address.trim() || !deliveryCoords)
    )
      errors.push("address");
    if (selectedPayment?.type === "cash") {
      const amount = parseFloat(cashAmount);
      if (isNaN(amount) || amount < finalTotal) errors.push("cashAmount");
    }
    if (errors.length > 0) {
      setInvalidFields(errors);
      if (
        errors.includes("address") &&
        orderType === "delivery" &&
        !deliveryCoords
      )
        setFormError("Por favor seleccioná tu dirección en el mapa.");
      else setFormError("Por favor completa los campos marcados en rojo.");
      return;
    }
    let paymentString = selectedPayment.name;
    if (selectedPayment.type === "cash") {
      paymentString += ` (Abona con ${formatCurrency(Number(cashAmount))})`;
    }
    const nextId =
      db.orders.length > 0 && !isNaN(parseInt(db.orders[0].id))
        ? parseInt(db.orders[0].id) + 1
        : 1000 + db.orders.length + 1;

    const newOrder = {
      id: nextId.toString(),
      date: new Date().toISOString(),
      customer: { ...formData, coords: deliveryCoords },
      type: orderType,
      items: cart,
      subtotal: cartTotal,
      shippingCost,
      distance: shippingDistance,
      total: finalTotal,
      status: "Recibido",
      paymentDetails: paymentString,
      paymentType: selectedPayment.type, // <--- ESTA ES LA LÍNEA CLAVE QUE AGREGAMOS
    };

    setDb((prev) => {
      let updatedProducts = [...prev.products];
      cart.forEach((cartItem) => {
        const pIndex = updatedProducts.findIndex(
          (p) => p.id === cartItem.product.id
        );
        if (pIndex > -1 && updatedProducts[pIndex].trackStock)
          updatedProducts[pIndex].stock = Math.max(
            0,
            updatedProducts[pIndex].stock - cartItem.quantity
          );
      });
      return {
        ...prev,
        orders: [newOrder, ...prev.orders],
        products: updatedProducts,
      };
    });

    let text = `       *PEDIDO #${nextId}*\n\n*Hola Al Buen Raviol Maipú!*\n\n*Cliente:* ${
      formData.name
    }\n*Tel:* ${formData.phone}\n*Tipo:* ${
      orderType === "retiro" ? "🏪 Retiro por local" : "🛵 Delivery"
    }\n`;
    if (orderType === "delivery") {
      text += `*Dirección:* ${formData.address}\n`;
      if (deliveryCoords)
        text += `*Mapa:* http://maps.google.com/?q=${deliveryCoords.lat},${deliveryCoords.lng}\n`;
    }
    if (formData.notes.trim())
      text += `*Aclaraciones:* ${formData.notes.trim()}\n`;
    text += `\n*Detalle:*\n`;
    cart.forEach((item) => {
      text += `- ${item.quantity} ${
        item.product.unitType === "peso" ? "kg" : "un"
      } x ${item.product.name} (${formatCurrency(
        item.product.price * item.quantity
      )})\n`;
    });
    text += `\n*Subtotal:* ${formatCurrency(cartTotal)}\n`;
    if (orderType === "delivery")
      text += `*Envío:* ${formatCurrency(shippingCost)}\n`;
    text += `*TOTAL A PAGAR: ${formatCurrency(
      finalTotal
    )}*\n\n*Medio de Pago:* ${selectedPayment.name}\n`;
    if (selectedPayment.type === "cash") {
      text += `*Abona con:* ${formatCurrency(Number(cashAmount))}\n`;
      const vuelto = Number(cashAmount) - finalTotal;
      if (vuelto > 0) text += `*Vuelto:* ${formatCurrency(vuelto)}\n`;
    }
    if (selectedPayment.type === "transfer")
      text += `\n*(Envío comprobante a continuación)*\n`;
    setWhatsappLink(
      `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(text)}`
    );
    clearCart();
  };
  if (whatsappLink)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white p-6 text-center animate-fadeIn">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          ¡Pedido Generado!
        </h2>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
          Toca el botón para{" "}
          <span className="font-bold text-gray-800">abrir WhatsApp</span> y
          enviarnos el detalle.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setTimeout(() => setRoute("home"), 1000)}
          className="bg-[#25D366] text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg flex items-center gap-2 hover:bg-green-600 transition-all w-full justify-center max-w-sm mb-4"
        >
          <Send size={24} /> Confirmar por WhatsApp
        </a>
      </div>
    );
  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <div className="flex items-center p-4 border-b border-gray-200 bg-white shrink-0 z-10 sticky top-0">
        <button
          onClick={() => setRoute("cart")}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-800"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-gray-800 ml-2">
          Finalizar Pedido
        </h2>
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
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setInvalidFields((p) => p.filter((f) => f !== "name"));
              }}
              className={`w-full rounded-lg px-4 py-3 text-sm outline-none transition-all ${
                invalidFields.includes("name")
                  ? "bg-red-50 border border-red-500 ring-1 ring-red-500"
                  : "bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500"
              }`}
            />
            <input
              type="tel"
              placeholder="Tu Teléfono (ej: 261...) *"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                setInvalidFields((p) => p.filter((f) => f !== "phone"));
              }}
              className={`w-full rounded-lg px-4 py-3 text-sm outline-none transition-all ${
                invalidFields.includes("phone")
                  ? "bg-red-50 border border-red-500 ring-1 ring-red-500"
                  : "bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500"
              }`}
            />
            <textarea
              placeholder="ACLARACIONES (Opcional)"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
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
              onClick={() => setOrderType("retiro")}
              className={`flex-1 py-2 text-sm font-bold rounded-md ${
                orderType === "retiro"
                  ? "bg-white shadow-sm text-gray-800"
                  : "text-gray-500"
              }`}
            >
              Retiro en Local
            </button>
            <button
              onClick={() => setOrderType("delivery")}
              className={`flex-1 py-2 text-sm font-bold rounded-md ${
                orderType === "delivery"
                  ? "bg-white shadow-sm text-gray-800"
                  : "text-gray-500"
              }`}
            >
              Delivery
            </button>
          </div>
          {orderType === "retiro" && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 animate-fadeIn">
              <p className="font-bold flex items-center gap-1">
                <MapPin size={16} /> Dirección de retiro:
              </p>
              <p className="mt-1">{SHOP_ADDRESS}</p>
            </div>
          )}
          {orderType === "delivery" && (
            <div className="mt-4 animate-fadeIn">
              <MapPicker
                address={formData.address}
                shopLocation={db.shippingConfig.shopLocation}
                onAddressChange={(val) => {
                  setFormData({ ...formData, address: val });
                  setInvalidFields((p) => p.filter((f) => f !== "address"));
                }}
                onLocationSelect={(coords, dist) => {
                  setDeliveryCoords(coords);
                  setShippingDistance(dist);
                }}
                isInvalid={invalidFields.includes("address")}
              />
              {shippingDistance > 0 && (
                <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-2 rounded text-center">
                  Distancia:{" "}
                  <span className="font-bold">
                    {shippingDistance.toFixed(1)} km
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3">💳 Medio de Pago</h3>
          {paymentOptions.length === 0 ? (
            <p className="text-sm text-red-500 font-bold bg-red-50 p-3 rounded-lg border border-red-200">
              No hay medios de pago disponibles para esta modalidad en este
              momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 mb-4">
              {paymentOptions.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => {
                    setSelectedPaymentId(pm.id);
                    setInvalidFields((p) => p.filter((f) => f !== "payment"));
                  }}
                  className={`text-left px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                    selectedPaymentId === pm.id
                      ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PaymentIcon
                      type={pm.type}
                      size={18}
                      className={
                        selectedPaymentId === pm.id
                          ? "text-red-600"
                          : "text-gray-500"
                      }
                    />
                    {pm.name}
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedPayment && (
            <div className="animate-fadeIn">
              {selectedPayment.details && (
                <div className="bg-blue-100 p-4 rounded-xl text-xl font-black text-blue-900 border-2 border-blue-300 mb-4 whitespace-pre-line text-center shadow-sm">
                  {selectedPayment.details}
                </div>
              )}
              {selectedPayment.type === "cash" && (
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">
                    ¿Con cuánto vas a abonar?
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-bold">$</span>
                    <input
                      type="number"
                      placeholder={`Ej: ${finalTotal + 1000}`}
                      value={cashAmount}
                      onChange={(e) => {
                        setCashAmount(e.target.value);
                        setInvalidFields((p) =>
                          p.filter((f) => f !== "cashAmount")
                        );
                      }}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm outline-none transition-all ${
                        invalidFields.includes("cashAmount")
                          ? "bg-red-50 border border-red-500 ring-1 ring-red-500"
                          : "bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500"
                      }`}
                    />
                  </div>
                  {Number(cashAmount) >= finalTotal && (
                    <div className="mt-3 bg-green-50 text-green-700 p-2 rounded text-sm text-center border border-green-100">
                      <span className="font-bold">Tu vuelto será de:</span>{" "}
                      {formatCurrency(Number(cashAmount) - finalTotal)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <ListOrdered size={18} className="text-red-500" /> Resumen del
            Pedido
          </h3>
          <div className="space-y-2 mb-4 border-b border-gray-100 pb-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-600">
                  {item.quantity}{" "}
                  {item.product.unitType === "peso" ? "kg" : "u"} x{" "}
                  {item.product.name}
                </span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal productos</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            {orderType === "delivery" && (
              <div className="flex justify-between text-gray-600">
                <span>Costo de envío</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-200 mt-2">
              <span>Total a pagar</span>
              <span className="text-[#c82a2a]">
                {formatCurrency(finalTotal)}
              </span>
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
          disabled={paymentOptions.length === 0}
          className="w-full bg-[#25D366] disabled:bg-gray-400 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-green-600 active:scale-95 flex items-center justify-center gap-2"
        >
          Confirmar Pedido <CheckCircle size={20} />
        </button>
      </div>
    </div>
  );
}

function MapPicker({
  address,
  shopLocation,
  onAddressChange,
  onLocationSelect,
  isInvalid,
}) {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState("");
  useEffect(() => {
    loadGoogleMaps(() => setMapLoaded(true));
  }, []);
  const calculateDrivingDistance = (lat, lng) => {
    if (!window.google) return;
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: shopLocation,
        destination: { lat, lng },
        travelMode: "DRIVING",
      },
      (response, status) => {
        if (
          status === "OK" &&
          response.routes[0] &&
          response.routes[0].legs[0]
        ) {
          onLocationSelect(
            { lat, lng },
            response.routes[0].legs[0].distance.value / 1000
          );
          setLocError("");
        } else {
          setLocError(`Calculando distancia en línea recta...`);
          onLocationSelect(
            { lat, lng },
            getDistanceFromLatLonInKm(
              shopLocation.lat,
              shopLocation.lng,
              lat,
              lng
            )
          );
        }
      }
    );
  };
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !inputRef.current) return;
    if (mapInstance.current) return;
    const map = new google.maps.Map(mapRef.current, {
      center: shopLocation,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "cooperative",
    });
    const marker = new google.maps.Marker({
      position: shopLocation,
      map: map,
      draggable: true,
    });
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      calculateDrivingDistance(pos.lat(), pos.lng());
      new google.maps.Geocoder().geocode(
        { location: { lat: pos.lat(), lng: pos.lng() } },
        (results, status) => {
          if (status === "OK" && results[0])
            onAddressChange(results[0].formatted_address);
        }
      );
    });
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "ar" },
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;
      map.setCenter(place.geometry.location);
      map.setZoom(15);
      marker.setPosition(place.geometry.location);
      calculateDrivingDistance(
        place.geometry.location.lat(),
        place.geometry.location.lng()
      );
      onAddressChange(place.formatted_address || place.name);
    });
    mapInstance.current = map;
    markerInstance.current = marker;
  }, [mapLoaded, shopLocation]);
  const handleUseMyLocation = () => {
    setLocError("");
    if (!navigator.geolocation)
      return setLocError("Tu navegador no soporta geolocalización.");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapInstance.current && markerInstance.current) {
          const newLatLng = new window.google.maps.LatLng(lat, lng);
          markerInstance.current.setPosition(newLatLng);
          mapInstance.current.setCenter(newLatLng);
          mapInstance.current.setZoom(15);
          calculateDrivingDistance(lat, lng);
          new window.google.maps.Geocoder().geocode(
            { location: { lat, lng } },
            (results, status) => {
              if (status === "OK" && results[0])
                onAddressChange(results[0].formatted_address);
              else onAddressChange("Ubicación actual en el mapa");
            }
          );
        }
        setIsLocating(false);
      },
      () => {
        setLocError("Permiso denegado. Buscá tu calle manualmente.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  return (
    <div className="mt-4 flex flex-col gap-2 relative">
      {locError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
          {locError}
        </div>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Tu calle y número"
            value={address || ""}
            onChange={(e) => onAddressChange(e.target.value)}
            className={`w-full bg-white rounded-lg pl-10 pr-4 py-3 text-sm z-20 relative transition-all ${
              isInvalid
                ? "border border-red-500 bg-red-50 ring-1 ring-red-500 placeholder-red-400"
                : "border border-gray-300 focus:ring-2 focus:ring-red-500"
            }`}
          />
          <Search
            size={18}
            className={`absolute left-3 top-3.5 z-30 transition-colors ${
              isInvalid ? "text-red-400" : "text-gray-400"
            }`}
          />
        </div>
        <button
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="bg-blue-50 text-blue-600 p-3 rounded-lg border border-blue-100 hover:bg-blue-100 flex-shrink-0"
          title="Usar mi ubicación actual"
        >
          <MapPin size={22} className={isLocating ? "animate-pulse" : ""} />
        </button>
      </div>
      <p className="text-[11px] text-[#c82a2a] font-bold mt-1 leading-tight">
        ⚠️ IMPORTANTE: No borres el nombre de la calle. Si vivís en un barrio,
        poné la Manzana y Casa en las "ACLARACIONES".
      </p>
      <div
        ref={mapRef}
        className="w-full h-48 rounded-lg border border-gray-200 bg-gray-100 relative z-0 mt-1"
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Cargando Mapa...
          </div>
        )}
      </div>
    </div>
  );
}
