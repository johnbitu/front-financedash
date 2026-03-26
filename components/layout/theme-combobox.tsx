'use client'

import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { useTheme } from 'next-themes'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import { Command } from '@/components/ui/command'
import { THEME_OPTIONS } from '@/lib/theme'
import { cn } from '@/lib/utils'

export function ThemeCombobox() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const selectedThemeLabel = useMemo(() => {
    return (
      THEME_OPTIONS.find((option) => option.value === theme)?.label ??
      'Selecione um tema'
    )
  }, [theme])

  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <ComboboxTrigger
        role="combobox"
        aria-expanded={open}
        className="w-[140px] justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm sm:w-[180px]"
      >
        <span className="truncate">{selectedThemeLabel}</span>
      </ComboboxTrigger>
      <ComboboxContent align="end">
        <Command>
          <ComboboxInput placeholder="Selecione um tema" />
          <ComboboxList>
            <ComboboxEmpty>Nenhum tema encontrado.</ComboboxEmpty>
            {THEME_OPTIONS.map((option) => (
              <ComboboxItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  setTheme(option.value)
                  setOpen(false)
                }}
              >
                {option.label}
                <Check
                  className={cn(
                    'ml-auto size-4',
                    theme === option.value ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </ComboboxItem>
            ))}
          </ComboboxList>
        </Command>
      </ComboboxContent>
    </Combobox>
  )
}
