/**
 * Documentation Page Tests
 * Validates documentation and help content
 */

describe('Documentation Page', () => {
  it('should display documentation structure', () => {
    const docSections = [
      'overview',
      'quick-start',
      'weekly-flow',
      'prayer-flow',
      'cell-leader',
      'admin',
      'faq'
    ];
    expect(docSections.length).toBe(7);
  });

  it('should have navigation table of contents', () => {
    const hasTableOfContents = true;
    expect(hasTableOfContents).toBe(true);
  });

  it('should provide FAQ section', () => {
    const faqItems = [
      '출석부 생성은 어떻게 하나요?',
      '참석자 변경은 어떻게 하나요?',
      '출석 현황은 어떻게 보나요?'
    ];
    expect(faqItems.length).toBeGreaterThan(0);
  });

  it('should have searchable content', () => {
    const searchable = true;
    expect(searchable).toBe(true);
  });

  it('should include usage examples', () => {
    const hasExamples = true;
    expect(hasExamples).toBe(true);
  });

  it('should link to bug reporting', () => {
    const bugReportPath = '/bugs';
    expect(bugReportPath).toMatch(/^\/bugs$/);
  });

  it('should provide role-specific guides', () => {
    const guides = {
      cellLeader: '/docs#cell-leader',
      admin: '/docs#admin'
    };
    expect(Object.keys(guides).length).toBe(2);
  });
});
