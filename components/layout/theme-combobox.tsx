'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'

type ThemeOption = {
  value: 'dark' | 'green-dark' | 'light' | 'green-light'
  label: 'Dark' | 'Verde-Dark' | 'Light' | 'Verde-Light'
}

const themeOptions: ThemeOption[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'green-dark', label: 'Verde-Dark' },
  { value: 'light', label: 'Light' },
  { value: 'green-light', label: 'Verde-Light' },
]

export function ThemeCombobox() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const selectedThemeLabel = useMemo(() => {
    if (!mounted) return 'Selecione um tema'

    return (
      themeOptions.find((option) => option.value === theme)?.label ??
      'Selecione um tema'
    )
  }, [mounted, theme])

  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <ComboboxTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[140px] justify-between sm:w-[180px]"
        >
          <span className="truncate">{selectedThemeLabel}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </ComboboxTrigger>
      <ComboboxContent align="end">
        <Command>
          <ComboboxInput placeholder="Selecione um tema" />
          <ComboboxList>
            <ComboboxEmpty>Nenhum tema encontrado.</ComboboxEmpty>
            {themeOptions.map((option) => (
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
