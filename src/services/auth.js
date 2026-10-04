const demoResidents = new Map();
let residentSequence = 1;
let activeSession = null;

export class DemoAuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DemoAuthenticationError';
  }
}

function normalizeEmail(value) {
  return value.trim().toLocaleLowerCase('fr');
}

export function getSession() {
  return activeSession;
}

export function registerDemoResident(fields) {
  const email = normalizeEmail(fields.email);
  if (demoResidents.has(email)) {
    throw new DemoAuthenticationError('Une identité de démonstration existe déjà pour cette adresse dans cette session.');
  }

  const resident = {
    id: `demo-resident-${residentSequence++}`,
    firstName: fields.firstName.trim(),
    lastName: fields.lastName.trim(),
    email,
    sector: fields.sector.trim(),
    isDemo: true,
  };
  demoResidents.set(email, resident);
  activeSession = resident;
  return resident;
}

export function loginDemoResident(email) {
  const resident = demoResidents.get(normalizeEmail(email));
  if (!resident) {
    throw new DemoAuthenticationError('Identité de démonstration introuvable dans cette session. Créez d’abord une identité de démonstration.');
  }

  activeSession = resident;
  return resident;
}

export function updateDemoResident(updatedFields) {
  if (!activeSession) {
    throw new DemoAuthenticationError('Aucune session de démonstration active.');
  }

  const updatedResident = { ...activeSession, ...updatedFields };
  const previousEmail = activeSession.email;
  const nextEmail = normalizeEmail(updatedResident.email);
  if (nextEmail !== previousEmail && demoResidents.has(nextEmail)) {
    throw new DemoAuthenticationError('Une identité de démonstration utilise déjà cette adresse.');
  }

  updatedResident.email = nextEmail;
  demoResidents.delete(previousEmail);
  demoResidents.set(nextEmail, updatedResident);
  activeSession = updatedResident;
  return updatedResident;
}

export function logout() {
  activeSession = null;
}
