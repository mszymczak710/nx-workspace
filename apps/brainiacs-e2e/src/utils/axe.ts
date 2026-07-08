import AxeBuilder from '@axe-core/playwright';
import { expect, Page } from '@playwright/test';

export const expectNoA11yViolations = async (page: Page): Promise<void> => {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();

  const formatted = violations.map(v => ({
    rule: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map(n => n.target.join(' '))
  }));

  expect(formatted, JSON.stringify(formatted, null, 2)).toEqual([]);
};
