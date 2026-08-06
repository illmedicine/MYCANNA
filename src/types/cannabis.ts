export type CategoryId =
  | 'flower'
  | 'edibles'
  | 'concentrates'
  | 'vapes'
  | 'tinctures'
  | 'topicals'
  | 'capsules'
  | 'pre_rolls';

export interface CannabisCategory {
  id: CategoryId;
  label: string;
  description: string;
  icon: string;
}

export const CANNABIS_CATEGORIES: CannabisCategory[] = [
  {
    id: 'flower',
    label: 'Flower',
    description: 'Traditional dried cannabis bud, smoked or vaporized',
    icon: '🌿',
  },
  {
    id: 'edibles',
    label: 'Edibles',
    description: 'Food and drink infused with cannabis',
    icon: '🍫',
  },
  {
    id: 'concentrates',
    label: 'Concentrates',
    description: 'High-potency extracts like wax, shatter, and rosin',
    icon: '💎',
  },
  {
    id: 'vapes',
    label: 'Vapes',
    description: 'Cartridges and disposable vaporizer pens',
    icon: '💨',
  },
  {
    id: 'tinctures',
    label: 'Tinctures',
    description: 'Liquid drops taken sublingually for fast onset',
    icon: '💧',
  },
  {
    id: 'topicals',
    label: 'Topicals',
    description: 'Creams and balms applied directly to skin',
    icon: '🧴',
  },
  {
    id: 'capsules',
    label: 'Capsules',
    description: 'Pre-dosed pills for consistent, discreet consumption',
    icon: '💊',
  },
  {
    id: 'pre_rolls',
    label: 'Pre-Rolls',
    description: 'Ready-to-smoke joints and blunts',
    icon: '🚬',
  },
];
