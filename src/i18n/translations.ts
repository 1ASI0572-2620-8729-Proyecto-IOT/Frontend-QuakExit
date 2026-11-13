export const locales = ['es', 'en'] as const
export type Locale = (typeof locales)[number]

export type TranslationDictionary = {
  access: string
  accountCreate: string
  email: string
  password: string
  showPassword: string
  loginTitle: string
  loginButton: string
  loggingIn: string
  sessionStarted: string
  sessionError: string
  heroBadge: string
  heroTitle: string
  heroDescription: string
  languageLabel: string
  languageEs: string
  languageEn: string
  secureRegistration: string
  registerTitle: string
  registerSubtitle: string
  stepProperty: string
  stepRole: string
  stepAccount: string
  whatRegister: string
  propertyHouse: string
  propertyApartment: string
  propertyHouseDescription: string
  propertyApartmentDescription: string
  roleOwner: string
  roleRenter: string
  roleBuildingAdmin: string
  accountData: string
  fullName: string
  phone: string
  phoneCountry: string
  passwordStrength: string
  back: string
  continue: string
  createAccountAction: string
  creatingAccount: string
  alreadyHaveAccount: string
  signIn: string
  accountCreated: string
  accountCreationError: string
  hidePassword: string
  showPasswordToggle: string
  passwordMinLength: string
  passwordUppercase: string
  passwordNumber: string
  fullNameRequired: string
  emailRequired: string
  phoneRequired: string
  notValidEmail: string
  invalidPhone: string
}

export const translations: Record<Locale, TranslationDictionary> = {
  es: {
    access: 'Acceso',
    accountCreate: 'Crear cuenta',
    email: 'Correo',
    password: 'Contraseña',
    showPassword: 'Mostrar u ocultar contraseña',
    loginTitle: 'Iniciar sesión',
    loginButton: 'Entrar al panel',
    loggingIn: 'Iniciando...',
    sessionStarted: 'Sesión iniciada',
    sessionError: 'No fue posible iniciar sesión. Verifica tus credenciales o el backend.',
    heroBadge: 'Evacuación sísmica con acción local y segura',
    heroTitle: 'Monitorea la seguridad de tu hogar.',
    heroDescription:
      'Cierra puertas, enciende luces de emergencia y supervisa cada nodo del ecosistema IoT en tiempo real.',
    languageLabel: 'Idioma',
    languageEs: 'ES',
    languageEn: 'EN',
    secureRegistration: 'Registro seguro',
    registerTitle: 'Crea tu cuenta QuakExit',
    registerSubtitle: 'Configura tu experiencia de evacuación en pocos pasos.',
    stepProperty: 'Propiedad',
    stepRole: 'Rol',
    stepAccount: 'Cuenta',
    whatRegister: '¿Qué vas a registrar?',
    propertyHouse: 'Casa',
    propertyApartment: 'Departamento',
    propertyHouseDescription: 'Controla puertas y dispositivos de tu casa.',
    propertyApartmentDescription: 'Configura tu espacio dentro de un edificio.',
    roleOwner: 'Propietario',
    roleRenter: 'Inquilino',
    roleBuildingAdmin: 'Administrador de Torre',
    accountData: 'Datos de tu cuenta',
    fullName: 'Nombre completo',
    phone: 'Teléfono',
    phoneCountry: 'Código telefónico',
    passwordStrength: 'Fortaleza de contraseña',
    back: 'Atrás',
    continue: 'Continuar',
    createAccountAction: 'Crear cuenta',
    creatingAccount: 'Creando cuenta...',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    signIn: 'Inicia sesión',
    accountCreated: 'Cuenta creada correctamente',
    accountCreationError: 'La cuenta no pudo crearse. Intenta nuevamente.',
    hidePassword: 'Ocultar contraseña',
    showPasswordToggle: 'Mostrar contraseña',
    passwordMinLength: 'Usa al menos 8 caracteres',
    passwordUppercase: 'Incluye al menos una mayúscula',
    passwordNumber: 'Incluye al menos un número',
    fullNameRequired: 'Ingresa tu nombre completo',
    emailRequired: 'Ingresa un correo válido',
    phoneRequired: 'Selecciona un código telefónico',
    notValidEmail: 'Ingresa un correo válido',
    invalidPhone: 'Ingresa entre 6 y 14 dígitos',
  },
  en: {
    access: 'Access',
    accountCreate: 'Create account',
    email: 'Email',
    password: 'Password',
    showPassword: 'Show or hide password',
    loginTitle: 'Sign in',
    loginButton: 'Enter dashboard',
    loggingIn: 'Signing in...',
    sessionStarted: 'Session started',
    sessionError: 'Unable to sign in. Please verify your credentials or the backend.',
    heroBadge: 'Seismic evacuation with safe local action',
    heroTitle: 'Monitor your home safety.',
    heroDescription:
      'Close doors, switch on emergency lights and supervise every node of the IoT ecosystem in real time.',
    languageLabel: 'Language',
    languageEs: 'ES',
    languageEn: 'EN',
    secureRegistration: 'Secure registration',
    registerTitle: 'Create your QuakExit account',
    registerSubtitle: 'Set up your evacuation experience in a few steps.',
    stepProperty: 'Property',
    stepRole: 'Role',
    stepAccount: 'Account',
    whatRegister: 'What are you registering?',
    propertyHouse: 'House',
    propertyApartment: 'Apartment',
    propertyHouseDescription: 'Control doors and devices across your home.',
    propertyApartmentDescription: 'Set up your space inside a building.',
    roleOwner: 'Owner',
    roleRenter: 'Renter',
    roleBuildingAdmin: 'Building Administrator',
    accountData: 'Account details',
    fullName: 'Full name',
    phone: 'Phone',
    phoneCountry: 'Phone code',
    passwordStrength: 'Password strength',
    back: 'Back',
    continue: 'Continue',
    createAccountAction: 'Create account',
    creatingAccount: 'Creating account...',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign in',
    accountCreated: 'Account created successfully',
    accountCreationError: 'The account could not be created. Please try again.',
    hidePassword: 'Hide password',
    showPasswordToggle: 'Show password',
    passwordMinLength: 'Use at least 8 characters',
    passwordUppercase: 'Include at least one uppercase letter',
    passwordNumber: 'Include at least one number',
    fullNameRequired: 'Enter your full name',
    emailRequired: 'Enter a valid email address',
    phoneRequired: 'Select a phone code',
    notValidEmail: 'Enter a valid email address',
    invalidPhone: 'Enter between 6 and 14 digits',
  },
}
