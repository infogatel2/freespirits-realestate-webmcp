import type { Property } from './property';

export interface EnquiryDraftInput {
  name?: string;
  email?: string;
  phone?: string;
  messageIntent?: string;
}

export interface EnquiryDraft {
  propertyId: string;
  propertyTitle: string;
  listingUrl: string;
  name?: string;
  email?: string;
  phone?: string;
  message: string;
  requiresHumanConfirmation: true;
}

export function prepareEnquiryDraft(property: Property, input: EnquiryDraftInput): EnquiryDraft {
  const intent = input.messageIntent?.trim();
  const base = `Hello, I am interested in “${property.title}” (${property.id}) in ${property.neighborhood}, Thessaloniki.`;
  const request = intent
    ? ` ${intent}`
    : ' Could you please let me know whether it is still available and what viewing times are possible?';

  return {
    propertyId: property.id,
    propertyTitle: property.title,
    listingUrl: property.listingUrl,
    name: input.name?.trim() || undefined,
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    message: `${base}${request}`,
    requiresHumanConfirmation: true,
  };
}
