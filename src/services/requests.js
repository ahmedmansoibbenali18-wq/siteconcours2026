export const requestCategories = [
  'Eau',
  'Énergie',
  'Météo',
  'Santé',
  'Transport',
  'Logement',
  'Sécurité',
  'Services publics',
  'Problème technique',
  'Autre',
];

let nextDemoRequestId = 1;

export function createDemoRequest(fields) {
  return {
    demoKey: `demo-${nextDemoRequestId++}`,
    title: fields.title.trim(),
    category: fields.category,
    description: fields.description.trim(),
    sector: fields.sector.trim(),
    urgency: fields.urgency,
    contact: fields.contact.trim(),
    createdAt: new Date().toISOString(),
    status: 'Simulation locale',
    isDemo: true,
  };
}
