const storageKey = 'crm-wialon-prefacturacion-v1'
const serverStateUrl = '/api/state'
const serverUploadUrl = '/api/uploads'
const authMeUrl = '/api/auth/me'
const authLoginUrl = '/api/auth/login'
const authLogoutUrl = '/api/auth/logout'
const authChangePasswordUrl = '/api/auth/change-password'
const authForgotPasswordUrl = '/api/auth/forgot-password'
const authResetPasswordUrl = '/api/auth/reset-password'
const authSetupInfoUrl = '/api/auth/setup-info'
const authSetupTokenUrl = '/api/auth/setup-token'
const authSetupUrl = '/api/auth/setup'
let setupTokenRequestInFlight = false
let setupUserRequestInFlight = false
let resetPasswordRequestInFlight = false
const usersUrl = '/api/users'
const privateFileUrl = '/api/private-file'
const seedFile = 'DispositivosWialon_Abril2026.xlsx'
const paymentSeedFile = 'Klifnet_Admon_Mensual_Pagos.xlsx'
const quoteTemplateFile = 'cotizacion_CalidadSP.xlsx'
const paymentImportVersion = 4
const lineAutoImportVersion = 14
const lineSeedImportVersion = 0
const lineResetVersion = 1
const lineRelationBaseVersion = 25
const standardMonthlyPriceVersion = 2
const quoteDefaultsVersion = 8
const standardMonthlyPrice = 297.36
const standardHardwarePrice = 1152.66
const cityInstallationPrice = 350
const outsideInstallationPrice = 600
const syscomDiscountPercent = 20
const defaultLineClients = ['Bernardo']
const lineTypeOptions = [
  { value: 'emprenet', label: 'Emprenet' },
  { value: 'telcel', label: 'Telcel' },
  { value: 'telcel-prepago', label: 'Telcel prepago' },
  { value: 'telcel-postpago', label: 'Telcel post pago' },
  { value: 'm2m', label: 'M2M' },
  { value: 'emnify', label: 'Emnify' },
  { value: 'wemobile', label: 'WeMobile' }
]
const quoteAttendantOptions = ['Felipe De Jesus Gomez Tirado', 'Isaac Gomez Estrada']
const defaultEquipmentSeller = quoteAttendantOptions[0]
const defaultNewEquipmentSeller = quoteAttendantOptions[1]

const equipmentPageSize = 40
const linePageSize = 40
const tablePageSize = 40
let floatingScrollbarWindowBound = false
let floatingScrollbarActiveWrap = null
let floatingScrollbarSyncing = false
let deviceMatchIndexCache = { devices: null, index: null }
let lineForDeviceIndexCache = { lines: null, devices: null, index: null }

const hardwarePresets = [
  {
    model: 'Ruptela TRACE5',
    supplier: 'Syscom',
    price: 886.66,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/products/197296'
  },
  {
    model: 'Ruptela PRO5LITE',
    supplier: 'Syscom',
    price: 2063.25,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/'
  },
  {
    model: 'Ruptela HCV5',
    supplier: 'Syscom',
    price: 2580.37,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/'
  },
  {
    model: 'Ruptela Eco5 Lite+',
    supplier: 'Syscom',
    price: 826.23,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/'
  },
  {
    model: 'Teltonika FTC927',
    supplier: 'Syscom',
    price: 789.26,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/'
  },
  {
    model: 'Teltonika FMC920',
    supplier: 'Syscom',
    price: 718.9,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/'
  },
  {
    model: 'Teltonika FMC130',
    supplier: 'Syscom',
    price: 851.87,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/'
  }
]

const fuelSensorPresets = [
  {
    model: 'Escort TDBLE1000',
    supplier: 'Syscom',
    price: 2304.6,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/'
  },
  {
    model: 'Escort TD6001000',
    supplier: 'Syscom',
    price: 2266.4,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/'
  }
]

const dashcamPresets = [
  {
    model: 'Streamax XMRDASHCAMADPLUS',
    supplier: 'Syscom',
    price: 5399.18,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/products/198323'
  }
]

const accessoryPresets = [
  {
    id: 'fuel-tdble1000',
    category: 'Sensor combustible',
    model: 'Escort TDBLE1000',
    supplier: 'Syscom',
    price: 2304.6,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/'
  },
  {
    id: 'fuel-td6001000',
    category: 'Sensor combustible',
    model: 'Escort TD6001000',
    supplier: 'Syscom',
    price: 2266.4,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/'
  },
  {
    id: 'dashcam-streamax-adplus',
    category: 'Dashcam',
    model: 'Streamax XMRDASHCAMADPLUS',
    supplier: 'Syscom',
    price: 5399.18,
    discount: 0,
    margin: 30,
    url: 'https://www.syscom.mx/products/198323'
  },
  {
    id: 'camera-extra',
    category: 'Camara adicional',
    model: 'Camara auxiliar',
    supplier: 'Syscom',
    price: 0,
    discount: 0,
    margin: 30,
    url: ''
  },
  {
    id: 'panic-button',
    category: 'Boton de panico',
    model: 'Boton SOS',
    supplier: 'Syscom',
    price: 0,
    discount: 0,
    margin: 30,
    url: ''
  },
  {
    id: 'temperature-sensor',
    category: 'Sensor temperatura',
    model: 'Sensor BLE temperatura',
    supplier: 'Syscom',
    price: 0,
    discount: 0,
    margin: 30,
    url: ''
  },
  {
    id: 'driver-id',
    category: 'Identificacion conductor',
    model: 'Lector / tag conductor',
    supplier: 'Syscom',
    price: 0,
    discount: 0,
    margin: 30,
    url: ''
  }
]

const fieldLabels = {
  unitName: 'Equipo',
  creator: 'Creador',
  company: 'Empresa',
  deviceType: 'Tipo dispositivo',
  deactivatedAt: 'Desactivacion',
  uid: 'UID',
  imei: 'IMEI',
  imeiLong: 'IMEI largo',
  imeiShort: 'IMEI corto',
  phone: 'Telefono',
  lastMessage: 'Ultimo mensaje',
  createdAt: 'Creada',
  groups: 'Grupos',
  customFields: 'Campos personalizados'
}

const fieldOrder = [
  'company',
  'groups',
  'unitName',
  'uid',
  'imei',
  'imeiLong',
  'imeiShort',
  'deviceType',
  'phone',
  'lastMessage',
  'createdAt',
  'deactivatedAt',
  'creator',
  'customFields'
]

const defaultBilling = {
  monthlyPricePerDevice: standardMonthlyPrice,
  annualPricePerDevice: 0,
  ivaRate: 0.16,
  currency: 'MXN',
  concept: 'Servicio mensual de rastreo GPS Wialon',
  periodMode: 'next'
}

const defaultQuote = {
  company: '',
  group: '',
  query: '',
  newCompanyName: '',
  clientName: '',
  attendant: quoteAttendantOptions[0],
  equipmentCount: '',
  billingCycle: 'mensual',
  firstMonthFree: true,
  monthlyPricePerDevice: standardMonthlyPrice,
  annualPricePerDevice: 0,
  lineCount: 0,
  lineBillingCycle: 'anual',
  lineMonthlyPrice: 0,
  lineAnnualPrice: 550,
  lineDescription: 'Linea celular M2M / datos',
  hardwareModel: 'Ruptela TRACE5',
  hardwareSupplier: 'Syscom',
  hardwareSyscomUrl: 'https://www.syscom.mx/products/197296',
  hardwareCostPerDevice: 886.66,
  hardwareDiscountPercent: 0,
  hardwareMarginPercent: 30,
  hardwarePricePerDevice: standardHardwarePrice,
  defaultsVersion: quoteDefaultsVersion,
  fuelSensorCount: '',
  fuelSensorModel: 'Escort TDBLE1000',
  fuelSensorCost: 2304.6,
  fuelSensorDiscountPercent: 0,
  fuelSensorMarginPercent: 30,
  fuelSensorPrice: 2995.98,
  fuelSensorSupplier: 'Syscom',
  fuelSensorUrl: '',
  dashcamCount: '',
  dashcamModel: 'Streamax XMRDASHCAMADPLUS',
  dashcamCost: 5399.18,
  dashcamDiscountPercent: 0,
  dashcamMarginPercent: 30,
  dashcamPrice: 7018.93,
  dashcamSupplier: 'Syscom',
  dashcamUrl: 'https://www.syscom.mx/products/198323',
  accessoryPreset: '',
  accessoryQuantity: 1,
  accessories: [],
  installationZone: 'city',
  installationPricePerDevice: cityInstallationPrice,
  travelFee: 0,
  travelNotes: '',
  setupPricePerDevice: 0,
  equipmentDescription: 'Equipos GPS / servicio de rastreo',
  ivaRate: 0.16,
  currency: 'MXN',
  validityDays: 15,
  notes: 'Precios sujetos a validacion final de inventario y condiciones comerciales.'
}

const defaultNewLine = {
  company: '',
  phone: '',
  lineType: 'emprenet',
  iccid: '',
  imei: '',
  carrier: '',
  plan: '',
  status: 'activa',
  billingCycle: 'anual',
  renewalDate: '',
  annualPrice: '550',
  soldBy: defaultNewEquipmentSeller,
  clientOnly: false,
  notes: ''
}

const state = {
  view: 'resumen',
  rawRows: [],
  columns: [],
  mapping: {},
  devices: [],
  lines: [],
  standardMonthlyPriceVersion: 0,
  companyMeta: {},
  billing: { ...defaultBilling },
  billingRows: [],
  paymentImport: null,
  lineImport: null,
  lineSeedImportVersion: 0,
  lineResetVersion: 0,
  quote: { ...defaultQuote },
  newDevice: {
    company: '',
    groups: '',
    unitName: '',
    uid: '',
    imei: '',
    imeiLong: '',
    imeiShort: '',
    deviceType: '',
    phone: '',
    soldBy: defaultNewEquipmentSeller,
    agreedPrice: '',
    saleDate: '',
    priceNote: ''
  },
  newLine: { ...defaultNewLine },
  query: '',
  equipmentCompanyFilter: '',
  equipmentCycleFilter: '',
  equipmentPage: 1,
  companyPage: 1,
  cobrosCompany: '',
  cobrosGroup: '',
  cobrosCycleFilter: '',
  cobrosPage: 1,
  billingCompany: '',
  billingGroup: '',
  billingQuery: '',
  billingPage: 1,
  lineQuery: '',
  lineIccQuery: '',
  lineStatusFilter: '',
  lineMatchFilter: '',
  lineTypeFilter: '',
  linePage: 1,
  lineRelationBaseVersion: 0,
  auth: { loading: true, dataLoading: false, setupRequired: false, allowedEmails: [], user: null, users: [] },
  login: {
    email: '',
    password: '',
    forgotEmail: '',
    resetEmail: '',
    resetToken: '',
    resetPassword: '',
    currentPassword: '',
    accountNewPassword: '',
    name: '',
    newEmail: '',
    newPassword: '',
    newRole: 'usuario',
    setupName: '',
    setupEmail: '',
    setupPassword: '',
    setupToken: ''
  },
  apiLog: [],
  sourceLabel: '',
  lastImportAt: '',
  selectedCompany: '',
  notice: ''
}

let serverSaveTimer = null
let currentServerUpdatedAt = ''
let applyingServerState = false
let serverPollTimer = null
let searchRenderTimer = null

function renderPreservingInput(selector, delay = 550) {
  clearTimeout(searchRenderTimer)
  const active = document.activeElement
  const activeId = active?.id || ''
  const start = typeof active?.selectionStart === 'number' ? active.selectionStart : null
  const end = typeof active?.selectionEnd === 'number' ? active.selectionEnd : null
  searchRenderTimer = setTimeout(() => {
    render()
    const next = activeId ? document.getElementById(activeId) : selector ? document.querySelector(selector) : null
    if (next && document.contains(next)) {
      next.focus()
      if (typeof next.setSelectionRange === 'function' && start !== null && end !== null) {
        const length = String(next.value || '').length
        next.setSelectionRange(Math.min(start, length), Math.min(end, length))
      }
    }
  }, delay)
}

function normalizeHeader(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function attr(value) {
  return esc(value)
}

function textValue(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function importTextValue(value) {
  const text = textValue(value)
  return text.replace(/^[`'´]+/, '').replace(/[`´]/g, '').trim()
}

function unique(values) {
  return Array.from(new Set(values.map((value) => textValue(value)).filter(Boolean)))
}

function expandScientificText(value) {
  const raw = importTextValue(value)
  const match = raw.match(/^([+-]?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/)
  if (!match) return raw
  const [, sign, integer, fraction = '', exponentText] = match
  const exponent = Number(exponentText)
  if (!Number.isFinite(exponent)) return raw
  const digits = `${integer}${fraction}`
  const decimalIndex = integer.length + exponent
  if (decimalIndex <= 0) return `${sign}0.${'0'.repeat(Math.abs(decimalIndex))}${digits}`.replace(/\.?0+$/, '')
  if (decimalIndex >= digits.length) return `${sign}${digits}${'0'.repeat(decimalIndex - digits.length)}`
  return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`.replace(/\.?0+$/, '')
}

function normalizeIdentifierText(value) {
  return expandScientificText(value)
    .replace(/^[`'\u00b4]+/, '')
    .replace(/\u00a0/g, '')
    .replace(/\s+/g, '')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/[^\dA-Za-z+.-]/g, '')
    .replace(/\.0+$/, '')
}

function normalizeSeller(value, fallback = defaultEquipmentSeller) {
  const clean = textValue(value)
  return quoteAttendantOptions.includes(clean) ? clean : fallback
}

function sellerSelectOptions(selectedValue) {
  const selected = normalizeSeller(selectedValue)
  return quoteAttendantOptions.map((name) => `<option value="${attr(name)}" ${selected === name ? 'selected' : ''}>${esc(name)}</option>`).join('')
}

function splitGroups(value) {
  return unique(String(value || '').split(/[,;|]/g))
}

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function slug(value) {
  return normalizeHeader(value).replace(/\s+/g, '-')
}

function icon(name) {
  return `<i data-lucide="${name}"></i>`
}

function normalizeIdentifier(value) {
  return normalizeHeader(normalizeIdentifierText(value) || value).replace(/\s+/g, '')
}

function deriveShortImei(value) {
  const clean = textValue(value).replace(/\D/g, '')
  if (!clean) return ''
  return clean.length > 6 ? clean.slice(-6) : clean
}

function deriveImeiSuffix(value, length) {
  const clean = textValue(value).replace(/\D/g, '')
  if (!clean || clean.length < length) return ''
  return clean.slice(-length)
}

function isDerivedShortIdentifier(value, source) {
  const cleanValue = textValue(value).replace(/\D/g, '')
  const cleanSource = textValue(source).replace(/\D/g, '')
  return Boolean(cleanValue && cleanSource.length > cleanValue.length && cleanValue === deriveShortImei(cleanSource))
}

function deviceImeiLong(device) {
  return textValue(device.imeiLong || device.imei)
}

function deviceImeiShort(device) {
  return textValue(device.imeiShort) || deriveShortImei(deviceImeiLong(device))
}

function deviceIdentifierValues(device) {
  return unique([device.uid, device.imei, device.imeiLong, device.imeiShort, deviceImeiLong(device), deviceImeiShort(device)])
}

function deviceText(device) {
  return normalizeHeader(
    `${device?.deviceType || ''} ${device?.unitName || ''} ${Array.isArray(device?.groups) ? device.groups.join(' ') : device?.groups || ''}`
  )
}

function deviceIdentifierKeys(device) {
  const keys = deviceIdentifierValues(device).map(normalizeIdentifier).filter(Boolean)
  if (keys.length) return unique(keys.map((key) => `device:${key}`))
  return [`unit:${normalizeHeader(`${device.company}-${device.unitName}-${device.deviceType}`)}`]
}

function deviceKey(device) {
  return deviceIdentifierKeys(device)[0]
}

function deviceMatchesIdentifier(device, identifier) {
  const clean = normalizeIdentifier(identifier)
  return Boolean(clean && deviceIdentifierValues(device).some((value) => normalizeIdentifier(value) === clean))
}

function devicesShareIdentifier(firstDevice, secondDevice) {
  const firstKeys = new Set(deviceIdentifierKeys(firstDevice))
  return deviceIdentifierKeys(secondDevice).some((key) => firstKeys.has(key))
}

function normalizeDeviceIdentifiers(device) {
  const uid = importTextValue(device.uid)
  const rawImei = importTextValue(device.imei)
  const rawImeiLong = importTextValue(device.imeiLong)
  const imeiLong =
    rawImeiLong && !isDerivedShortIdentifier(rawImeiLong, uid)
      ? rawImeiLong
      : rawImei && !isDerivedShortIdentifier(rawImei, uid)
        ? rawImei
        : uid || rawImeiLong || rawImei
  const imeiShort = importTextValue(device.imeiShort) || deriveShortImei(imeiLong || rawImei || uid)
  const mainImei = rawImei && !isDerivedShortIdentifier(rawImei, uid) ? rawImei : imeiLong || uid || imeiShort
  return {
    ...device,
    uid: uid || mainImei,
    imei: mainImei || uid,
    imeiLong: imeiLong || mainImei || uid,
    imeiShort,
    lineIccid: importTextValue(device.lineIccid || device.iccid),
    lineOperator: importTextValue(device.lineOperator),
    lineCarrier: importTextValue(device.lineCarrier),
    linePhone: importTextValue(device.linePhone),
    lineMatchSource: importTextValue(device.lineMatchSource),
    soldBy: normalizeSeller(device.soldBy || device.seller || device.vendedor, defaultEquipmentSeller)
  }
}

function createManualDevice() {
  const draft = state.newDevice
  const company = textValue(draft.company)
  const unitName = textValue(draft.unitName)
  const identifier = textValue(draft.imeiLong || draft.imei || draft.imeiShort || draft.uid)

  if (!company || !unitName || !identifier) {
    setState({ notice: 'Para agregar equipo captura empresa, nombre del equipo y UID, IMEI largo o IMEI corto.', view: 'equipos' })
    return
  }

  const device = normalizeDeviceIdentifiers({
    id: '',
    unitName,
    creator: 'Manual',
    company,
    deviceType: textValue(draft.deviceType) || 'Manual',
    deactivatedAt: '',
    uid: importTextValue(draft.uid),
    imei: importTextValue(draft.imei),
    imeiLong: importTextValue(draft.imeiLong || draft.imei),
    imeiShort: importTextValue(draft.imeiShort) || deriveShortImei(draft.imeiLong || draft.imei),
    phone: importTextValue(draft.phone),
    soldBy: normalizeSeller(draft.soldBy, defaultNewEquipmentSeller),
    lastMessage: '',
    createdAt: new Date().toISOString().slice(0, 10),
    groups: splitGroups(draft.groups),
    customFields: '',
    billingCycle: 'mensual',
    annualMonth: String(new Date().getMonth() + 1),
    renewalDate: '',
    agreedPrice: textValue(draft.agreedPrice) || standardMonthlyPriceText(),
    saleDate: textValue(draft.saleDate),
    priceNote: textValue(draft.priceNote),
    recordState: 'manual',
    source: 'manual'
  })
  device.id = `${deviceKey(device)}-${Date.now()}`

  const existing = state.devices.some((current) => devicesShareIdentifier(current, device))
  if (existing) {
    setState({ notice: 'Ya existe un equipo con ese UID, IMEI largo o IMEI corto.', view: 'equipos' })
    return
  }

  setState({
    devices: [...state.devices, device],
    companyMeta: {
      ...state.companyMeta,
      [company]: { ...blankMeta(company), ...(state.companyMeta[company] || {}) }
    },
    newDevice: {
      company: '',
      groups: '',
      unitName: '',
      uid: '',
      imei: '',
      imeiLong: '',
      imeiShort: '',
      deviceType: '',
      phone: '',
      soldBy: defaultNewEquipmentSeller,
      agreedPrice: '',
      saleDate: '',
      priceNote: ''
    },
    notice: `Equipo agregado: ${unitName}`,
    view: 'equipos'
  })
}

function isBillableDevice(device) {
  return device.recordState !== 'no_encontrado' && !device.deactivatedAt
}

function isImportedWialonDevice(device) {
  return device.source !== 'manual'
}

function normalizeCycle(value, paymentsCount = '') {
  const clean = normalizeHeader(value)
  const count = Number(paymentsCount || 0)
  if (clean.includes('semestral') || count === 2) return 'semestral'
  if (clean.includes('anual') || count === 1) return 'anual'
  return 'mensual'
}

function monthName(monthNumber) {
  const month = Number(monthNumber || 1)
  return monthNames[Math.max(0, Math.min(11, month - 1))]
}

const monthAliasMap = {
  ene: 0,
  enero: 0,
  feb: 1,
  febrero: 1,
  mar: 2,
  mzo: 2,
  marzo: 2,
  abr: 3,
  abri: 3,
  abril: 3,
  may: 4,
  mayo: 4,
  jun: 5,
  junio: 5,
  jul: 6,
  julio: 6,
  ago: 7,
  agosto: 7,
  sep: 8,
  sept: 8,
  septiembre: 8,
  oct: 9,
  octubre: 9,
  nov: 10,
  noviembre: 10,
  dic: 11,
  diciembre: 11
}

function monthIndexFromText(value) {
  const clean = normalizeHeader(value).replace(/\s+/g, '')
  if (!clean) return -1
  if (monthAliasMap[clean] !== undefined) return monthAliasMap[clean]
  const alias = Object.keys(monthAliasMap).find((key) => clean.startsWith(key) || key.startsWith(clean))
  return alias ? monthAliasMap[alias] : -1
}

function parseAmount(value) {
  const clean = String(value ?? '').replace(/[$,\s]/g, '')
  const number = Number(clean)
  return Number.isFinite(number) ? number : 0
}

function parsePaymentMonths(value) {
  const parts = Array.isArray(value) ? value : String(value || '').split(/[,;|]/g)
  return unique(
    parts.map((part) => {
      const clean = normalizeHeader(part)
      const numeric = Number(clean)
      if (numeric >= 1 && numeric <= 12) return String(numeric)
      const index = monthNames.findIndex((month) => normalizeHeader(month) === clean)
      return index >= 0 ? String(index + 1) : ''
    })
  )
}

function formatPaymentMonths(months = []) {
  return unique(parsePaymentMonths(months).map((month) => monthName(month))).join(', ')
}

function blankMeta(company) {
  return {
    legalName: company,
    rfc: '',
    email: '',
    billingCycle: 'mensual',
    annualMonth: String(new Date().getMonth() + 1),
    contact: '',
    notes: ''
  }
}

function getCompanyMeta(company) {
  return { ...blankMeta(company), ...(state.companyMeta[company] || {}) }
}

function money(value, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(Number(value || 0))
}

function standardMonthlyPriceText() {
  return standardMonthlyPrice.toFixed(2)
}

function isLegacyStandardMonthlyPrice(value) {
  const price = Number(value)
  return Number.isFinite(price) && (Math.abs(price - 297) < 0.005 || Math.abs(price - 297.5) < 0.005)
}

function normalizeStandardMonthlyPriceValue(value) {
  return isLegacyStandardMonthlyPrice(value) ? standardMonthlyPriceText() : value
}

function installationPriceForZone(zone) {
  return zone === 'outside' ? outsideInstallationPrice : cityInstallationPrice
}

function roundCurrency(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100
}

function syscomNetCost(priceValue, discountValue = syscomDiscountPercent) {
  const price = Number(priceValue || 0)
  const discount = Number(discountValue ?? syscomDiscountPercent)
  if (price <= 0) return 0
  return roundCurrency(price * (1 - discount / 100))
}

function salePriceFromSyscom(priceValue, discountValue, marginValue, fallbackValue = 0) {
  const netCost = syscomNetCost(priceValue, discountValue)
  const margin = Number(marginValue ?? 30)
  if (netCost > 0) return roundCurrency(netCost * (1 + margin / 100))
  return Number(fallbackValue || 0)
}

function hardwareSalePriceFromQuote(quote) {
  const explicitPrice = Number(quote.hardwarePricePerDevice || 0)
  if (explicitPrice > 0) return explicitPrice
  const salePrice = salePriceFromSyscom(quote.hardwareCostPerDevice, quote.hardwareDiscountPercent, quote.hardwareMarginPercent, quote.hardwarePricePerDevice)
  if (salePrice > 0) return salePrice
  return Number(quote.hardwarePricePerDevice || standardHardwarePrice)
}

function hardwarePresetOptions(selectedModel) {
  return hardwarePresets
    .map((preset) => `<option value="${attr(preset.model)}" ${selectedModel === preset.model ? 'selected' : ''}>${esc(preset.model)}</option>`)
    .join('')
}

function applyHardwarePreset(model, baseQuote = state.quote) {
  const preset = hardwarePresets.find((item) => item.model === model)
  if (!preset) return { hardwareModel: model }
  const nextQuote = {
    ...baseQuote,
    hardwareModel: preset.model,
    hardwareSupplier: preset.supplier,
    hardwareSyscomUrl: preset.url,
    hardwareCostPerDevice: preset.price,
    hardwareDiscountPercent: preset.discount,
    hardwareMarginPercent: preset.margin
  }
  return {
    ...nextQuote,
    hardwarePricePerDevice: salePriceFromSyscom(nextQuote.hardwareCostPerDevice, nextQuote.hardwareDiscountPercent, nextQuote.hardwareMarginPercent, standardHardwarePrice)
  }
}

function sensorPresetOptions(selectedModel) {
  return fuelSensorPresets
    .map((preset) => `<option value="${attr(preset.model)}" ${selectedModel === preset.model ? 'selected' : ''}>${esc(preset.model)}</option>`)
    .join('')
}

function applyFuelSensorPreset(model, baseQuote = state.quote) {
  const preset = fuelSensorPresets.find((item) => item.model === model)
  if (!preset) return { fuelSensorModel: model }
  const nextQuote = {
    ...baseQuote,
    fuelSensorModel: preset.model,
    fuelSensorSupplier: preset.supplier,
    fuelSensorUrl: preset.url,
    fuelSensorCost: preset.price,
    fuelSensorDiscountPercent: preset.discount,
    fuelSensorMarginPercent: preset.margin
  }
  return {
    ...nextQuote,
    fuelSensorPrice: salePriceFromSyscom(nextQuote.fuelSensorCost, nextQuote.fuelSensorDiscountPercent, nextQuote.fuelSensorMarginPercent, nextQuote.fuelSensorPrice)
  }
}

function dashcamPresetOptions(selectedModel) {
  return dashcamPresets
    .map((preset) => `<option value="${attr(preset.model)}" ${selectedModel === preset.model ? 'selected' : ''}>${esc(preset.model)}</option>`)
    .join('')
}

function applyDashcamPreset(model, baseQuote = state.quote) {
  const preset = dashcamPresets.find((item) => item.model === model)
  if (!preset) return { dashcamModel: model }
  const nextQuote = {
    ...baseQuote,
    dashcamModel: preset.model,
    dashcamSupplier: preset.supplier,
    dashcamUrl: preset.url,
    dashcamCost: preset.price,
    dashcamDiscountPercent: preset.discount,
    dashcamMarginPercent: preset.margin
  }
  return {
    ...nextQuote,
    dashcamPrice: salePriceFromSyscom(nextQuote.dashcamCost, nextQuote.dashcamDiscountPercent, nextQuote.dashcamMarginPercent, nextQuote.dashcamPrice)
  }
}

function accessoryPresetOptions(selectedId) {
  return accessoryPresets
    .map((preset) => `<option value="${attr(preset.id)}" ${selectedId === preset.id ? 'selected' : ''}>${esc(preset.category)} - ${esc(preset.model)}</option>`)
    .join('')
}

function createAccessoryId(accessory = {}, index = 0) {
  const raw = `${accessory.category || 'accesorio'}-${accessory.model || accessory.name || index}`
  return `acc-${slug(raw) || index}-${index}`
}

function normalizeQuoteAccessory(accessory = {}, index = 0) {
  const category = textValue(accessory.category) || 'Accesorio'
  const model = textValue(accessory.model || accessory.name) || 'Accesorio personalizado'
  const cost = Number(accessory.cost ?? accessory.syscomPrice ?? accessory.price ?? 0) || 0
  const discount = Number(accessory.discount ?? accessory.discountPercent ?? 0) || 0
  const margin = Number(accessory.margin ?? accessory.marginPercent ?? 30) || 0
  const explicitUnitPrice = Number(accessory.unitPrice ?? accessory.salePrice ?? accessory.pricePerUnit ?? 0) || 0
  const unitPrice = explicitUnitPrice > 0 ? explicitUnitPrice : salePriceFromSyscom(cost, discount, margin, 0)
  const quantity = Number(accessory.quantity ?? accessory.count ?? 0) || 0
  return {
    id: textValue(accessory.id) || createAccessoryId(accessory, index),
    category,
    model,
    supplier: textValue(accessory.supplier) || 'Syscom',
    quantity,
    cost,
    discount,
    margin,
    unitPrice,
    url: textValue(accessory.url),
    notes: textValue(accessory.notes)
  }
}

function legacyAccessoriesFromQuote(quote) {
  const accessories = []
  if (Number(quote.fuelSensorCount || 0) > 0) {
    accessories.push({
      id: 'legacy-fuel-sensor',
      category: 'Sensor combustible',
      model: quote.fuelSensorModel || 'Sensor combustible',
      supplier: quote.fuelSensorSupplier || 'Syscom',
      quantity: Number(quote.fuelSensorCount || 0),
      cost: Number(quote.fuelSensorCost || 0),
      discount: Number(quote.fuelSensorDiscountPercent ?? 0),
      margin: Number(quote.fuelSensorMarginPercent ?? 30),
      unitPrice: accessorySalePrice(quote.fuelSensorCost, quote.fuelSensorDiscountPercent, quote.fuelSensorMarginPercent, quote.fuelSensorPrice),
      url: quote.fuelSensorUrl || '',
      notes: ''
    })
  }
  if (Number(quote.dashcamCount || 0) > 0) {
    accessories.push({
      id: 'legacy-dashcam',
      category: 'Dashcam',
      model: quote.dashcamModel || 'Dashcam vehicular',
      supplier: quote.dashcamSupplier || 'Syscom',
      quantity: Number(quote.dashcamCount || 0),
      cost: Number(quote.dashcamCost || 0),
      discount: Number(quote.dashcamDiscountPercent ?? 0),
      margin: Number(quote.dashcamMarginPercent ?? 30),
      unitPrice: accessorySalePrice(quote.dashcamCost, quote.dashcamDiscountPercent, quote.dashcamMarginPercent, quote.dashcamPrice),
      url: quote.dashcamUrl || '',
      notes: ''
    })
  }
  return accessories
}

function normalizedQuoteAccessories(quote) {
  const explicitAccessories = Array.isArray(quote.accessories) ? quote.accessories : []
  const source = explicitAccessories.length ? explicitAccessories : legacyAccessoriesFromQuote(quote)
  return source.map(normalizeQuoteAccessory)
}

function accessoryFromPreset(presetId, quantity = 1) {
  const preset = accessoryPresets.find((item) => item.id === presetId)
  if (!preset) {
    return normalizeQuoteAccessory({
      id: `acc-custom-${Date.now()}`,
      category: 'Accesorio',
      model: 'Accesorio personalizado',
      supplier: '',
      quantity,
      cost: 0,
      discount: 0,
      margin: 30,
      unitPrice: 0,
      url: '',
      notes: ''
    })
  }
  return normalizeQuoteAccessory({
    id: `acc-${preset.id}-${Date.now()}`,
    category: preset.category,
    model: preset.model,
    supplier: preset.supplier,
    quantity,
    cost: preset.price,
    discount: preset.discount,
    margin: preset.margin,
    unitPrice: salePriceFromSyscom(preset.price, preset.discount, preset.margin, 0),
    url: preset.url,
    notes: ''
  })
}

function normalizeQuoteDefaults(parsedQuote = {}) {
  const shouldApplyNewHardwareDefault =
    parsedQuote.defaultsVersion !== quoteDefaultsVersion &&
    (normalizeHeader(parsedQuote.hardwareModel) === 'ruptela pro5lite' || Number(parsedQuote.hardwareCostPerDevice || 0) === 2063.25)
  const shouldApplySensorDefault =
    parsedQuote.defaultsVersion !== quoteDefaultsVersion &&
    (!parsedQuote.fuelSensorModel || normalizeHeader(parsedQuote.fuelSensorModel) === 'escort tdble1000')
  const shouldApplyDashcamDefault =
    parsedQuote.defaultsVersion !== quoteDefaultsVersion &&
    (!parsedQuote.dashcamModel || normalizeHeader(parsedQuote.dashcamModel) === 'streamax xmrdashcamadplus')
  let baseQuote = { ...parsedQuote }
  if (shouldApplyNewHardwareDefault) baseQuote = applyHardwarePreset('Ruptela TRACE5', baseQuote)
  if (shouldApplySensorDefault) baseQuote = applyFuelSensorPreset('Escort TDBLE1000', baseQuote)
  if (shouldApplyDashcamDefault) baseQuote = applyDashcamPreset('Streamax XMRDASHCAMADPLUS', baseQuote)
  const accessories = normalizedQuoteAccessories(baseQuote)
  const migratedFromOlderQuote = parsedQuote.defaultsVersion !== quoteDefaultsVersion
  return {
    ...defaultQuote,
    ...baseQuote,
    defaultsVersion: quoteDefaultsVersion,
    accessoryPreset: migratedFromOlderQuote && !accessories.length ? defaultQuote.accessoryPreset : baseQuote.accessoryPreset || defaultQuote.accessoryPreset,
    accessoryQuantity: Number(baseQuote.accessoryQuantity ?? defaultQuote.accessoryQuantity) || defaultQuote.accessoryQuantity,
    accessories,
    firstMonthFree: baseQuote.firstMonthFree !== false,
    monthlyPricePerDevice: Number(baseQuote.monthlyPricePerDevice ?? defaultQuote.monthlyPricePerDevice) || defaultQuote.monthlyPricePerDevice,
    lineCount: Number(baseQuote.lineCount ?? defaultQuote.lineCount) || 0,
    lineBillingCycle: normalizeCycle(baseQuote.lineBillingCycle || defaultQuote.lineBillingCycle),
    lineMonthlyPrice: Number(baseQuote.lineMonthlyPrice ?? defaultQuote.lineMonthlyPrice) || 0,
    lineAnnualPrice: Number(baseQuote.lineAnnualPrice ?? defaultQuote.lineAnnualPrice) || defaultQuote.lineAnnualPrice,
    lineDescription: baseQuote.lineDescription || defaultQuote.lineDescription,
    hardwareModel:
      Number(baseQuote.hardwareCostPerDevice || 0) > 0 ? baseQuote.hardwareModel || defaultQuote.hardwareModel : defaultQuote.hardwareModel,
    hardwareSupplier: baseQuote.hardwareSupplier || defaultQuote.hardwareSupplier,
    hardwareSyscomUrl: baseQuote.hardwareSyscomUrl || defaultQuote.hardwareSyscomUrl,
    hardwareCostPerDevice: Number(baseQuote.hardwareCostPerDevice || 0) > 0 ? baseQuote.hardwareCostPerDevice : defaultQuote.hardwareCostPerDevice,
    hardwareDiscountPercent:
      Number(baseQuote.hardwareCostPerDevice || 0) > 0
        ? Number(baseQuote.hardwareDiscountPercent ?? defaultQuote.hardwareDiscountPercent) || 0
        : defaultQuote.hardwareDiscountPercent,
    hardwareMarginPercent: Number(baseQuote.hardwareMarginPercent ?? defaultQuote.hardwareMarginPercent) || defaultQuote.hardwareMarginPercent,
    hardwarePricePerDevice:
      Number(baseQuote.hardwareCostPerDevice || 0) > 0
        ? Number(baseQuote.hardwarePricePerDevice ?? defaultQuote.hardwarePricePerDevice) || defaultQuote.hardwarePricePerDevice
        : defaultQuote.hardwarePricePerDevice,
    fuelSensorCount: baseQuote.fuelSensorCount ?? '',
    fuelSensorModel: baseQuote.fuelSensorModel || defaultQuote.fuelSensorModel,
    fuelSensorCost: Number(baseQuote.fuelSensorCost || 0) > 0 ? baseQuote.fuelSensorCost : defaultQuote.fuelSensorCost,
    fuelSensorDiscountPercent: Number(baseQuote.fuelSensorDiscountPercent ?? defaultQuote.fuelSensorDiscountPercent) || defaultQuote.fuelSensorDiscountPercent,
    fuelSensorMarginPercent: Number(baseQuote.fuelSensorMarginPercent ?? defaultQuote.fuelSensorMarginPercent) || defaultQuote.fuelSensorMarginPercent,
    fuelSensorPrice: Number(baseQuote.fuelSensorCost || 0) > 0 ? baseQuote.fuelSensorPrice ?? '' : defaultQuote.fuelSensorPrice,
    fuelSensorSupplier: baseQuote.fuelSensorSupplier || defaultQuote.fuelSensorSupplier,
    fuelSensorUrl: baseQuote.fuelSensorUrl || '',
    dashcamCount: baseQuote.dashcamCount ?? '',
    dashcamModel: baseQuote.dashcamModel || defaultQuote.dashcamModel,
    dashcamCost: Number(baseQuote.dashcamCost || 0) > 0 ? baseQuote.dashcamCost : defaultQuote.dashcamCost,
    dashcamDiscountPercent:
      Number(baseQuote.dashcamCost || 0) > 0 ? Number(baseQuote.dashcamDiscountPercent ?? defaultQuote.dashcamDiscountPercent) || 0 : defaultQuote.dashcamDiscountPercent,
    dashcamMarginPercent: Number(baseQuote.dashcamMarginPercent ?? defaultQuote.dashcamMarginPercent) || defaultQuote.dashcamMarginPercent,
    dashcamPrice: Number(baseQuote.dashcamCost || 0) > 0 ? baseQuote.dashcamPrice ?? '' : defaultQuote.dashcamPrice,
    dashcamSupplier: baseQuote.dashcamSupplier || defaultQuote.dashcamSupplier,
    dashcamUrl: baseQuote.dashcamUrl || defaultQuote.dashcamUrl,
    installationZone: baseQuote.installationZone || defaultQuote.installationZone,
    installationPricePerDevice:
      Number(baseQuote.installationPricePerDevice ?? baseQuote.setupPricePerDevice ?? installationPriceForZone(baseQuote.installationZone)) ||
      installationPriceForZone(baseQuote.installationZone),
    travelFee: Number(baseQuote.travelFee ?? defaultQuote.travelFee) || 0,
    travelNotes: baseQuote.travelNotes || ''
  }
}

function accessorySalePrice(costValue, discountValue, marginValue, fallbackValue = 0) {
  const explicitPrice = Number(fallbackValue || 0)
  if (explicitPrice > 0) return explicitPrice
  return salePriceFromSyscom(costValue, discountValue, marginValue, fallbackValue)
}

function quoteAccessoryRows(quote) {
  return normalizedQuoteAccessories(quote)
    .map((row) => ({
      ...row,
      key: row.id,
      label: `${row.category}${row.model ? ` - ${row.model}` : ''}`,
      syscomPrice: row.cost,
      netCost: syscomNetCost(row.cost, row.discount),
      unitPrice: accessorySalePrice(row.cost, row.discount, row.margin, row.unitPrice),
      subtotal: row.quantity * accessorySalePrice(row.cost, row.discount, row.margin, row.unitPrice)
    }))
    .filter((row) => row.quantity > 0 && row.unitPrice > 0)
}

function deviceAgreedPriceValue(device) {
  const agreedPrice = device.agreedPrice ?? device.pricePerDeviceOverride
  if (Number(agreedPrice) > 0) return String(normalizeStandardMonthlyPriceValue(agreedPrice))
  return deviceBillingCycle(device) === 'mensual' ? standardMonthlyPriceText() : ''
}

function escapeCsv(value) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function stateSnapshot() {
  return {
    rawRows: state.rawRows,
    columns: state.columns,
    mapping: state.mapping,
    devices: state.devices,
    lines: state.lines,
    standardMonthlyPriceVersion: state.standardMonthlyPriceVersion,
    companyMeta: state.companyMeta,
    billing: state.billing,
    billingRows: state.billingRows,
    paymentImport: state.paymentImport,
    lineImport: state.lineImport,
    lineSeedImportVersion: state.lineSeedImportVersion,
    lineResetVersion: state.lineResetVersion,
    lineQuery: state.lineQuery,
    lineIccQuery: state.lineIccQuery,
    lineStatusFilter: state.lineStatusFilter,
    lineMatchFilter: state.lineMatchFilter,
    lineTypeFilter: state.lineTypeFilter,
    linePage: state.linePage,
    lineRelationBaseVersion: state.lineRelationBaseVersion,
    quote: state.quote,
    newDevice: state.newDevice,
    newLine: state.newLine,
    sourceLabel: state.sourceLabel,
    lastImportAt: state.lastImportAt,
    equipmentCompanyFilter: state.equipmentCompanyFilter,
    equipmentCycleFilter: state.equipmentCycleFilter,
    equipmentPage: state.equipmentPage,
    companyPage: state.companyPage,
    cobrosPage: state.cobrosPage,
    billingPage: state.billingPage
  }
}

async function saveStateToServer(snapshot) {
  try {
    const response = await fetch(serverStateUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: snapshot })
    })
    if (!response.ok) throw new Error('No se pudo guardar en servidor.')
    const result = await response.json()
    currentServerUpdatedAt = result.updatedAt || currentServerUpdatedAt
    return true
  } catch (error) {
    console.warn(error)
    return false
  }
}

function scheduleServerStateSave(snapshot) {
  if (applyingServerState) return
  clearTimeout(serverSaveTimer)
  serverSaveTimer = setTimeout(() => {
    serverSaveTimer = null
    saveStateToServer(snapshot)
  }, 700)
}

function persistState(options = {}) {
  const snapshot = stateSnapshot()
  if (!options.localOnly) scheduleServerStateSave(snapshot)
}

async function saveChangesNow() {
  clearTimeout(serverSaveTimer)
  serverSaveTimer = null
  const snapshot = stateSnapshot()
  const saved = await saveStateToServer(snapshot)
  state.notice = saved ? 'Cambios guardados en el servidor cifrado.' : 'No se pudo conectar al servidor para guardar.'
  render()
}

function setState(patch, shouldRender = true) {
  Object.assign(state, patch)
  persistState()
  if (shouldRender) render()
}

async function fetchPrivateFile(kind) {
  const response = await fetch(`${privateFileUrl}?kind=${encodeURIComponent(kind)}`, { cache: 'no-store' })
  if (!response.ok) {
    let detail = ''
    try {
      detail = (await response.json()).error || ''
    } catch {
      detail = ''
    }
    throw new Error(detail || `No se pudo abrir la base privada: ${kind}.`)
  }
  return response.arrayBuffer()
}

async function fetchPrivateJson(kind) {
  const buffer = await fetchPrivateFile(kind)
  const text = new TextDecoder().decode(buffer)
  return JSON.parse(text)
}

async function savePrivateJson(kind, payload) {
  const text = JSON.stringify(payload, null, 2)
  const bytes = new TextEncoder().encode(text)
  const response = await fetch(privateFileUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind,
      dataBase64: arrayBufferToBase64(bytes.buffer)
    })
  })
  if (!response.ok) throw new Error('No se pudo guardar la base privada cifrada.')
  return response.json()
}

async function apiJson(url, options = {}) {
  const method = options.method || 'GET'
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
  const result = await response.json().catch(() => ({}))
  pushApiLog({
    method,
    url,
    status: response.status,
    ok: response.ok && result.ok !== false,
    message: result.message || result.error || (result.delivered ? 'Token enviado' : ''),
    detail: [result.smtpError, result.tokenPath, result.fallback].filter(Boolean).join(' | ')
  })
  if (!response.ok || result.ok === false) throw new Error(result.error || 'No se pudo completar la operacion.')
  return result
}

function syncLoginFieldsFromDom() {
  document.querySelectorAll('[data-login]').forEach((input) => {
    state.login = { ...state.login, [input.dataset.login]: input.value }
  })
}

function pushApiLog(entry) {
  const cleanUrl = String(entry.url || '').replace(/\?.*$/, '')
  state.apiLog = [
    {
      time: new Date().toLocaleTimeString('es-MX', { hour12: false }),
      method: entry.method || 'GET',
      url: cleanUrl,
      status: entry.status || '',
      ok: Boolean(entry.ok),
      message: entry.message || '',
      detail: entry.detail || ''
    },
    ...state.apiLog
  ].slice(0, 8)
}

async function refreshAuth() {
  try {
    const result = await apiJson(authMeUrl, { method: 'GET' })
    state.auth = {
      ...state.auth,
      loading: false,
      dataLoading: false,
      setupRequired: Boolean(result.setupRequired),
      allowedEmails: result.allowedEmails || state.auth.allowedEmails || [],
      user: result.user || null,
      users: result.users || []
    }
    return Boolean(result.user)
  } catch (error) {
    state.auth = { ...state.auth, loading: false, dataLoading: false, user: null, users: [] }
    return false
  }
}

async function loginUser() {
  syncLoginFieldsFromDom()
  try {
    state.notice = 'Validando acceso...'
    render()
    const result = await apiJson(authLoginUrl, {
      method: 'POST',
      body: JSON.stringify({ email: state.login.email, password: state.login.password })
    })
    state.auth = { ...state.auth, loading: false, dataLoading: true, user: result.user || null, users: result.users || [] }
    state.login = { ...state.login, password: '' }
    state.notice = 'Acceso listo. Cargando datos del CRM...'
    render()
    await initDataAfterAuth()
  } catch (error) {
    state.auth = { ...state.auth, loading: false, dataLoading: false }
    state.notice = error.message
    render()
  }
}

async function logoutUser() {
  try {
    await apiJson(authLogoutUrl, { method: 'POST', body: '{}' })
  } catch {}
  localStorage.removeItem(storageKey)
  Object.assign(state, { auth: { ...state.auth, loading: false, dataLoading: false, user: null, users: [] }, notice: 'Sesion cerrada.' })
  render()
}

async function createUser() {
  syncLoginFieldsFromDom()
  try {
    const result = await apiJson(usersUrl, {
      method: 'POST',
      body: JSON.stringify({
        name: state.login.name,
        email: state.login.newEmail,
        password: state.login.newPassword,
        role: state.login.newRole
      })
    })
    state.auth = { ...state.auth, users: result.users || [] }
    state.login = { ...state.login, name: '', newEmail: '', newPassword: '', newRole: 'usuario' }
    state.notice = 'Usuario creado.'
    render()
  } catch (error) {
    state.notice = error.message
    render()
  }
}

async function deleteUser(id) {
  try {
    const result = await apiJson(`${usersUrl}/${encodeURIComponent(id)}`, { method: 'DELETE' })
    state.auth = { ...state.auth, users: result.users || [] }
    state.notice = 'Usuario eliminado.'
    render()
  } catch (error) {
    state.notice = error.message
    render()
  }
}

async function changeOwnPassword() {
  syncLoginFieldsFromDom()
  try {
    await apiJson(authChangePasswordUrl, {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: state.login.currentPassword,
        newPassword: state.login.accountNewPassword
      })
    })
    state.login = { ...state.login, currentPassword: '', accountNewPassword: '' }
    state.notice = 'Password actualizado.'
    render()
  } catch (error) {
    state.notice = error.message
    render()
  }
}

async function requestPasswordReset() {
  syncLoginFieldsFromDom()
  pushApiLog({ method: 'CLICK', url: '#forgot-password-token', status: 'UI', ok: true, message: 'Click recibido: enviar token' })
  const email = state.login.forgotEmail || state.login.resetEmail || state.login.email || state.auth.user?.email || ''
  if (!email) {
    state.notice = 'Captura el correo para enviar token.'
    render()
    return
  }
  try {
    state.notice = 'Enviando token...'
    render()
    const result = await apiJson(authForgotPasswordUrl, {
      method: 'POST',
      body: JSON.stringify({ email })
    })
    state.login = { ...state.login, forgotEmail: email, resetEmail: email }
    state.notice = result.delivered
      ? 'Token enviado al correo.'
      : `Token generado, pero no salio por correo.${result.smtpError ? ` SMTP: ${result.smtpError}` : ''} Revisa ${result.tokenPath || 'data/password-reset-tokens.txt'} en el servidor.`
    render()
  } catch (error) {
    state.notice = error.message
    render()
  }
}

async function resetPasswordWithToken() {
  if (resetPasswordRequestInFlight) return
  resetPasswordRequestInFlight = true
  const button = document.getElementById('resetPasswordButton')
  if (button) button.disabled = true
  syncLoginFieldsFromDom()
  const email = state.login.resetEmail || state.login.forgotEmail || state.login.email || state.auth.user?.email || ''
  try {
    await apiJson(authResetPasswordUrl, {
      method: 'POST',
      body: JSON.stringify({
        email,
        token: state.login.resetToken,
        newPassword: state.login.resetPassword
      })
    })
    state.login = { ...state.login, email, resetEmail: email, password: '', resetToken: '', resetPassword: '' }
    state.notice = 'Password restablecido. Ya puedes iniciar sesion.'
    render()
  } catch (error) {
    state.notice = error.message
    render()
  } finally {
    resetPasswordRequestInFlight = false
    const currentButton = document.getElementById('resetPasswordButton')
    if (currentButton) currentButton.disabled = false
  }
}

async function requestSetupToken() {
  if (setupTokenRequestInFlight) return
  setupTokenRequestInFlight = true
  const button = document.getElementById('setupTokenButton')
  if (button) button.disabled = true
  syncLoginFieldsFromDom()
  pushApiLog({ method: 'CLICK', url: '#setup-token', status: 'UI', ok: true, message: 'Click recibido: token de alta' })
  const email = state.login.setupEmail || state.login.email || ''
  if (!email) {
    state.notice = 'Captura un correo autorizado para enviar token.'
    render()
    return
  }
  try {
    state.notice = 'Enviando token de alta...'
    render()
    const result = await apiJson(authSetupTokenUrl, {
      method: 'POST',
      body: JSON.stringify({ email })
    })
    state.login = { ...state.login, setupEmail: email }
    state.notice = result.delivered
      ? 'Token de alta enviado al correo.'
      : `Token de alta generado, pero no salio por correo.${result.smtpError ? ` SMTP: ${result.smtpError}` : ''} Revisa ${result.tokenPath || 'data/password-reset-tokens.txt'} en el servidor.`
    render()
  } catch (error) {
    state.notice = error.message
    render()
  } finally {
    setupTokenRequestInFlight = false
    const currentButton = document.getElementById('setupTokenButton')
    if (currentButton) currentButton.disabled = false
  }
}

async function setupUserWithToken() {
  if (setupUserRequestInFlight) return
  setupUserRequestInFlight = true
  const button = document.getElementById('setupUserButton')
  if (button) button.disabled = true
  syncLoginFieldsFromDom()
  const email = state.login.setupEmail || state.login.email || ''
  try {
    const result = await apiJson(authSetupUrl, {
      method: 'POST',
      body: JSON.stringify({
        name: state.login.setupName,
        email,
        password: state.login.setupPassword,
        token: state.login.setupToken
      })
    })
    state.login = {
      ...state.login,
      email,
      password: '',
      setupName: '',
      setupEmail: email,
      setupPassword: '',
      setupToken: ''
    }
    state.auth = { ...state.auth, setupRequired: false }
    state.notice = result.message || 'Cuenta creada. Ya puedes iniciar sesion.'
    render()
  } catch (error) {
    state.notice = error.message
    render()
  } finally {
    setupUserRequestInFlight = false
    const currentButton = document.getElementById('setupUserButton')
    if (currentButton) currentButton.disabled = false
  }
}

function detectMapping(columns) {
  const normalized = columns.map((column) => ({ raw: column, norm: normalizeHeader(column) }))
  const pick = (candidates) => {
    const clean = candidates.map(normalizeHeader)
    for (const candidate of clean) {
      const exact = normalized.find((column) => column.norm === candidate)
      if (exact) return exact.raw
    }
    for (const candidate of clean) {
      const partial = normalized.find((column) => column.norm.includes(candidate))
      if (partial) return partial.raw
    }
    return ''
  }

  return {
    unitName: pick(['Nombre', 'Unidad', 'Nombre unidad', 'Objeto', 'Equipo', 'Vehicle', 'Device name', 'Name']),
    creator: pick(['Creador', 'Creator']),
    company: pick(['Cuenta', 'Empresa', 'Cliente', 'Compania', 'Company', 'Customer', 'Account', 'Razon social']),
    deviceType: pick(['Tipo de dispositivo', 'Device type', 'Hardware', 'Modelo']),
    deactivatedAt: pick(['Desactivacion', 'Desactivación', 'Desactivado', 'Disabled']),
    uid: pick(['UID', 'Unique ID', 'ID unico', 'Identificador']),
    imei: pick(['IMEI', 'IMEI equipo', 'IMEI dispositivo', 'Device IMEI', 'Serial IMEI']),
    imeiLong: pick(['IMEI largo', 'IMEI completo', 'IMEI full', 'Long IMEI', 'IMEI largo equipo']),
    imeiShort: pick(['IMEI corto', 'Short IMEI', 'IMEI short', 'IMEI abreviado']),
    phone: pick(['Telefono', 'Teléfono', 'Phone', 'MSISDN']),
    lastMessage: pick(['Hora de ultimo mensaje', 'Hora de último mensaje', 'Ultimo mensaje', 'Last message']),
    createdAt: pick(['Creada', 'Created', 'Fecha alta']),
    groups: pick(['Grupos', 'Grupo', 'Groups', 'Fleet']),
    customFields: pick(['Campos personalizados', 'Custom fields'])
  }
}

function inferFromName(unitName) {
  const parts = String(unitName || '')
    .split(/\s*(?:\/|>|\\|\|)\s*/g)
    .filter(Boolean)
  if (parts.length >= 3) {
    return { company: parts[0], groups: [parts[1]], unitName: parts.slice(2).join(' / ') }
  }
  return { company: '', groups: [], unitName }
}

function normalizeRows(rows, mapping, recordState) {
  const get = (row, key) => (mapping[key] ? textValue(row[mapping[key]]) : '')

  return rows.map((row, index) => {
    const rawUnitName = get(row, 'unitName')
    const inferred = inferFromName(rawUnitName)
    const mappedGroups = splitGroups(get(row, 'groups'))
    const rawUid = get(row, 'uid')
    const rawImei = get(row, 'imei')
    const rawImeiLong = get(row, 'imeiLong') || rawImei
    const rawImeiShort = get(row, 'imeiShort') || deriveShortImei(rawImeiLong || rawImei || rawUid)
    const device = normalizeDeviceIdentifiers({
      id: '',
      unitName: inferred.unitName || rawUnitName || `Equipo ${index + 1}`,
      creator: get(row, 'creator'),
      company: get(row, 'company') || inferred.company || 'Sin empresa',
      deviceType: get(row, 'deviceType'),
      deactivatedAt: get(row, 'deactivatedAt'),
      uid: rawUid,
      imei: rawImei,
      imeiLong: rawImeiLong,
      imeiShort: rawImeiShort,
      phone: get(row, 'phone'),
      lastMessage: get(row, 'lastMessage'),
      createdAt: get(row, 'createdAt'),
      groups: mappedGroups.length ? mappedGroups : inferred.groups,
      customFields: get(row, 'customFields'),
      soldBy: defaultEquipmentSeller,
      billingCycle: 'mensual',
      annualMonth: String(new Date().getMonth() + 1),
      renewalDate: '',
      agreedPrice: '',
      saleDate: '',
      priceNote: '',
      recordState
    })
    device.id = `${deviceKey(device)}-${index}`
    return device
  })
}

function mergeDevices(previous, incoming) {
  if (!previous.length) return incoming.map((device) => normalizeDeviceIdentifiers({ ...device, recordState: 'vigente' }))

  const cleanPrevious = previous.map(normalizeDeviceIdentifiers)
  const previousByKey = new Map()
  cleanPrevious.forEach((device) => {
    deviceIdentifierKeys(device).forEach((key) => {
      if (!previousByKey.has(key)) previousByKey.set(key, device)
    })
  })
  const incomingKeys = new Set()
  const merged = incoming.map((device) => {
    const keys = deviceIdentifierKeys(device)
    keys.forEach((key) => incomingKeys.add(key))
    const oldDevice = keys.map((key) => previousByKey.get(key)).find(Boolean)
    if (!oldDevice) return { ...device, recordState: 'nuevo' }

    const changed =
      oldDevice.unitName !== device.unitName ||
      oldDevice.company !== device.company ||
      oldDevice.deviceType !== device.deviceType ||
      oldDevice.phone !== device.phone ||
      oldDevice.imeiLong !== device.imeiLong ||
      oldDevice.imeiShort !== device.imeiShort ||
      oldDevice.deactivatedAt !== device.deactivatedAt ||
      oldDevice.lastMessage !== device.lastMessage ||
      oldDevice.groups.join('|') !== device.groups.join('|')

    return {
      ...oldDevice,
      ...device,
      id: oldDevice.id,
      uid: device.uid || oldDevice.uid || '',
      imei: device.imei || oldDevice.imei || '',
      imeiLong: device.imeiLong || oldDevice.imeiLong || device.imei || oldDevice.imei || '',
      imeiShort: device.imeiShort || oldDevice.imeiShort || deriveShortImei(device.imeiLong || device.imei || oldDevice.imeiLong || oldDevice.imei),
      billingCycle: oldDevice.billingCycle || device.billingCycle || 'mensual',
      annualMonth: oldDevice.annualMonth || device.annualMonth || String(new Date().getMonth() + 1),
      renewalDate: oldDevice.renewalDate || '',
      agreedPrice: oldDevice.agreedPrice ?? oldDevice.pricePerDeviceOverride ?? '',
      saleDate: oldDevice.saleDate || '',
      priceNote: oldDevice.priceNote || '',
      soldBy: normalizeSeller(oldDevice.soldBy || device.soldBy, defaultEquipmentSeller),
      recordState: changed ? 'actualizado' : 'vigente'
    }
  })

  cleanPrevious.forEach((device) => {
    if (!deviceIdentifierKeys(device).some((key) => incomingKeys.has(key))) {
      merged.push(isImportedWialonDevice(device) ? { ...device, recordState: 'no_encontrado' } : device)
    }
  })

  return merged
}

function columnIndex(cellRef) {
  const letters = String(cellRef || '').match(/[A-Z]+/i)?.[0] || 'A'
  return letters
    .toUpperCase()
    .split('')
    .reduce((sum, letter) => sum * 26 + letter.charCodeAt(0) - 64, 0) - 1
}

function xmlDoc(text) {
  return new DOMParser().parseFromString(text, 'application/xml')
}

function workbookTargetToPath(target) {
  const clean = textValue(target).replace(/^\/+/, '')
  if (!clean) return ''
  return clean.startsWith('xl/') ? clean : `xl/${clean}`
}

function worksheetPaths(zip) {
  return Object.keys(zip.files)
    .filter((file) => /^xl\/worksheets\/sheet\d+\.xml$/.test(file))
    .sort((a, b) => Number(a.match(/\d+/)?.[0] || 0) - Number(b.match(/\d+/)?.[0] || 0))
}

async function workbookSheetInfos(zip) {
  const fallback = worksheetPaths(zip).map((path, index) => ({ name: `Hoja ${index + 1}`, path }))
  const workbookFile = zip.file('xl/workbook.xml')
  if (!workbookFile) return fallback

  const rels = new Map()
  const relsFile = zip.file('xl/_rels/workbook.xml.rels')
  if (relsFile) {
    const relsDoc = xmlDoc(await relsFile.async('text'))
    Array.from(relsDoc.getElementsByTagName('Relationship')).forEach((node) => {
      const id = node.getAttribute('Id')
      const target = workbookTargetToPath(node.getAttribute('Target'))
      if (id && target) rels.set(id, target)
    })
  }

  const workbookDoc = xmlDoc(await workbookFile.async('text'))
  const sheets = Array.from(workbookDoc.getElementsByTagName('sheet'))
    .map((node, index) => {
      const name = node.getAttribute('name') || `Hoja ${index + 1}`
      const relationshipId = node.getAttribute('r:id') || node.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id')
      const sheetId = node.getAttribute('sheetId') || String(index + 1)
      return {
        name,
        path: rels.get(relationshipId) || `xl/worksheets/sheet${sheetId}.xml`
      }
    })
    .filter((sheet) => sheet.path && zip.file(sheet.path))

  return sheets.length ? sheets : fallback
}

function worksheetMatrix(doc, shared) {
  const matrix = []
  Array.from(doc.getElementsByTagName('row')).forEach((rowNode) => {
    const row = []
    Array.from(rowNode.getElementsByTagName('c')).forEach((cell) => {
      const ref = cell.getAttribute('r') || ''
      const type = cell.getAttribute('t') || ''
      const index = columnIndex(ref)
      let value = ''

      if (type === 'inlineStr') {
        value = Array.from(cell.getElementsByTagName('t')).map((node) => node.textContent || '').join('')
      } else {
        const raw = cell.getElementsByTagName('v')[0]?.textContent || ''
        if (type === 's') {
          value = shared[Number(raw)] || ''
        } else if (type === 'b') {
          value = raw === '1' ? 'TRUE' : raw === '0' ? 'FALSE' : raw
        } else {
          value = raw
        }
      }

      row[index] = value
    })
    matrix.push(row.map((value) => importTextValue(value)))
  })
  return matrix
}

async function parseXlsx(buffer) {
  const zip = await JSZip.loadAsync(buffer)
  const sharedFile = zip.file('xl/sharedStrings.xml')
  const shared = []

  if (sharedFile) {
    const doc = xmlDoc(await sharedFile.async('text'))
    Array.from(doc.getElementsByTagName('si')).forEach((node) => {
      shared.push(Array.from(node.getElementsByTagName('t')).map((text) => text.textContent || '').join(''))
    })
  }

  const sheets = await workbookSheetInfos(zip)
  if (!sheets.length) throw new Error('El XLSX no contiene hojas legibles.')

  const parsedSheets = []
  for (const sheet of sheets) {
    const file = zip.file(sheet.path)
    if (!file) continue
    const doc = xmlDoc(await file.async('text'))
    parsedSheets.push(rowsFromMatrix(worksheetMatrix(doc, shared), sheet.name))
  }

  const rows = parsedSheets.flatMap((sheet) => sheet.rows)
  const columns = unique(parsedSheets.flatMap((sheet) => sheet.columns))
  return { rows, columns, mapping: detectMapping(columns) }
}

function csvDelimiter(text) {
  const sample = String(text || '').split(/\r?\n/).find((line) => line.trim()) || ''
  const candidates = [',', ';', '\t', '|']
  return candidates
    .map((delimiter) => ({ delimiter, count: sample.split(delimiter).length - 1 }))
    .sort((a, b) => b.count - a.count)[0]?.delimiter || ','
}

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  const delimiter = csvDelimiter(text)

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]
    if (quoted && char === '"' && next === '"') {
      cell += '"'
      i += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (!quoted && char === delimiter) {
      row.push(cell)
      cell = ''
    } else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') i += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }
  row.push(cell)
  rows.push(row)
  return rowsFromMatrix(rows)
}

function headerScore(row) {
  const knownHeaders = new Set([
    'nombre',
    'name',
    'cliente',
    'customer',
    'empresa',
    'razon social',
    'cuenta',
    'account',
    'grupo',
    'grupos',
    'icc',
    'iccid',
    'icc id',
    'iccid luhn',
    'sim',
    'sim id',
    'msisdn',
    'msidn',
    'telefono',
    'phone',
    'phone number',
    'number',
    'linea',
    'linea celular',
    'line',
    'imei',
    'imei largo',
    'imei corto',
    'imei 1',
    'imei 2',
    'device imei',
    'proveedor',
    'proveedora',
    'provider',
    'operador',
    'carrier',
    'status',
    'estatus',
    'estado',
    'vencimiento',
    'renovacion',
    'fecha renovacion',
    'renewal',
    'lifecycle status',
    'connectivity status',
    'endpoint id',
    'endpoint name',
    'assigned to',
    'workspace',
    'organization',
    'iccid icc',
    'vendido por',
    'precio pactado'
  ])
  const meaningfulCells = row.filter((cell) => normalizeHeader(cell)).length
  if (meaningfulCells < 2) return 0
  return row.reduce((score, cell) => {
    const clean = normalizeHeader(cell)
    if (!clean) return score
    if (knownHeaders.has(clean)) return score + 2
    return Array.from(knownHeaders).some((header) => clean.includes(header)) ? score + 1 : score
  }, 0)
}

function detectHeaderIndex(matrix) {
  let best = { index: -1, score: 0 }
  matrix.slice(0, 60).forEach((row, index) => {
    const score = headerScore(row)
    if (score > best.score) best = { index, score }
  })
  return best.score >= 3 ? best.index : -1
}

function uniqueHeaders(headers) {
  const seen = new Map()
  return headers.map((header, index) => {
    const base = textValue(header) || `Columna ${index + 1}`
    const clean = normalizeHeader(base)
    const count = seen.get(clean) || 0
    seen.set(clean, count + 1)
    return count ? `${base} ${count + 1}` : base
  })
}

function rowsFromMatrix(matrix, sheetName = '') {
  const cleanedMatrix = matrix.filter((row) => row.some((cell) => textValue(cell)))
  if (!cleanedMatrix.length) return { rows: [], columns: [], mapping: {} }
  const headerIndex = detectHeaderIndex(cleanedMatrix)
  const maxColumns = cleanedMatrix.reduce((max, row) => Math.max(max, row.length), 0)
  const headerRow = headerIndex >= 0 ? cleanedMatrix[headerIndex] : []
  const headers = uniqueHeaders(Array.from({ length: maxColumns }, (_, index) => textValue(headerRow[index]) || `Columna ${index + 1}`))
  const rows = cleanedMatrix
    .slice(headerIndex >= 0 ? headerIndex + 1 : 0)
    .filter((row) => row.some((cell) => textValue(cell)))
    .map((row, rowIndex) => {
      const output = {}
      headers.forEach((header, index) => {
        output[header] = importTextValue(row[index])
        output[`Columna ${index + 1}`] = importTextValue(row[index])
      })
      output.__sheet = sheetName
      output.__row = String((headerIndex >= 0 ? headerIndex + 2 : 1) + rowIndex)
      return output
    })
  const columns = unique(rows.flatMap((row) => Object.keys(row)))
  return { rows, columns, mapping: detectMapping(columns) }
}

async function parseWorkbookFile(fileOrBuffer, filename = '') {
  if (filename.toLowerCase().endsWith('.csv')) {
    const text = (typeof fileOrBuffer === 'string' ? fileOrBuffer : new TextDecoder().decode(fileOrBuffer)).replace(/^\ufeff/, '')
    return parseCsv(text)
  }
  return parseXlsx(fileOrBuffer)
}

async function loadSeedFile() {
  try {
    const buffer = await fetchPrivateFile('wialon')
    const parsed = await parseWorkbookFile(buffer, seedFile)
    const normalized = normalizeRows(parsed.rows, parsed.mapping, 'vigente')
    const devices = state.devices.length ? mergeDevices(state.devices, normalized) : normalized
    const lineMerge = mergeLineRows(state.lines, parsed.rows, 'DispositivosWialon_Abril2026.xlsx', { requireIcc: true, markMissing: false, devices })
    setState({
      rawRows: parsed.rows,
      columns: parsed.columns,
      mapping: parsed.mapping,
      devices,
      ...(lineMerge.imported.length
        ? {
            lines: lineMerge.lines,
            lineImport: lineImportState('DispositivosWialon_Abril2026.xlsx', parsed.rows.length, lineMerge.imported, lineMerge.stats, {
              autoVersion: lineAutoImportVersion
            })
          }
        : {}),
      sourceLabel: 'DispositivosWialon_Abril2026.xlsx',
      lastImportAt: new Date().toISOString(),
      notice: `Base cargada: ${normalized.length} equipos de Wialon.${lineMerge.imported.length ? ` Lineas detectadas: ${lineMerge.imported.length} (${lineMerge.imported.filter((line) => line.iccid).length} con ICC).` : ''}`
    })
  } catch (error) {
    setState({ notice: error.message || 'Carga tu archivo Wialon para comenzar.' })
  }
}

async function handleFile(file) {
  const buffer = await file.arrayBuffer()
  await saveUploadedFile(file, 'wialon', buffer)
  const parsed = await parseWorkbookFile(buffer, file.name)
  const normalized = normalizeRows(parsed.rows, parsed.mapping, 'vigente')
  const merged = mergeDevices(state.devices, normalized)
  const lineMerge = mergeLineRows(state.lines, parsed.rows, file.name, { requireIcc: true, markMissing: false, devices: merged })
  const stats = {
    nuevos: merged.filter((device) => device.recordState === 'nuevo').length,
    actualizados: merged.filter((device) => device.recordState === 'actualizado').length,
    noEncontrados: merged.filter((device) => device.recordState === 'no_encontrado').length
  }

  setState({
    rawRows: parsed.rows,
    columns: parsed.columns,
    mapping: parsed.mapping,
    devices: merged,
    ...(lineMerge.imported.length
      ? {
          lines: lineMerge.lines,
          lineImport: lineImportState(file.name, parsed.rows.length, lineMerge.imported, lineMerge.stats, {
            autoVersion: lineAutoImportVersion
          })
        }
      : {}),
    sourceLabel: file.name,
    lastImportAt: new Date().toISOString(),
    notice: `Actualizado: ${normalized.length} equipos leidos, ${stats.nuevos} nuevos, ${stats.actualizados} actualizados, ${stats.noEncontrados} no encontrados.${lineMerge.imported.length ? ` Lineas/chips detectados: ${lineMerge.imported.length} (${lineMerge.imported.filter((line) => line.iccid).length} con ICC).` : ''}`
  })
}

function rowValue(row, candidates) {
  const entries = Object.entries(row)
  for (const candidate of candidates) {
    const cleanCandidate = normalizeHeader(candidate)
    const match = entries.find(([key]) => normalizeHeader(key) === cleanCandidate)
    if (match) return importTextValue(match[1])
  }
  return ''
}

function rowValueLoose(row, candidates) {
  const exact = rowValue(row, candidates)
  if (exact) return exact
  const entries = Object.entries(row)
  for (const candidate of candidates) {
    const cleanCandidate = normalizeHeader(candidate)
    const match = entries.find(([key]) => {
      const cleanKey = normalizeHeader(key)
      return cleanKey.includes(cleanCandidate) || cleanCandidate.includes(cleanKey)
    })
    if (match) return importTextValue(match[1])
  }
  return ''
}

function paymentRuleFromRow(row) {
  const name = rowValue(row, ['Nombre', 'Equipo', 'Unidad'])
  const uid = rowValue(row, ['UID', 'IMEI', 'Identificador'])
  const imeiLong = rowValue(row, ['IMEI largo', 'IMEI completo', 'IMEI full', 'Long IMEI'])
  const imeiShort = rowValue(row, ['IMEI corto', 'Short IMEI', 'IMEI short'])
  const company = rowValue(row, ['Cuenta', 'Empresa'])
  const tipo = rowValue(row, ['Tipo de Pago', 'Forma de pago'])
  const noPagos = rowValue(row, ['No. Pagos', 'Pagos'])
  const cycle = normalizeCycle(tipo, noPagos)
  const price = parseAmount(rowValue(row, ['Importe', 'Precio', 'Precio pactado']))
  const paymentMonths = monthNames
    .map((month, index) => {
      const value = rowValue(row, [month])
      const clean = textValue(value)
      return clean && clean !== '0' ? String(index + 1) : ''
    })
    .filter(Boolean)

  return {
    name,
    uid,
    imeiLong,
    imeiShort,
    identifiers: unique([uid, imeiLong, imeiShort]),
    company,
    cycle,
    price,
    paymentMonths,
    tipo,
    noPagos
  }
}

function applyPaymentRows(rows, label, options = {}) {
  const byName = new Map()
  const byCompanyName = new Map()
  const byId = new Map()
  const stats = {
    version: paymentImportVersion,
    source: label,
    rows: rows.length,
    matchedByName: 0,
    matchedByCompanyName: 0,
    matchedById: 0,
    defaultMonthly: 0,
    monthly: 0,
    annual: 0,
    semestral: 0,
    unmatchedRules: 0,
    appliedAt: new Date().toISOString()
  }

  const rules = rows.map(paymentRuleFromRow)
  rules.forEach((rule) => {
    const nameKey = normalizeHeader(rule.name)
    const companyKey = normalizeHeader(rule.company)
    rule.identifiers.forEach((identifier) => {
      const idKey = normalizeIdentifier(identifier)
      if (idKey && !byId.has(idKey)) byId.set(idKey, rule)
    })
    if (companyKey && nameKey && !byCompanyName.has(`${companyKey}|${nameKey}`)) byCompanyName.set(`${companyKey}|${nameKey}`, rule)
    if (nameKey && !byName.has(nameKey)) byName.set(nameKey, rule)
  })

  const usedRules = new Set()
  const devices = state.devices.map((device) => {
    if (!isImportedWialonDevice(device)) return device
    const idRule = deviceIdentifierValues(device)
      .map((identifier) => byId.get(normalizeIdentifier(identifier)))
      .find(Boolean)
    const companyNameRule = byCompanyName.get(`${normalizeHeader(device.company)}|${normalizeHeader(device.unitName)}`)
    const nameRule = byName.get(normalizeHeader(device.unitName))
    const rule = idRule || companyNameRule || nameRule
    const matchedBy = idRule ? 'UID/IMEI largo/corto' : companyNameRule ? 'empresa+nombre' : nameRule ? 'nombre' : ''

    if (!rule) {
      stats.defaultMonthly += 1
      return {
        ...device,
        billingCycle: 'mensual',
        paymentMonths: [],
        agreedPrice: deviceAgreedPriceValue({ ...device, billingCycle: 'mensual' }),
        paymentSource: label,
        paymentMatchedBy: 'sin coincidencia'
      }
    }

    usedRules.add(rule)
    if (matchedBy === 'UID/IMEI largo/corto') stats.matchedById += 1
    else if (matchedBy === 'empresa+nombre') stats.matchedByCompanyName += 1
    else stats.matchedByName += 1
    if (rule.cycle === 'semestral') stats.semestral += 1
    else if (rule.cycle === 'anual') stats.annual += 1
    else stats.monthly += 1
    const paymentMonths = parsePaymentMonths(rule.paymentMonths)

    return {
      ...device,
      billingCycle: rule.cycle,
      paymentMonths,
      annualMonth: paymentMonths[0] || device.annualMonth || String(new Date().getMonth() + 1),
      agreedPrice: rule.price > 0 ? String(rule.price) : deviceAgreedPriceValue({ ...device, billingCycle: rule.cycle }),
      priceNote: rule.price > 0 ? `Pago pactado importado de ${label}` : device.priceNote || '',
      paymentSource: label,
      paymentMatchedBy: matchedBy,
      paymentImportName: rule.name,
      paymentImportCompany: rule.company,
      paymentTypeOriginal: rule.tipo,
      paymentAmount: rule.price > 0 ? String(rule.price) : ''
    }
  })

  stats.unmatchedRules = rules.filter((rule) => !usedRules.has(rule)).length
  const matchedTotal = stats.matchedById + stats.matchedByCompanyName + stats.matchedByName
  const lineMerge = mergeLineRows(state.lines, rows, label, { requireIcc: true, markMissing: false, devices })

  setState({
    devices,
    ...(lineMerge.imported.length
      ? {
          lines: lineMerge.lines,
          lineImport: lineImportState(label, rows.length, lineMerge.imported, lineMerge.stats, {
            autoVersion: lineAutoImportVersion
          })
        }
      : {}),
    paymentImport: stats,
    notice: `Pagos pactados aplicados: ${matchedTotal} equipos; ${stats.semestral} semestrales, ${stats.annual} anuales; ${stats.defaultMonthly} quedaron mensuales.${lineMerge.imported.length ? ` Lineas/chips detectados: ${lineMerge.imported.length} (${lineMerge.imported.filter((line) => line.iccid).length} con ICC).` : ''}`,
    view: options.keepView ? state.view : 'facturacion'
  })
}

async function loadPaymentSeed(options = {}) {
  const buffer = await fetchPrivateFile('pagos')
  const parsed = await parseWorkbookFile(buffer, paymentSeedFile)
  applyPaymentRows(parsed.rows, 'Klifnet_Admon_Mensual_Pagos.xlsx', options)
}

async function handlePaymentFile(file) {
  const buffer = await file.arrayBuffer()
  await saveUploadedFile(file, 'pagos', buffer)
  const parsed = await parseWorkbookFile(buffer, file.name)
  applyPaymentRows(parsed.rows, file.name)
}

function normalizePhone(value) {
  return normalizeIdentifierText(value).replace(/\D/g, '')
}

const linePhoneCandidates = ['MSISDN', 'MSIDN', 'MSISDN linea', 'MSISDN number', 'Linea celular', 'Linea telefonica', 'Telefono', 'Telefono linea', 'Numero de telefono', 'Numero celular', 'Numero', 'Linea', 'Line', 'DN', 'Celular', 'Phone', 'Phone number', 'Mobile number']
const lineIccCandidates = ['ICCID', 'ICC', 'ICCID / ICC', 'ICC ID', 'ICCID Luhn', 'SIM ICCID', 'SIM', 'Numero SIM', 'No SIM', 'Simcard', 'SIM card', 'Chip', 'Numero chip', 'No chip', 'SIM ID', 'ID SIM', 'SIM serial', 'Serial SIM']
const lineImeiCandidates = ['IMEI', 'IMEI largo', 'IMEI completo', 'IMEI full', 'IMEI corto', 'IMEI equipo', 'IMEI dispositivo', 'Equipo IMEI', 'Device IMEI', 'Terminal IMEI', 'Dispositivo', 'UID', 'Identificador', 'Serial', 'Serial number', 'Device ID', 'Endpoint ID']
const lineImeiIgnoredHeaders = ['imeisv', 'imei sv', 'imei lock', 'imei locked', 'lock imei']

function normalizeIccid(value) {
  const clean = normalizeIdentifierText(value).replace(/\D/g, '')
  return /^89\d{16,22}$/.test(clean) ? clean : normalizeIdentifierText(value)
}

function extractIccidFromText(value) {
  const raw = normalizeIdentifierText(value)
  const compact = raw.replace(/\D/g, '')
  if (/^89\d{16,22}$/.test(compact)) return compact
  const spaced = raw.match(/\b89(?:[\s-]?\d){16,22}\b/)
  return spaced ? spaced[0].replace(/\D/g, '') : ''
}

function rowCandidateValues(row, candidates, loose = false) {
  const entries = Object.entries(row)
  return candidates.flatMap((candidate) => {
    const cleanCandidate = normalizeHeader(candidate)
    return entries
      .filter(([key]) => {
        const cleanKey = normalizeHeader(key)
        return loose ? cleanKey.includes(cleanCandidate) || cleanCandidate.includes(cleanKey) : cleanKey === cleanCandidate
      })
      .map(([, value]) => importTextValue(value))
      .filter(Boolean)
  })
}

function extractIccidFromRow(row) {
  const direct = rowCandidateValues(row, lineIccCandidates, true).map(extractIccidFromText).find(Boolean)
  if (direct) return direct
  const entries = Object.entries(row)
  const likelyField = entries
    .filter(([key]) => /(^|\s)(icc|iccid|sim|chip|msisdn)(\s|$)/.test(normalizeHeader(key)))
    .map(([, value]) => extractIccidFromText(value))
    .find(Boolean)
  if (likelyField) return likelyField
  return entries.map(([, value]) => extractIccidFromText(value)).find(Boolean) || ''
}

function normalizePhoneCandidate(value) {
  const clean = normalizePhone(normalizeIdentifierText(value))
  if (!clean || clean.startsWith('89')) return ''

  // Mexico/Telcel: guardar y comparar el telefono como 10 digitos nacionales.
  // Asi +523331234567, 523331234567 y 3331234567 son la misma linea.
  if (clean.length === 13 && clean.startsWith('521')) return clean.slice(3)
  if (clean.length === 12 && clean.startsWith('52')) return clean.slice(2)
  if (clean.length === 10) return clean

  return clean.length >= 10 && clean.length <= 15 ? clean : ''
}

function phoneMatchValues(value) {
  const clean = normalizePhoneCandidate(value)
  if (!clean || clean.startsWith('89')) return []
  const values = [clean]
  if (clean.length === 10) values.push(`52${clean}`, `521${clean}`)
  if (clean.length === 12 && clean.startsWith('52')) values.push(clean.slice(2))
  if (clean.length === 13 && clean.startsWith('521')) values.push(clean.slice(3))
  return unique(values)
}

function phoneValuesMatch(firstValue, secondValue) {
  const first = new Set(phoneMatchValues(firstValue))
  if (!first.size) return false
  return phoneMatchValues(secondValue).some((value) => first.has(value))
}

function deviceMatchesPhone(device, phone) {
  return Boolean(device?.phone && phoneValuesMatch(device.phone, phone))
}

function extractPhoneFromRow(row) {
  const direct = rowCandidateValues(row, linePhoneCandidates, true).map(normalizePhoneCandidate).find(Boolean)
  if (direct) return direct
  const likelyField = Object.entries(row)
    .filter(([key]) => /(^|\s)(linea|line|telefono|phone|msisdn|numero|dn|celular|icc)(\s|$)/.test(normalizeHeader(key)))
    .map(([, value]) => normalizePhoneCandidate(value))
    .find(Boolean)
  if (likelyField) return likelyField
  return Object.values(row).map(normalizePhoneCandidate).find(Boolean) || ''
}

function normalizeImeiCandidate(value) {
  const clean = normalizePhone(normalizeIdentifierText(value))
  if (!clean || clean.startsWith('89')) return ''
  return clean.length >= 6 && clean.length <= 20 ? clean : ''
}

function extractImeiFromRow(row) {
  const exact = rowCandidateValues(row, ['IMEI largo', 'IMEI completo', 'Long IMEI', 'IMEI equipo', 'IMEI dispositivo', 'Device IMEI', 'IMEI'], false)
    .map(normalizeImeiCandidate)
    .find(Boolean)
  if (exact) return exact
  const loose = Object.entries(row)
    .filter(([key]) => {
      const cleanKey = normalizeHeader(key)
      if (!cleanKey || lineImeiIgnoredHeaders.includes(cleanKey)) return false
      return lineImeiCandidates.some((candidate) => {
        const cleanCandidate = normalizeHeader(candidate)
        return cleanKey.includes(cleanCandidate) || cleanCandidate.includes(cleanKey)
      })
    })
    .map(([, value]) => normalizeImeiCandidate(value))
    .find(Boolean)
  if (loose) return loose
  if (normalizeHeader(row.__sheet).includes('stock')) {
    const stockImei = normalizeImeiCandidate(row['Columna 7'])
    if (stockImei) return stockImei
  }
  const headerlessImei = normalizeImeiCandidate(row['Columna 4']) || normalizeImeiCandidate(row['Columna 6'])
  if (headerlessImei) return headerlessImei
  const longCandidates = Object.values(row)
    .map(importTextValue)
    .map(normalizeImeiCandidate)
    .filter((value) => value.length >= 14 && !value.startsWith('89'))
  if (longCandidates.length) return longCandidates.at(-1)
  return ''
}

function lineIdentifierParts(line) {
  return {
    iccid: extractIccidFromText(importTextValue(line.iccid)) || extractIccidFromText(importTextValue(line.phone)),
    phone: normalizePhoneCandidate(importTextValue(line.phone)) || normalizePhoneCandidate(importTextValue(line.iccid)),
    imei: importTextValue(line.imei || line.imeiLong || line.imeiShort)
  }
}

function lineImeiValues(line) {
  return unique([line.imei, line.imeiLong, line.imeiShort, line.imei_largo, line.imei_corto, line.imei_1, line.imei_2, line.imei1, line.imei2, line.equipo_wialon_uid, line.linkedDeviceUid])
}

function lineTextIdentifierValues(line) {
  return unique(
    [line.notes, line.providerHint, line.alias, line.model]
      .map(importTextValue)
      .flatMap((value) => value.match(/\b\d{5,12}\b/g) || [])
  )
}

function lineNameMatchValues(line) {
  const generic = new Set(['klifnet', 'klifet', 'active', 'enabled', 'deleted', 'disabled', 'disponible', 'asignada'])
  return unique([line.alias, line.unitName, line.notes])
    .flatMap((value) => importTextValue(value).split(/[|;]/g))
    .flatMap((value) => importTextValue(value).split(/\s*,\s*/g))
    .map(normalizeHeader)
    .filter((value) => value.length >= 4 && !generic.has(value) && !value.startsWith('relacion ') && !value.startsWith('match '))
}

function lineKey(line) {
  return lineIdentifierKeys(line)[0]
}

function lineIdentifierKeys(line) {
  const identifiers = lineIdentifierParts(line)
  const iccid = identifiers.iccid
  const phone = identifiers.phone
  const providerKey = detectLineTypeFromText(line.lineType || line.providerOverride || line.carrier || line.source || '') || normalizeHeader(line.carrier || 'sin-proveedor')
  const relationId = normalizeIdentifier(line.relationId || line.relacion_id || line.relation_id)
  const sourceLineId = normalizeIdentifier(line.sourceLineId || line.linea_id || line.line_id)
  const keys = []
  if (relationId) keys.push(`relation:${providerKey}:${relationId}`)
  if (sourceLineId) keys.push(`source-line:${providerKey}:${sourceLineId}`)
  if (keys.length) return unique(keys)
  if (iccid) keys.push(`iccid:${providerKey}:${iccid}`)
  if (phone) keys.push(`phone:${providerKey}:${phone}`)
  if (keys.length) return unique(keys)
  lineImeiValues(line).forEach((imei) => {
    const key = normalizeIdentifier(imei)
    if (key) keys.push(`imei:${providerKey}:${key}`)
  })
  if (!keys.length) keys.push(`line:${normalizeHeader(`${line.company || ''}-${line.carrier || ''}-${line.plan || ''}`)}`)
  return unique(keys)
}

function linesShareIdentifier(firstLine, secondLine) {
  const firstKeys = new Set(lineIdentifierKeys(firstLine))
  return lineIdentifierKeys(secondLine).some((key) => firstKeys.has(key))
}

function normalizeLineDate(value) {
  const raw = textValue(value)
  if (!raw) return ''
  const numeric = Number(raw)
  if (Number.isFinite(numeric) && numeric > 25000) {
    const date = new Date((numeric - 25569) * 86400000)
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
  }
  const slash = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (slash) {
    const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3]
    return `${year}-${slash[2].padStart(2, '0')}-${slash[1].padStart(2, '0')}`
  }
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? raw : date.toISOString().slice(0, 10)
}

function lineDateFromWords(day, monthNameValue, year) {
  const monthIndex = monthIndexFromText(monthNameValue)
  const numericDay = Number(day)
  let numericYear = Number(year)
  if (String(year).length === 2) numericYear += numericYear >= 70 ? 1900 : 2000
  if (monthIndex < 0 || numericDay < 1 || numericDay > 31 || numericYear < 2000) return ''
  return `${numericYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(numericDay).padStart(2, '0')}`
}

function lineDateFromNumericParts(day, month, year) {
  const numericDay = Number(day)
  const numericMonth = Number(month)
  let numericYear = Number(year)
  if (String(year).length === 2) numericYear += numericYear >= 70 ? 1900 : 2000
  if (numericDay < 1 || numericDay > 31 || numericMonth < 1 || numericMonth > 12 || numericYear < 2000) return ''
  return `${numericYear}-${String(numericMonth).padStart(2, '0')}-${String(numericDay).padStart(2, '0')}`
}

function isInternalLineCompany(value) {
  const clean = normalizeHeader(value)
  if (!clean) return false
  return clean.includes('felipe') && (clean.includes('gomez') || clean.includes('tirado') || clean.includes('celular'))
}

function sanitizeLineCompany(value) {
  const company = textValue(value)
  return isInternalLineCompany(company) ? '' : company
}

function companyFromLineCode(prefix) {
  const clean = normalizeHeader(prefix).replace(/\s+/g, '')
  if (!clean) return ''
  if (clean.startsWith('berna')) return 'Bernardo'
  if (clean === 'klifnet' || clean.startsWith('klifnet')) return ''
  return clean
    .replace(/([a-z])([0-9])/g, '$1 $2')
    .split(/\s+/g)
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : ''))
    .join(' ')
}

function formatLineCustomerCode(value) {
  const spaced = textValue(value)
    .replace(/[_-]+/g, ' ')
    .replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
  const clean = normalizeHeader(spaced)
  if (!clean || clean === 'mgr' || clean === 'demo' || clean === 'klifnet') return ''
  if (/^\d+$/.test(clean)) return ''
  return clean
    .split(/\s+/g)
    .map((part) => {
      if (!part) return ''
      if (part.length <= 3) return part.toUpperCase()
      return `${part[0].toUpperCase()}${part.slice(1)}`
    })
    .join(' ')
}

function companyFromLineTag(value) {
  const raw = textValue(value)
  if (!raw) return ''
  const clean = normalizeHeader(raw)
  if (clean.startsWith('berna')) return 'Bernardo'
  if (clean.startsWith('tracks')) return 'Tracks'
  const separated = raw.match(/^klifnet[_-]+(.+)$/i)
  if (separated) return formatLineCustomerCode(separated[1].replace(/[_-]+/g, ' '))
  const joined = raw.match(/^klifnet([A-Z][A-Za-z0-9]{2,})$/)
  if (joined) return formatLineCustomerCode(joined[1])
  return ''
}

function isBernardoLine(line) {
  const signal = normalizeHeader(
    `${line?.company || ''} ${line?.cliente_perfil || ''} ${line?.cliente_fuente || ''} ${line?.alias || ''} ${line?.notes || ''} ${line?.notas || ''} ${line?.source || ''} ${
      line?.fuente || ''
    }`
  )
  return signal.includes('bernardo') || signal.includes('berna')
}

function lineCanMatchWialon(line) {
  return Boolean(line && !isBernardoLine(line))
}

function parseLineCustomerText(value) {
  const renewal = parseLineRenewalText(value)

  const raw = textValue(value)
  const codeTokens = raw.match(/\b(?:klifnet|berna|bernardo|tracks)[_-][A-Za-z0-9][A-Za-z0-9_-]*\b|\bKlifnet[A-Z][A-Za-z0-9]{2,}\b/gi) || []
  const company = codeTokens.map(companyFromLineTag).find(Boolean)
  if (renewal?.company || renewal?.renewalDate || company) {
    return {
      company: renewal?.company || company || '',
      renewalDate: renewal?.renewalDate || ''
    }
  }
  return null
}

function parseLineRenewalText(value) {
  const clean = normalizeHeader(value)
  const wordDate = clean.match(/\b([a-z][a-z0-9]{1,24})\s+(\d{1,2})\s*([a-z]{3,12})\s*(\d{2,4})\b/)
  if (wordDate) {
    const renewalDate = lineDateFromWords(wordDate[2], wordDate[3], wordDate[4])
    if (renewalDate) {
      return {
        company: companyFromLineCode(wordDate[1]),
        renewalDate
      }
    }
  }

  const numericDate = clean.match(/\b([a-z][a-z0-9]{1,24})\s+(\d{2})(\d{2})(\d{2,4})\b/)
  if (numericDate) {
    const renewalDate = lineDateFromNumericParts(numericDate[2], numericDate[3], numericDate[4])
    if (renewalDate) {
      return {
        company: companyFromLineCode(numericDate[1]),
        renewalDate
      }
    }
  }

  const bernardoWords = clean.match(/\bbernardo\b\s+(\d{1,2})\s+([a-z]{3,12})\s+(\d{2,4})\b/)
  if (!bernardoWords) return null
  const renewalDate = lineDateFromWords(bernardoWords[1], bernardoWords[2], bernardoWords[3])
  if (!renewalDate) return null
  return {
    company: 'Bernardo',
    renewalDate
  }
}

function normalizeLineStatus(value) {
  const clean = normalizeHeader(value)
  if (
    !clean ||
    clean === 'activa' ||
    clean === 'activo' ||
    clean === 'active' ||
    clean === 'vigente' ||
    clean === 'alta' ||
    clean.includes('activated') ||
    clean.includes('enabled') ||
    clean.includes('telcel plan')
  )
    return 'activa'
  if (clean.includes('issued') || clean.includes('emitid')) return 'emitida'
  if (clean.includes('suspend')) return 'suspendida'
  if (
    clean.includes('desactiv') ||
    clean.includes('deactiv') ||
    clean.includes('inactiv') ||
    clean.includes('baja') ||
    clean.includes('cancel') ||
    clean.includes('disabled') ||
    clean.includes('deleted') ||
    clean.includes('terminated')
  )
    return 'desactivada'
  return clean
}

function normalizeLineType(value) {
  const clean = normalizeHeader(value)
  if (clean.includes('emprenet')) return 'emprenet'
  if (clean.includes('emnify')) return 'emnify'
  if (clean.includes('wemobile') || clean.includes('we mobile')) return 'wemobile'
  if (clean.includes('m2m') || clean.includes('m 2 m')) return 'm2m'
  if (clean.includes('telcel') && (clean.includes('prepago') || clean.includes('pre pago') || clean.includes('telcelprep'))) return 'telcel-prepago'
  if (clean.includes('telcel') && (clean.includes('postpago') || clean.includes('post pago') || clean.includes('pospago') || clean.includes('pos pago'))) return 'telcel-postpago'
  if (clean.includes('telcel')) return 'telcel'
  return lineTypeOptions.some((option) => option.value === clean) ? clean : 'emprenet'
}

function detectLineTypeFromText(value) {
  const clean = normalizeHeader(value)
  if (!clean) return ''
  if (clean.includes('emprenet')) return 'emprenet'
  if (clean.includes('emnify')) return 'emnify'
  if (clean.includes('wemobile') || clean.includes('we mobile')) return 'wemobile'
  if (clean.includes('m2m') || clean.includes('m 2 m')) return 'm2m'
  if (clean.includes('telcel') && (clean.includes('prepago') || clean.includes('pre pago') || clean.includes('telcelprep'))) return 'telcel-prepago'
  if (clean.includes('telcel') && (clean.includes('postpago') || clean.includes('post pago') || clean.includes('pospago') || clean.includes('pos pago'))) return 'telcel-postpago'
  if (clean.includes('telcel')) return 'telcel'
  return lineTypeOptions.some((option) => option.value === clean) ? clean : ''
}

function classifyLineTypeByIccid(iccid, phone) {
  const cleanIccid = textValue(iccid).replace(/\D/g, '')
  if (cleanIccid.startsWith('8934') || cleanIccid.startsWith('8949')) return 'emnify'
  if (cleanIccid.startsWith('8952')) return normalizePhone(phone) ? 'telcel' : 'emprenet'
  return ''
}

function detectLineProvider(line, fallback = '', options = {}) {
  const forced = detectLineTypeFromText(options.force)
  if (forced) return { value: forced, reason: 'archivo proveedor' }
  if (line.providerManual) {
    const manual = detectLineTypeFromText(fallback || line.lineType || line.carrier)
    if (manual) return { value: manual, reason: 'manual' }
  }

  // Primero respetar campos explicitos. Antes, cualquier telefono valido caia como Telcel,
  // y eso movia masivamente lineas Emnify/otras proveedoras a Telcel.
  const explicit = detectLineTypeFromText(fallback || line.lineType || line.carrier)
  if (explicit) return { value: explicit, reason: 'campo proveedor' }

  const text = detectLineTypeFromText(`${line.providerHint || ''} ${line.source || ''} ${line.company || ''} ${line.model || ''} ${line.plan || ''} ${line.notes || ''}`)
  if (text) return { value: text, reason: 'base proveedor' }

  const byIccid = classifyLineTypeByIccid(line.iccid, line.phone)
  if (byIccid) return { value: byIccid, reason: 'prefijo ICCID' }

  // Tener numero telefonico NO significa Telcel. Telcel solo debe venir de archivo/campo
  // Telcel o de la base de relacion; el match de Telcel se hace por telefono normalizado.
  return { value: 'emprenet', reason: 'default' }
}

function normalizeLineProvider(line, fallback = '', options = {}) {
  return detectLineProvider(line, fallback, options).value
}

function lineTypeLabel(value) {
  const normalized = normalizeLineType(value)
  return lineTypeOptions.find((option) => option.value === normalized)?.label || 'Emprenet'
}

function providerDetectionLabel(value) {
  const labels = {
    'archivo proveedor': 'Archivo proveedor',
    manual: 'Manual',
    'prefijo ICCID': 'Prefijo ICCID',
    'base proveedor': 'Base proveedor',
    'empresa/modelo/fuente': 'Base proveedor',
    'numero telefonico': 'Numero telefonico',
    'campo proveedor': 'Campo proveedor',
    default: 'Default'
  }
  return labels[textValue(value)] || textValue(value) || 'Default'
}

function isActiveLine(line) {
  return normalizeLineStatus(line.status) === 'activa'
}

function lineRenewalLabel(line) {
  const date = normalizeLineDate(line.renewalDate)
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return date || '-'
  return `${Number(match[3])} ${monthName(match[2]).toLowerCase()} ${match[1]}`
}

function normalizeLine(line, index = 0) {
  const identifiers = lineIdentifierParts(line)
  const phone = identifiers.phone
  const iccid = identifiers.iccid
  const renewalSignal = parseLineCustomerText(`${line.providerHint || ''} ${line.notes || ''} ${line.company || ''} ${line.source || ''} ${line.plan || ''} ${line.model || ''}`)
  const providerDetection = detectLineProvider({ ...line, phone, iccid }, line.lineType, { force: line.providerOverride })
  const lineType = providerDetection.value
  const clean = {
    company: renewalSignal?.company || sanitizeLineCompany(importTextValue(line.company)),
    phone,
    lineType,
    iccid,
    imei: importTextValue(line.imei),
    imeiLong: importTextValue(line.imeiLong || line.imei_largo),
    imeiShort: importTextValue(line.imeiShort || line.imei_corto),
    imei1: importTextValue(line.imei_1 || line.imei1),
    imei2: importTextValue(line.imei_2 || line.imei2),
    linkedDeviceUid: importTextValue(line.linkedDeviceUid || line.equipo_wialon_uid),
    carrier: importTextValue(line.carrier) || lineTypeLabel(lineType),
    plan: importTextValue(line.plan),
    alias: importTextValue(line.alias),
    unitName: importTextValue(line.unitName),
    relationId: importTextValue(line.relationId || line.relacion_id || line.relation_id),
    sourceLineId: importTextValue(line.sourceLineId || line.linea_id || line.line_id),
    status: normalizeLineStatus(line.status),
    billingCycle: normalizeCycle(line.billingCycle || 'anual'),
    renewalDate: renewalSignal?.renewalDate || normalizeLineDate(line.renewalDate),
    annualPrice: line.annualPrice === '' || line.annualPrice === undefined ? '' : String(line.annualPrice),
    soldBy: normalizeSeller(line.soldBy || line.seller || line.vendedor, defaultEquipmentSeller),
    clientOnly: Boolean(line.clientOnly),
    notes: importTextValue(line.notes),
    source: importTextValue(line.source) || 'manual',
    providerManual: Boolean(line.providerManual),
    providerDetectedBy: providerDetection.reason,
    recordState: textValue(line.recordState) || 'vigente'
  }
  clean.imei = clean.imei || clean.imeiLong || clean.imeiShort || clean.imei1 || clean.imei2 || clean.linkedDeviceUid
  const bernardoLine = isBernardoLine({ ...line, ...clean })
  clean.clientOnly = clean.clientOnly || bernardoLine || !clean.imei
  if (bernardoLine && lineBillingCycle(clean) === 'anual' && (clean.annualPrice === '' || Number(clean.annualPrice) <= 0)) {
    clean.annualPrice = '550'
  }
  clean.id = line.id || `${lineKey(clean)}-${index}`
  return clean
}

function lineFromRow(row, index, label, options = {}) {
  const rowText = Object.values(row).join(' ')
  const renewalSignal = parseLineCustomerText(rowText)
  const type = rowValueLoose(row, ['Tipo', 'Tipo servicio', 'Servicio', 'Modalidad', 'Producto'])
  const lineType = rowValueLoose(row, ['Proveedor', 'Proveedora', 'Proveedor linea', 'Tipo linea', 'Tipo de linea', 'Categoria linea', 'Categoria', 'Operador', 'Compania', 'Plan', 'Paquete'])
  const model = rowValueLoose(row, ['Equipo', 'Equipos', 'Modelo', 'Modelo equipo', 'Tipo equipo'])
  const imei = extractImeiFromRow(row)
  const phone = extractPhoneFromRow(row)
  const iccid = extractIccidFromRow(row)
  const billing = rowValueLoose(row, ['Cobro', 'Forma de pago', 'Tipo de pago', 'Periodicidad', 'Renovacion'])
  const payments = rowValueLoose(row, ['No. Pagos', 'Pagos'])
  const status = rowValueLoose(row, ['Estado', 'Estatus', 'Status', 'SIM Status', 'Lifecycle status', 'Connectivity status'])
  const notes = rowValueLoose(row, ['Notas', 'Comentario', 'Comentarios', 'Observaciones', 'Tags', 'Etiqueta', 'Etiquetas', 'Name', 'Nombre'])
  const renewalDate = renewalSignal?.renewalDate || rowValueLoose(row, ['Fecha renovacion', 'Renovacion', 'Vencimiento', 'Fecha vencimiento', 'Fecha pago', 'Proximo pago']) || ''
  const carrier = rowValueLoose(row, ['Compania', 'Operador', 'Carrier', 'Proveedor', 'Proveedora', 'Red']) || options.defaultCarrier || ''
  const rowCompany = rowValueLoose(row, ['Cliente', 'Empresa', 'Razon social', 'Cuenta', 'Nombre cliente', 'Customer', 'Organization', 'Grupo', 'Grupos', 'Assigned to', 'Workspace'])

  return normalizeLine(
    {
      company: renewalSignal?.company || sanitizeLineCompany(rowCompany) || options.defaultCompany || '',
      phone,
      lineType: lineType || carrier || '',
      providerOverride: options.forceLineType || rowValue(row, ['Proveedor']) || '',
      iccid,
      imei,
      carrier,
      model,
      providerHint: rowText,
      plan: rowValueLoose(row, ['Plan', 'Paquete', 'Producto', 'Servicio contratado', 'Tariff profile', 'Rate plan', 'Service profile']),
      status: status || 'activa',
      billingCycle: normalizeCycle(billing || 'anual', payments),
      renewalDate,
      annualPrice: parseAmount(rowValueLoose(row, ['Precio', 'Importe', 'Renta', 'Costo', 'Precio anual', 'Anualidad', 'Monto'])),
      clientOnly: !imei || normalizeHeader(type).includes('linea'),
      notes: renewalSignal && !notes ? `Renovacion importada como: ${rowText}` : notes,
      source: label
    },
    index
  )
}

function lineMatchesDeviceByImei(line, device) {
  if (!lineCanMatchWialon(line)) return false
  if (lineImeiValues(line).some((value) => {
    const imei = normalizeIdentifier(value)
    return imei && deviceMatchesIdentifier(device, imei)
  })) {
    return true
  }
  const suffixLengths = deviceImeiSuffixLengths(device)
  if (!suffixLengths.length) return false
  const deviceValues = deviceIdentifierValues(device).map((value) => textValue(value).replace(/\D/g, '')).filter(Boolean)
  return unique([...lineImeiValues(line), ...lineTextIdentifierValues(line)]).some((value) => {
    const cleanLineImei = textValue(value).replace(/\D/g, '')
    if (!cleanLineImei) return false
    return suffixLengths.some((length) => {
      const suffix = deriveImeiSuffix(cleanLineImei, length)
      return suffix && deviceValues.some((deviceValue) => deviceValue === suffix || deviceValue === cleanLineImei)
    })
  })
}

function lineMatchesDeviceByPhone(line, device) {
  if (!lineCanMatchWialon(line)) return false
  const phone = lineIdentifierParts(line).phone
  return Boolean(phone && deviceMatchesPhone(device, phone))
}

function lineMatchesDeviceByName(line, device) {
  if (!lineCanMatchWialon(line)) return false
  const deviceName = normalizeHeader(device?.unitName)
  return Boolean(deviceName && lineNameMatchValues(line).includes(deviceName))
}

function lineIsWialonMatchExempt(line, devices = state.devices, match = null) {
  const type = normalizeLineType(line.lineType || line.providerOverride || line.carrier)
  const text = normalizeHeader(`${line.company || ''} ${line.status || ''} ${line.notes || ''} ${line.plan || ''} ${line.source || ''}`)
  if (type === 'emnify') {
    if (!isActiveLine(line)) return true
    if (
      text.includes('deleted') ||
      text.includes('disabled') ||
      text.includes('available') ||
      text.includes('disponible') ||
      text.includes('sin asign') ||
      text.includes('unassigned')
    ) {
      return true
    }
  }
  const hasDeviceMatch = match ? Boolean(match.device) : Boolean(matchLineDevice(line, devices))
  if ((type === 'emprenet' || type === 'telcel') && !hasDeviceMatch && (text.includes('disponible') || text.includes('available'))) return true
  return false
}

function lineWialonExemptLabel(line) {
  const type = normalizeLineType(line.lineType || line.providerOverride || line.carrier)
  const text = normalizeHeader(`${line.company || ''} ${line.status || ''} ${line.notes || ''} ${line.plan || ''} ${line.source || ''}`)
  if (type === 'emnify') {
    if (!isActiveLine(line) || text.includes('deleted') || text.includes('disabled')) return 'Emnify baja / sin activar'
    if (text.includes('available') || text.includes('disponible') || text.includes('sin asign') || text.includes('unassigned')) {
      return 'Emnify disponible / sin asignar'
    }
  }
  if ((type === 'emprenet' || type === 'telcel') && (text.includes('disponible') || text.includes('available'))) {
    return `${lineTypeLabel(type)} disponible / sin asignar`
  }
  return 'No asignable a Wialon'
}

function isStreamaxDevice(device) {
  return deviceText(device).includes('streamax')
}

function isSuntechDevice(device) {
  return deviceText(device).includes('suntech')
}

function isCalampDevice(device) {
  const text = deviceText(device)
  return text.includes('calamp') || text.includes('cal amp')
}

function isCellocatorDevice(device) {
  const text = deviceText(device)
  return text.includes('cellocator') || text.includes('cello locator') || text.includes('cello')
}

function deviceImeiSuffixLengths(device) {
  if (isSuntechDevice(device)) return [10, 9, 6]
  if (isCalampDevice(device)) return [9, 10]
  if (isCellocatorDevice(device)) return [7, 6]
  return []
}

function deviceMatchIndex(devices = state.devices) {
  if (deviceMatchIndexCache.devices === devices && deviceMatchIndexCache.index) return deviceMatchIndexCache.index
  const index = {
    exact: new Map(),
    phone: new Map(),
    streamaxPhone: new Map(),
    name: new Map(),
    suffix: []
  }
  const duplicateNames = new Set()
  const add = (map, key, device) => {
    if (key && !map.has(key)) map.set(key, device)
  }
  devices.forEach((device) => {
    deviceIdentifierValues(device).forEach((value) => add(index.exact, normalizeIdentifier(value), device))
    phoneMatchValues(device.phone).forEach((value) => add(isStreamaxDevice(device) ? index.streamaxPhone : index.phone, value, device))
    const deviceName = normalizeHeader(device.unitName)
    if (deviceName) {
      if (index.name.has(deviceName)) duplicateNames.add(deviceName)
      else index.name.set(deviceName, device)
    }
    const suffixLengths = deviceImeiSuffixLengths(device)
    if (suffixLengths.length) {
      const identifiers = deviceIdentifierValues(device)
        .map((value) => textValue(value).replace(/\D/g, ''))
        .filter(Boolean)
      index.suffix.push({ device, suffixLengths, identifiers })
    }
  })
  duplicateNames.forEach((name) => index.name.delete(name))
  deviceMatchIndexCache = { devices, index }
  return index
}

function matchLineDeviceWithMethod(line, devices = state.devices) {
  if (!lineCanMatchWialon(line)) return { device: null, method: '' }
  const index = deviceMatchIndex(devices)
  const phone = lineIdentifierParts(line).phone
  for (const phoneKey of phoneMatchValues(phone)) {
    const device = index.streamaxPhone.get(phoneKey)
    if (device) return { device, method: 'telefono' }
  }
  for (const value of lineImeiValues(line)) {
    const key = normalizeIdentifier(value)
    const device = key ? index.exact.get(key) : null
    if (device) return { device, method: 'imei' }
  }
  const lineIdentifiers = unique([...lineImeiValues(line), ...lineTextIdentifierValues(line)])
    .map((value) => textValue(value).replace(/\D/g, ''))
    .filter(Boolean)
  for (const candidate of index.suffix) {
    const matched = lineIdentifiers.some((lineIdentifier) =>
      candidate.suffixLengths.some((length) => {
        const suffix = deriveImeiSuffix(lineIdentifier, length)
        return suffix && candidate.identifiers.some((deviceIdentifier) => deviceIdentifier === suffix || deviceIdentifier === lineIdentifier)
      })
    )
    if (matched) return { device: candidate.device, method: 'imei' }
  }
  for (const phoneKey of phoneMatchValues(phone)) {
    const device = index.phone.get(phoneKey)
    if (device) return { device, method: 'telefono' }
  }
  for (const name of lineNameMatchValues(line)) {
    const device = index.name.get(name)
    if (device) return { device, method: 'nombre' }
  }
  return { device: null, method: '' }
}

function matchLineDevice(line, devices = state.devices) {
  return matchLineDeviceWithMethod(line, devices).device
}

function lineMatchMethod(line, devices = state.devices) {
  return matchLineDeviceWithMethod(line, devices).method
}

function lineMatchType(line, devices = state.devices) {
  if (isBernardoLine(line)) return 'solo_linea'
  const match = matchLineDeviceWithMethod(line, devices)
  if (match.device) return 'equipo'
  if (lineIsWialonMatchExempt(line, devices, match)) return 'no_asignada'
  if (line.clientOnly) return 'solo_linea'
  return 'sin_match'
}

function lineMatchTypeFromMatch(line, match, devices = state.devices) {
  if (isBernardoLine(line)) return 'solo_linea'
  if (match?.device) return 'equipo'
  if (lineIsWialonMatchExempt(line, devices, match)) return 'no_asignada'
  if (line.clientOnly) return 'solo_linea'
  return 'sin_match'
}

function lineMatchLabel(line) {
  if (isBernardoLine(line)) return 'Solo linea celular'
  const device = matchLineDevice(line)
  if (device) {
    const method = lineMatchMethod(line)
    const suffix = method === 'telefono' ? ' / telefono Wialon' : method === 'nombre' ? ' / nombre Wialon' : ''
    return `${device.unitName || 'Equipo'} / ${device.company || 'Sin empresa'}${suffix}`
  }
  if (lineIsWialonMatchExempt(line)) return lineWialonExemptLabel(line)
  return line.clientOnly ? 'Solo linea celular' : 'Sin match'
}

function lineMatchTypeText(line) {
  const matchType = lineMatchType(line)
  if (matchType === 'equipo') return 'Equipo GPS'
  if (matchType === 'no_asignada') return 'No asignable'
  if (matchType === 'solo_linea') return 'Solo linea celular'
  return 'Sin match'
}

function lineForDeviceIndex(lines = state.lines, devices = state.devices) {
  if (lineForDeviceIndexCache.lines === lines && lineForDeviceIndexCache.devices === devices && lineForDeviceIndexCache.index) {
    return lineForDeviceIndexCache.index
  }
  const index = new Map()
  lines.forEach((line) => {
    const match = matchLineDeviceWithMethod(line, devices)
    const deviceId = match.device?.id
    if (deviceId && !index.has(deviceId)) index.set(deviceId, { line, method: match.method })
  })
  lineForDeviceIndexCache = { lines, devices, index }
  return index
}

function lineForDevice(device) {
  return lineForDeviceIndex().get(device?.id)?.line || null
}

function lineForDeviceMatchMethod(device, line = lineForDevice(device)) {
  const cached = lineForDeviceIndex().get(device?.id)
  if (cached?.line?.id === line?.id) return cached.method
  return line ? lineMatchMethod(line, [device]) : ''
}

function preferredLinePhoneFromRecord(record) {
  return [
    record.msisdn,
    record.MSISDN,
    record.msidn,
    record.MSIDN,
    record.relacion_2023_msisdn,
    record.telefono,
    record.phone,
    record.linea,
    record.Linea
  ]
    .map(normalizePhoneCandidate)
    .find(Boolean)
}

function preferredLineImeiFromRecord(record) {
  return [
    record.imei,
    record.imei_largo,
    record.imeiLong,
    record.imei_1,
    record.imei1,
    record.imei_2,
    record.imei2,
    record.imei_corto,
    record.imeiShort,
    record.equipo_wialon_uid
  ]
    .map(importTextValue)
    .find(Boolean)
}

function preferredLineImeiLongFromRecord(record) {
  return [
    record.imei_largo,
    record.imeiLong,
    record.imei,
    record.imei_1,
    record.imei1,
    record.imei_2,
    record.imei2,
    record.equipo_wialon_uid
  ]
    .map(importTextValue)
    .find(Boolean)
}

function preferredLineImeiShortFromRecord(record, sourceImei = '') {
  return [record.imei_corto, record.imeiShort, record.imei_2, record.imei2, deriveShortImei(sourceImei)].map(importTextValue).find(Boolean)
}

function deviceLineIccid(device, line = lineForDevice(device)) {
  return line?.iccid || importTextValue(device.lineIccid || device.iccid)
}

function deviceLineOperator(device, line = lineForDevice(device)) {
  if (line) return lineTypeLabel(line.lineType)
  return importTextValue(device.lineOperator)
}

function deviceLineCarrier(device, line = lineForDevice(device)) {
  if (line?.carrier && normalizeHeader(line.carrier) !== normalizeHeader(lineTypeLabel(line.lineType))) return line.carrier
  return importTextValue(device.lineCarrier)
}

function deviceLinePhone(device, line = lineForDevice(device)) {
  return line?.phone || importTextValue(device.linePhone)
}

function deviceLineMatchLabel(device, line = lineForDevice(device)) {
  if (line) {
    const method = lineForDeviceMatchMethod(device, line)
    if (method === 'telefono') return 'Match por telefono'
    if (method === 'nombre') return 'Match por nombre'
    return 'Match por IMEI'
  }
  return importTextValue(device.lineMatchSource) ? 'Base de lineas' : ''
}

function lineMatchKeys(line, devices = state.devices) {
  return unique(lineIdentifierKeys(line))
}

function sameLineIccid(firstLine, secondLine) {
  const firstIccid = lineIdentifierParts(firstLine).iccid
  const secondIccid = lineIdentifierParts(secondLine).iccid
  return Boolean(firstIccid && secondIccid && firstIccid === secondIccid)
}

function mergeLineRecord(oldLine, normalizedLine) {
  const preserveImeiByExistingIcc = sameLineIccid(oldLine, normalizedLine) && Boolean(oldLine.imei || oldLine.imeiLong || oldLine.imeiShort)
  const preserveSuntechImei = isSuntechDevice(matchLineDevice(oldLine))
  const preserveExistingImei = preserveImeiByExistingIcc || preserveSuntechImei
  const providerIsManual = Boolean(oldLine.providerManual)
  const incomingProviderIsDefault = normalizedLine.providerDetectedBy === 'default'
  const oldLineType = normalizeLineType(oldLine.lineType)
  const oldCompany = sanitizeLineCompany(oldLine.company)
  const incomingCompany = sanitizeLineCompany(normalizedLine.company)
  const nextLineType = providerIsManual
    ? oldLine.lineType
    : incomingProviderIsDefault && oldLineType && oldLineType !== 'emprenet'
      ? oldLine.lineType
      : normalizedLine.lineType || oldLine.lineType
  const nextCarrier = providerIsManual || (incomingProviderIsDefault && oldLine.carrier) ? oldLine.carrier : normalizedLine.carrier || oldLine.carrier
  const next = {
    ...oldLine,
    company: incomingCompany || oldCompany,
    phone: normalizedLine.phone || oldLine.phone,
    lineType: nextLineType,
    iccid: normalizedLine.iccid || oldLine.iccid,
    imei: preserveExistingImei ? oldLine.imei || normalizedLine.imei : normalizedLine.imei || oldLine.imei,
    imeiLong: preserveExistingImei ? oldLine.imeiLong || normalizedLine.imeiLong : normalizedLine.imeiLong || oldLine.imeiLong,
    imeiShort: preserveExistingImei ? oldLine.imeiShort || normalizedLine.imeiShort : normalizedLine.imeiShort || oldLine.imeiShort,
    carrier: nextCarrier,
    plan: normalizedLine.plan || oldLine.plan,
    status: normalizedLine.status || oldLine.status,
    billingCycle: normalizedLine.billingCycle || oldLine.billingCycle,
    renewalDate: normalizedLine.renewalDate || oldLine.renewalDate,
    annualPrice: normalizedLine.annualPrice || oldLine.annualPrice,
    soldBy: normalizeSeller(oldLine.soldBy || normalizedLine.soldBy, defaultEquipmentSeller),
    clientOnly: Boolean(oldLine.clientOnly || normalizedLine.clientOnly),
    notes: normalizedLine.notes || oldLine.notes,
    source: normalizedLine.source || oldLine.source,
    providerManual: providerIsManual,
    providerDetectedBy: providerIsManual ? 'manual' : incomingProviderIsDefault && oldLine.providerDetectedBy ? oldLine.providerDetectedBy : normalizedLine.providerDetectedBy || oldLine.providerDetectedBy,
    id: oldLine.id
  }
  const changed = [
    'company',
    'phone',
    'lineType',
    'iccid',
    'imei',
    'imeiLong',
    'imeiShort',
    'carrier',
    'plan',
    'status',
    'billingCycle',
    'renewalDate',
    'annualPrice',
    'soldBy',
    'clientOnly',
    'notes',
    'source',
    'providerManual',
    'providerDetectedBy'
  ].some((field) => String(oldLine[field] ?? '') !== String(next[field] ?? ''))
  return {
    ...next,
    recordState: changed ? 'actualizado' : oldLine.recordState === 'nuevo' ? 'nuevo' : 'vigente'
  }
}

function mergeLines(previous, incoming, options = {}) {
  const devices = options.devices || state.devices
  const markMissing = options.markMissing !== false
  const previousByKey = new Map()
  const previousLines = dedupeLines(
    previous.map((line, index) => normalizeLine(line, index)),
    devices
  )
  const mergedById = new Map()
  const orderedIds = []
  const touchedIds = new Set()

  const indexLine = (line) => {
    lineMatchKeys(line, devices).forEach((key) => {
      if (!previousByKey.has(key)) previousByKey.set(key, line.id)
    })
  }

  previousLines.forEach((line) => {
    mergedById.set(line.id, line)
    orderedIds.push(line.id)
    indexLine(line)
  })

  incoming.forEach((line, index) => {
    const normalized = normalizeLine(line, index)
    const existingId = lineMatchKeys(normalized, devices).map((key) => previousByKey.get(key)).find(Boolean)
    if (existingId) {
      const oldLine = mergedById.get(existingId)
      const next = mergeLineRecord(oldLine, normalized)
      mergedById.set(existingId, next)
      touchedIds.add(existingId)
      indexLine(next)
      return
    }

    const id = normalized.id || `${lineKey(normalized)}-${Date.now()}-${index}`
    const next = { ...normalized, id, recordState: 'nuevo' }
    mergedById.set(id, next)
    orderedIds.push(id)
    touchedIds.add(id)
    indexLine(next)
  })

  return orderedIds.map((id) => {
    const line = mergedById.get(id)
    if (markMissing && previousLines.some((previousLine) => previousLine.id === id) && !touchedIds.has(id)) {
      return { ...line, recordState: 'no_encontrado' }
    }
    return line
  })
}

function dedupeLines(lines, devices = state.devices) {
  const normalizedLines = lines.map((line, index) => normalizeLine(line, index))
  const byKey = new Map()
  const byId = new Map()
  const orderedIds = []

  normalizedLines.forEach((line) => {
    const existingId = lineMatchKeys(line, devices).map((key) => byKey.get(key)).find(Boolean)
    if (existingId) {
      const merged = mergeLineRecord(byId.get(existingId), line)
      byId.set(existingId, merged)
      lineMatchKeys(merged, devices).forEach((key) => byKey.set(key, existingId))
      return
    }

    byId.set(line.id, line)
    orderedIds.push(line.id)
    lineMatchKeys(line, devices).forEach((key) => byKey.set(key, line.id))
  })

  return orderedIds.map((id) => byId.get(id))
}

function lineStats(lines = state.lines, devices = state.devices) {
  return lines.reduce((totals, line) => {
    const match = matchLineDeviceWithMethod(line, devices)
    const matchType = lineMatchTypeFromMatch(line, match, devices)
    totals.total += 1
    if (isActiveLine(line)) totals.active += 1
    else totals.inactive += 1
    totals[matchType === 'equipo' ? 'matched' : matchType === 'solo_linea' ? 'clientOnly' : matchType === 'no_asignada' ? 'exempt' : 'unmatched'] += 1
    return totals
  }, {
    total: 0,
    active: 0,
    inactive: 0,
    matched: 0,
    clientOnly: 0,
    exempt: 0,
    unmatched: 0
  })
}

function filteredLines() {
  const query = normalizeHeader(state.lineQuery)
  const iccQuery = normalizeIdentifier(state.lineIccQuery)
  return state.lines.filter((line) => {
    const matchType = lineMatchType(line)
    const statusMatches =
      !state.lineStatusFilter ||
      (state.lineStatusFilter === 'activa' ? isActiveLine(line) : state.lineStatusFilter === 'desactivada' ? !isActiveLine(line) : normalizeLineStatus(line.status) === state.lineStatusFilter)
    const matchMatches = !state.lineMatchFilter || matchType === state.lineMatchFilter
    const typeMatches = !state.lineTypeFilter || normalizeLineType(line.lineType) === state.lineTypeFilter
    const queryMatches =
      !query ||
      normalizeHeader(
        `${line.company} ${line.phone} ${line.iccid} ${line.imei} ${lineTypeLabel(line.lineType)} ${line.carrier} ${line.plan} ${line.notes} ${lineSeller(line)} ${lineMatchLabel(line)}`
      ).includes(query)
    const iccMatches = !iccQuery || normalizeIdentifier(line.iccid).includes(iccQuery)
    return statusMatches && matchMatches && typeMatches && queryMatches && iccMatches
  })
}

function linePaginationState(total) {
  const pageCount = Math.max(1, Math.ceil(total / linePageSize))
  const page = Math.min(Math.max(1, Number(state.linePage || 1)), pageCount)
  const start = total ? (page - 1) * linePageSize : 0
  const end = Math.min(start + linePageSize, total)
  return {
    page,
    pageCount,
    start,
    end
  }
}

function visiblePageNumbers(page, pageCount) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1])
  if (page <= 3) [1, 2, 3, 4].forEach((number) => pages.add(number))
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1, pageCount].forEach((number) => pages.add(number))
  const valid = [...pages].filter((number) => number >= 1 && number <= pageCount).sort((a, b) => a - b)
  return valid.reduce((items, number, index) => {
    if (index && number - valid[index - 1] > 1) items.push('...')
    items.push(number)
    return items
  }, [])
}

function tablePaginationState(total, pageValue, pageSize = tablePageSize) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(1, Number(pageValue || 1)), pageCount)
  const start = total ? (page - 1) * pageSize : 0
  const end = Math.min(start + pageSize, total)
  return {
    page,
    pageCount,
    start,
    end,
    pageSize
  }
}

function renderTablePagination(total, pagination, options = {}) {
  const label = options.label || 'registros'
  const dataAttr = options.dataAttr || 'data-table-page'
  const ariaLabel = options.ariaLabel || `Paginacion de ${label}`
  if (total <= pagination.pageSize) {
    return `<div class="pager"><div class="pager-summary">Mostrando ${total} de ${total} ${esc(label)}</div></div>`
  }
  const pages = visiblePageNumbers(pagination.page, pagination.pageCount)
  return `
    <div class="pager">
      <div class="pager-summary">Mostrando ${pagination.start + 1}-${pagination.end} de ${total} ${esc(label)} - ${pagination.pageSize} por hoja</div>
      <div class="pager-controls" aria-label="${attr(ariaLabel)}">
        <button class="icon-button" ${dataAttr}="${pagination.page - 1}" ${pagination.page <= 1 ? 'disabled' : ''} title="Pagina anterior">${icon('chevron-left')}</button>
        ${pages
          .map((page) =>
            page === '...'
              ? '<span class="pager-gap">...</span>'
              : `<button class="pager-page ${page === pagination.page ? 'active' : ''}" ${dataAttr}="${page}" ${page === pagination.page ? 'disabled' : ''}>${page}</button>`
          )
          .join('')}
        <button class="icon-button" ${dataAttr}="${pagination.page + 1}" ${pagination.page >= pagination.pageCount ? 'disabled' : ''} title="Pagina siguiente">${icon('chevron-right')}</button>
      </div>
    </div>
  `
}

function renderPagination(total, pagination) {
  if (total <= linePageSize) {
    return `<div class="pager"><div class="pager-summary">Mostrando ${total} de ${total} lineas</div></div>`
  }
  const pages = visiblePageNumbers(pagination.page, pagination.pageCount)
  return `
    <div class="pager">
      <div class="pager-summary">Mostrando ${pagination.start + 1}-${pagination.end} de ${total} lineas - ${linePageSize} por hoja</div>
      <div class="pager-controls" aria-label="Paginacion de lineas">
        <button class="icon-button" data-line-page="${pagination.page - 1}" ${pagination.page <= 1 ? 'disabled' : ''} title="Pagina anterior">${icon('chevron-left')}</button>
        ${pages
          .map((page) =>
            page === '...'
              ? '<span class="pager-gap">...</span>'
              : `<button class="pager-page ${page === pagination.page ? 'active' : ''}" data-line-page="${page}" ${page === pagination.page ? 'disabled' : ''}>${page}</button>`
          )
          .join('')}
        <button class="icon-button" data-line-page="${pagination.page + 1}" ${pagination.page >= pagination.pageCount ? 'disabled' : ''} title="Pagina siguiente">${icon('chevron-right')}</button>
      </div>
    </div>
  `
}

function equipmentPaginationState(total) {
  const pageCount = Math.max(1, Math.ceil(total / equipmentPageSize))
  const page = Math.min(Math.max(1, Number(state.equipmentPage || 1)), pageCount)
  const start = total ? (page - 1) * equipmentPageSize : 0
  const end = Math.min(start + equipmentPageSize, total)
  return {
    page,
    pageCount,
    start,
    end
  }
}

function renderEquipmentPagination(total, pagination) {
  if (total <= equipmentPageSize) {
    return `<div class="pager"><div class="pager-summary">Mostrando ${total} de ${total} equipos</div></div>`
  }
  const pages = visiblePageNumbers(pagination.page, pagination.pageCount)
  return `
    <div class="pager">
      <div class="pager-summary">Mostrando ${pagination.start + 1}-${pagination.end} de ${total} equipos - ${equipmentPageSize} por hoja</div>
      <div class="pager-controls" aria-label="Paginacion de equipos">
        <button class="icon-button" data-equipment-page="${pagination.page - 1}" ${pagination.page <= 1 ? 'disabled' : ''} title="Pagina anterior">${icon('chevron-left')}</button>
        ${pages
          .map((page) =>
            page === '...'
              ? '<span class="pager-gap">...</span>'
              : `<button class="pager-page ${page === pagination.page ? 'active' : ''}" data-equipment-page="${page}" ${page === pagination.page ? 'disabled' : ''}>${page}</button>`
          )
          .join('')}
        <button class="icon-button" data-equipment-page="${pagination.page + 1}" ${pagination.page >= pagination.pageCount ? 'disabled' : ''} title="Pagina siguiente">${icon('chevron-right')}</button>
      </div>
    </div>
  `
}

function lineProviderGroups(lines) {
  return lineTypeOptions
    .map((option) => {
      const providerLines = lines.filter((line) => normalizeLineType(line.lineType) === option.value)
      const active = providerLines.filter(isActiveLine).length
      const suspended = providerLines.filter((line) => normalizeLineStatus(line.status) === 'suspendida').length
      const issued = providerLines.filter((line) => normalizeLineStatus(line.status) === 'emitida').length
      const inactive = providerLines.length - active
      const otherInactive = Math.max(0, inactive - suspended - issued)
      return {
        ...option,
        lines: providerLines,
        active,
        inactive,
        suspended,
        issued,
        otherInactive
      }
    })
    .filter((group) => group.lines.length)
}

function lineProviderStatusSummary(group) {
  const parts = [`${group.active} activas`]
  if (group.suspended) parts.push(`${group.suspended} suspendidas`)
  if (group.issued) parts.push(`${group.issued} emitidas`)
  if (group.otherInactive) parts.push(`${group.otherInactive} desactivadas`)
  if (!group.suspended && !group.issued && !group.otherInactive && group.inactive) parts.push(`${group.inactive} desactivadas`)
  return parts.join(' / ')
}

function lineCompanyOptions(companies) {
  return unique([...defaultLineClients, ...companies.map((company) => company.name), ...state.lines.map((line) => line.company), ...Object.keys(state.companyMeta)]).sort(
    (a, b) => a.localeCompare(b)
  )
}

function lineClientProfiles(companies) {
  return lineCompanyOptions(companies).map((company) => {
    const clientLines = state.lines.filter((line) => normalizeHeader(line.company) === normalizeHeader(company))
    const active = clientLines.filter(isActiveLine)
    const inactive = clientLines.filter((line) => !isActiveLine(line))
    const nextRenewal = active
      .map((line) => normalizeLineDate(line.renewalDate))
      .filter(Boolean)
      .sort()[0]
    return {
      company,
      lines: clientLines,
      active,
      inactive,
      nextRenewal
    }
  })
}

function lineRowsForStatus(lines, active) {
  return lines.filter((line) => (active ? isActiveLine(line) : !isActiveLine(line)))
}

function lineShouldImport(line, options = {}) {
  if (options.requireIcc && !line.iccid) return false
  if (line.phone || line.iccid) return true
  return Boolean(options.allowImeiOnly && line.imei)
}

function linesFromRows(rows, label, options = {}) {
  return rows.map((row, index) => lineFromRow(row, index, label, options)).filter((line) => lineShouldImport(line, options))
}

function mergeLineRows(previous, rows, label, options = {}) {
  const imported = linesFromRows(rows, label, options)
  if (!imported.length) {
    const stats = lineStats(previous, options.devices || state.devices)
    return { lines: previous, imported, stats }
  }
  const merged = mergeLines(previous, imported, { markMissing: options.markMissing, devices: options.devices })
  const stats = lineStats(merged, options.devices || state.devices)
  return { lines: merged, imported, stats }
}

function buildLineBridge(lines) {
  const bridge = new Map()
  lines.forEach((line) => {
    const normalized = normalizeLine(line)
    if (!normalized.imei) return
    const key = normalizeIdentifier(normalized.imei)
    if (key && !bridge.has(`imei:${key}`)) bridge.set(`imei:${key}`, normalized)
  })
  return bridge
}

function buildDeviceLineBridge(devices = state.devices) {
  const bridge = new Map()
  devices.forEach((device) => {
    const normalized = normalizeDeviceIdentifiers(device)
    const linked = {
      company: normalized.company,
      imei: deviceImeiLong(normalized),
      source: 'Wialon'
    }
    deviceIdentifierValues(normalized).forEach((identifier) => {
      const key = normalizeIdentifier(identifier)
      if (key && !bridge.has(`imei:${key}`)) bridge.set(`imei:${key}`, linked)
    })
  })
  return bridge
}

function mergedLineBridge(lines, devices = state.devices) {
  return new Map([...buildLineBridge(lines), ...buildDeviceLineBridge(devices)])
}

function enrichLinesFromBridge(lines, bridge, devices = state.devices) {
  return lines.map((line, index) => {
    const normalized = normalizeLine(line, index)
    const lineImei = normalizeIdentifier(normalized.imei)
    const source = lineImei ? bridge.get(`imei:${lineImei}`) : null
    const device = matchLineDevice(source ? { ...normalized, imei: normalized.imei || source.imei } : normalized, devices)
    const linkedCompany = sanitizeLineCompany(device?.company) || sanitizeLineCompany(source?.company) || normalized.company
    const linkedImei = isSuntechDevice(device)
      ? deviceImeiLong(device || {}) || normalized.imei || source?.imei
      : normalized.imei || source?.imei || deviceImeiLong(device || {})
    if (!source && !device) return normalized
    return normalizeLine(
      {
        ...normalized,
        company: linkedCompany,
        imei: linkedImei,
        clientOnly: normalized.clientOnly && !linkedImei,
        notes: normalized.notes || (linkedImei ? `IMEI ligado desde ${device ? 'Wialon' : source.source}` : normalized.notes)
      },
      index
    )
  })
}

function lineImportState(label, rowsLength, imported, stats, extra = {}) {
  return {
    source: label,
    rows: rowsLength,
    imported: imported.length,
    iccDetected: imported.filter((line) => line.iccid).length,
    matched: stats.matched,
    clientOnly: stats.clientOnly,
    exempt: stats.exempt,
    unmatched: stats.unmatched,
    appliedAt: new Date().toISOString(),
    ...extra
  }
}

function lineFromRelationRecord(record, index) {
  const provider = record.proveedor || record.provider || ''
  const isBernardo = normalizeHeader(record.cliente_perfil || record.cliente_fuente || record.alias).includes('bernardo') || normalizeHeader(record.alias).startsWith('berna')
  const imei = preferredLineImeiFromRecord(record)
  const imeiLong = preferredLineImeiLongFromRecord(record)
  const imeiShort = preferredLineImeiShortFromRecord(record, imeiLong || imei)
  const price = parseAmount(record.precio_mensual || record.precio_pactado || record.precio || record.annualPrice || record.precio_anual || '')
  return normalizeLine(
    {
      id: `${normalizeHeader(provider) || 'linea'}-${record.linea_id || record.relacion_id || index}`,
      relationId: record.relacion_id,
      sourceLineId: record.linea_id,
      company: record.cliente_perfil || (isBernardo ? 'Bernardo' : record.equipo_wialon_cuenta || record.cliente_fuente) || '',
      phone: preferredLinePhoneFromRecord(record),
      lineType: provider,
      providerOverride: provider,
      iccid: record.iccid_luhn || record.iccid,
      imei,
      imeiLong,
      imeiShort,
      imei1: record.imei_1 || record.imei1,
      imei2: record.imei_2 || record.imei2,
      linkedDeviceUid: record.equipo_wialon_uid,
      carrier: record.operador || provider,
      plan: record.plan,
      alias: record.alias,
      unitName: record.equipo_wialon_nombre,
      status: record.estatus_servicio || record.estatus_original || 'activa',
      billingCycle: normalizeCycle(record.cobro || record.periodicidad || record.billingCycle || (isBernardo ? 'anual' : 'anual')),
      renewalDate: record.fecha_renovacion || '',
      annualPrice: price > 0 ? normalizeStandardMonthlyPriceValue(String(price)) : isBernardo ? '550' : '',
      soldBy: record.vendido_por || record.vendedor || record.soldBy || record.seller || defaultEquipmentSeller,
      clientOnly: isBernardo || !imei,
      notes: [record.alias, record.estatus_original, record.renovacion_fuente, record.match_fuente, record.equipo_wialon_nombre, record.equipo_wialon_tipo, record.notas].filter(Boolean).join(' | '),
      source: record.fuente || 'base_relacion_lineas',
      providerManual: false,
      recordState: 'vigente'
    },
    index
  )
}

function relationRecordFromRow(row) {
  const phone = rowValueLoose(row, linePhoneCandidates) || extractPhoneFromRow(row)
  const iccid = rowValueLoose(row, lineIccCandidates) || extractIccidFromRow(row)
  const imei = rowValueLoose(row, lineImeiCandidates) || extractImeiFromRow(row)
  return {
    relacion_id: rowValue(row, ['Relacion ID', 'Relación ID', 'relation_id', 'relacion_id']),
    linea_id: rowValue(row, ['Linea ID', 'Línea ID', 'linea_id', 'line_id']),
    proveedor: rowValueLoose(row, ['Proveedor', 'Proveedora', 'Provider', 'Tipo linea', 'Tipo de linea', 'Operador']),
    estatus_servicio: rowValue(row, ['Estatus servicio', 'Status servicio', 'Service status', 'Estatus']),
    estatus_original: rowValue(row, ['Estatus original', 'Original status']),
    telefono: phone,
    msisdn: rowValueLoose(row, ['MSISDN', 'MSIDN', 'MSISDN linea', 'MSISDN línea', 'MSISDN lÃ­nea', 'Linea MSISDN', 'MSISDN number']) || phone,
    relacion_2023_msisdn: rowValue(row, ['Relacion 2023 MSISDN', 'Relación 2023 MSISDN', 'RelaciÃ³n 2023 MSISDN', 'relacion_2023_msisdn']),
    iccid,
    iccid_luhn: rowValueLoose(row, ['ICCID Luhn', 'ICCID LUHN', 'ICCID / ICC']) || iccid,
    sim_ultimos4: rowValue(row, ['SIM ultimos 4', 'SIM últimos 4']),
    imei,
    imei_largo: rowValue(row, ['IMEI largo', 'IMEI Largo', 'IMEI completo', 'Long IMEI']),
    imei_corto: rowValue(row, ['IMEI corto', 'IMEI Corto', 'Short IMEI']),
    imei_1: rowValue(row, ['IMEI 1', 'IMEI1', 'imei_1']),
    imei_2: rowValue(row, ['IMEI 2', 'IMEI2', 'imei_2']),
    equipo_wialon_uid: rowValue(row, ['Equipo Wialon UID', 'Wialon UID', 'UID Wialon', 'equipo_wialon_uid']),
    equipo_wialon_nombre: rowValue(row, ['Equipo Wialon nombre', 'Nombre Wialon', 'Unidad Wialon', 'equipo_wialon_nombre']),
    equipo_wialon_cuenta: rowValue(row, ['Equipo Wialon cuenta', 'Cuenta Wialon', 'Empresa Wialon', 'equipo_wialon_cuenta']),
    equipo_wialon_tipo: rowValue(row, ['Equipo Wialon tipo', 'Tipo Wialon', 'Modelo Wialon', 'equipo_wialon_tipo']),
    match_fuente: rowValue(row, ['Match fuente', 'Fuente match', 'match_fuente']),
    renovacion_fuente: rowValue(row, ['Renovacion fuente', 'Renovación fuente', 'renovacion_fuente']),
    imsi: rowValue(row, ['IMSI']),
    plan: rowValue(row, ['Plan']),
    operador: rowValue(row, ['Operador', 'Carrier']),
    cobro: rowValue(row, ['Cobro', 'Periodicidad', 'Forma de pago', 'Billing cycle']),
    precio_mensual: rowValue(row, ['Precio mensual', 'Mensualidad', 'Precio pactado mensual']),
    precio_pactado: rowValue(row, ['Precio pactado', 'Precio', 'Importe', 'Monto']),
    vendido_por: rowValue(row, ['Vendido por', 'Vendedor', 'Asesor']),
    alias: rowValue(row, ['Alias']),
    cliente_fuente: rowValue(row, ['Cliente fuente', 'Cliente']),
    subcuenta: rowValue(row, ['Subcuenta']),
    fuente: rowValue(row, ['Fuente']),
    fila_fuente: rowValue(row, ['Fila fuente']),
    fecha_activacion: rowValue(row, ['Fecha activacion', 'Fecha activación']),
    fecha_ultimo_cambio: rowValue(row, ['Fecha ultimo cambio', 'Fecha último cambio']),
    notas: rowValue(row, ['Notas'])
  }
}

function relationRecordsFromRows(rows) {
  const records = rows
    .map(relationRecordFromRow)
    .filter((record) => record.proveedor && (record.linea_id || record.relacion_id || record.iccid || record.imei))
  return records.length ? records : []
}

function relationPayloadToLines(payload) {
  if (payload?.version === 1 && payload?.alg === 'aes-256-gcm' && payload?.data) {
    throw new Error('El servidor entrego la base de lineas todavia cifrada; actualiza y reinicia el servidor.')
  }
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.lineas)
      ? payload.lineas
      : Array.isArray(payload?.lines)
        ? payload.lines
        : Array.isArray(payload?.state?.lines)
          ? payload.state.lines
          : []
  return rows.map((row, index) => {
    const relationShape = row?.proveedor || row?.provider || row?.relacion_id || row?.linea_id || row?.iccid_luhn || row?.equipo_wialon_cuenta || row?.cliente_fuente
    return relationShape ? lineFromRelationRecord(row, index) : normalizeLine(row, index)
  })
}

function lineRelationKeys(line) {
  const normalized = normalizeLine(line)
  const providerKey = normalizeLineType(normalized.lineType || normalized.providerOverride || normalized.carrier)
  const relationId = normalizeIdentifier(normalized.relationId)
  const sourceLineId = normalizeIdentifier(normalized.sourceLineId)
  const iccid = normalizeIdentifier(normalized.iccid)
  const keys = []
  if (relationId) keys.push(`relation:${providerKey}:${relationId}`)
  if (sourceLineId) keys.push(`source-line:${providerKey}:${sourceLineId}`)
  if (iccid) keys.push(`iccid:${iccid}`)
  return unique(keys)
}

function indexLinesByRelationKey(lines) {
  const indexed = new Map()
  lines.forEach((line) => {
    lineRelationKeys(line).forEach((key) => {
      if (!indexed.has(key)) indexed.set(key, line)
    })
  })
  return indexed
}

function reconcileRelationLine(currentLine, relationLine) {
  const current = normalizeLine(currentLine)
  const base = normalizeLine(relationLine)
  return normalizeLine({
    ...base,
    id: current.id || base.id,
    company: base.company || current.company,
    phone: base.phone || current.phone,
    iccid: base.iccid || current.iccid,
    imei: base.imei || current.imei,
    imeiLong: base.imeiLong || current.imeiLong,
    imeiShort: base.imeiShort || current.imeiShort,
    status: base.status || current.status,
    billingCycle: current.billingCycle || base.billingCycle,
    renewalDate: current.renewalDate || base.renewalDate,
    annualPrice: current.annualPrice || base.annualPrice,
    soldBy: current.soldBy || base.soldBy,
    clientOnly: isBernardoLine(base) ? true : current.clientOnly && !current.imei ? true : base.clientOnly,
    notes: current.notes || base.notes,
    plan: base.plan || current.plan,
    lineType: base.lineType,
    providerOverride: base.lineType,
    carrier: base.carrier || current.carrier,
    source: base.source || current.source,
    providerManual: false,
    providerDetectedBy: 'archivo proveedor',
    recordState: current.recordState === 'manual' ? 'manual' : 'vigente'
  })
}

function revalidateLinesWithRelationBase(relationLines = []) {
  const currentLines = state.lines.map((line, index) => normalizeLine(line, index))
  const baseLines = relationLines.map((line, index) => normalizeLine(line, index))
  const currentByKey = indexLinesByRelationKey(currentLines)
  const usedCurrentIds = new Set()
  const nextLines = []

  baseLines.forEach((baseLine) => {
    const currentLine = lineRelationKeys(baseLine)
      .map((key) => currentByKey.get(key))
      .find(Boolean)
    if (currentLine) {
      usedCurrentIds.add(currentLine.id)
      nextLines.push(reconcileRelationLine(currentLine, baseLine))
      return
    }
    nextLines.push(baseLine)
  })

  currentLines.forEach((line) => {
    const shouldKeep = !baseLines.length || line.recordState === 'manual' || line.source === 'manual'
    if (shouldKeep && !usedCurrentIds.has(line.id)) nextLines.push(line)
  })

  const normalized = nextLines.map((line, index) => normalizeLine(line, index))
  return enrichLinesFromBridge(normalized, mergedLineBridge(normalized, state.devices), state.devices)
}

async function revalidateLineasPage(options = {}) {
  let relationLines = []
  let source = state.lineImport?.source || 'lineas actuales'
  let relationBaseLoaded = false
  let relationBaseError = ''
  try {
    const payload = await fetchPrivateJson('lineas')
    relationLines = relationPayloadToLines(payload)
    if (relationLines.length) {
      source = 'base_relacion_lineas.json cifrada'
      relationBaseLoaded = true
    } else {
      relationBaseError = 'La base privada de lineas no trae registros validos.'
    }
  } catch (error) {
    console.warn(error)
    relationBaseError = error.message || 'No se pudo cargar la base privada de lineas.'
  }

  if (!relationBaseLoaded) {
    const stats = lineStats(state.lines, state.devices)
    state.lineImport = {
      ...(state.lineImport || {}),
      source,
      rows: state.lines.length,
      imported: state.lines.length,
      iccDetected: state.lines.filter((line) => line.iccid).length,
      matched: stats.matched,
      clientOnly: stats.clientOnly,
      exempt: stats.exempt,
      unmatched: stats.unmatched,
      revalidatedAt: new Date().toISOString(),
      autoVersion: lineAutoImportVersion,
      relationBaseVersion: state.lineRelationBaseVersion,
      relationBaseError
    }
    state.notice = `No se pudo revalidar Lineas con la base cifrada: ${relationBaseError}`
    state.view = 'lineas'
    persistState()
    render()
    return { ...stats, ok: false, error: relationBaseError }
  }

  const nextLines = revalidateLinesWithRelationBase(relationLines)
  const stats = lineStats(nextLines, state.devices)
  state.lines = nextLines
  state.lineImport = {
    ...(state.lineImport || {}),
    source,
    rows: relationLines.length || nextLines.length,
    imported: nextLines.length,
    iccDetected: nextLines.filter((line) => line.iccid).length,
    matched: stats.matched,
    clientOnly: stats.clientOnly,
    exempt: stats.exempt,
    unmatched: stats.unmatched,
    appliedAt: state.lineImport?.appliedAt || new Date().toISOString(),
    revalidatedAt: new Date().toISOString(),
    autoVersion: lineAutoImportVersion,
    relationBaseVersion: lineRelationBaseVersion,
    relationBaseError: ''
  }
  state.lineRelationBaseVersion = lineRelationBaseVersion
  state.linePage = Math.min(state.linePage, linePaginationState(filteredLines().length).pageCount)
  state.view = 'lineas'
  if (options.notice) {
    state.notice = `Lineas revalidadas: ${stats.matched} con equipo por IMEI o telefono Wialon, ${stats.clientOnly} solo linea, ${stats.exempt} no asignables, ${stats.unmatched} sin match accionable.`
  }
  persistState()
  render()
  return { ...stats, ok: true }
}

async function loadLineRelationBase(options = {}) {
  try {
    const payload = await fetchPrivateJson('lineas')
    const imported = relationPayloadToLines(payload)
    const enriched = enrichLinesFromBridge(imported, mergedLineBridge(imported, state.devices), state.devices)
    const merged = options.merge ? mergeLines(state.lines, enriched, { markMissing: false }) : enriched
    const stats = lineStats(merged)
    state.lines = merged
    state.lineImport = lineImportState('base_relacion_lineas.json cifrada', imported.length, imported, stats, {
      autoVersion: lineAutoImportVersion,
      relationBaseVersion: lineRelationBaseVersion
    })
    state.lineRelationBaseVersion = lineRelationBaseVersion
    persistState()
    return true
  } catch (error) {
    console.warn(error)
    return false
  }
}

async function loadIncludedLineDatabases(options = {}) {
  state.lineSeedImportVersion = lineSeedImportVersion
  state.notice = options.notice || 'No hay bases de lineas incluidas para cargar.'
  persistState()
  return false
}

function clearLineState(reason = 'Lineas limpiadas del servidor') {
  state.lines = []
  state.lineImport = lineImportState(reason, 0, [], lineStats([]), {
    autoVersion: lineAutoImportVersion,
    seedVersion: lineSeedImportVersion,
    resetVersion: lineResetVersion
  })
  state.lineSeedImportVersion = lineSeedImportVersion
  state.lineResetVersion = lineResetVersion
  state.lineQuery = ''
  state.lineIccQuery = ''
  state.lineStatusFilter = ''
  state.lineMatchFilter = ''
  state.lineTypeFilter = ''
  state.linePage = 1
  state.lineRelationBaseVersion = 0
}

async function handleLineFile(file) {
  const buffer = await file.arrayBuffer()
  await saveUploadedFile(file, 'lineas', buffer)
  const parsed = await parseWorkbookFile(buffer, file.name)
  const relationRecords = relationRecordsFromRows(parsed.rows)
  if (relationRecords.length) {
    try {
      await savePrivateJson('lineas', {
        source: file.name,
        updatedAt: new Date().toISOString(),
        lineas: relationRecords
      })
    } catch (error) {
      console.warn(error)
    }
    const imported = enrichLinesFromBridge(relationRecords.map(lineFromRelationRecord), mergedLineBridge(relationRecords.map(lineFromRelationRecord), state.devices), state.devices)
    const stats = lineStats(imported)
    setState({
      lines: imported,
      lineImport: lineImportState(file.name, parsed.rows.length, imported, stats, {
        autoVersion: lineAutoImportVersion,
        relationBaseVersion: lineRelationBaseVersion
      }),
      lineRelationBaseVersion,
      lineQuery: '',
      lineIccQuery: '',
      lineStatusFilter: '',
      lineMatchFilter: '',
      lineTypeFilter: '',
      linePage: 1,
      view: 'lineas',
      notice: `Base de relacion cargada limpia: ${imported.length} lineas; se respeto Proveedor y Operador de cada fila. Cruce con Wialon por IMEI o Telefono.`
    })
    return
  }
  const { lines: merged, imported, stats } = mergeLineRows(state.lines, parsed.rows, file.name, { allowImeiOnly: true, markMissing: true })
  if (imported.length) {
    try {
      await savePrivateJson('lineas', {
        source: file.name,
        updatedAt: new Date().toISOString(),
        lines: merged
      })
    } catch (error) {
      console.warn(error)
    }
  }
  setState({
    lines: merged,
    lineImport: lineImportState(file.name, parsed.rows.length, imported, stats),
    view: 'lineas',
    notice: `Lineas importadas: ${imported.length}; ${imported.filter((line) => line.iccid).length} con ICC, ${stats.matched} ligadas a equipo, ${stats.clientOnly} solo linea, ${stats.exempt} no asignables, ${stats.unmatched} sin match accionable.`
  })
}

async function handleEmnifyFile(file) {
  const buffer = await file.arrayBuffer()
  await saveUploadedFile(file, 'emnify', buffer)
  const parsed = await parseWorkbookFile(buffer, file.name)
  const { lines: merged, imported, stats } = mergeLineRows(state.lines, parsed.rows, `Emnify - ${file.name}`, {
    allowImeiOnly: true,
    markMissing: false,
    forceLineType: 'emnify',
    defaultCarrier: 'Emnify'
  })
  if (imported.length) {
    try {
      await savePrivateJson('lineas', {
        source: `Emnify - ${file.name}`,
        updatedAt: new Date().toISOString(),
        lines: merged
      })
    } catch (error) {
      console.warn(error)
    }
  }
  setState({
    lines: merged,
    lineImport: lineImportState(`Emnify - ${file.name}`, parsed.rows.length, imported, stats),
    view: 'lineas',
    notice: `Emnify importado: ${imported.length} lineas; ${imported.filter((line) => line.iccid).length} con ICC, ${stats.matched} ligadas a equipo, ${stats.exempt} no asignables. Se actualizaron coincidencias antes de crear nuevas.`
  })
}

function addManualLine() {
  const draft = state.newLine
  const company = textValue(draft.company)
  const identifier = textValue(draft.phone || draft.iccid || draft.imei)
  if (!company || !identifier) {
    setState({ notice: 'Captura cliente y telefono, ICCID o IMEI para agregar la linea.', view: 'lineas' })
    return
  }
  const line = normalizeLine({ ...draft, source: 'manual', recordState: 'manual' }, Date.now())
  const exists = state.lines.some((current) => linesShareIdentifier(current, line))
  if (exists) {
    setState({ notice: 'Ya existe una linea con ese telefono, ICCID o IMEI.', view: 'lineas' })
    return
  }
  setState({
    lines: [...state.lines, line],
    newLine: { ...defaultNewLine },
    view: 'lineas',
    notice: 'Linea agregada.'
  })
}

async function exportLinesXlsx() {
  const header = [
    'Cliente',
    'Linea',
    'Tipo de linea',
    'ICCID',
    'IMEI',
    'IMEI largo',
    'IMEI corto',
    'Vendido por',
    'Operador',
    'Plan',
    'Estatus',
    'Tipo',
    'Cobro',
    'Renovacion',
    'Precio anual',
    'Match equipo',
    'Detectado por',
    'Origen',
    'Notas'
  ]
  const toRow = (line) => [
    line.company,
    line.phone,
    lineTypeLabel(line.lineType),
    line.iccid,
    line.imei,
    line.imeiLong || '',
    line.imeiShort || '',
    lineSeller(line),
    line.carrier,
    line.plan,
    line.status,
    lineMatchTypeText(line),
    line.billingCycle,
    line.renewalDate,
    line.annualPrice,
    lineMatchLabel(line),
    providerDetectionLabel(line.providerDetectedBy),
    line.source,
    line.notes
  ]
  const rows = [header, ...state.lines.map((line) => toRow(line))]
  await exportWorkbookXlsx(`lineas-celulares-${new Date().toISOString().slice(0, 10)}.xlsx`, [{ name: 'Lineas', rows }])
}

async function exportLineMatchReportXlsx() {
  const header = [
    'Cliente',
    'Linea',
    'Tipo de linea',
    'ICCID',
    'IMEI',
    'IMEI largo',
    'IMEI corto',
    'Vendido por',
    'Operador',
    'Plan',
    'Estatus',
    'Tipo',
    'Cobro',
    'Renovacion',
    'Precio anual',
    'Match equipo',
    'Detectado por',
    'Origen',
    'Notas'
  ]
  const toRow = (line) => [
      line.company,
      line.phone,
      lineTypeLabel(line.lineType),
      line.iccid,
      line.imei,
      line.imeiLong || '',
      line.imeiShort || '',
      lineSeller(line),
      line.carrier,
      line.plan,
      line.status,
      lineMatchTypeText(line),
      line.billingCycle,
      line.renewalDate,
      line.annualPrice,
      lineMatchLabel(line),
      providerDetectionLabel(line.providerDetectedBy),
      line.source,
      line.notes
    ]
  const withDevice = state.lines.filter((line) => lineMatchType(line) === 'equipo')
  const clientOnly = state.lines.filter((line) => lineMatchType(line) === 'solo_linea')
  const exempt = state.lines.filter((line) => lineMatchType(line) === 'no_asignada')
  const unmatched = state.lines.filter((line) => lineMatchType(line) === 'sin_match')
  const summaryRows = [
    ['Categoria', 'Cantidad'],
    ['Con equipo', withDevice.length],
    ['Solo linea', clientOnly.length],
    ['No asignable', exempt.length],
    ['Sin match', unmatched.length],
    ['Total', state.lines.length]
  ]
  await exportWorkbookXlsx(`reporte-match-lineas-${new Date().toISOString().slice(0, 10)}.xlsx`, [
    { name: 'Resumen', rows: summaryRows },
    { name: 'Con equipo', rows: [header, ...withDevice.map((line) => toRow(line))] },
    { name: 'Solo linea', rows: [header, ...clientOnly.map((line) => toRow(line))] },
    { name: 'No asignable', rows: [header, ...exempt.map((line) => toRow(line))] },
    { name: 'Sin match', rows: [header, ...unmatched.map((line) => toRow(line))] }
  ])
}

function applyMapping(nextMapping) {
  const normalized = normalizeRows(state.rawRows, nextMapping, 'vigente')
  setState({
    mapping: nextMapping,
    devices: mergeDevices(state.devices, normalized),
    lastImportAt: new Date().toISOString()
  })
}

function buildCompanies() {
  const map = new Map()
  state.devices.forEach((device) => {
    const companyName = device.company || 'Sin empresa'
    if (!map.has(companyName)) {
      map.set(companyName, { name: companyName, devices: [], billableCount: 0, groups: new Map() })
    }
    const company = map.get(companyName)
    company.devices.push(device)
    if (isBillableDevice(device)) company.billableCount += 1
    const groups = device.groups.length ? device.groups : ['Sin grupo']
    groups.forEach((group) => {
      const cleanGroup = group || 'Sin grupo'
      const list = company.groups.get(cleanGroup) || []
      list.push(device)
      company.groups.set(cleanGroup, list)
    })
  })
  Object.keys(state.companyMeta).forEach((companyName) => {
    if (companyName && !map.has(companyName)) {
      map.set(companyName, { name: companyName, devices: [], billableCount: 0, groups: new Map() })
    }
  })
  return Array.from(map.values()).sort((a, b) => b.billableCount - a.billableCount || a.name.localeCompare(b.name))
}

function filteredDevices() {
  const query = normalizeHeader(state.query)
  const companyFilter = normalizeHeader(state.equipmentCompanyFilter)
  return state.devices.filter((device) => {
    const line = lineForDevice(device)
    const lineIccid = deviceLineIccid(device, line)
    const lineOperator = deviceLineOperator(device, line)
    const lineCarrier = deviceLineCarrier(device, line)
    const linePhone = deviceLinePhone(device, line)
    const companyMatches = !companyFilter || normalizeHeader(device.company).includes(companyFilter)
    const cycleMatches = !state.equipmentCycleFilter || deviceBillingCycle(device) === state.equipmentCycleFilter
    const queryMatches =
      !query ||
      normalizeHeader(
        `${device.company} ${device.groups.join(' ')} ${device.unitName} ${deviceIdentifierValues(device).join(' ')} ${device.phone} ${device.deviceType} ${
          lineIccid || ''
        } ${lineOperator || ''} ${lineCarrier || ''} ${linePhone || ''} ${deviceSeller(device)}`
      ).includes(query)
    return companyMatches && cycleMatches && queryMatches
  })
}

function filteredCobrosDevices() {
  const query = normalizeHeader(state.query)
  return state.devices.filter((device) => {
    const deviceGroups = device.groups.length ? device.groups : ['Sin grupo']
    const companyMatches = !state.cobrosCompany || device.company === state.cobrosCompany
    const groupMatches = !state.cobrosGroup || deviceGroups.includes(state.cobrosGroup)
    const cycleMatches = !state.cobrosCycleFilter || deviceBillingCycle(device) === state.cobrosCycleFilter
    const queryMatches =
      !query ||
      normalizeHeader(
        `${device.company} ${deviceGroups.join(' ')} ${device.unitName} ${deviceIdentifierValues(device).join(' ')} ${device.phone} ${device.deviceType} ${deviceSeller(device)}`
      ).includes(query)
    return companyMatches && groupMatches && cycleMatches && queryMatches
  })
}

function cobrosGroups(companies) {
  const groups = new Set()
  state.devices.forEach((device) => {
    if (state.cobrosCompany && device.company !== state.cobrosCompany) return
    ;(device.groups.length ? device.groups : ['Sin grupo']).forEach((group) => groups.add(group))
  })
  return Array.from(groups).sort((a, b) => a.localeCompare(b))
}

function billingFilterMatches(device) {
  const query = normalizeHeader(state.billingQuery)
  const deviceGroups = device.groups.length ? device.groups : ['Sin grupo']
  const companyMatches = !state.billingCompany || device.company === state.billingCompany
  const groupMatches = !state.billingGroup || deviceGroups.includes(state.billingGroup)
  const queryMatches =
    !query ||
    normalizeHeader(
      `${device.company} ${deviceGroups.join(' ')} ${device.unitName} ${deviceIdentifierValues(device).join(' ')} ${device.phone} ${device.deviceType} ${deviceSeller(device)}`
    ).includes(query)
  return companyMatches && groupMatches && queryMatches
}

function billingGroups() {
  const groups = new Set()
  state.devices.forEach((device) => {
    if (state.billingCompany && device.company !== state.billingCompany) return
    ;(device.groups.length ? device.groups : ['Sin grupo']).forEach((group) => groups.add(group))
  })
  return Array.from(groups).sort((a, b) => a.localeCompare(b))
}

function billingFilterStats(rows) {
  return rows.reduce(
    (totals, row) => ({
      monthly: totals.monthly + row.monthlyCount,
      annual: totals.annual + row.annualCount,
      semestral: totals.semestral + row.semestralCount,
      outsideAnnual: totals.outsideAnnual + row.annualOutsidePeriod,
      billable: totals.billable + row.equipmentCount,
      lines: totals.lines + (row.lineCount || 0),
      totalBillable: totals.totalBillable + (row.billableCount || row.equipmentCount || 0),
      total: totals.total + row.total
    }),
    { monthly: 0, annual: 0, semestral: 0, outsideAnnual: 0, billable: 0, lines: 0, totalBillable: 0, total: 0 }
  )
}

function companyOptions(companies) {
  return Array.from(new Set([...companies.map((company) => company.name), ...Object.keys(state.companyMeta)]))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
}

function addCompanyFromQuote() {
  const company = textValue(state.quote.newCompanyName)
  if (!company) {
    setState({ notice: 'Escribe el nombre de la empresa nueva.', view: 'facturacion' })
    return
  }

  setState({
    companyMeta: {
      ...state.companyMeta,
      [company]: { ...blankMeta(company), ...(state.companyMeta[company] || {}) }
    },
    quote: {
      ...state.quote,
      company,
      clientName: state.quote.clientName || company,
      newCompanyName: '',
      group: ''
    },
    notice: `Empresa agregada: ${company}`,
    view: 'facturacion'
  })
}

function addAccessoryToQuote() {
  if (!state.quote.accessoryPreset) {
    setState({ notice: 'Selecciona un accesorio antes de agregarlo.', view: 'cotizaciones' })
    return
  }
  const quantity = Number(state.quote.accessoryQuantity || 1) > 0 ? Number(state.quote.accessoryQuantity) : 1
  const accessory = accessoryFromPreset(state.quote.accessoryPreset, quantity)
  setState({
    quote: {
      ...state.quote,
      accessories: [...normalizedQuoteAccessories(state.quote), accessory],
      accessoryQuantity: 1,
      fuelSensorCount: '',
      dashcamCount: ''
    },
    notice: '',
    view: 'cotizaciones'
  })
}

function removeAccessoryFromQuote(accessoryId) {
  setState({
    quote: {
      ...state.quote,
      accessories: normalizedQuoteAccessories(state.quote).filter((accessory) => accessory.id !== accessoryId)
    },
    notice: '',
    view: 'cotizaciones'
  })
}

function buildQuote() {
  const quote = state.quote
  const quantity = Number(quote.equipmentCount || 0) > 0 ? Number(quote.equipmentCount) : 0
  const cycle = quote.billingCycle === 'anual' ? 'anual' : quote.billingCycle === 'semestral' ? 'semestral' : 'mensual'
  const lineQuantity = Number(quote.lineCount || 0) > 0 ? Number(quote.lineCount) : 0
  const lineCycle = quote.lineBillingCycle === 'mensual' ? 'mensual' : quote.lineBillingCycle === 'semestral' ? 'semestral' : 'anual'
  const recurringUnitPrice =
    cycle === 'anual'
      ? Number(quote.annualPricePerDevice || 0) || Number(state.billing.annualPricePerDevice || 0)
      : cycle === 'semestral'
        ? Number(quote.annualPricePerDevice || 0) / 2 || Number(state.billing.annualPricePerDevice || 0) / 2 || Number(quote.monthlyPricePerDevice || 0) * 6
      : Number(quote.monthlyPricePerDevice || 0) || Number(state.billing.monthlyPricePerDevice || 0)
  const lineRecurringUnitPrice =
    lineCycle === 'mensual'
      ? Number(quote.lineMonthlyPrice || 0)
      : lineCycle === 'semestral'
        ? Number(quote.lineAnnualPrice || 0) / 2
        : Number(quote.lineAnnualPrice || 0)
  const hardwareUnitPrice = hardwareSalePriceFromQuote(quote)
  const installationUnitPrice = Number(quote.installationPricePerDevice || quote.setupPricePerDevice || installationPriceForZone(quote.installationZone))
  const travelFee = Number(quote.travelFee || 0)
  const monthlyUnitPrice = Number(quote.monthlyPricePerDevice || 0) || Number(state.billing.monthlyPricePerDevice || 0)
  const recurringGrossSubtotal = quantity * recurringUnitPrice
  const lineRecurringGrossSubtotal = lineQuantity * lineRecurringUnitPrice
  const firstMonthDiscountUnit = quote.firstMonthFree === false ? 0 : cycle === 'mensual' ? recurringUnitPrice : monthlyUnitPrice
  const firstMonthDiscount = Math.min(recurringGrossSubtotal, quantity * firstMonthDiscountUnit)
  const lineFirstMonthDiscountUnit = quote.firstMonthFree === false || lineCycle !== 'mensual' ? 0 : lineRecurringUnitPrice
  const lineFirstMonthDiscount = Math.min(lineRecurringGrossSubtotal, lineQuantity * lineFirstMonthDiscountUnit)
  const equipmentRecurringSubtotal = Math.max(0, recurringGrossSubtotal - firstMonthDiscount)
  const lineRecurringSubtotal = Math.max(0, lineRecurringGrossSubtotal - lineFirstMonthDiscount)
  const recurringSubtotal = equipmentRecurringSubtotal + lineRecurringSubtotal
  const hardwareSubtotal = quantity * hardwareUnitPrice
  const installationSubtotal = quantity * installationUnitPrice
  const accessoryRows = quoteAccessoryRows(quote)
  const accessorySubtotal = accessoryRows.reduce((sum, row) => sum + row.subtotal, 0)
  const setupUnitPrice = hardwareUnitPrice + installationUnitPrice
  const setupSubtotal = hardwareSubtotal + installationSubtotal + travelFee
  const subtotal = recurringSubtotal + setupSubtotal + accessorySubtotal
  const tax = subtotal * Number(quote.ivaRate || 0)
  const total = subtotal + tax
  const selectedCompany = quote.company || ''
  const meta = selectedCompany ? getCompanyMeta(selectedCompany) : blankMeta('')
  const clientName = quote.clientName || meta.legalName || selectedCompany || textValue(quote.newCompanyName) || 'Cliente'
  const today = new Date()
  const expires = new Date(today.getFullYear(), today.getMonth(), today.getDate() + Number(quote.validityDays || 0))

  return {
    clientName,
    company: selectedCompany,
    email: meta.email || '',
    attendant: quoteAttendantOptions.includes(quote.attendant) ? quote.attendant : quoteAttendantOptions[0],
    cycle,
    quantity,
    description: quote.equipmentDescription || 'Equipos GPS / servicio de rastreo',
    firstMonthFree: quote.firstMonthFree !== false,
    firstMonthDiscountUnit,
    firstMonthDiscount,
    equipmentRecurringSubtotal,
    recurringUnitPrice,
    recurringGrossSubtotal,
    lineQuantity,
    lineCycle,
    lineDescription: quote.lineDescription || 'Linea celular M2M / datos',
    lineRecurringUnitPrice,
    lineRecurringGrossSubtotal,
    lineFirstMonthDiscountUnit,
    lineFirstMonthDiscount,
    lineRecurringSubtotal,
    hardwareModel: quote.hardwareModel || 'GPS vehicular',
    hardwareSupplier: quote.hardwareSupplier || 'Syscom',
    hardwareSyscomUrl: quote.hardwareSyscomUrl || '',
    hardwareCostPerDevice: Number(quote.hardwareCostPerDevice || 0),
    hardwareDiscountPercent: Number(quote.hardwareDiscountPercent ?? syscomDiscountPercent),
    hardwareNetCost: syscomNetCost(quote.hardwareCostPerDevice, quote.hardwareDiscountPercent),
    hardwareMarginPercent: Number(quote.hardwareMarginPercent ?? 30),
    hardwareUnitPrice,
    installationZone: quote.installationZone || 'city',
    installationUnitPrice,
    travelFee,
    travelNotes: quote.travelNotes || '',
    accessoryRows,
    accessorySubtotal,
    setupUnitPrice,
    recurringSubtotal,
    hardwareSubtotal,
    installationSubtotal,
    setupSubtotal,
    subtotal,
    tax,
    total,
    currency: quote.currency,
    notes: quote.notes,
    date: today.toISOString().slice(0, 10),
    expires: expires.toISOString().slice(0, 10)
  }
}

function getBillingPeriod() {
  const now = new Date()
  const periodOffset = state.billing.periodMode === 'previous' ? -1 : state.billing.periodMode === 'next' ? 1 : 0
  const target = new Date(now.getFullYear(), now.getMonth() + periodOffset, 1)
  const start = new Date(target.getFullYear(), target.getMonth(), 1)
  const end = new Date(target.getFullYear(), target.getMonth() + 1, 0)
  return {
    key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
    label: new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(start),
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  }
}

function nextFirstDay() {
  const now = new Date()
  const next = now.getDate() === 1 ? now : new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }).format(next)
}

function deviceBillingCycle(device) {
  if (device.billingCycle === 'anual') return 'anual'
  if (device.billingCycle === 'semestral') return 'semestral'
  return 'mensual'
}

function deviceAnnualMonth(device) {
  if (/^\d{4}-\d{2}-\d{2}/.test(device.renewalDate || '')) return String(Number(device.renewalDate.slice(5, 7)))
  return String(device.annualMonth || new Date().getMonth() + 1)
}

function devicePaymentMonths(device) {
  if (deviceBillingCycle(device) === 'mensual') return []
  const explicitMonths = parsePaymentMonths(device.paymentMonths)
  if (explicitMonths.length) return explicitMonths
  const firstMonth = Number(deviceAnnualMonth(device))
  if (deviceBillingCycle(device) === 'semestral') {
    const secondMonth = ((firstMonth + 5) % 12) + 1
    return [String(firstMonth), String(secondMonth)]
  }
  return [String(firstMonth)]
}

function deviceRenewalLabel(device) {
  if (!device.renewalDate) return ''
  const [year, month, day] = device.renewalDate.split('-')
  return `${day}/${month}/${year}`
}

function deviceSeller(device) {
  return normalizeSeller(device?.soldBy || device?.seller || device?.vendedor, defaultEquipmentSeller)
}

function lineSeller(line) {
  return normalizeSeller(line?.soldBy || line?.seller || line?.vendedor, defaultEquipmentSeller)
}

function deviceUnitPrice(device) {
  const agreedPrice = device.agreedPrice ?? device.pricePerDeviceOverride
  if (Number(agreedPrice) > 0) return Number(normalizeStandardMonthlyPriceValue(agreedPrice))
  if (deviceBillingCycle(device) === 'anual') {
    return Number(state.billing.annualPricePerDevice || 0) || Number(state.billing.monthlyPricePerDevice || 0) * 12
  }
  if (deviceBillingCycle(device) === 'semestral') {
    return Number(state.billing.annualPricePerDevice || 0) / 2 || Number(state.billing.monthlyPricePerDevice || 0) * 6
  }
  return Number(state.billing.monthlyPricePerDevice || 0)
}

function lineBillingCycle(line) {
  return normalizeCycle(line.billingCycle || 'anual')
}

function linePaymentMonths(line) {
  if (lineBillingCycle(line) === 'mensual') return []
  const renewalDate = normalizeLineDate(line.renewalDate)
  if (/^\d{4}-\d{2}-\d{2}$/.test(renewalDate)) {
    const firstMonth = Number(renewalDate.slice(5, 7))
    if (lineBillingCycle(line) === 'semestral') {
      const secondMonth = ((firstMonth + 5) % 12) + 1
      return [String(firstMonth), String(secondMonth)]
    }
    return [String(firstMonth)]
  }
  return []
}

function lineUnitPrice(line) {
  const annualPrice = Number(normalizeStandardMonthlyPriceValue(line.annualPrice) || 0)
  if (annualPrice > 0 && lineBillingCycle(line) === 'semestral') return annualPrice / 2
  if (annualPrice > 0) return annualPrice
  return 0
}

function emptySellerMonthlyTotals() {
  return Object.fromEntries(quoteAttendantOptions.map((seller) => [seller, 0]))
}

function emptySellerMonthlyCounts() {
  return Object.fromEntries(quoteAttendantOptions.map((seller) => [seller, 0]))
}

function addSellerMonthly(row, seller, amount) {
  const cleanSeller = normalizeSeller(seller)
  row.sellerMonthlyTotals[cleanSeller] = Number(row.sellerMonthlyTotals[cleanSeller] || 0) + Number(amount || 0)
  row.sellerMonthlyCounts[cleanSeller] = Number(row.sellerMonthlyCounts[cleanSeller] || 0) + 1
}

function billingSellerMonthlyTotals(rows) {
  return rows.reduce((totals, row) => {
    quoteAttendantOptions.forEach((seller) => {
      totals[seller] = Number(totals[seller] || 0) + Number(row.sellerMonthlyTotals?.[seller] || 0)
    })
    return totals
  }, emptySellerMonthlyTotals())
}

function billingLineFilterMatches(line) {
  const query = normalizeHeader(state.billingQuery)
  const device = matchLineDevice(line)
  const companyName = device?.company || line.company
  const groups = Array.isArray(device?.groups) ? device.groups : []
  const companyMatches = !state.billingCompany || normalizeHeader(companyName) === normalizeHeader(state.billingCompany)
  const groupMatches = !state.billingGroup || groups.some((group) => normalizeHeader(group) === normalizeHeader(state.billingGroup))
  const queryMatches =
    !query ||
    normalizeHeader(
      `${companyName} ${line.company} ${line.phone} ${line.iccid} ${line.imei} ${lineTypeLabel(line.lineType)} ${line.carrier} ${line.plan} ${line.notes} ${lineSeller(line)} ${device?.unitName || ''} ${
        device?.uid || ''
      } ${deviceImeiLong(device || {})} ${deviceImeiShort(device || {})}`
    ).includes(query)
  return companyMatches && groupMatches && queryMatches
}

function ensureBillingRow(rows, companyName, period) {
  if (!companyName || companyName === 'Sin empresa') return null
  const meta = getCompanyMeta(companyName)
  if (!rows.has(companyName)) {
    rows.set(companyName, {
      id: `${slug(companyName)}-${period.key}`,
      company: companyName,
      legalName: meta.legalName || companyName,
      rfc: meta.rfc,
      email: meta.email,
      periodLabel: period.label,
      monthlyCount: 0,
      annualCount: 0,
      semestralCount: 0,
      annualOutsidePeriod: 0,
      equipmentCount: 0,
      lineCount: 0,
      billableCount: 0,
      sellerMonthlyTotals: emptySellerMonthlyTotals(),
      sellerMonthlyCounts: emptySellerMonthlyCounts(),
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'facturar',
      message: '',
      details: []
    })
  }
  return rows.get(companyName)
}

function buildBillingRows() {
  const period = getBillingPeriod()
  const periodMonth = Number(period.key.slice(5, 7))
  const rows = new Map()

  state.devices
    .filter((device) => isBillableDevice(device) && isImportedWialonDevice(device) && billingFilterMatches(device))
    .forEach((device) => {
    const companyName = device.company || 'Sin empresa'
    const row = ensureBillingRow(rows, companyName, period)
    if (!row) return
    const cycle = deviceBillingCycle(device)
    const months = devicePaymentMonths(device)
    const shouldBill = cycle === 'mensual' || months.includes(String(periodMonth))
    const unitPrice = deviceUnitPrice(device)
    const soldBy = deviceSeller(device)

    if (cycle === 'mensual') row.monthlyCount += 1
    if (cycle === 'anual' && shouldBill) row.annualCount += 1
    if (cycle === 'semestral' && shouldBill) row.semestralCount += 1
    if ((cycle === 'anual' || cycle === 'semestral') && !shouldBill) row.annualOutsidePeriod += 1

    if (shouldBill) {
      row.equipmentCount += 1
      row.billableCount += 1
      row.subtotal += unitPrice
      if (cycle === 'mensual') addSellerMonthly(row, soldBy, unitPrice)
      row.details.push({
        sourceType: 'Equipo Wialon',
        unitName: device.unitName,
        uid: device.uid,
        imei: device.imei,
        imeiLong: deviceImeiLong(device),
        imeiShort: deviceImeiShort(device),
        phone: device.phone || '',
        iccid: '',
        lineType: '',
        cycle,
        paymentMonths: months,
        renewalDate: device.renewalDate || '',
        saleDate: device.saleDate || '',
        soldBy,
        priceNote: device.priceNote || '',
        unitPrice
      })
    }
    })

  state.lines
    .map((line, index) => normalizeLine(line, index))
    .filter((line) => isActiveLine(line) && billingLineFilterMatches(line))
    .forEach((line) => {
      const matchedDevice = matchLineDevice(line)
      const matchedDeviceImei = deviceImeiLong(matchedDevice || {})
      const companyName = matchedDevice?.company || line.company || 'Sin empresa'
      const row = ensureBillingRow(rows, companyName, period)
      if (!row) return
      const cycle = lineBillingCycle(line)
      const months = linePaymentMonths(line)
      const shouldBill = cycle === 'mensual' || months.includes(String(periodMonth))
      const unitPrice = lineUnitPrice(line)
      const soldBy = lineSeller(line) || (matchedDevice ? deviceSeller(matchedDevice) : '')

      if (cycle === 'mensual' && shouldBill && unitPrice > 0) row.monthlyCount += 1
      if (cycle === 'anual' && shouldBill) row.annualCount += 1
      if (cycle === 'semestral' && shouldBill) row.semestralCount += 1
      if ((cycle === 'anual' || cycle === 'semestral') && !shouldBill && months.length) row.annualOutsidePeriod += 1

      if (shouldBill && unitPrice > 0) {
        row.lineCount += 1
        row.billableCount += 1
        row.subtotal += unitPrice
        if (cycle === 'mensual') addSellerMonthly(row, soldBy, unitPrice)
        row.details.push({
          sourceType: 'Linea celular',
          unitName: matchedDevice?.unitName ? `${lineTypeLabel(line.lineType)} / ${matchedDevice.unitName}` : lineTypeLabel(line.lineType),
          uid: matchedDevice?.uid || '',
          imei: line.imei || line.imeiLong || matchedDeviceImei || '',
          imeiLong: line.imeiLong || line.imei || matchedDeviceImei || '',
          imeiShort: line.imeiShort || deriveShortImei(line.imeiLong || line.imei || matchedDeviceImei || ''),
          phone: line.phone || matchedDevice?.phone || '',
          iccid: line.iccid || '',
          lineType: lineTypeLabel(line.lineType),
          cycle,
          paymentMonths: months,
          renewalDate: line.renewalDate || '',
          saleDate: '',
          soldBy,
          priceNote: [line.notes, matchedDevice && lineMatchMethod(line) === 'telefono' ? 'Ligada a Wialon por telefono' : ''].filter(Boolean).join(' | '),
          unitPrice
        })
      }
    })

  return Array.from(rows.values())
    .map((row) => {
      row.tax = row.subtotal * Number(state.billing.ivaRate || 0)
      row.total = row.subtotal + row.tax
      row.status = row.billableCount > 0 ? 'facturar' : 'fuera_periodo'
      row.message =
        row.billableCount > 0
          ? `${row.monthlyCount} mensuales, ${row.annualCount} anuales, ${row.semestralCount} semestrales y ${row.lineCount} lineas.`
          : `${row.annualOutsidePeriod} anualidades/semestrales fuera de este periodo.`
      return row
    })
    .sort((a, b) => b.total - a.total || a.company.localeCompare(b.company))
}

function generateBillingList() {
  const rows = buildBillingRows()
  const hasBillableAmount = rows.some((row) => row.total > 0)
  if (!hasBillableAmount && !Number(state.billing.monthlyPricePerDevice) && !Number(state.billing.annualPricePerDevice)) {
    setState({ notice: 'Captura al menos un precio por equipo antes de generar la lista.', view: 'facturacion' })
    return
  }

  setState({ billingRows: rows, view: 'facturacion', notice: `Prefacturacion generada para ${getBillingPeriod().label}.` })
}

function download(filename, body, type) {
  const blob = new Blob([body], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return btoa(binary)
}

async function saveUploadedFile(file, category, buffer) {
  try {
    const response = await fetch(serverUploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        category,
        dataBase64: arrayBufferToBase64(buffer)
      })
    })
    if (!response.ok) throw new Error('No se pudo guardar archivo cifrado.')
  } catch (error) {
    console.warn(error)
  }
}

function exportCsv() {
  const headers = [
    'Empresa',
    'Grupos',
    'Equipo',
    'UID',
    'IMEI',
    'IMEI largo',
    'IMEI corto',
    'Telefono',
    'Tipo',
    'Ultimo mensaje',
    'Desactivacion',
    'Cobro',
    'Fecha renovacion',
    'Meses pago',
    'Precio pactado',
    'Fecha venta',
    'Nota precio',
    'Origen',
    'Estado'
  ]
  const lines = [
    headers.map(escapeCsv).join(','),
    ...state.devices.map((device) =>
      [
        device.company,
        device.groups.join('; '),
        device.unitName,
        device.uid,
        device.imei,
        deviceImeiLong(device),
        deviceImeiShort(device),
        device.phone,
        device.deviceType,
        device.lastMessage,
        device.deactivatedAt,
        deviceBillingCycle(device),
        device.renewalDate || '',
        formatPaymentMonths(devicePaymentMonths(device)),
        device.agreedPrice ?? device.pricePerDeviceOverride ?? '',
        device.saleDate || '',
        device.priceNote || '',
        isImportedWialonDevice(device) ? 'Wialon' : 'Manual',
        device.recordState
      ]
        .map(escapeCsv)
        .join(',')
    )
  ]
  download('crm-wialon-equipos.csv', lines.join('\n'), 'text/csv;charset=utf-8')
}

function exportJson() {
  download(
    'crm-wialon-prefacturacion.json',
    JSON.stringify(stateSnapshot(), null, 2),
    'application/json;charset=utf-8'
  )
}

function xmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function columnName(index) {
  let name = ''
  let current = index + 1
  while (current > 0) {
    const modulo = (current - 1) % 26
    name = String.fromCharCode(65 + modulo) + name
    current = Math.floor((current - modulo) / 26)
  }
  return name
}

function sheetXml(rows) {
  const sheetData = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, columnIndexValue) => {
          const ref = `${columnName(columnIndexValue)}${rowIndex + 1}`
          if (typeof value === 'number' && Number.isFinite(value)) {
            return `<c r="${ref}"><v>${value}</v></c>`
          }
          return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`
        })
        .join('')
      return `<row r="${rowIndex + 1}">${cells}</row>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetData}</sheetData></worksheet>`
}

async function exportWorkbookXlsx(filename, sheets) {
  const zip = new JSZip()
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheets
  .map(
    (_sheet, index) =>
      `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  )
  .join('')}
</Types>`
  )
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`)
  zip.file(
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets
      .map((sheet, index) => `<sheet name="${xmlEscape(sheet.name).slice(0, 31)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
      .join('')}</sheets></workbook>`
  )
  zip.file(
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
      .map(
        (_sheet, index) =>
          `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
      )
      .join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
  )
  zip.file('xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/></styleSheet>`)
  sheets.forEach((sheet, index) => zip.file(`xl/worksheets/sheet${index + 1}.xml`, sheetXml(sheet.rows)))
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  download(filename, blob, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}

function excelSerialDate(date) {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor(utc / 86400000) + 25569
}

function quoteNumber() {
  const now = new Date()
  const datePart = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  return Number(`${datePart}${String(now.getHours()).padStart(2, '0')}`)
}

function templateCellXml(ref, value, style = '') {
  const styleAttr = style ? ` s="${style}"` : ''
  if (value === null || value === undefined || value === '') return `<c r="${ref}"${styleAttr}/>`
  if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${ref}"${styleAttr}><v>${roundCurrency(value)}</v></c>`
  return `<c r="${ref}"${styleAttr} t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`
}

function setTemplateCell(sheetXmlText, ref, value) {
  const pattern = new RegExp(`<c\\b(?=[^>]*\\br="${ref}")[^>]*(?:>[\\s\\S]*?<\\/c>|\\/>)`)
  const match = sheetXmlText.match(pattern)
  const style = match?.[0]?.match(/\ss="([^"]+)"/)?.[1] || ''
  const replacement = templateCellXml(ref, value, style)
  if (match) return sheetXmlText.replace(pattern, replacement)

  const rowNumber = ref.match(/\d+/)?.[0]
  if (!rowNumber) return sheetXmlText
  const rowPattern = new RegExp(`(<row\\b[^>]*\\br="${rowNumber}"[^>]*>)([\\s\\S]*?)(<\\/row>)`)
  return sheetXmlText.replace(rowPattern, (_row, start, cells, end) => `${start}${cells}${replacement}${end}`)
}

function setTemplateCells(sheetXmlText, entries) {
  return entries.reduce((xmlText, [ref, value]) => setTemplateCell(xmlText, ref, value), sheetXmlText)
}

function clearTemplateLine(sheetXmlText, rowNumber) {
  return ['B', 'C', 'D', 'G', 'H', 'I', 'J'].reduce((xmlText, column) => setTemplateCell(xmlText, `${column}${rowNumber}`, ''), sheetXmlText)
}

function writeTemplateLine(sheetXmlText, rowNumber, row) {
  return setTemplateCells(sheetXmlText, [
    [`B${rowNumber}`, row.product || ''],
    [`C${rowNumber}`, row.quantity || ''],
    [`D${rowNumber}`, row.description || ''],
    [`G${rowNumber}`, row.listPrice || ''],
    [`H${rowNumber}`, row.discount || ''],
    [`I${rowNumber}`, row.unitPrice || ''],
    [`J${rowNumber}`, row.amount || '']
  ])
}

function compactTemplateRows(rows, maxRows) {
  if (rows.length <= maxRows) return rows
  const visible = rows.slice(0, maxRows - 1)
  const extra = rows.slice(maxRows - 1)
  const amount = extra.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  return [
    ...visible,
    {
      product: 'VARIOS',
      quantity: 1,
      description: `Otros conceptos (${extra.length})`,
      listPrice: amount,
      discount: '',
      unitPrice: amount,
      amount
    }
  ]
}

function quoteTemplateProductRows(quote) {
  const rows = [
    {
      product: 'GPS',
      quantity: quote.quantity,
      description: quote.hardwareModel,
      listPrice: quote.hardwareUnitPrice,
      discount: '',
      unitPrice: quote.hardwareUnitPrice,
      amount: quote.hardwareSubtotal
    },
    ...quote.accessoryRows.map((row) => ({
      product: row.category || 'ACC',
      quantity: row.quantity,
      description: row.model || row.label,
      listPrice: row.syscomPrice || row.unitPrice,
      discount: row.discount || '',
      unitPrice: row.unitPrice,
      amount: row.subtotal
    }))
  ]

  if (quote.installationSubtotal > 0) {
    rows.push({
      product: 'INST',
      quantity: quote.quantity,
      description: 'Instalacion por equipo',
      listPrice: quote.installationUnitPrice,
      discount: '',
      unitPrice: quote.installationUnitPrice,
      amount: quote.installationSubtotal
    })
  }

  if (quote.travelFee > 0) {
    rows.push({
      product: 'VIAT',
      quantity: 1,
      description: quote.travelNotes || 'Viaticos traslado tecnico',
      listPrice: quote.travelFee,
      discount: '',
      unitPrice: quote.travelFee,
      amount: quote.travelFee
    })
  }

  return compactTemplateRows(rows.filter((row) => Number(row.amount || 0) !== 0), 6)
}

function quoteRecurringRows(quote) {
  const serviceName =
    quote.cycle === 'anual' ? 'Servicio anual por equipo' : quote.cycle === 'semestral' ? 'Servicio semestral por equipo' : 'Servicio mensual por equipo'
  const lineServiceName =
    quote.lineCycle === 'mensual' ? 'Servicio mensual de linea celular' : quote.lineCycle === 'semestral' ? 'Servicio semestral de linea celular' : 'Servicio anual de linea celular'
  const rows = []

  if (quote.quantity > 0) {
    rows.push({
      product: 'REC',
      quantity: quote.quantity,
      description: serviceName,
      listPrice: quote.recurringUnitPrice,
      discount: '',
      unitPrice: quote.recurringUnitPrice,
      amount: quote.recurringGrossSubtotal
    })
  }

  if (quote.firstMonthDiscount > 0) {
    rows.push({
      product: 'PROMO',
      quantity: quote.quantity,
      description: 'Primer mes gratis',
      listPrice: -quote.firstMonthDiscountUnit,
      discount: '',
      unitPrice: -quote.firstMonthDiscountUnit,
      amount: -quote.firstMonthDiscount
    })
  }

  if (quote.lineQuantity > 0) {
    rows.push({
      product: 'LIN',
      quantity: quote.lineQuantity,
      description: quote.lineDescription || lineServiceName,
      listPrice: quote.lineRecurringUnitPrice,
      discount: '',
      unitPrice: quote.lineRecurringUnitPrice,
      amount: quote.lineRecurringGrossSubtotal
    })
  }

  if (quote.lineFirstMonthDiscount > 0) {
    rows.push({
      product: 'PROMO',
      quantity: quote.lineQuantity,
      description: 'Primer mes gratis linea celular',
      listPrice: -quote.lineFirstMonthDiscountUnit,
      discount: '',
      unitPrice: -quote.lineFirstMonthDiscountUnit,
      amount: -quote.lineFirstMonthDiscount
    })
  }

  return rows.filter((row) => Number(row.amount || 0) !== 0)
}

function quoteTemplateRecurringRows(quote) {
  return compactTemplateRows(quoteRecurringRows(quote), 3)
}

function pdfClean(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
}

function pdfEscape(value) {
  return pdfClean(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function pdfTrim(value, maxLength) {
  const text = pdfClean(value).replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? `${text.slice(0, Math.max(0, maxLength - 3))}...` : text
}

function pdfTextWidth(value, size) {
  return pdfClean(value).length * size * 0.52
}

function pdfMoney(value, currency = 'MXN') {
  const amount = Number(value || 0)
  const symbol = currency === 'USD' ? 'US$' : '$'
  return `${symbol}${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function pdfDateLabel(value) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date()
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function jpegDimensions(bytes) {
  let index = 2
  while (index < bytes.length) {
    if (bytes[index] !== 0xff) {
      index += 1
      continue
    }
    const marker = bytes[index + 1]
    const length = (bytes[index + 2] << 8) + bytes[index + 3]
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return {
        height: (bytes[index + 5] << 8) + bytes[index + 6],
        width: (bytes[index + 7] << 8) + bytes[index + 8]
      }
    }
    index += 2 + length
  }
  return { width: 250, height: 111 }
}

function buildPdfBlob(objects) {
  const encoder = new TextEncoder()
  const parts = []
  const offsets = [0]
  let byteLength = 0
  const pushText = (value) => {
    const bytes = encoder.encode(value)
    parts.push(bytes)
    byteLength += bytes.length
  }
  const pushBytes = (bytes) => {
    parts.push(bytes)
    byteLength += bytes.length
  }

  pushText('%PDF-1.4\n')
  objects.forEach((object, index) => {
    offsets.push(byteLength)
    pushText(`${index + 1} 0 obj\n`)
    if (typeof object === 'string') {
      pushText(`${object}\n`)
    } else {
      pushText(object.prefix)
      pushBytes(object.bytes)
      pushText(object.suffix)
    }
    pushText('endobj\n')
  })

  const xrefOffset = byteLength
  pushText(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`)
  for (let index = 1; index <= objects.length; index += 1) {
    pushText(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`)
  }
  pushText(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)
  return new Blob(parts, { type: 'application/pdf' })
}

function buildQuotePdfBlob(quote, logo = null) {
  const commands = []
  const red = [0.78, 0, 0]
  const lightRed = [1, 0.92, 0.92]
  const black = [0, 0, 0]
  const gray = [0.35, 0.35, 0.35]
  const border = [0.18, 0.18, 0.18]
  const softBorder = [0.78, 0.78, 0.78]
  const pageWidth = 612
  const margin = 36
  const productRows = quoteTemplateProductRows(quote)
  const recurringRows = quoteRecurringRows(quote)
  const productSubtotal = quote.hardwareSubtotal + quote.accessorySubtotal + quote.installationSubtotal + quote.travelFee

  const color = (rgb) => rgb.map((part) => Number(part).toFixed(3)).join(' ')
  const rect = (x, y, width, height, fill, stroke) => {
    if (fill) commands.push(`q ${color(fill)} rg ${x} ${y} ${width} ${height} re f Q`)
    if (stroke) commands.push(`q ${color(stroke)} RG 0.8 w ${x} ${y} ${width} ${height} re S Q`)
  }
  const line = (x1, y1, x2, y2, stroke = softBorder) => {
    commands.push(`q ${color(stroke)} RG 0.6 w ${x1} ${y1} m ${x2} ${y2} l S Q`)
  }
  const text = (value, x, y, size = 9, bold = false, fill = black, align = 'left') => {
    const safe = pdfClean(value)
    if (!safe) return
    let textX = x
    if (align === 'right') textX = x - pdfTextWidth(safe, size)
    if (align === 'center') textX = x - pdfTextWidth(safe, size) / 2
    commands.push(`q ${color(fill)} rg BT /${bold ? 'F2' : 'F1'} ${size} Tf 1 0 0 1 ${textX.toFixed(2)} ${y.toFixed(2)} Tm (${pdfEscape(safe)}) Tj ET Q`)
  }

  rect(0, 0, pageWidth, 792, [1, 1, 1], null)
  if (logo?.bytes?.length) {
    const logoWidth = 188
    const logoHeight = Math.min(70, logoWidth * (logo.height / logo.width))
    commands.push(`q ${logoWidth.toFixed(2)} 0 0 ${logoHeight.toFixed(2)} 42 704 cm /Logo Do Q`)
  } else {
    text('KLI', 42, 724, 32, false, black)
    text('FNET', 91, 724, 32, true, red)
    text('Tu Posicion Actual', 92, 706, 10, false, gray)
  }

  rect(314, 740, 262, 26, red, red)
  text('COTIZACION', 445, 748, 14, true, [1, 1, 1], 'center')
  text('Numero:', 324, 719, 10)
  text(quoteNumber(), 444, 719, 10, false, black, 'right')
  text('Fecha:', 324, 702, 10)
  text(pdfDateLabel(quote.date), 444, 702, 10, false, black, 'right')
  text('Elaboro:', 324, 685, 10)
  text('KLIFNET', 444, 685, 10, false, black, 'right')

  line(margin, 670, pageWidth - margin, 670, border)
  text('EMPRESA:', 42, 650, 10)
  text(pdfTrim(quote.clientName, 32), 102, 650, 11, true)
  text('ATIENDE:', 42, 632, 10)
  text(pdfTrim(quote.attendant || '', 42), 104, 632, 10)
  text('PUESTO:', 42, 614, 10)
  text('EMAIL:', 352, 614, 10)
  text(pdfTrim(quote.email || '', 34), 400, 614, 10)

  const columns = [
    { label: 'Producto', x: 36, width: 58 },
    { label: 'Cantidad', x: 94, width: 48, align: 'right' },
    { label: 'Descripcion', x: 142, width: 204 },
    { label: 'Precio lista', x: 346, width: 82, align: 'right' },
    { label: 'Precio unit.', x: 428, width: 82, align: 'right' },
    { label: 'Importe', x: 510, width: 66, align: 'right' }
  ]
  const drawHeader = (y) => {
    columns.forEach((column) => rect(column.x, y, column.width, 30, red, red))
    columns.forEach((column) => text(column.label, column.align === 'right' ? column.x + column.width - 6 : column.x + 4, y + 10, 8.4, true, [1, 1, 1], column.align))
  }
  const drawRow = (row, y) => {
    text(pdfTrim(row.product, 8), 40, y + 5, 8.6)
    text(Number(row.quantity || 0).toLocaleString('es-MX'), 136, y + 5, 8.6, false, black, 'right')
    text(pdfTrim(row.description, 39), 148, y + 5, 8.6)
    text(pdfMoney(row.listPrice, quote.currency), 422, y + 5, 8, false, black, 'right')
    text(pdfMoney(row.unitPrice, quote.currency), 504, y + 5, 8, false, black, 'right')
    text(pdfMoney(row.amount, quote.currency), 570, y + 5, 8, false, black, 'right')
    line(36, y, 576, y)
  }

  drawHeader(566)
  let y = 546
  productRows.forEach((row) => {
    drawRow(row, y)
    y -= 20
  })

  y -= 10
  rect(36, y, 540, 22, [0.86, 0.86, 0.86], border)
  text('TOTAL EQUIPO INSTALADO', 320, y + 7, 10, true, black, 'center')
  text(pdfMoney(productSubtotal, quote.currency), 558, y + 7, 9.5, true, black, 'right')

  y -= 30
  rect(36, y, 540, 20, [1, 1, 1], border)
  text('CARGOS RECURRENTES', 42, y + 6, 10, true)
  y -= 20
  recurringRows.forEach((row) => {
    drawRow(row, y)
    y -= 20
  })

  y -= 34
  rect(36, y - 96, 540, 118, [1, 1, 1], border)
  rect(36, y, 540, 22, [1, 1, 1], border)
  text('RESUMEN DE PAGO DE CONTADO', 42, y + 7, 10, true)
  const summaryY = y - 18
  const summaryRows = [
    ['SUBTOTAL EQUIPO', productSubtotal],
    ['SUBTOTAL CARGOS RECURRENTES', quote.recurringSubtotal],
    ['SUBTOTAL', quote.subtotal],
    ['I.V.A.', quote.tax],
    ['TOTAL', quote.total]
  ]
  summaryRows.forEach((row, index) => {
    const rowY = summaryY - index * 17
    text(row[0], 150, rowY, 10, true)
    text(pdfMoney(row[1], quote.currency), 574, rowY, 10, true, row[0] === 'TOTAL' ? red : black, 'right')
  })

  rect(36, 58, 540, 52, lightRed, [0.9, 0.55, 0.55])
  text('Notas comerciales', 48, 92, 9, true, red)
  text(pdfTrim(quote.notes || 'Precios sujetos a validacion final de inventario y condiciones comerciales.', 92), 48, 76, 8)
  text(`Vigencia: ${pdfDateLabel(quote.expires)}`, 48, 64, 8)

  const content = commands.join('\n')
  const contentBytes = new TextEncoder().encode(content)
  const hasLogo = Boolean(logo?.bytes?.length)
  const contentObjectId = hasLogo ? 7 : 6
  const imageResource = hasLogo ? '/XObject << /Logo 6 0 R >>' : ''
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> ${imageResource} >> /Contents ${contentObjectId} 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
  ]

  if (hasLogo) {
    objects.push({
      prefix: `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.bytes.length} >>\nstream\n`,
      bytes: logo.bytes,
      suffix: '\nendstream\n'
    })
  }

  objects.push({
    prefix: `<< /Length ${contentBytes.length} >>\nstream\n`,
    bytes: contentBytes,
    suffix: '\nendstream\n'
  })

  return buildPdfBlob(objects)
}

async function exportQuotePdf(quote) {
  let logo = null
  try {
    const response = await fetch('/public/assets/klifnet-logo.jpg')
    if (response.ok) {
      const bytes = new Uint8Array(await response.arrayBuffer())
      logo = { bytes, ...jpegDimensions(bytes) }
    }
  } catch (error) {
    console.warn('No se pudo cargar el logo para el PDF.', error)
  }

  const blob = buildQuotePdfBlob(quote, logo)
  download(`cotizacion-${slug(quote.clientName)}-${quote.date}.pdf`, blob, 'application/pdf')
}

async function exportQuoteTemplateXlsx(quote) {
  const zip = await JSZip.loadAsync(await fetchPrivateFile('cotizacion'))
  let sheetXmlText = await zip.file('xl/worksheets/sheet1.xml').async('string')
  const today = new Date()
  const productRows = quoteTemplateProductRows(quote)
  const recurringRows = quoteTemplateRecurringRows(quote)
  const productSubtotal = quote.hardwareSubtotal + quote.accessorySubtotal + quote.installationSubtotal + quote.travelFee

  sheetXmlText = sheetXmlText.replace(/<hyperlinks>[\s\S]*?<\/hyperlinks>/, '')
  sheetXmlText = setTemplateCells(sheetXmlText, [
    ['H3', quoteNumber()],
    ['H4', excelSerialDate(today)],
    ['H5', 'KLIFNET'],
    ['H11', ''],
    ['C6', quote.clientName],
    ['A7', 'ATIENDE:'],
    ['C7', quote.attendant || ''],
    ['C8', ''],
    ['H7', ''],
    ['H8', quote.email || ''],
    ['I18', productSubtotal],
    ['I19', productSubtotal],
    ['I24', quote.recurringSubtotal],
    ['I26', productSubtotal],
    ['I27', quote.recurringSubtotal],
    ['I28', quote.subtotal],
    ['I29', quote.tax],
    ['I30', quote.total],
    ['D32', quote.currency === 'MXN' ? 1 : 1],
    ['I32', quote.total]
  ])

  for (let row = 12; row <= 17; row += 1) sheetXmlText = clearTemplateLine(sheetXmlText, row)
  productRows.forEach((row, index) => {
    sheetXmlText = writeTemplateLine(sheetXmlText, 12 + index, row)
  })

  for (let row = 21; row <= 23; row += 1) sheetXmlText = clearTemplateLine(sheetXmlText, row)
  recurringRows.forEach((row, index) => {
    sheetXmlText = writeTemplateLine(sheetXmlText, 21 + index, row)
  })

  zip.file('xl/worksheets/sheet1.xml', sheetXmlText)
  zip.remove('xl/calcChain.xml')

  const contentTypes = zip.file('[Content_Types].xml')
  if (contentTypes) {
    const xmlText = await contentTypes.async('string')
    zip.file('[Content_Types].xml', xmlText.replace(/<Override PartName="\/xl\/calcChain\.xml"[^>]*\/>/, ''))
  }

  const workbookRels = zip.file('xl/_rels/workbook.xml.rels')
  if (workbookRels) {
    const xmlText = await workbookRels.async('string')
    zip.file('xl/_rels/workbook.xml.rels', xmlText.replace(/<Relationship[^>]*Target="calcChain\.xml"[^>]*\/>/, ''))
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  download(`cotizacion-${slug(quote.clientName)}-${quote.date}.xlsx`, blob, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}

async function exportBillingXlsx() {
  const rows = state.billingRows.length ? state.billingRows : buildBillingRows()
  const summary = [
    [
      'Empresa',
      'Razon social',
      'RFC',
      'Email',
      'Periodo',
      'Mensuales',
      'Anualidades periodo',
      'Semestrales periodo',
      'Anualidades fuera',
      'Equipos a facturar',
      'Lineas a facturar',
      'Total partidas',
      ...quoteAttendantOptions.map((seller) => `Mensualidad ${seller}`),
      'Subtotal',
      'IVA',
      'Total',
      'Estado',
      'Nota'
    ],
    ...rows.map((row) => [
      row.company,
      row.legalName,
      row.rfc,
      row.email,
      row.periodLabel,
      row.monthlyCount,
      row.annualCount,
      row.semestralCount,
      row.annualOutsidePeriod,
      row.equipmentCount,
      row.lineCount || 0,
      row.billableCount || row.equipmentCount,
      ...quoteAttendantOptions.map((seller) => row.sellerMonthlyTotals?.[seller] || 0),
      row.subtotal,
      row.tax,
      row.total,
      row.status,
      row.message
    ])
  ]
  const detailRows = rows.flatMap((row) =>
    row.details.map((detail) => [
      row.company,
      detail.sourceType || 'Equipo Wialon',
      detail.unitName,
      detail.uid,
      detail.phone || '',
      detail.iccid || '',
      detail.imei,
      detail.imeiLong,
      detail.imeiShort,
      detail.lineType || '',
      detail.cycle,
      formatPaymentMonths(detail.paymentMonths),
      detail.renewalDate,
      detail.unitPrice,
      detail.saleDate,
      detail.soldBy || '',
      detail.priceNote,
      row.periodLabel
    ])
  )
  const details = [
    ['Empresa', 'Tipo partida', 'Equipo / Linea', 'UID', 'Telefono', 'ICCID', 'IMEI', 'IMEI largo', 'IMEI corto', 'Proveedora linea', 'Cobro', 'Meses pago', 'Fecha renovacion', 'Precio pactado/aplicado', 'Fecha venta', 'Vendido por', 'Nota precio', 'Periodo'],
    ...detailRows
  ]
  await exportWorkbookXlsx(`prefacturacion-${getBillingPeriod().key}.xlsx`, [
    { name: 'Resumen', rows: summary },
    { name: 'Detalle partidas', rows: details }
  ])
}

async function exportQuoteXlsx() {
  const quote = buildQuote()
  const quoteHasAmount = quote.quantity > 0 || quote.lineQuantity > 0 || quote.accessoryRows.length > 0 || quote.travelFee > 0
  if (!quoteHasAmount || quote.total <= 0) {
    setState({ notice: 'Captura cantidad y precio para generar la cotizacion.', view: 'cotizaciones' })
    return
  }

  try {
    await exportQuoteTemplateXlsx(quote)
    try {
      await exportQuotePdf(quote)
    } catch (error) {
      console.error(error)
      setState({ notice: 'Se genero el XLSX, pero no se pudo generar el PDF.', view: 'cotizaciones' })
    }
    return
  } catch (error) {
    console.error(error)
    setState({ notice: 'No se pudo usar la plantilla; se generara una cotizacion plana de respaldo.', view: 'cotizaciones' })
  }

  const summary = [
    ['KLIFNET', 'Cotizacion'],
    ['Fecha', quote.date],
    ['Vigencia hasta', quote.expires],
    ['Cliente', quote.clientName],
    ['Atiende', quote.attendant],
    ['Empresa registrada', quote.company || 'Prospecto'],
    ['Descripcion', quote.description],
    ['Email', quote.email],
    ['Moneda', quote.currency],
    ['Primer mes gratis', quote.firstMonthFree ? 'Si' : 'No'],
    ['Descuento primer mes', quote.firstMonthDiscount + quote.lineFirstMonthDiscount],
    ['Lineas celulares', quote.lineQuantity],
    ['Cobro linea', quote.lineCycle],
    ['Precio linea aplicado', quote.lineRecurringUnitPrice],
    ['Modelo GPS', quote.hardwareModel],
    ['Proveedor GPS', quote.hardwareSupplier],
    ['URL proveedor GPS', quote.hardwareSyscomUrl],
    ['Precio proveedor GPS', quote.hardwareCostPerDevice],
    ['Descuento proveedor GPS %', quote.hardwareDiscountPercent],
    ['Costo neto GPS', quote.hardwareNetCost],
    ['Ganancia GPS %', quote.hardwareMarginPercent],
    ['Zona instalacion', quote.installationZone === 'outside' ? 'Fuera de ciudad' : quote.installationZone === 'town' ? 'Pueblo / traslado' : 'Dentro de ciudad'],
    ['Notas traslado', quote.travelNotes],
    [],
    ['Concepto', 'Cantidad', 'Precio unitario', 'Subtotal'],
    ['Equipos'],
    ['Equipo GPS', quote.quantity, quote.hardwareUnitPrice, quote.hardwareSubtotal],
    ['Accesorios'],
    ...quote.accessoryRows.map((row) => [`${row.label} (${row.margin}% ganancia)`, row.quantity, row.unitPrice, row.subtotal]),
    ['Instalacion y viaticos'],
    ['Instalacion por equipo', quote.quantity, quote.installationUnitPrice, quote.installationSubtotal],
    ['Viaticos traslado tecnico', 1, quote.travelFee, quote.travelFee],
    ['Mensualidades'],
    ...quoteRecurringRows(quote).map((row) => [row.description, row.quantity, row.unitPrice, row.amount]),
    [],
    ['Subtotal', '', '', quote.subtotal],
    ['IVA', '', '', quote.tax],
    ['Total', '', '', quote.total],
    [],
    ['Notas', quote.notes]
  ]
  const accessoryDetails = [
    ['Tipo', 'Modelo', 'Proveedor', 'URL', 'Cantidad', 'Costo proveedor', 'Descuento %', 'Costo neto', 'Ganancia %', 'Precio venta', 'Subtotal', 'Notas'],
    ...normalizedQuoteAccessories(state.quote).map((row) => {
      const unitPrice = accessorySalePrice(row.cost, row.discount, row.margin, row.unitPrice)
      return [
        row.category,
        row.model,
        row.supplier,
        row.url,
        row.quantity,
        row.cost,
        row.discount,
        syscomNetCost(row.cost, row.discount),
        row.margin,
        unitPrice,
        row.quantity * unitPrice,
        row.notes
      ]
    })
  ]

  await exportWorkbookXlsx(`cotizacion-${slug(quote.clientName)}-${quote.date}.xlsx`, [
    { name: 'Cotizacion', rows: summary },
    { name: 'Accesorios', rows: accessoryDetails }
  ])
  try {
    await exportQuotePdf(quote)
  } catch (error) {
    console.error(error)
    setState({ notice: 'Se genero el XLSX de respaldo, pero no se pudo generar el PDF.', view: 'cotizaciones' })
  }
}

function metric(label, value, tone = 'default') {
  return `<div class="metric-card ${tone}"><span>${esc(label)}</span><strong>${Number(value).toLocaleString('es-MX')}</strong></div>`
}

function metricMoney(label, value, currency = state.billing.currency, tone = 'default') {
  return `<div class="metric-card ${tone}"><span>${esc(label)}</span><strong>${money(value, currency)}</strong></div>`
}

function companyTable(companies) {
  const pagination = tablePaginationState(companies.length, state.companyPage)
  const pageCompanies = companies.slice(pagination.start, pagination.end)
  return `
    ${renderTablePagination(companies.length, pagination, { label: 'empresas', dataAttr: 'data-company-page', ariaLabel: 'Paginacion de empresas' })}
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Empresa</th><th>Grupos</th><th>Equipos</th><th>Facturables</th><th>Cobro</th><th></th></tr>
        </thead>
        <tbody>
          ${pageCompanies
            .map((company) => {
              const monthly = company.devices.filter((device) => isBillableDevice(device) && deviceBillingCycle(device) === 'mensual').length
              const annual = company.devices.filter((device) => isBillableDevice(device) && deviceBillingCycle(device) === 'anual').length
              return `
                <tr>
                  <td>${esc(company.name)}</td>
                  <td>${company.groups.size}</td>
                  <td>${company.devices.length}</td>
                  <td>${company.billableCount}</td>
                  <td><span class="pill ok">${monthly} M</span> <span class="pill warn">${annual} A</span></td>
                  <td><button class="icon-button" title="Editar cobros" data-company="${attr(company.name)}">${icon('settings-2')}</button></td>
                </tr>
              `
            })
            .join('')}
        </tbody>
      </table>
    </div>
    ${renderTablePagination(companies.length, pagination, { label: 'empresas', dataAttr: 'data-company-page', ariaLabel: 'Paginacion de empresas' })}
  `
}

function deviceTable(devices) {
  return `
    <div class="table-wrap devices-table">
      <table>
        <thead>
          <tr>
            <th>Empresa</th><th>Grupos</th><th>Equipo</th><th>UID</th><th>IMEI</th><th>IMEI largo</th><th>IMEI corto</th><th>ICCID</th><th>Operadora</th><th>Linea / MSISDN</th><th>Telefono Wialon</th><th>Tipo</th><th>Vendido por</th><th>Cobro</th><th>Meses pago</th><th>Precio pactado</th><th>Fecha venta</th><th>Nota precio</th><th>Origen</th><th>Ultimo mensaje</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${devices
            .map((device) => {
              const line = lineForDevice(device)
              const lineIccid = deviceLineIccid(device, line)
              const lineOperator = deviceLineOperator(device, line)
              const linePhone = deviceLinePhone(device, line)
              const lineCarrierText = deviceLineCarrier(device, line)
              const lineCarrier = lineCarrierText ? `<small>${esc(lineCarrierText)}</small>` : ''
              const matchLabel = deviceLineMatchLabel(device, line)
              return `
                <tr>
                  <td><input list="equipmentCompanyList" value="${attr(device.company)}" data-device="${attr(device.id)}" data-field="company"></td>
                  <td><input value="${attr(device.groups.join(', '))}" data-device="${attr(device.id)}" data-field="groups"></td>
                  <td><input value="${attr(device.unitName)}" data-device="${attr(device.id)}" data-field="unitName"></td>
                  <td><input value="${attr(device.uid || '')}" data-device="${attr(device.id)}" data-field="uid"></td>
                  <td><input value="${attr(device.imei || '')}" data-device="${attr(device.id)}" data-field="imei"></td>
                  <td><input value="${attr(deviceImeiLong(device))}" data-device="${attr(device.id)}" data-field="imeiLong"></td>
                  <td><input value="${attr(deviceImeiShort(device))}" data-device="${attr(device.id)}" data-field="imeiShort"></td>
                  <td>${lineIccid ? `${esc(lineIccid)}${matchLabel ? `<small>${esc(matchLabel)}</small>` : ''}` : '-'}</td>
                  <td>${lineOperator ? `${esc(lineOperator)}${lineCarrier}` : '-'}</td>
                  <td>${linePhone ? `${esc(linePhone)}<small>${lineOperator ? esc(lineOperator) : 'Linea'}</small>` : '-'}</td>
                  <td><input value="${attr(device.phone || '')}" data-device="${attr(device.id)}" data-field="phone"></td>
                  <td><input value="${attr(device.deviceType || '')}" data-device="${attr(device.id)}" data-field="deviceType"></td>
                  <td><select data-device="${attr(device.id)}" data-field="soldBy">${sellerSelectOptions(device.soldBy)}</select></td>
                  <td>
                    <select data-device="${attr(device.id)}" data-field="billingCycle">
                      <option value="mensual" ${deviceBillingCycle(device) === 'mensual' ? 'selected' : ''}>Mensual</option>
                      <option value="semestral" ${deviceBillingCycle(device) === 'semestral' ? 'selected' : ''}>Semestral</option>
                      <option value="anual" ${deviceBillingCycle(device) === 'anual' ? 'selected' : ''}>Anual por equipo</option>
                    </select>
                  </td>
                  <td><input value="${attr(formatPaymentMonths(devicePaymentMonths(device)))}" data-device="${attr(device.id)}" data-field="paymentMonths" ${deviceBillingCycle(device) === 'mensual' ? 'readonly class="muted-input"' : ''}></td>
                  <td><input type="number" min="0" step="0.01" value="${attr(deviceAgreedPriceValue(device))}" data-device="${attr(device.id)}" data-field="agreedPrice"></td>
                  <td><input type="date" value="${attr(device.saleDate || '')}" data-device="${attr(device.id)}" data-field="saleDate"></td>
                  <td><input value="${attr(device.priceNote || '')}" data-device="${attr(device.id)}" data-field="priceNote"></td>
                  <td><span class="pill ${isImportedWialonDevice(device) ? 'ok' : 'warn'}">${isImportedWialonDevice(device) ? 'Wialon' : 'Manual'}</span></td>
                  <td>${esc(device.lastMessage || '-')}</td>
                  <td><span class="pill ${esc(device.recordState)}">${esc(device.recordState.replace('_', ' '))}</span></td>
                </tr>`
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `
}

function billingTable() {
  if (!state.billingRows.length) return '<div class="empty-state">Sin lista generada.</div>'
  const pagination = tablePaginationState(state.billingRows.length, state.billingPage)
  const pageRows = state.billingRows.slice(pagination.start, pagination.end)
  return `
    ${renderTablePagination(state.billingRows.length, pagination, { label: 'prefacturas', dataAttr: 'data-billing-page', ariaLabel: 'Paginacion de prefacturas' })}
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Empresa</th><th>Periodo</th><th>Mensuales</th><th>Anuales</th><th>Semestrales</th><th>Equipos</th><th>Lineas</th><th>Total partidas</th><th>Mensualidad Felipe</th><th>Mensualidad Isaac</th><th>Subtotal</th><th>IVA</th><th>Total</th><th>Estado</th></tr>
        </thead>
        <tbody>
          ${pageRows
            .map(
              (row) => `
                <tr>
                  <td>${esc(row.company)}</td>
                  <td>${esc(row.periodLabel)}</td>
                  <td>${row.monthlyCount}</td>
                  <td>${row.annualCount}</td>
                  <td>${row.semestralCount}</td>
                  <td>${row.equipmentCount}</td>
                  <td>${row.lineCount || 0}</td>
                  <td>${row.billableCount || row.equipmentCount}</td>
                  <td>${money(row.sellerMonthlyTotals?.[quoteAttendantOptions[0]] || 0, state.billing.currency)}</td>
                  <td>${money(row.sellerMonthlyTotals?.[quoteAttendantOptions[1]] || 0, state.billing.currency)}</td>
                  <td>${money(row.subtotal, state.billing.currency)}</td>
                  <td>${money(row.tax, state.billing.currency)}</td>
                  <td>${money(row.total, state.billing.currency)}</td>
                  <td><span class="pill ${esc(row.status)}">${esc(row.status.replace('_', ' '))}</span><small>${esc(row.message)}</small></td>
                </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
    ${renderTablePagination(state.billingRows.length, pagination, { label: 'prefacturas', dataAttr: 'data-billing-page', ariaLabel: 'Paginacion de prefacturas' })}
  `
}

function renderResumen(companies, stats) {
  return `
    <section class="status-strip">
      <div><span>Archivo</span><strong>${esc(state.sourceLabel || 'Sin archivo')}</strong></div>
      <div><span>Ultima actualizacion</span><strong>${state.lastImportAt ? new Date(state.lastImportAt).toLocaleString('es-MX') : 'Pendiente'}</strong></div>
      <div><span>Facturacion</span><strong>Proximo 1: ${esc(nextFirstDay())}</strong></div>
      <button class="button" id="reloadSeed">${icon('refresh-ccw')}Recargar Abril</button>
    </section>
    <section class="metric-grid">
      ${metric('Empresas', stats.companies)}
      ${metric('Grupos', stats.groups)}
      ${metric('Equipos', stats.devices)}
      ${metric('Facturables', stats.billable)}
      ${metric('Cambios', stats.newOrUpdated, 'amber')}
      ${metric('No encontrados', stats.missing, 'red')}
    </section>
    <details class="mapping-panel">
      <summary>${icon('settings-2')}Mapeo de columnas Wialon</summary>
      <div class="mapping-grid">
        ${fieldOrder
          .map(
            (field) => `
              <label>
                <span>${esc(fieldLabels[field])}</span>
                <select data-mapping="${field}">
                  <option value="">Sin columna</option>
                  ${state.columns
                    .map((column) => `<option value="${attr(column)}" ${state.mapping[field] === column ? 'selected' : ''}>${esc(column)}</option>`)
                    .join('')}
                </select>
              </label>`
          )
          .join('')}
      </div>
    </details>
    ${companyTable(companies)}
  `
}

function renderEmpresas(companies) {
  const pagination = tablePaginationState(companies.length, state.companyPage)
  const pageCompanies = companies.slice(pagination.start, pagination.end)
  return `
    ${renderTablePagination(companies.length, pagination, { label: 'empresas', dataAttr: 'data-company-page', ariaLabel: 'Paginacion de empresas' })}
    <section class="company-list">
      ${pageCompanies
        .map(
          (company) => `
            <details class="company-row">
              <summary>
                <div><strong>${esc(company.name)}</strong><span>${company.billableCount} facturables / ${company.devices.length} equipos</span></div>
                ${icon('chevron-right')}
              </summary>
              <div class="company-settings">
                <label>
                  <span>Email de facturacion</span>
                  <input type="email" value="${attr(getCompanyMeta(company.name).email || '')}" data-company-meta="${attr(company.name)}" data-meta-field="email" placeholder="facturas@empresa.com">
                </label>
              </div>
              <div class="group-list">
                ${Array.from(company.groups.entries())
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(
                    ([group, groupDevices]) => `
                      <div class="group-row"><span>${esc(group)}</span><strong>${groupDevices.filter(isBillableDevice).length}</strong></div>`
                  )
                  .join('')}
              </div>
            </details>`
        )
        .join('')}
    </section>
    ${renderTablePagination(companies.length, pagination, { label: 'empresas', dataAttr: 'data-company-page', ariaLabel: 'Paginacion de empresas' })}
  `
}

function renderEquipos() {
  const devices = filteredDevices()
  const pagination = equipmentPaginationState(devices.length)
  const pageDevices = devices.slice(pagination.start, pagination.end)
  const companyOptions = unique([...buildCompanies().map((company) => company.name), ...state.devices.map((device) => device.company), ...Object.keys(state.companyMeta)]).sort((a, b) =>
    a.localeCompare(b)
  )
  const d = state.newDevice
  return `
    <section>
      <div class="billing-settings">
        <label><span>Empresa</span><input list="equipmentCompanyList" value="${attr(d.company)}" data-new-device="company" placeholder="Selecciona o escribe nueva empresa"></label>
        <label><span>Grupo</span><input value="${attr(d.groups)}" data-new-device="groups" placeholder="Grupo o grupos"></label>
        <label><span>Equipo</span><input value="${attr(d.unitName)}" data-new-device="unitName"></label>
        <label><span>UID</span><input value="${attr(d.uid)}" data-new-device="uid"></label>
        <label><span>IMEI</span><input value="${attr(d.imei)}" data-new-device="imei"></label>
        <label><span>IMEI largo</span><input value="${attr(d.imeiLong)}" data-new-device="imeiLong"></label>
        <label><span>IMEI corto</span><input value="${attr(d.imeiShort)}" data-new-device="imeiShort"></label>
        <label><span>Tipo</span><input value="${attr(d.deviceType)}" data-new-device="deviceType"></label>
        <label><span>Telefono Wialon</span><input value="${attr(d.phone)}" data-new-device="phone"></label>
        <label>
          <span>Vendido por</span>
          <select data-new-device="soldBy">${sellerSelectOptions(d.soldBy || defaultNewEquipmentSeller)}</select>
        </label>
        <label><span>Precio pactado</span><input type="number" min="0" step="0.01" value="${attr(d.agreedPrice)}" data-new-device="agreedPrice"></label>
        <label><span>Fecha venta</span><input type="date" value="${attr(d.saleDate)}" data-new-device="saleDate"></label>
        <label class="wide"><span>Nota precio</span><input value="${attr(d.priceNote)}" data-new-device="priceNote"></label>
        <button class="button primary" id="addManualDevice">${icon('plus')}Agregar equipo</button>
      </div>
      <datalist id="equipmentCompanyList">
        ${companyOptions.map((company) => `<option value="${attr(company)}"></option>`).join('')}
      </datalist>
      <div class="table-toolbar">
        <label class="search-box">${icon('search')}<input id="searchInput" value="${attr(state.query)}" placeholder="Buscar"></label>
        <label class="search-box">${icon('building-2')}<input id="equipmentCompanyFilter" list="equipmentCompanyList" value="${attr(state.equipmentCompanyFilter)}" placeholder="Empresa"></label>
        <select id="equipmentCycleFilter" class="compact-select" aria-label="Filtrar por cobro">
          <option value="">Todos los cobros</option>
          <option value="mensual" ${state.equipmentCycleFilter === 'mensual' ? 'selected' : ''}>Mensual</option>
          <option value="semestral" ${state.equipmentCycleFilter === 'semestral' ? 'selected' : ''}>Semestral</option>
          <option value="anual" ${state.equipmentCycleFilter === 'anual' ? 'selected' : ''}>Anual</option>
        </select>
        <span>${devices.length} equipos</span>
      </div>
      ${renderEquipmentPagination(devices.length, pagination)}
      ${deviceTable(pageDevices)}
      ${renderEquipmentPagination(devices.length, pagination)}
    </section>
  `
}

function renderLineRows(lines) {
  if (!lines.length) return '<tr><td colspan="18">Sin lineas en esta seccion.</td></tr>'
  return lines
    .map((line) => {
      const matchType = lineMatchType(line)
      const pillClass = matchType === 'equipo' ? 'ok' : matchType === 'no_asignada' || matchType === 'solo_linea' ? 'warn' : 'red'
      return `
        <tr>
          <td><input value="${attr(line.company)}" data-line="${attr(line.id)}" data-line-field="company"></td>
          <td><input value="${attr(line.phone)}" data-line="${attr(line.id)}" data-line-field="phone"></td>
          <td>
            <select data-line="${attr(line.id)}" data-line-field="lineType">
              ${lineTypeOptions.map((option) => `<option value="${attr(option.value)}" ${normalizeLineType(line.lineType) === option.value ? 'selected' : ''}>${esc(option.label)}</option>`).join('')}
            </select>
          </td>
          <td><input value="${attr(line.iccid)}" data-line="${attr(line.id)}" data-line-field="iccid"></td>
          <td><input value="${attr(line.imei)}" data-line="${attr(line.id)}" data-line-field="imei"></td>
          <td><input value="${attr(line.imeiLong)}" data-line="${attr(line.id)}" data-line-field="imeiLong"></td>
          <td><input value="${attr(line.imeiShort)}" data-line="${attr(line.id)}" data-line-field="imeiShort"></td>
          <td><select data-line="${attr(line.id)}" data-line-field="soldBy">${sellerSelectOptions(line.soldBy)}</select></td>
          <td><span class="pill ${pillClass}">${esc(lineMatchLabel(line))}</span></td>
          <td><span class="pill">${esc(providerDetectionLabel(line.providerDetectedBy))}</span></td>
          <td>
            <select data-line="${attr(line.id)}" data-line-field="clientOnly">
              <option value="false" ${!line.clientOnly ? 'selected' : ''}>Equipo GPS</option>
              <option value="true" ${line.clientOnly ? 'selected' : ''}>Solo linea</option>
            </select>
          </td>
          <td>
            <select data-line="${attr(line.id)}" data-line-field="status">
              <option value="activa" ${isActiveLine(line) ? 'selected' : ''}>Activa</option>
              <option value="desactivada" ${normalizeLineStatus(line.status) === 'desactivada' ? 'selected' : ''}>Desactivada</option>
              <option value="suspendida" ${normalizeLineStatus(line.status) === 'suspendida' ? 'selected' : ''}>Suspendida</option>
              <option value="emitida" ${normalizeLineStatus(line.status) === 'emitida' ? 'selected' : ''}>Emitida</option>
            </select>
          </td>
          <td>
            <select data-line="${attr(line.id)}" data-line-field="billingCycle">
              <option value="anual" ${line.billingCycle === 'anual' ? 'selected' : ''}>Anual</option>
              <option value="semestral" ${line.billingCycle === 'semestral' ? 'selected' : ''}>Semestral</option>
              <option value="mensual" ${line.billingCycle === 'mensual' ? 'selected' : ''}>Mensual</option>
            </select>
          </td>
          <td><input type="date" value="${attr(line.renewalDate)}" data-line="${attr(line.id)}" data-line-field="renewalDate"><small>${esc(lineRenewalLabel(line))}</small></td>
          <td><input type="number" min="0" step="0.01" value="${attr(line.annualPrice)}" data-line="${attr(line.id)}" data-line-field="annualPrice"></td>
          <td><input value="${attr(line.carrier)}" data-line="${attr(line.id)}" data-line-field="carrier"></td>
          <td><input value="${attr(line.plan)}" data-line="${attr(line.id)}" data-line-field="plan"></td>
          <td><input value="${attr(line.notes)}" data-line="${attr(line.id)}" data-line-field="notes"></td>
        </tr>`
    })
    .join('')
}

function renderLineTable(title, lines, tone = '') {
  return `
    <section class="line-section ${tone}">
      <div class="line-section-head">
        <div><span>Lineas</span><h2>${esc(title)}</h2></div>
        <strong>${lines.length}</strong>
      </div>
      <div class="table-wrap devices-table">
        <table>
          <thead>
            <tr>
              <th>Empresa</th><th>Linea</th><th>Tipo linea</th><th>ICCID / ICC</th><th>IMEI</th><th>IMEI largo</th><th>IMEI corto</th><th>Vendido por</th><th>Match</th><th>Detectado por</th><th>Tipo</th><th>Estatus</th><th>Cobro</th><th>Renovacion</th><th>Precio pactado</th><th>Operador</th><th>Plan</th><th>Notas</th>
            </tr>
          </thead>
          <tbody>${renderLineRows(lines)}</tbody>
        </table>
      </div>
    </section>
  `
}

function renderLineProviderSections(lines) {
  const groups = lineProviderGroups(lines)
  if (!groups.length) return '<div class="empty-state">Sin lineas para los filtros seleccionados.</div>'
  return groups
    .map((group) => renderLineTable(`${group.label} - ${group.lines.length} lineas (${group.active} activas / ${group.inactive} desactivadas)`, group.lines))
    .join('')
}

function renderLineas(companies) {
  const lines = filteredLines()
  const pagination = linePaginationState(lines.length)
  const pageLines = lines.slice(pagination.start, pagination.end)
  const stats = lineStats(state.lines)
  const providerGroups = lineProviderGroups(state.lines)
  const d = { ...state.newLine, status: normalizeLineStatus(state.newLine.status) }
  const options = lineCompanyOptions(companies)
  return `
    <section class="billing-layout">
      <section class="metric-grid billing-metrics">
        ${metric('Lineas', stats.total)}
        ${metric('Activas', stats.active)}
        ${metric('Desactivadas', stats.inactive, 'red')}
        ${metric('Con equipo', stats.matched)}
        ${metric('Solo lineas', stats.clientOnly, 'amber')}
        ${metric('No asignables', stats.exempt, 'amber')}
        ${metric('Sin match', stats.unmatched, 'red')}
      </section>
      <section class="line-profile-grid">
        ${providerGroups
          .map(
            (group) => `
              <div class="line-profile-card">
                <span>Proveedora</span>
                <strong>${esc(group.label)}</strong>
                <div><b>${group.lines.length}</b> lineas</div>
                <small>${esc(lineProviderStatusSummary(group))}</small>
              </div>`
          )
          .join('')}
      </section>
      <div class="billing-settings">
        <label>
          <span>Empresa / Cliente</span>
          <input list="lineCompanyList" value="${attr(d.company)}" data-new-line="company" placeholder="Cliente">
        </label>
        <label><span>Linea celular</span><input value="${attr(d.phone)}" data-new-line="phone" placeholder="Numero"></label>
        <label>
          <span>Tipo linea</span>
          <select data-new-line="lineType">
            ${lineTypeOptions.map((option) => `<option value="${attr(option.value)}" ${normalizeLineType(d.lineType) === option.value ? 'selected' : ''}>${esc(option.label)}</option>`).join('')}
          </select>
        </label>
        <label><span>ICCID / ICC</span><input value="${attr(d.iccid)}" data-new-line="iccid" placeholder="SIM"></label>
        <label><span>IMEI equipo</span><input value="${attr(d.imei)}" data-new-line="imei" placeholder="IMEI si aplica"></label>
        <label>
          <span>Vendido por</span>
          <select data-new-line="soldBy">${sellerSelectOptions(d.soldBy || defaultNewEquipmentSeller)}</select>
        </label>
        <label><span>Operador</span><input value="${attr(d.carrier)}" data-new-line="carrier" placeholder="Telcel, AT&T, etc."></label>
        <label><span>Plan</span><input value="${attr(d.plan)}" data-new-line="plan" placeholder="Plan / paquete"></label>
        <label>
          <span>Estatus</span>
          <select data-new-line="status">
            <option value="activa" ${d.status === 'activa' ? 'selected' : ''}>Activa</option>
            <option value="desactivada" ${d.status === 'desactivada' ? 'selected' : ''}>Desactivada</option>
          </select>
        </label>
        <label>
          <span>Cobro</span>
          <select data-new-line="billingCycle">
            <option value="anual" ${d.billingCycle === 'anual' ? 'selected' : ''}>Anual</option>
            <option value="semestral" ${d.billingCycle === 'semestral' ? 'selected' : ''}>Semestral</option>
            <option value="mensual" ${d.billingCycle === 'mensual' ? 'selected' : ''}>Mensual</option>
          </select>
        </label>
        <label><span>Renovacion</span><input type="date" value="${attr(d.renewalDate)}" data-new-line="renewalDate"></label>
        <label><span>Precio pactado</span><input type="number" min="0" step="0.01" value="${attr(d.annualPrice)}" data-new-line="annualPrice"></label>
        <label class="check-field"><input type="checkbox" data-new-line="clientOnly" ${d.clientOnly ? 'checked' : ''}><span>Solo linea celular</span></label>
        <label class="wide"><span>Notas</span><input value="${attr(d.notes)}" data-new-line="notes" placeholder='Ej. bernardo 15 mayo 2026'></label>
        <button class="button primary" id="addManualLine">${icon('plus')}Agregar linea</button>
      </div>
      <datalist id="lineCompanyList">
        ${options.map((company) => `<option value="${attr(company)}"></option>`).join('')}
      </datalist>
      <div class="billing-settings line-actions">
        <button class="button primary" id="uploadLineFile">${icon('upload')}Importar lineas XLSX</button>
        <button class="button" id="uploadEmnifyFile">${icon('cloud-upload')}Importar Emnify</button>
        <button class="button" id="loadRelationLines">${icon('database')}Cargar base cifrada</button>
        <button class="button" id="exportLinesXlsx">${icon('download')}Exportar lineas</button>
        <button class="button" id="exportLineMatchReportXlsx">${icon('file-text')}Reporte match lineas</button>
        <label>
          <span>Estatus</span>
          <select id="lineStatusFilter">
            <option value="">Todos</option>
            <option value="activa" ${state.lineStatusFilter === 'activa' ? 'selected' : ''}>Activas</option>
            <option value="desactivada" ${state.lineStatusFilter === 'desactivada' ? 'selected' : ''}>Desactivadas</option>
            <option value="suspendida" ${state.lineStatusFilter === 'suspendida' ? 'selected' : ''}>Suspendidas</option>
            <option value="emitida" ${state.lineStatusFilter === 'emitida' ? 'selected' : ''}>Emitidas</option>
          </select>
        </label>
        <label>
          <span>Proveedora</span>
          <select id="lineTypeFilter">
            <option value="">Todas</option>
            ${lineTypeOptions.map((option) => `<option value="${attr(option.value)}" ${state.lineTypeFilter === option.value ? 'selected' : ''}>${esc(option.label)}</option>`).join('')}
          </select>
        </label>
        <label>
          <span>Match</span>
          <select id="lineMatchFilter">
            <option value="">Todos</option>
            <option value="equipo" ${state.lineMatchFilter === 'equipo' ? 'selected' : ''}>Con equipo GPS</option>
            <option value="solo_linea" ${state.lineMatchFilter === 'solo_linea' ? 'selected' : ''}>Solo linea celular</option>
            <option value="no_asignada" ${state.lineMatchFilter === 'no_asignada' ? 'selected' : ''}>No asignables Wialon</option>
            <option value="sin_match" ${state.lineMatchFilter === 'sin_match' ? 'selected' : ''}>Sin match</option>
          </select>
        </label>
        <label class="search-box billing-search">${icon('search')}<input id="lineSearchInput" value="${attr(state.lineQuery)}" placeholder="Buscar ICC/ICCID, IMEI o linea"></label>
        <label class="search-box billing-search">${icon('scan-search')}<input id="lineIccSearchInput" value="${attr(state.lineIccQuery)}" placeholder="Filtrar solo por ICCID"></label>
        <div class="filter-count"><span>Filtradas</span><strong>${lines.length}</strong></div>
      </div>
      ${
        state.lineImport
          ? `<div class="notice">Ultima base de lineas: ${esc(state.lineImport.source)} (${state.lineImport.imported} lineas, ${state.lineImport.iccDetected || 0} con ICC), ${state.lineImport.matched} con equipo, ${state.lineImport.clientOnly} solo linea, ${state.lineImport.exempt || 0} no asignables, ${state.lineImport.unmatched} sin match accionable.</div>`
          : '<div class="notice">Importa la base de lineas activas para cruzarlas contra IMEI o contra el telefono Wialon. Para Bernardo tambien lee renovaciones escritas como: bernardo 15 mayo 2026.</div>'
      }
      <div class="notice">Clasificacion automatica: archivo/base con proveedor explicito manda; si no hay proveedor, 8934 y 8949 = Emnify, 8952 sin telefono = Emprenet y 8952 con telefono = Telcel. El cruce con Wialon usa IMEI, UID y telefono; Bernardo/Berna se conserva como solo linea, y las Emnify desactivadas/deleted/disponibles sin asignar no cuentan como sin match.</div>
      ${renderPagination(lines.length, pagination)}
      ${renderLineProviderSections(pageLines)}
      ${renderPagination(lines.length, pagination)}
    </section>
  `
}

function renderFacturacion(stats, companies) {
  const period = getBillingPeriod()
  const previewRows = buildBillingRows()
  const periodStats = billingFilterStats(previewRows)
  const sellerMonthlyTotals = billingSellerMonthlyTotals(previewRows)
  const projectedTotal = previewRows.reduce((sum, row) => sum + row.total, 0)
  const groups = billingGroups()
  const options = companyOptions(companies)
  return `
    <section class="billing-layout">
      <div class="billing-settings">
        <label class="wide"><span>Empresa nueva</span><input value="${attr(state.quote.newCompanyName)}" data-quote="newCompanyName" placeholder="Nombre de la empresa"></label>
        <button class="button primary" id="addCompanyFromQuote">${icon('building-2')}Agregar empresa</button>
        <button class="button" id="loadPaymentSeed">${icon('refresh-ccw')}Aplicar pagos pactados</button>
        <button class="button" id="uploadPaymentFile">${icon('upload')}Importar pagos XLSX</button>
      </div>
      ${
        state.paymentImport
          ? `<div class="notice">Pagos pactados: ${(state.paymentImport.matchedById || 0) + (state.paymentImport.matchedByCompanyName || 0) + (state.paymentImport.matchedByName || 0)} equipos comparados (${state.paymentImport.matchedById || 0} por UID/IMEI largo/corto, ${state.paymentImport.matchedByCompanyName || 0} por empresa+nombre, ${state.paymentImport.matchedByName || 0} por nombre), ${state.paymentImport.semestral} semestrales, ${state.paymentImport.annual} anuales, ${state.paymentImport.defaultMonthly} mensuales por defecto.</div>`
          : ''
      }
      <div class="billing-filters">
        <label>
          <span>Empresa</span>
          <select id="billingCompany">
            <option value="">Todas</option>
            ${options.map((company) => `<option value="${attr(company)}" ${state.billingCompany === company ? 'selected' : ''}>${esc(company)}</option>`).join('')}
          </select>
        </label>
        <label>
          <span>Grupo</span>
          <select id="billingGroup">
            <option value="">Todos</option>
            ${groups.map((group) => `<option value="${attr(group)}" ${state.billingGroup === group ? 'selected' : ''}>${esc(group)}</option>`).join('')}
          </select>
        </label>
        <label class="search-box billing-search">${icon('search')}<input id="billingSearchInput" value="${attr(state.billingQuery)}" placeholder="Equipo, UID o IMEI"></label>
        <div class="filter-count"><span>Partidas a facturar</span><strong>${periodStats.totalBillable}</strong></div>
      </div>
      <div class="notice">Facturacion de equipos cuenta estrictamente equipos importados de Wialon. Las lineas celulares se agregan desde la pestaña Lineas y entran por su fecha de renovacion del periodo seleccionado.</div>
      <section class="metric-grid billing-metrics">
        ${metric('Mensuales', periodStats.monthly)}
        ${metric('Anualidades periodo', periodStats.annual, 'amber')}
        ${metric('Semestrales periodo', periodStats.semestral, 'amber')}
        ${metric('Lineas periodo', periodStats.lines, 'amber')}
        ${metric('Anualidades fuera', periodStats.outsideAnnual, 'red')}
        ${metric('Empresas en lista', previewRows.length)}
        ${metricMoney('Mensualidad Felipe', sellerMonthlyTotals[quoteAttendantOptions[0]] || 0, state.billing.currency)}
        ${metricMoney('Mensualidad Isaac', sellerMonthlyTotals[quoteAttendantOptions[1]] || 0, state.billing.currency)}
      </section>
      <div class="billing-settings">
        <label><span>Precio mensual por equipo</span><input type="number" min="0" step="0.01" value="${attr(state.billing.monthlyPricePerDevice)}" data-billing="monthlyPricePerDevice"></label>
        <label><span>Precio anual por equipo</span><input type="number" min="0" step="0.01" value="${attr(state.billing.annualPricePerDevice)}" data-billing="annualPricePerDevice"></label>
        <label><span>IVA</span><input type="number" min="0" step="0.01" value="${attr(state.billing.ivaRate)}" data-billing="ivaRate"></label>
        <label>
          <span>Moneda</span>
          <select data-billing="currency">
            <option value="MXN" ${state.billing.currency === 'MXN' ? 'selected' : ''}>MXN</option>
            <option value="USD" ${state.billing.currency === 'USD' ? 'selected' : ''}>USD</option>
          </select>
        </label>
        <label>
          <span>Periodo</span>
          <select data-billing="periodMode">
            <option value="next" ${state.billing.periodMode === 'next' ? 'selected' : ''}>Mes siguiente</option>
            <option value="current" ${state.billing.periodMode === 'current' ? 'selected' : ''}>Mes actual</option>
            <option value="previous" ${state.billing.periodMode === 'previous' ? 'selected' : ''}>Mes anterior</option>
          </select>
        </label>
        <label class="wide"><span>Concepto</span><input value="${attr(state.billing.concept)}" data-billing="concept"></label>
        <button class="button primary" id="generateBilling">${icon('file-spreadsheet')}Generar prefactura</button>
        <button class="button" id="exportBillingXlsx">${icon('download')}Exportar XLSX</button>
      </div>
      <div class="billing-summary">
        <div>${icon('calendar-days')}<span>Periodo: ${esc(period.label)}</span></div>
        <strong>${money(projectedTotal, state.billing.currency)}</strong>
      </div>
      ${billingTable()}
    </section>
  `
}

function renderAccessoryManager(quoteDraft, quote) {
  const accessories = normalizedQuoteAccessories(quoteDraft)
  if (!accessories.length) {
    return `<div class="accessory-empty">Sin accesorios agregados. Usa el combo para sumar sensores, dashcams, camaras u otros accesorios a la cotizacion.</div>`
  }

  return `
    <div class="table-wrap accessory-table">
      <table>
        <thead>
          <tr><th>Tipo</th><th>Modelo</th><th>Cantidad</th><th>Precio venta</th><th>Subtotal</th><th></th></tr>
        </thead>
        <tbody>
          ${accessories
            .map((accessory) => {
              const unitPrice = accessorySalePrice(accessory.cost, accessory.discount, accessory.margin, accessory.unitPrice)
              return `
                <tr>
                  <td><input value="${attr(accessory.category)}" data-accessory-id="${attr(accessory.id)}" data-accessory-field="category"></td>
                  <td><input value="${attr(accessory.model)}" data-accessory-id="${attr(accessory.id)}" data-accessory-field="model"></td>
                  <td><input type="number" min="0" step="1" value="${attr(accessory.quantity)}" data-accessory-id="${attr(accessory.id)}" data-accessory-field="quantity"></td>
                  <td><input type="number" min="0" step="0.01" value="${attr(unitPrice)}" data-accessory-id="${attr(accessory.id)}" data-accessory-field="unitPrice"></td>
                  <td><strong>${money(accessory.quantity * unitPrice, quote.currency)}</strong></td>
                  <td><button class="icon-button danger" title="Quitar accesorio" data-remove-accessory="${attr(accessory.id)}">${icon('trash-2')}</button></td>
                </tr>
              `
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `
}

function renderAccessoryAdvancedEditor(quoteDraft) {
  const accessories = normalizedQuoteAccessories(quoteDraft)
  if (!accessories.length) return `<div class="accessory-empty">Agrega accesorios para capturar proveedor, costo, margen y URL.</div>`

  return `
    <div class="accessory-subtitle">Accesorios</div>
    <div class="table-wrap accessory-table accessory-advanced-table">
      <table>
        <thead>
          <tr><th>Accesorio</th><th>Proveedor</th><th>Costo proveedor</th><th>Desc. %</th><th>Ganancia %</th><th>URL / notas</th></tr>
        </thead>
        <tbody>
          ${accessories
            .map(
              (accessory) => `
                <tr>
                  <td><strong>${esc(accessory.category)}</strong><small>${esc(accessory.model)}</small></td>
                  <td><input value="${attr(accessory.supplier)}" data-accessory-id="${attr(accessory.id)}" data-accessory-field="supplier"></td>
                  <td><input type="number" min="0" step="0.01" value="${attr(accessory.cost)}" data-accessory-id="${attr(accessory.id)}" data-accessory-field="cost"></td>
                  <td><input type="number" min="0" step="0.01" value="${attr(accessory.discount)}" data-accessory-id="${attr(accessory.id)}" data-accessory-field="discount"></td>
                  <td><input type="number" min="0" step="0.01" value="${attr(accessory.margin)}" data-accessory-id="${attr(accessory.id)}" data-accessory-field="margin"></td>
                  <td>
                    <input value="${attr(accessory.url)}" data-accessory-id="${attr(accessory.id)}" data-accessory-field="url" placeholder="URL proveedor">
                    <input value="${attr(accessory.notes)}" data-accessory-id="${attr(accessory.id)}" data-accessory-field="notes" placeholder="Notas">
                  </td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `
}

function renderCotizaciones(companies) {
  const quote = buildQuote()
  const options = companyOptions(companies)
  const q = state.quote

  return `
    <section class="billing-layout quote-layout">
      <div class="quote-section">
        <div class="quote-section-head">
          <div><span>Cliente</span><h2>Datos de cotizacion</h2></div>
        </div>
        <div class="quote-section-grid">
          <label>
            <span>Empresa registrada</span>
            <select id="quoteCompany">
              <option value="">Prospecto sin registrar</option>
              ${options.map((company) => `<option value="${attr(company)}" ${q.company === company ? 'selected' : ''}>${esc(company)}</option>`).join('')}
            </select>
          </label>
          <label><span>Cliente / razon social</span><input value="${attr(q.clientName)}" data-quote="clientName" placeholder="${attr(quote.clientName)}"></label>
          <label>
            <span>Atiende</span>
            <select data-quote="attendant">
              ${quoteAttendantOptions.map((name) => `<option value="${attr(name)}" ${(q.attendant || defaultQuote.attendant) === name ? 'selected' : ''}>${esc(name)}</option>`).join('')}
            </select>
          </label>
          <label><span>Cantidad cotizada</span><input type="number" min="0" step="1" value="${attr(q.equipmentCount)}" data-quote="equipmentCount" placeholder="0"></label>
          <label>
            <span>Moneda</span>
            <select data-quote="currency">
              <option value="MXN" ${q.currency === 'MXN' ? 'selected' : ''}>MXN</option>
              <option value="USD" ${q.currency === 'USD' ? 'selected' : ''}>USD</option>
            </select>
          </label>
          <label><span>Vigencia dias</span><input type="number" min="0" step="1" value="${attr(q.validityDays)}" data-quote="validityDays"></label>
          <label><span>IVA</span><input type="number" min="0" step="0.01" value="${attr(q.ivaRate)}" data-quote="ivaRate"></label>
          <label class="wide"><span>Descripcion</span><input value="${attr(q.equipmentDescription)}" data-quote="equipmentDescription"></label>
        </div>
      </div>

      <div class="quote-section">
        <div class="quote-section-head">
          <div><span>Mensualidades</span><h2>Servicio recurrente</h2></div>
          <div class="quote-total-chip"><span>Subtotal</span><strong>${money(quote.recurringSubtotal, quote.currency)}</strong></div>
        </div>
        <div class="quote-section-grid">
          <label>
            <span>Tipo de servicio</span>
            <select data-quote="billingCycle">
              <option value="mensual" ${q.billingCycle === 'mensual' ? 'selected' : ''}>Mensual</option>
              <option value="semestral" ${q.billingCycle === 'semestral' ? 'selected' : ''}>Semestral</option>
              <option value="anual" ${q.billingCycle === 'anual' ? 'selected' : ''}>Anual por equipo</option>
            </select>
          </label>
          <label><span>Precio mensual</span><input type="number" min="0" step="0.01" value="${attr(q.monthlyPricePerDevice)}" data-quote="monthlyPricePerDevice"></label>
          <label><span>Precio anual</span><input type="number" min="0" step="0.01" value="${attr(q.annualPricePerDevice)}" data-quote="annualPricePerDevice"></label>
          <label class="check-field"><input type="checkbox" data-quote="firstMonthFree" ${q.firstMonthFree !== false ? 'checked' : ''}><span>Primer mes gratis</span></label>
          <div class="quote-total-chip"><span>Precio aplicado</span><strong>${money(quote.recurringUnitPrice, quote.currency)}</strong></div>
          <div class="quote-total-chip"><span>Descuento primer mes</span><strong>-${money(quote.firstMonthDiscount, quote.currency)}</strong></div>
        </div>
      </div>

      <div class="quote-section">
        <div class="quote-section-head">
          <div><span>Lineas celulares</span><h2>Venta de lineas</h2></div>
          <div class="quote-total-chip"><span>Subtotal</span><strong>${money(quote.lineRecurringSubtotal, quote.currency)}</strong></div>
        </div>
        <div class="quote-section-grid">
          <label><span>Cantidad lineas</span><input type="number" min="0" step="1" value="${attr(q.lineCount)}" data-quote="lineCount" placeholder="0"></label>
          <label>
            <span>Cobro linea</span>
            <select data-quote="lineBillingCycle">
              <option value="anual" ${q.lineBillingCycle === 'anual' ? 'selected' : ''}>Anual</option>
              <option value="semestral" ${q.lineBillingCycle === 'semestral' ? 'selected' : ''}>Semestral</option>
              <option value="mensual" ${q.lineBillingCycle === 'mensual' ? 'selected' : ''}>Mensual</option>
            </select>
          </label>
          <label><span>Precio mensual linea</span><input type="number" min="0" step="0.01" value="${attr(q.lineMonthlyPrice)}" data-quote="lineMonthlyPrice"></label>
          <label><span>Precio anual linea</span><input type="number" min="0" step="0.01" value="${attr(q.lineAnnualPrice)}" data-quote="lineAnnualPrice"></label>
          <label class="wide"><span>Descripcion linea</span><input value="${attr(q.lineDescription)}" data-quote="lineDescription"></label>
          <div class="quote-total-chip"><span>Precio aplicado</span><strong>${money(quote.lineRecurringUnitPrice, quote.currency)}</strong></div>
          <div class="quote-total-chip"><span>Descuento linea</span><strong>-${money(quote.lineFirstMonthDiscount, quote.currency)}</strong></div>
        </div>
      </div>

      <div class="quote-section">
        <div class="quote-section-head">
          <div><span>Equipos</span><h2>Equipo GPS principal</h2></div>
          <div class="quote-total-chip"><span>Subtotal</span><strong>${money(quote.hardwareSubtotal, quote.currency)}</strong></div>
        </div>
        <div class="quote-section-grid">
          <label>
            <span>GPS</span>
            <select data-quote="hardwarePreset">
              ${hardwarePresetOptions(q.hardwareModel)}
              <option value="custom" ${hardwarePresets.some((preset) => preset.model === q.hardwareModel) ? '' : 'selected'}>Otro proveedor/modelo</option>
            </select>
          </label>
          <label><span>Cantidad equipos</span><input type="number" min="0" step="1" value="${attr(q.equipmentCount)}" data-quote="equipmentCount" placeholder="0"></label>
          <label><span>Venta GPS</span><input type="number" min="0" step="0.01" value="${attr(hardwareSalePriceFromQuote(q))}" data-quote="hardwarePricePerDevice"></label>
        </div>
      </div>

      <div class="quote-section">
        <div class="quote-section-head">
          <div><span>Accesorios</span><h2>Sensores, dashcams y extras</h2></div>
          <div class="quote-total-chip"><span>Subtotal</span><strong>${money(quote.accessorySubtotal, quote.currency)}</strong></div>
        </div>
        <div class="quote-section-grid">
          <label>
            <span>Agregar accesorio</span>
            <select data-quote="accessoryPreset">
              <option value="" ${!q.accessoryPreset ? 'selected' : ''}>Sin accesorio</option>
              ${accessoryPresetOptions(q.accessoryPreset)}
              <option value="custom" ${q.accessoryPreset === 'custom' ? 'selected' : ''}>Accesorio personalizado</option>
            </select>
          </label>
          <label><span>Cantidad accesorio</span><input type="number" min="1" step="1" value="${attr(q.accessoryQuantity || 1)}" data-quote="accessoryQuantity"></label>
          <button class="button" id="addAccessoryQuote" ${!q.accessoryPreset ? 'disabled' : ''}>${icon('plus')}Agregar accesorio</button>
        </div>
        ${renderAccessoryManager(q, quote)}
      </div>

      <details class="quote-section quote-advanced">
        <summary>${icon('settings-2')}Precios avanzados de equipos y accesorios</summary>
        <div class="quote-section-grid">
          <label><span>Modelo manual GPS</span><input value="${attr(q.hardwareModel)}" data-quote="hardwareModel" placeholder="Ej. Teltonika FMB920"></label>
          <label><span>Proveedor GPS</span><input value="${attr(q.hardwareSupplier || 'Syscom')}" data-quote="hardwareSupplier" placeholder="Syscom, MercadoLibre, Amazon..."></label>
          <label><span>Precio proveedor GPS</span><input type="number" min="0" step="0.01" value="${attr(q.hardwareCostPerDevice)}" data-quote="hardwareCostPerDevice"></label>
          <label><span>Desc. proveedor GPS %</span><input type="number" min="0" step="0.01" value="${attr(q.hardwareDiscountPercent)}" data-quote="hardwareDiscountPercent"></label>
          <label><span>Ganancia GPS %</span><input type="number" min="0" step="0.01" value="${attr(q.hardwareMarginPercent)}" data-quote="hardwareMarginPercent"></label>
          <label class="wide"><span>URL proveedor GPS</span><input value="${attr(q.hardwareSyscomUrl)}" data-quote="hardwareSyscomUrl" placeholder="https://www.syscom.mx/products/..."></label>
        </div>
        ${renderAccessoryAdvancedEditor(q)}
      </details>

      <div class="quote-section">
        <div class="quote-section-head">
          <div><span>Instalacion</span><h2>Instalacion y viaticos</h2></div>
          <div class="quote-total-chip"><span>Subtotal</span><strong>${money(quote.installationSubtotal + quote.travelFee, quote.currency)}</strong></div>
        </div>
        <div class="quote-section-grid">
          <label>
            <span>Zona instalacion</span>
            <select data-quote="installationZone">
              <option value="city" ${q.installationZone === 'city' ? 'selected' : ''}>Dentro de ciudad</option>
              <option value="outside" ${q.installationZone === 'outside' ? 'selected' : ''}>Fuera de ciudad</option>
              <option value="town" ${q.installationZone === 'town' ? 'selected' : ''}>Pueblo / traslado</option>
            </select>
          </label>
          <label><span>Instalacion por equipo</span><input type="number" min="0" step="0.01" value="${attr(q.installationPricePerDevice)}" data-quote="installationPricePerDevice"></label>
          <label><span>Viaticos traslado</span><input type="number" min="0" step="0.01" value="${attr(q.travelFee)}" data-quote="travelFee"></label>
          <label class="wide"><span>Notas traslado</span><input value="${attr(q.travelNotes)}" data-quote="travelNotes" placeholder="Traslado ida y vuelta del tecnico segun ubicacion"></label>
        </div>
      </div>

      <div class="quote-section">
        <div class="quote-section-grid quote-actions-grid">
          <label class="wide"><span>Notas comerciales</span><input value="${attr(q.notes)}" data-quote="notes"></label>
          <button class="button primary" id="exportQuoteXlsx">${icon('file-spreadsheet')}Generar cotizacion XLSX + PDF</button>
        </div>
      </div>

      <div class="billing-summary">
        <div>${icon('file-text')}<span>${esc(quote.clientName)} - ${quote.quantity || 0} equipos / ${quote.lineQuantity || 0} lineas</span></div>
        <strong>${money(quote.total, quote.currency)}</strong>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Concepto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            <tr class="section-row"><td colspan="4">Equipos</td></tr>
            <tr>
              <td>Equipo GPS${quote.hardwareModel ? ` - ${esc(quote.hardwareModel)}` : ''}</td>
              <td>${quote.quantity}</td>
              <td>${money(quote.hardwareUnitPrice, quote.currency)}</td>
              <td>${money(quote.hardwareSubtotal, quote.currency)}</td>
            </tr>
            <tr class="section-row"><td colspan="4">Accesorios</td></tr>
            ${quote.accessoryRows
              .map(
                (row) => `
                  <tr>
                    <td>${esc(row.label)}</td>
                    <td>${row.quantity}</td>
                    <td>${money(row.unitPrice, quote.currency)}</td>
                    <td>${money(row.subtotal, quote.currency)}</td>
                  </tr>`
              )
              .join('')}
            <tr class="section-row"><td colspan="4">Instalacion y viaticos</td></tr>
            <tr>
              <td>Instalacion por equipo</td>
              <td>${quote.quantity}</td>
              <td>${money(quote.installationUnitPrice, quote.currency)}</td>
              <td>${money(quote.installationSubtotal, quote.currency)}</td>
            </tr>
            <tr>
              <td>Viaticos traslado tecnico</td>
              <td>1</td>
              <td>${money(quote.travelFee, quote.currency)}</td>
              <td>${money(quote.travelFee, quote.currency)}</td>
            </tr>
            <tr class="section-row"><td colspan="4">Mensualidades</td></tr>
            ${quoteRecurringRows(quote)
              .map(
                (row) => `
                  <tr>
                    <td>${esc(row.description)}</td>
                    <td>${row.quantity}</td>
                    <td>${money(row.unitPrice, quote.currency)}</td>
                    <td>${money(row.amount, quote.currency)}</td>
                  </tr>`
              )
              .join('')}
            <tr>
              <td colspan="3"><strong>IVA</strong></td>
              <td>${money(quote.tax, quote.currency)}</td>
            </tr>
            <tr>
              <td colspan="3"><strong>Total</strong></td>
              <td><strong>${money(quote.total, quote.currency)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
}

function renderCobros(companies) {
  const devices = filteredCobrosDevices()
  const pagination = tablePaginationState(devices.length, state.cobrosPage)
  const pageDevices = devices.slice(pagination.start, pagination.end)
  const groups = cobrosGroups()
  return `
    <section class="client-layout">
      <div class="billing-filters">
        <label>
          <span>Empresa</span>
          <select id="cobrosCompany">
            <option value="">Todas</option>
            ${companies.map((company) => `<option value="${attr(company.name)}" ${state.cobrosCompany === company.name ? 'selected' : ''}>${esc(company.name)}</option>`).join('')}
          </select>
        </label>
        <label>
          <span>Grupo</span>
          <select id="cobrosGroup">
            <option value="">Todos</option>
            ${groups.map((group) => `<option value="${attr(group)}" ${state.cobrosGroup === group ? 'selected' : ''}>${esc(group)}</option>`).join('')}
          </select>
        </label>
        <label class="search-box billing-search">${icon('search')}<input id="searchInput" value="${attr(state.query)}" placeholder="Equipo, UID o IMEI"></label>
        <label>
          <span>Cobro</span>
          <select id="cobrosCycleFilter">
            <option value="">Todos</option>
            <option value="mensual" ${state.cobrosCycleFilter === 'mensual' ? 'selected' : ''}>Mensual</option>
            <option value="semestral" ${state.cobrosCycleFilter === 'semestral' ? 'selected' : ''}>Semestral</option>
            <option value="anual" ${state.cobrosCycleFilter === 'anual' ? 'selected' : ''}>Anual</option>
          </select>
        </label>
        <div class="filter-count"><span>Equipos visibles</span><strong>${devices.length}</strong></div>
      </div>
      ${renderTablePagination(devices.length, pagination, { label: 'equipos', dataAttr: 'data-cobros-page', ariaLabel: 'Paginacion de cobros' })}
      <div class="table-wrap devices-table">
        <table>
          <thead>
            <tr><th>Empresa</th><th>Grupos</th><th>Equipo</th><th>UID</th><th>IMEI</th><th>IMEI largo</th><th>IMEI corto</th><th>Origen</th><th>Vendido por</th><th>Cobro</th><th>Fecha renovacion</th><th>Meses pago</th><th>Precio pactado</th><th>Fecha venta</th><th>Nota precio</th><th>Estado</th></tr>
          </thead>
          <tbody>
            ${pageDevices
              .map(
                (device) => `
                  <tr>
                    <td><input value="${attr(device.company)}" data-device-billing="${attr(device.id)}" data-billing-field="company"></td>
                    <td><input value="${attr((device.groups.length ? device.groups : ['Sin grupo']).join(', '))}" data-device-billing="${attr(device.id)}" data-billing-field="groups"></td>
                    <td>${esc(device.unitName)}</td>
                    <td>${esc(device.uid || '-')}</td>
                    <td>${esc(device.imei || '-')}</td>
                    <td>${esc(deviceImeiLong(device) || '-')}</td>
                    <td>${esc(deviceImeiShort(device) || '-')}</td>
                    <td><span class="pill ${isImportedWialonDevice(device) ? 'ok' : 'warn'}">${isImportedWialonDevice(device) ? 'Wialon' : 'Manual'}</span></td>
                    <td><select data-device-billing="${attr(device.id)}" data-billing-field="soldBy">${sellerSelectOptions(device.soldBy)}</select></td>
                    <td>
                      <select data-device-billing="${attr(device.id)}" data-billing-field="billingCycle">
                        <option value="mensual" ${deviceBillingCycle(device) === 'mensual' ? 'selected' : ''}>Mensual</option>
                        <option value="semestral" ${deviceBillingCycle(device) === 'semestral' ? 'selected' : ''}>Semestral</option>
                        <option value="anual" ${deviceBillingCycle(device) === 'anual' ? 'selected' : ''}>Anual por equipo</option>
                      </select>
                    </td>
                    <td><input type="date" value="${attr(device.renewalDate || '')}" data-device-billing="${attr(device.id)}" data-billing-field="renewalDate"></td>
                    <td><input value="${attr(formatPaymentMonths(devicePaymentMonths(device)))}" data-device-billing="${attr(device.id)}" data-billing-field="paymentMonths" ${deviceBillingCycle(device) === 'mensual' ? 'readonly class="muted-input"' : ''}></td>
                    <td><input type="number" min="0" step="0.01" value="${attr(deviceAgreedPriceValue(device))}" data-device-billing="${attr(device.id)}" data-billing-field="agreedPrice"></td>
                    <td><input type="date" value="${attr(device.saleDate || '')}" data-device-billing="${attr(device.id)}" data-billing-field="saleDate"></td>
                    <td><input value="${attr(device.priceNote || '')}" data-device-billing="${attr(device.id)}" data-billing-field="priceNote"></td>
                    <td><span class="pill ${esc(device.recordState)}">${esc(device.recordState.replace('_', ' '))}</span></td>
                  </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
      ${renderTablePagination(devices.length, pagination, { label: 'equipos', dataAttr: 'data-cobros-page', ariaLabel: 'Paginacion de cobros' })}
    </section>
  `
}

function renderLogin() {
  document.body.classList.remove('has-floating-table-scrollbar')
  return `
    <div class="app-shell auth-shell">
      <header class="topbar">
        <div class="brand-lockup">
          <img class="brand-logo" src="/public/assets/klifnet-logo.jpg" alt="KLIFNET">
        </div>
      </header>
      ${state.notice ? `<div class="notice">${esc(state.notice)}</div>` : ''}
      <main>
        <section class="auth-card">
          <div>
            <span>Acceso privado</span>
            <h1>KLIFNET CRM</h1>
          </div>
          <label><span>Correo</span><input type="email" value="${attr(state.login.email)}" data-login="email" autocomplete="username"></label>
          <label><span>Password</span><input type="password" value="${attr(state.login.password)}" data-login="password" autocomplete="current-password"></label>
          <button class="button primary" id="loginButton">${icon('log-in')}Entrar</button>
        </section>
        <details class="auth-card" ${state.auth.setupRequired ? 'open' : ''}>
          <summary>${icon('user-plus')}Crear acceso</summary>
          <label><span>Nombre</span><input value="${attr(state.login.setupName)}" data-login="setupName" autocomplete="name"></label>
          <label><span>Correo autorizado</span><input type="email" value="${attr(state.login.setupEmail)}" data-login="setupEmail" autocomplete="username"></label>
          <button class="button" type="button" id="setupTokenButton">${icon('mail')}Enviar token de alta</button>
          <label><span>Token</span><input value="${attr(state.login.setupToken)}" data-login="setupToken" autocomplete="one-time-code"></label>
          <label><span>Password nuevo</span><input type="password" value="${attr(state.login.setupPassword)}" data-login="setupPassword" autocomplete="new-password"></label>
          <button class="button primary" type="button" id="setupUserButton">${icon('shield-check')}Crear cuenta</button>
        </details>
        <details class="auth-card">
          <summary>${icon('key-round')}Recuperar password</summary>
          <label><span>Correo</span><input type="email" value="${attr(state.login.forgotEmail)}" data-login="forgotEmail" placeholder="tu@correo.com"></label>
          <button class="button" type="button" id="forgotPasswordButton">${icon('mail')}Enviar token</button>
          <label><span>Correo</span><input type="email" value="${attr(state.login.resetEmail)}" data-login="resetEmail"></label>
          <label><span>Token</span><input value="${attr(state.login.resetToken)}" data-login="resetToken" autocomplete="one-time-code"></label>
          <label><span>Password nuevo</span><input type="password" value="${attr(state.login.resetPassword)}" data-login="resetPassword" autocomplete="new-password"></label>
          <button class="button primary" type="button" id="resetPasswordButton">${icon('rotate-ccw-key')}Restablecer password</button>
        </details>
        ${renderApiLogPanel()}
      </main>
    </div>
  `
}

function renderAccountSecurity() {
  return `
    <section class="auth-card user-admin">
      <div><span>Cuenta</span><h2>Cambiar password</h2></div>
      <label><span>Password actual</span><input type="password" value="${attr(state.login.currentPassword)}" data-login="currentPassword" autocomplete="current-password"></label>
      <label><span>Password nuevo</span><input type="password" value="${attr(state.login.accountNewPassword)}" data-login="accountNewPassword" autocomplete="new-password"></label>
      <button class="button primary" id="changePasswordButton">${icon('key-round')}Guardar password</button>
      <hr>
      <label><span>Correo</span><input type="email" value="${attr(state.login.resetEmail || state.auth.user?.email || '')}" data-login="resetEmail" autocomplete="username"></label>
      <button class="button" type="button" id="accountForgotPasswordButton">${icon('mail')}Enviar token</button>
      <label><span>Token</span><input value="${attr(state.login.resetToken)}" data-login="resetToken" autocomplete="one-time-code"></label>
      <label><span>Password nuevo con token</span><input type="password" value="${attr(state.login.resetPassword)}" data-login="resetPassword" autocomplete="new-password"></label>
      <button class="button primary" type="button" id="accountResetPasswordButton">${icon('rotate-ccw-key')}Guardar con token</button>
    </section>
    ${renderApiLogPanel()}
  `
}

function renderApiLogPanel() {
  return `
    <section class="auth-card api-log-panel">
      <div><span>Testing API</span><h2>Ultimas llamadas</h2></div>
      <div class="api-log-list">
        ${
          state.apiLog.length
            ? state.apiLog
                .map(
                  (item) => `
                    <div class="api-log-item ${item.ok ? 'ok' : 'warn'}">
                      <strong>${esc(item.time)} ${esc(item.method)} ${esc(item.url)}</strong>
                      <span>${esc(String(item.status))} ${item.ok ? 'OK' : 'ERROR'}</span>
                      ${item.message ? `<small>${esc(item.message)}</small>` : ''}
                      ${item.detail ? `<code>${esc(item.detail)}</code>` : ''}
                    </div>
                  `
                )
                .join('')
            : '<div class="api-log-item"><strong>Sin llamadas registradas todavia</strong><small>Al presionar Enviar token debe aparecer primero un CLICK y luego la llamada POST.</small></div>'
        }
      </div>
    </section>
  `
}

function renderUsersAdmin() {
  return `
    ${renderAccountSecurity()}
    <section class="auth-card user-admin">
      <div><span>Usuarios</span><h2>Crear cuentas</h2></div>
      <label><span>Nombre</span><input value="${attr(state.login.name)}" data-login="name"></label>
      <label><span>Correo nuevo</span><input type="email" value="${attr(state.login.newEmail)}" data-login="newEmail"></label>
      <label><span>Password temporal</span><input type="password" value="${attr(state.login.newPassword)}" data-login="newPassword"></label>
      <label>
        <span>Rol</span>
        <select data-login="newRole">
          <option value="usuario" ${state.login.newRole === 'usuario' ? 'selected' : ''}>Usuario</option>
          <option value="admin" ${state.login.newRole === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
      </label>
      <button class="button primary" id="createUserButton">${icon('user-plus')}Crear usuario</button>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Correo</th><th>Nombre</th><th>Rol</th><th></th></tr></thead>
          <tbody>
            ${state.auth.users
              .map(
                (user) => `
                  <tr>
                    <td>${esc(user.email)}</td>
                    <td>${esc(user.name)}</td>
                    <td>${esc(user.role)}</td>
                    <td><button class="icon-button" data-delete-user="${attr(user.id)}" ${user.id === state.auth.user?.id ? 'disabled' : ''}>${icon('trash-2')}</button></td>
                  </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `
}

function render() {
  const root = document.getElementById('app')
  if (state.auth.loading) {
    root.innerHTML = '<div class="app-shell"><div class="notice">Cargando seguridad...</div></div>'
    return
  }
  if (!state.auth.user) {
    root.innerHTML = renderLogin()
    bindAuthEvents()
    if (window.lucide) window.lucide.createIcons()
    return
  }
  const companies = buildCompanies()
  if (!state.selectedCompany && companies.length) state.selectedCompany = companies[0].name

  const activeGroups = new Set()
  state.devices.forEach((device) => {
    if (!isBillableDevice(device)) return
    ;(device.groups.length ? device.groups : ['Sin grupo']).forEach((group) => activeGroups.add(group))
  })

  const stats = {
    companies: companies.length,
    devices: state.devices.length,
    billable: state.devices.filter((device) => isBillableDevice(device) && isImportedWialonDevice(device)).length,
    groups: activeGroups.size,
    missing: state.devices.filter((device) => device.recordState === 'no_encontrado').length,
    newOrUpdated: state.devices.filter((device) => device.recordState === 'nuevo' || device.recordState === 'actualizado').length
  }

  const body =
    state.view === 'resumen'
      ? renderResumen(companies, stats)
      : state.view === 'empresas'
        ? renderEmpresas(companies)
        : state.view === 'usuarios'
          ? state.auth.user.role === 'admin'
            ? renderUsersAdmin()
            : renderAccountSecurity()
          : state.view === 'equipos'
          ? renderEquipos()
          : state.view === 'lineas'
            ? renderLineas(companies)
            : state.view === 'facturacion'
              ? renderFacturacion(stats, companies)
              : state.view === 'cotizaciones'
                ? renderCotizaciones(companies)
                : renderCobros(companies)

  root.innerHTML = `
    <div class="app-shell">
      <input class="hidden-input" id="fileInput" type="file" accept=".xlsx,.csv">
      <input class="hidden-input" id="paymentFileInput" type="file" accept=".xlsx,.csv">
      <input class="hidden-input" id="lineFileInput" type="file" accept=".xlsx,.csv">
      <input class="hidden-input" id="emnifyFileInput" type="file" accept=".xlsx,.csv">
      <header class="topbar">
        <div class="brand-lockup">
          <img class="brand-logo" src="/public/assets/klifnet-logo.jpg" alt="KLIFNET">
        </div>
        <div class="top-actions">
          <span class="user-chip">${esc(state.auth.user.email)}</span>
          <button class="button" id="saveChangesButton">${icon('save')}Guardar cambios</button>
          <button class="button" id="showUsersButton">${icon('user-cog')}Cuenta</button>
          <button class="icon-button" title="Cerrar sesion" id="logoutButton">${icon('log-out')}</button>
          <button class="button primary" id="uploadButton">${icon('upload')}Actualizar Wialon</button>
          <button class="icon-button" title="Exportar CSV" id="exportCsv">${icon('download')}</button>
          <button class="icon-button" title="Exportar respaldo JSON" id="exportJson">${icon('file-spreadsheet')}</button>
        </div>
      </header>
      <nav class="tabs" aria-label="Vistas del CRM">
        ${[
          ['resumen', 'building-2', 'Resumen'],
          ['empresas', 'users-round', 'Empresas'],
          ['equipos', 'wrench', 'Equipos'],
          ['lineas', 'sim-card', 'Lineas'],
          ['facturacion', 'circle-dollar-sign', 'Facturacion'],
          ['cotizaciones', 'file-text', 'Cotizaciones'],
          ['cobros', 'calendar-days', 'Cobros'],
          ['usuarios', 'user-cog', state.auth.user.role === 'admin' ? 'Usuarios' : 'Cuenta']
        ]
          .map(
            ([view, iconName, label]) =>
              `<button class="${state.view === view ? 'active' : ''}" data-view="${view}">${icon(iconName)}${label}</button>`
          )
          .join('')}
      </nav>
      ${state.auth.dataLoading ? '<div class="notice">Cargando datos del CRM en segundo plano...</div>' : ''}
      ${state.notice ? `<div class="notice">${esc(state.notice)}</div>` : ''}
      <main>${body}</main>
    </div>
    <div class="floating-table-scrollbar" id="floatingTableScrollbar" hidden aria-hidden="true">
      <div class="floating-table-scrollbar-spacer" data-floating-scroll-spacer></div>
    </div>
  `

  bindEvents()
  if (window.lucide) window.lucide.createIcons()
  bindFloatingTableScrollbar()
}

function wideTableWraps() {
  return Array.from(document.querySelectorAll('.table-wrap')).filter((wrap) => wrap.scrollWidth > wrap.clientWidth + 4)
}

function visibleWrapScore(wrap) {
  const rect = wrap.getBoundingClientRect()
  const viewportBottom = window.innerHeight - 28
  const visibleTop = Math.max(0, rect.top)
  const visibleBottom = Math.min(viewportBottom, rect.bottom)
  return Math.max(0, visibleBottom - visibleTop)
}

function activeWideTableWrap() {
  const visible = wideTableWraps()
    .map((wrap) => ({ wrap, score: visibleWrapScore(wrap) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
  return visible[0]?.wrap || null
}

function updateFloatingTableScrollbar() {
  const bar = document.getElementById('floatingTableScrollbar')
  const spacer = bar?.querySelector('[data-floating-scroll-spacer]')
  if (!bar || !spacer) return

  const wrap = activeWideTableWrap()
  if (!wrap) {
    bar.hidden = true
    floatingScrollbarActiveWrap = null
    document.body.classList.remove('has-floating-table-scrollbar')
    return
  }

  const shellRect = document.querySelector('.app-shell')?.getBoundingClientRect()
  const wrapRect = wrap.getBoundingClientRect()
  const left = Math.max(8, Math.round(shellRect?.left ?? wrapRect.left))
  const rightEdge = Math.min(window.innerWidth - 8, Math.round(shellRect?.right ?? wrapRect.right))
  bar.style.left = `${left}px`
  bar.style.width = `${Math.max(120, rightEdge - left)}px`
  spacer.style.width = `${wrap.scrollWidth}px`
  floatingScrollbarActiveWrap = wrap
  document.body.classList.add('has-floating-table-scrollbar')
  bar.hidden = false

  if (!floatingScrollbarSyncing && bar.scrollLeft !== wrap.scrollLeft) {
    floatingScrollbarSyncing = true
    bar.scrollLeft = wrap.scrollLeft
    floatingScrollbarSyncing = false
  }
}

function bindFloatingTableScrollbar() {
  const bar = document.getElementById('floatingTableScrollbar')
  if (!bar) return

  bar.addEventListener(
    'scroll',
    () => {
      if (!floatingScrollbarActiveWrap) updateFloatingTableScrollbar()
      if (!floatingScrollbarActiveWrap || floatingScrollbarSyncing) return
      floatingScrollbarSyncing = true
      floatingScrollbarActiveWrap.scrollLeft = bar.scrollLeft
      floatingScrollbarSyncing = false
    },
    { passive: true }
  )

  document.querySelectorAll('.table-wrap').forEach((wrap) => {
    if (wrap.dataset.floatingScrollBound) return
    wrap.dataset.floatingScrollBound = 'true'
    wrap.addEventListener(
      'scroll',
      () => {
        if (wrap !== floatingScrollbarActiveWrap || floatingScrollbarSyncing) return
        floatingScrollbarSyncing = true
        bar.scrollLeft = wrap.scrollLeft
        floatingScrollbarSyncing = false
      },
      { passive: true }
    )
  })

  if (!floatingScrollbarWindowBound) {
    window.addEventListener('scroll', updateFloatingTableScrollbar, { passive: true })
    window.addEventListener('resize', updateFloatingTableScrollbar)
    floatingScrollbarWindowBound = true
  }

  requestAnimationFrame(updateFloatingTableScrollbar)
}

function bindAuthEvents() {
  document.querySelectorAll('[data-login]').forEach((input) => {
    const save = () => {
      state.login = { ...state.login, [input.dataset.login]: input.value }
    }
    input.addEventListener('input', save)
    input.addEventListener('change', save)
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return
      if (input.dataset.login.startsWith('setup')) {
        setupUserWithToken()
        return
      }
      if (input.dataset.login.startsWith('reset')) {
        resetPasswordWithToken()
        return
      }
      loginUser()
    })
  })
  document.getElementById('loginButton')?.addEventListener('click', loginUser)
  document.getElementById('forgotPasswordButton')?.addEventListener('click', requestPasswordReset)
  document.getElementById('resetPasswordButton')?.addEventListener('click', resetPasswordWithToken)
  document.getElementById('setupTokenButton')?.addEventListener('click', requestSetupToken)
  document.getElementById('setupUserButton')?.addEventListener('click', setupUserWithToken)
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (button.dataset.view === 'lineas') {
        await revalidateLineasPage({ notice: true })
        return
      }
      setState({ view: button.dataset.view })
    })
  })

  document.querySelectorAll('[data-login]').forEach((input) => {
    const save = () => {
      state.login = { ...state.login, [input.dataset.login]: input.value }
    }
    input.addEventListener('input', save)
    input.addEventListener('change', save)
  })
  document.getElementById('createUserButton')?.addEventListener('click', createUser)
  document.getElementById('changePasswordButton')?.addEventListener('click', changeOwnPassword)
  document.getElementById('accountForgotPasswordButton')?.addEventListener('click', requestPasswordReset)
  document.getElementById('accountResetPasswordButton')?.addEventListener('click', resetPasswordWithToken)
  document.querySelectorAll('[data-delete-user]').forEach((button) => {
    button.addEventListener('click', () => deleteUser(button.dataset.deleteUser))
  })
  document.getElementById('showUsersButton')?.addEventListener('click', () => setState({ view: 'usuarios' }))
  document.getElementById('logoutButton')?.addEventListener('click', logoutUser)
  document.getElementById('saveChangesButton')?.addEventListener('click', saveChangesNow)
  document.getElementById('uploadButton')?.addEventListener('click', () => document.getElementById('fileInput')?.click())
  document.getElementById('fileInput')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    await handleFile(file)
    event.target.value = ''
  })
  document.getElementById('paymentFileInput')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    await handlePaymentFile(file)
    event.target.value = ''
  })
  document.getElementById('lineFileInput')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    await handleLineFile(file)
    event.target.value = ''
  })
  document.getElementById('emnifyFileInput')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    await handleEmnifyFile(file)
    event.target.value = ''
  })
  document.getElementById('exportCsv')?.addEventListener('click', exportCsv)
  document.getElementById('exportJson')?.addEventListener('click', exportJson)
  document.getElementById('reloadSeed')?.addEventListener('click', loadSeedFile)

  document.querySelectorAll('[data-mapping]').forEach((select) => {
    select.addEventListener('change', () => {
      applyMapping({ ...state.mapping, [select.dataset.mapping]: select.value })
    })
  })

  document.querySelectorAll('[data-company]').forEach((button) => {
    button.addEventListener('click', () =>
      setState({ selectedCompany: button.dataset.company, cobrosCompany: button.dataset.company, cobrosGroup: '', query: '', cobrosPage: 1, view: 'cobros' })
    )
  })

  document.querySelectorAll('[data-company-page]').forEach((button) => {
    button.addEventListener('click', () => {
      setState({ companyPage: Math.max(1, Number(button.dataset.companyPage || 1)) })
    })
  })

  document.querySelectorAll('[data-new-device]').forEach((input) => {
    const saveNewDeviceDraft = () => {
      state.newDevice = { ...state.newDevice, [input.dataset.newDevice]: input.value }
      persistState()
    }
    input.addEventListener('input', saveNewDeviceDraft)
    input.addEventListener('change', saveNewDeviceDraft)
  })

  document.getElementById('addManualDevice')?.addEventListener('click', createManualDevice)

  document.querySelectorAll('[data-new-line]').forEach((input) => {
    const saveNewLine = () => {
      const field = input.dataset.newLine
      const value = input.type === 'checkbox' ? input.checked : input.value
      state.newLine = { ...state.newLine, [field]: value }
      persistState()
    }
    input.addEventListener('input', saveNewLine)
    input.addEventListener('change', saveNewLine)
  })

  document.getElementById('addManualLine')?.addEventListener('click', addManualLine)
  document.getElementById('uploadLineFile')?.addEventListener('click', () => document.getElementById('lineFileInput')?.click())
  document.getElementById('uploadEmnifyFile')?.addEventListener('click', () => document.getElementById('emnifyFileInput')?.click())
  document.getElementById('loadRelationLines')?.addEventListener('click', async () => {
    const loaded = await loadLineRelationBase()
    setState({ view: 'lineas', notice: loaded ? 'Base cifrada de lineas cargada limpia, sin mezclar operadores anteriores.' : 'No se pudo cargar la base cifrada de lineas.' })
  })
  document.getElementById('exportLinesXlsx')?.addEventListener('click', exportLinesXlsx)
  document.getElementById('exportLineMatchReportXlsx')?.addEventListener('click', exportLineMatchReportXlsx)

  document.getElementById('lineSearchInput')?.addEventListener('input', (event) => {
    state.lineQuery = event.target.value
    state.linePage = 1
    persistState()
    renderPreservingInput('#lineSearchInput')
  })

  document.getElementById('lineIccSearchInput')?.addEventListener('input', (event) => {
    state.lineIccQuery = event.target.value
    state.linePage = 1
    persistState()
    renderPreservingInput('#lineIccSearchInput')
  })

  document.getElementById('lineStatusFilter')?.addEventListener('change', (event) => {
    setState({ lineStatusFilter: event.target.value, linePage: 1 })
  })

  document.getElementById('lineMatchFilter')?.addEventListener('change', (event) => {
    setState({ lineMatchFilter: event.target.value, linePage: 1 })
  })

  document.getElementById('lineTypeFilter')?.addEventListener('change', (event) => {
    setState({ lineTypeFilter: event.target.value, linePage: 1 })
  })

  document.querySelectorAll('[data-line-page]').forEach((button) => {
    button.addEventListener('click', () => {
      setState({ linePage: Math.max(1, Number(button.dataset.linePage || 1)) })
    })
  })

  document.querySelectorAll('[data-line]').forEach((input) => {
    const saveLine = (shouldRender) => {
      const id = input.dataset.line
      const field = input.dataset.lineField
      const value = field === 'clientOnly' ? input.value === 'true' : field === 'annualPrice' ? input.value : input.value
      state.lines = state.lines.map((line) =>
        line.id === id
          ? normalizeLine({
              ...line,
              [field]: value,
              ...(field === 'lineType' ? { providerManual: true, providerDetectedBy: 'manual' } : {})
            })
          : line
      )
      persistState()
      if (shouldRender) render()
    }
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => saveLine(true))
    } else {
      input.addEventListener('input', () => saveLine(false))
      input.addEventListener('change', () => saveLine(true))
    }
  })

  document.getElementById('searchInput')?.addEventListener('input', (event) => {
    state.query = event.target.value
    state.equipmentPage = 1
    state.cobrosPage = 1
    persistState()
    renderPreservingInput('#searchInput')
  })

  document.getElementById('equipmentCompanyFilter')?.addEventListener('input', (event) => {
    state.equipmentCompanyFilter = event.target.value
    state.equipmentPage = 1
    persistState()
    renderPreservingInput('#equipmentCompanyFilter')
  })

  document.getElementById('equipmentCycleFilter')?.addEventListener('change', (event) => {
    setState({ equipmentCycleFilter: event.target.value, equipmentPage: 1 })
  })

  document.querySelectorAll('[data-equipment-page]').forEach((button) => {
    button.addEventListener('click', () => {
      setState({ equipmentPage: Math.max(1, Number(button.dataset.equipmentPage || 1)) })
    })
  })

  document.getElementById('cobrosCompany')?.addEventListener('change', (event) => {
    setState({ cobrosCompany: event.target.value, cobrosGroup: '', cobrosPage: 1 })
  })

  document.getElementById('cobrosGroup')?.addEventListener('change', (event) => {
    setState({ cobrosGroup: event.target.value, cobrosPage: 1 })
  })

  document.getElementById('cobrosCycleFilter')?.addEventListener('change', (event) => {
    setState({ cobrosCycleFilter: event.target.value, cobrosPage: 1 })
  })

  document.querySelectorAll('[data-cobros-page]').forEach((button) => {
    button.addEventListener('click', () => {
      setState({ cobrosPage: Math.max(1, Number(button.dataset.cobrosPage || 1)) })
    })
  })

  document.getElementById('billingCompany')?.addEventListener('change', (event) => {
    setState({ billingCompany: event.target.value, billingGroup: '', billingPage: 1 })
  })

  document.getElementById('billingGroup')?.addEventListener('change', (event) => {
    setState({ billingGroup: event.target.value, billingPage: 1 })
  })

  document.getElementById('billingSearchInput')?.addEventListener('input', (event) => {
    state.billingQuery = event.target.value
    state.billingPage = 1
    persistState()
    renderPreservingInput('#billingSearchInput')
  })

  document.querySelectorAll('[data-billing-page]').forEach((button) => {
    button.addEventListener('click', () => {
      setState({ billingPage: Math.max(1, Number(button.dataset.billingPage || 1)) })
    })
  })

  document.querySelectorAll('[data-device]').forEach((input) => {
    const saveDeviceEdit = (shouldRender) => {
      const id = input.dataset.device
      const field = input.dataset.field
      const shouldRecalculateLines = field === 'uid' || field === 'imei' || field === 'imeiLong' || field === 'imeiShort' || field === 'phone'
      state.devices = state.devices.map((device) => {
        if (device.id !== id) return device
        if (field === 'groups') return { ...device, groups: splitGroups(input.value) }
        if (field === 'paymentMonths') return { ...device, paymentMonths: parsePaymentMonths(input.value) }
        if (field === 'billingCycle' && input.value === 'mensual') return { ...device, billingCycle: input.value, paymentMonths: [], agreedPrice: deviceAgreedPriceValue({ ...device, billingCycle: 'mensual' }) }
        if (field === 'uid') return normalizeDeviceIdentifiers({ ...device, uid: input.value })
        if (field === 'imei') return normalizeDeviceIdentifiers({ ...device, imei: input.value, imeiLong: input.value || device.imeiLong })
        if (field === 'imeiLong') return normalizeDeviceIdentifiers({ ...device, imeiLong: input.value, imei: input.value || device.imei })
        if (field === 'imeiShort') return normalizeDeviceIdentifiers({ ...device, imeiShort: input.value })
        return { ...device, [field]: input.value }
      })
      if (shouldRecalculateLines) {
        const bridge = mergedLineBridge(state.lines, state.devices)
        state.lines = enrichLinesFromBridge(state.lines, bridge, state.devices).map((line, index) => normalizeLine(line, index))
      }
      if (field === 'company' && shouldRender && textValue(input.value)) {
        const company = textValue(input.value)
        state.companyMeta = {
          ...state.companyMeta,
          [company]: { ...blankMeta(company), ...(state.companyMeta[company] || {}) }
        }
      }
      persistState()
      if (shouldRender) {
        state.notice = 'Edicion de equipo guardada.'
      }
      if (shouldRender) render()
    }
    input.addEventListener('input', () => saveDeviceEdit(false))
    input.addEventListener('change', () => saveDeviceEdit(true))
  })

  document.querySelectorAll('[data-billing]').forEach((input) => {
    const saveBilling = (shouldRender) => {
      const field = input.dataset.billing
      const numeric = field === 'monthlyPricePerDevice' || field === 'annualPricePerDevice' || field === 'ivaRate'
      state.billing = { ...state.billing, [field]: numeric ? Number(input.value) : input.value }
      persistState()
      if (shouldRender) render()
    }
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => saveBilling(true))
    } else {
      input.addEventListener('input', () => saveBilling(false))
      input.addEventListener('change', () => saveBilling(true))
    }
  })

  document.getElementById('generateBilling')?.addEventListener('click', generateBillingList)
  document.getElementById('exportBillingXlsx')?.addEventListener('click', exportBillingXlsx)
  document.getElementById('loadPaymentSeed')?.addEventListener('click', loadPaymentSeed)
  document.getElementById('uploadPaymentFile')?.addEventListener('click', () => document.getElementById('paymentFileInput')?.click())
  document.getElementById('exportQuoteXlsx')?.addEventListener('click', exportQuoteXlsx)
  document.getElementById('addCompanyFromQuote')?.addEventListener('click', addCompanyFromQuote)
  document.getElementById('addAccessoryQuote')?.addEventListener('click', addAccessoryToQuote)

  document.getElementById('quoteCompany')?.addEventListener('change', (event) => {
    setState({ quote: { ...state.quote, company: event.target.value, group: '' } })
  })

  document.querySelectorAll('[data-quote]').forEach((input) => {
    const numericFields = new Set([
      'equipmentCount',
      'monthlyPricePerDevice',
      'annualPricePerDevice',
      'lineCount',
      'lineMonthlyPrice',
      'lineAnnualPrice',
      'hardwareCostPerDevice',
      'hardwareDiscountPercent',
      'hardwareMarginPercent',
      'hardwarePricePerDevice',
      'fuelSensorCount',
      'fuelSensorCost',
      'fuelSensorDiscountPercent',
      'fuelSensorMarginPercent',
      'fuelSensorPrice',
      'dashcamCount',
      'dashcamCost',
      'dashcamDiscountPercent',
      'dashcamMarginPercent',
      'dashcamPrice',
      'installationPricePerDevice',
      'travelFee',
      'setupPricePerDevice',
      'ivaRate',
      'validityDays',
      'accessoryQuantity'
    ])
    const saveQuote = (shouldRender) => {
      const field = input.dataset.quote
      const value = input.type === 'checkbox' ? input.checked : numericFields.has(field) ? (input.value === '' ? '' : Number(input.value)) : input.value
      const nextQuote = {
        ...state.quote,
        [field]: value,
        ...(field === 'installationZone' ? { installationPricePerDevice: installationPriceForZone(value) } : {})
      }
      if (field === 'hardwarePreset' && value !== 'custom') {
        state.quote = applyHardwarePreset(value)
        persistState()
        if (shouldRender) render()
        return
      }
      if (field === 'fuelSensorPreset' && value !== 'custom') {
        state.quote = applyFuelSensorPreset(value)
        persistState()
        if (shouldRender) render()
        return
      }
      if (field === 'dashcamPreset' && value !== 'custom') {
        state.quote = applyDashcamPreset(value)
        persistState()
        if (shouldRender) render()
        return
      }
      if (field === 'hardwareCostPerDevice' || field === 'hardwareDiscountPercent' || field === 'hardwareMarginPercent') {
        nextQuote.hardwarePricePerDevice = salePriceFromSyscom(
          nextQuote.hardwareCostPerDevice,
          nextQuote.hardwareDiscountPercent,
          nextQuote.hardwareMarginPercent,
          nextQuote.hardwarePricePerDevice
        )
      }
      if (field === 'fuelSensorCost' || field === 'fuelSensorDiscountPercent' || field === 'fuelSensorMarginPercent') {
        nextQuote.fuelSensorPrice = salePriceFromSyscom(
          nextQuote.fuelSensorCost,
          nextQuote.fuelSensorDiscountPercent,
          nextQuote.fuelSensorMarginPercent,
          nextQuote.fuelSensorPrice
        )
      }
      if (field === 'dashcamCost' || field === 'dashcamDiscountPercent' || field === 'dashcamMarginPercent') {
        nextQuote.dashcamPrice = salePriceFromSyscom(nextQuote.dashcamCost, nextQuote.dashcamDiscountPercent, nextQuote.dashcamMarginPercent, nextQuote.dashcamPrice)
      }
      state.quote = nextQuote
      persistState()
      if (shouldRender) render()
    }
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => saveQuote(true))
    } else {
      input.addEventListener('input', () => saveQuote(false))
      input.addEventListener('change', () => saveQuote(true))
    }
  })

  document.querySelectorAll('[data-remove-accessory]').forEach((button) => {
    button.addEventListener('click', () => removeAccessoryFromQuote(button.dataset.removeAccessory))
  })

  document.querySelectorAll('[data-accessory-field]').forEach((input) => {
    const numericFields = new Set(['quantity', 'cost', 'discount', 'margin', 'unitPrice'])
    const recalcFields = new Set(['cost', 'discount', 'margin'])
    const saveAccessory = (shouldRender) => {
      const accessoryId = input.dataset.accessoryId
      const field = input.dataset.accessoryField
      const value = numericFields.has(field) ? (input.value === '' ? 0 : Number(input.value)) : input.value
      state.quote = {
        ...state.quote,
        accessories: normalizedQuoteAccessories(state.quote).map((accessory, index) => {
          if (accessory.id !== accessoryId) return accessory
          const nextAccessory = { ...accessory, [field]: value }
          if (recalcFields.has(field)) {
            nextAccessory.unitPrice = salePriceFromSyscom(nextAccessory.cost, nextAccessory.discount, nextAccessory.margin, nextAccessory.unitPrice)
          }
          return normalizeQuoteAccessory(nextAccessory, index)
        }),
        fuelSensorCount: '',
        dashcamCount: ''
      }
      persistState()
      if (shouldRender) render()
    }
    input.addEventListener('input', () => saveAccessory(false))
    input.addEventListener('change', () => saveAccessory(true))
  })

  document.getElementById('selectedCompany')?.addEventListener('change', (event) => {
    setState({ selectedCompany: event.target.value })
  })

  document.querySelectorAll('[data-meta]').forEach((input) => {
    input.addEventListener('change', () => {
      const company = state.selectedCompany
      const existing = getCompanyMeta(company)
      setState({
        companyMeta: {
          ...state.companyMeta,
          [company]: { ...existing, [input.dataset.meta]: input.value }
        }
      })
    })
  })

  document.querySelectorAll('[data-company-meta]').forEach((input) => {
    input.addEventListener('input', () => {
      const company = input.dataset.companyMeta
      const field = input.dataset.metaField
      const existing = getCompanyMeta(company)
      state.companyMeta = {
        ...state.companyMeta,
        [company]: { ...existing, [field]: input.value }
      }
      persistState()
    })
  })

  document.querySelectorAll('[data-device-billing]').forEach((input) => {
    const saveDeviceBilling = (shouldRender) => {
      const id = input.dataset.deviceBilling
      const field = input.dataset.billingField
      state.devices = state.devices.map((device) => {
        if (device.id !== id) return device
        if (field === 'groups') return { ...device, groups: splitGroups(input.value) }
        if (field === 'paymentMonths') return { ...device, paymentMonths: parsePaymentMonths(input.value) }
        if (field === 'billingCycle' && input.value === 'mensual') return { ...device, billingCycle: input.value, paymentMonths: [], agreedPrice: deviceAgreedPriceValue({ ...device, billingCycle: 'mensual' }) }
        if (field === 'imeiLong') return normalizeDeviceIdentifiers({ ...device, imeiLong: input.value, imei: input.value || device.imei })
        if (field === 'imeiShort') return normalizeDeviceIdentifiers({ ...device, imeiShort: input.value })
        return { ...device, [field]: input.value }
      })
      persistState()
      if (shouldRender) render()
    }

    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => saveDeviceBilling(true))
    } else {
      input.addEventListener('input', () => saveDeviceBilling(false))
      input.addEventListener('change', () => saveDeviceBilling(false))
    }
  })
}

function applySavedState(parsed = {}) {
  applyingServerState = true
  try {
    Object.assign(state, {
      rawRows: parsed.rawRows || [],
      columns: parsed.columns || [],
      mapping: parsed.mapping || {},
      devices: (parsed.devices || []).map(normalizeDeviceIdentifiers),
      lines: (parsed.lines || []).map((line, index) => normalizeLine(line, index)),
      standardMonthlyPriceVersion: parsed.standardMonthlyPriceVersion || 0,
      companyMeta: parsed.companyMeta || {},
      billing: {
        ...defaultBilling,
        ...(parsed.billing || {}),
        monthlyPricePerDevice:
          Number(normalizeStandardMonthlyPriceValue(parsed.billing?.monthlyPricePerDevice ?? parsed.billing?.pricePerDevice ?? defaultBilling.monthlyPricePerDevice)) ||
          defaultBilling.monthlyPricePerDevice,
        annualPricePerDevice: parsed.billing?.annualPricePerDevice ?? 0
      },
      billingRows: parsed.billingRows || parsed.invoices || [],
      paymentImport: parsed.paymentImport || null,
      lineImport: parsed.lineImport || null,
      lineSeedImportVersion: parsed.lineSeedImportVersion || 0,
      lineResetVersion: parsed.lineResetVersion || 0,
      lineQuery: parsed.lineQuery || '',
      lineIccQuery: parsed.lineIccQuery || '',
      lineStatusFilter: parsed.lineStatusFilter || '',
      lineMatchFilter: parsed.lineMatchFilter || '',
      lineTypeFilter: parsed.lineTypeFilter || '',
      linePage: Math.max(1, Number(parsed.linePage || 1)),
      lineRelationBaseVersion: parsed.lineRelationBaseVersion || 0,
      quote: normalizeQuoteDefaults(parsed.quote || {}),
      newDevice: {
        company: '',
        groups: '',
        unitName: '',
        uid: '',
        imei: '',
        imeiLong: '',
        imeiShort: '',
        deviceType: '',
        phone: '',
        agreedPrice: '',
        saleDate: '',
        priceNote: '',
        soldBy: defaultNewEquipmentSeller,
        ...(parsed.newDevice || {})
      },
      newLine: {
        ...defaultNewLine,
        ...(parsed.newLine || {})
      },
      sourceLabel: parsed.sourceLabel || '',
      lastImportAt: parsed.lastImportAt || '',
      equipmentCompanyFilter: parsed.equipmentCompanyFilter || '',
      equipmentCycleFilter: parsed.equipmentCycleFilter || '',
      equipmentPage: Math.max(1, Number(parsed.equipmentPage || 1)),
      companyPage: Math.max(1, Number(parsed.companyPage || 1)),
      cobrosPage: Math.max(1, Number(parsed.cobrosPage || 1)),
      billingPage: Math.max(1, Number(parsed.billingPage || 1))
    })
    const previousLineCount = state.lines.length
    state.lines = dedupeLines(state.lines, state.devices)
    return Math.max(0, previousLineCount - state.lines.length)
  } finally {
    applyingServerState = false
  }
}

async function loadStateFromServer() {
  try {
    const response = await fetch(serverStateUrl, { cache: 'no-store' })
    if (!response.ok) return false
    const result = await response.json()
    if (!result.state) return false
    const duplicateCount = applySavedState(result.state)
    currentServerUpdatedAt = result.updatedAt || ''
    if (duplicateCount) state.notice = `Lineas duplicadas consolidadas: ${duplicateCount} repetidas.`
    persistState({ localOnly: true })
    return true
  } catch (error) {
    console.warn(error)
    return false
  }
}

function loadStateFromLocal() {
  localStorage.removeItem(storageKey)
  return false
}

function isEditingFormField() {
  const element = document.activeElement
  return Boolean(element && ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName))
}

async function refreshStateFromServer() {
  if (isEditingFormField()) return
  if (serverSaveTimer) return
  try {
    const response = await fetch(serverStateUrl, { cache: 'no-store' })
    if (!response.ok) return
    const result = await response.json()
    if (!result.state || !result.updatedAt || result.updatedAt === currentServerUpdatedAt) return
    applySavedState(result.state)
    currentServerUpdatedAt = result.updatedAt
    persistState({ localOnly: true })
    render()
  } catch (error) {
    console.warn(error)
  }
}

function startServerStatePolling() {
  if (serverPollTimer) return
  serverPollTimer = setInterval(refreshStateFromServer, 15000)
}

function migrateStandardMonthlyPrices() {
  let changed = false

  if (isLegacyStandardMonthlyPrice(state.billing.monthlyPricePerDevice)) {
    state.billing = { ...state.billing, monthlyPricePerDevice: standardMonthlyPrice }
    changed = true
  }

  if (isLegacyStandardMonthlyPrice(state.quote.monthlyPricePerDevice)) {
    state.quote = { ...state.quote, monthlyPricePerDevice: standardMonthlyPrice }
    changed = true
  }

  state.devices = state.devices.map((device) => {
    const agreedPrice = device.agreedPrice ?? device.pricePerDeviceOverride
    if (deviceBillingCycle(device) !== 'mensual' || !isLegacyStandardMonthlyPrice(agreedPrice)) return device
    changed = true
    return { ...device, agreedPrice: standardMonthlyPriceText() }
  })

  state.lines = state.lines.map((line, index) => {
    const normalized = normalizeLine(line, index)
    if (lineBillingCycle(normalized) !== 'mensual' || !isLegacyStandardMonthlyPrice(normalized.annualPrice)) return normalized
    changed = true
    return normalizeLine({ ...normalized, annualPrice: standardMonthlyPriceText() }, index)
  })

  state.standardMonthlyPriceVersion = standardMonthlyPriceVersion
  return changed
}

async function initDataAfterAuth() {
  try {
    const loadedFromServer = await loadStateFromServer()
    const loadedFromLocal = loadedFromServer ? false : loadStateFromLocal()

    if (!state.devices.length) {
      await loadSeedFile()
    } else if (loadedFromLocal && !loadedFromServer) {
      persistState()
    }

    if (state.lineResetVersion !== lineResetVersion) {
      clearLineState()
      persistState()
    }

    if (state.standardMonthlyPriceVersion !== standardMonthlyPriceVersion) {
      const changed = migrateStandardMonthlyPrices()
      state.notice = changed ? 'Precio mensual estandar actualizado a $297.36.' : state.notice
      persistState()
    }

    if (state.lineRelationBaseVersion !== lineRelationBaseVersion) {
      const lineRevalidation = await revalidateLineasPage()
      if (state.lineRelationBaseVersion !== lineRelationBaseVersion) {
        state.notice =
          lineRevalidation?.error || state.notice || 'No se pudo cargar la base cifrada de lineas; no se actualizo la version para evitar dejar datos mezclados como validos.'
      }
    }

    if (state.rawRows.length && state.lineImport?.autoVersion !== lineAutoImportVersion) {
      const label = state.sourceLabel || 'Base guardada'
      const lineMerge = mergeLineRows(state.lines, state.rawRows, label, { requireIcc: true, markMissing: false })
      if (lineMerge.imported.length) {
        state.lines = lineMerge.lines
        state.lineImport = lineImportState(label, state.rawRows.length, lineMerge.imported, lineMerge.stats, {
          autoVersion: lineAutoImportVersion
        })
        persistState()
      }
    }

    if (state.devices.length && state.paymentImport?.version !== paymentImportVersion) {
      await loadPaymentSeed({ keepView: true })
    }
  } finally {
    state.auth = { ...state.auth, dataLoading: false }
    if (state.notice === 'Acceso listo. Cargando datos del CRM...') state.notice = ''
    render()
    startServerStatePolling()
  }
}

async function init() {
  const loggedIn = await refreshAuth()
  if (!loggedIn) {
    render()
    return
  }
  await initDataAfterAuth()
}

init()
