import {
  IconBuildingBank,
  IconCalendarStats,
  IconCategory,
  IconCreditCard,
  IconDashboard,
  IconReceipt2,
  IconReportAnalytics,
  IconSettings,
  IconTargetArrow,
  IconUserDollar,
  IconUsers,
  type Icon,
} from '@tabler/icons-react'

export type NavigationItem = {
  title: string
  url: string
  icon?: Icon
}

export const MAIN_NAV_ITEMS: NavigationItem[] = [
  { title: 'Visao geral', url: '/dashboard', icon: IconDashboard },
  { title: 'Este mes', url: '/dashboard', icon: IconCalendarStats },
  { title: 'Transacoes', url: '/transacoes', icon: IconReceipt2 },
  { title: 'Categorias', url: '/categorias', icon: IconCategory },
  { title: 'Contas', url: '/contas', icon: IconBuildingBank },
  { title: 'Cartoes', url: '/dashboard', icon: IconCreditCard },
  { title: 'Assinaturas', url: '/dashboard', icon: IconUserDollar },
  { title: 'Metas', url: '/dashboard', icon: IconTargetArrow },
]

export const ADMIN_USERS_NAV_ITEM: NavigationItem = {
  title: 'Usuarios',
  url: '/admin/usuarios',
  icon: IconUsers,
}

export const SECONDARY_NAV_ITEMS: Required<NavigationItem>[] = [
  { title: 'Relatorios', url: '/dashboard', icon: IconReportAnalytics },
  { title: 'Configuracoes', url: '/dashboard', icon: IconSettings },
]
