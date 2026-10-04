import { createDemoRequest } from './requests.js';

const requestsByResident = new Map();
const notificationsByResident = new Map();

export function getResidentRequests(residentId) {
  return [...(requestsByResident.get(residentId) ?? [])];
}

export function createResidentDemoRequest(residentId, fields) {
  if (!residentId) {
    throw new Error('Une identité de démonstration est requise pour créer une demande personnelle.');
  }

  const request = { ...createDemoRequest(fields), residentId };
  const currentRequests = requestsByResident.get(residentId) ?? [];
  requestsByResident.set(residentId, [request, ...currentRequests]);
  const currentNotifications = notificationsByResident.get(residentId) ?? [];
  notificationsByResident.set(residentId, [{
    id: `notification-${request.demoKey}`,
    title: 'Demande de démonstration créée',
    description: request.title,
    date: request.createdAt,
    isDemo: true,
  }, ...currentNotifications]);
  return request;
}

export function getResidentRequest(residentId, requestId) {
  if (!residentId) return null;
  return (requestsByResident.get(residentId) ?? [])
    .find((request) => request.demoKey === requestId) ?? null;
}

export function getResidentNotifications(residentId) {
  return [...(notificationsByResident.get(residentId) ?? [])];
}
