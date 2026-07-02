export interface NavItem {
  label: string;
  route?: string;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'navigation.home', route: '/home' },
  { label: 'navigation.users', route: '/users' },
  { label: 'navigation.help', disabled: true }
];
