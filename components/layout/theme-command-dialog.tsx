'use client'

import { Check, Palette } from 'lucide-react'
import { useTheme } from 'next-themes'

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { THEME_OPTIONS } from '@/lib/theme'
import { cn } from '@/lib/utils'

type ThemeCommandDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThemeCommandDialog({
  open,
  onOpenChange,
}: ThemeCommandDialogProps) {
  const { theme, setTheme } = useTheme()

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Selecionar tema"
      description="Selecione um tema para a aplicação."
    >
      <Command>
        <CommandInput placeholder="Buscar tema..." />
        <CommandList>
          <CommandEmpty>Nenhum tema encontrado.</CommandEmpty>
          <CommandGroup heading="Temas">
            {THEME_OPTIONS.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  setTheme(option.value)
                  onOpenChange(false)
                }}
              >
                <Palette className="size-4" />
                <span>{option.label}</span>
                <Check
                  className={cn(
                    'ml-auto size-4',
                    theme === option.value ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
