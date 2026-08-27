import { describe, expect, it } from 'vitest';
import { demoProperties } from '../data/demo-properties';
import { prepareEnquiryDraft } from './enquiry';

describe('prepareEnquiryDraft', () => {
  it('always requires human confirmation and never sends', () => {
    const draft = prepareEnquiryDraft(demoProperties[0], { name: 'Demo User' });
    expect(draft.requiresHumanConfirmation).toBe(true);
    expect(draft.propertyId).toBe('thess-001');
    expect(draft.message).toContain('interested');
  });
});
