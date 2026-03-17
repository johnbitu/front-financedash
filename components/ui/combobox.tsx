'use client'

import * as React from 'react'

import { CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

function Combobox({
  ...props
}: React.ComponentProps<typeof Popover>) {
  return <Popover data-slot="combobox" {...props} />
}

function ComboboxTrigger({
  ...props
}: React.ComponentProps<typeof PopoverTrigger>) {
  return <PopoverTrigger data-slot="combobox-trigger" {...props} />
}

function ComboboxContent({
  className,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      data-slot="combobox-content"
      className={cn('w-(--radix-popover-trigger-width) p-0', className)}
      {...props}
    />
  )
}

function ComboboxInput({
  ...props
}: React.ComponentProps<typeof CommandInput>) {
  return <CommandInput data-slot="combobox-input" {...props} />
}

function ComboboxEmpty({
  ...props
}: React.ComponentProps<typeof CommandEmpty>) {
  return <CommandEmpty data-slot="combobox-empty" {...props} />
}

function ComboboxList({
  ...props
}: React.ComponentProps<typeof CommandList>) {
  return <CommandList data-slot="combobox-list" {...props} />
}

function ComboboxItem({
  ...props
}: React.ComponentProps<typeof CommandItem>) {
  return <CommandItem data-slot="combobox-item" {...props} />
}

export {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
}
