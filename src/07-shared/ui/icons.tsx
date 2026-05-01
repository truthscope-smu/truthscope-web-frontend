import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export const ICON_SIZE = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-10 w-10',
} as const;

function BaseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function BadgeCheckIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 2 2.2 2.2 3.1-.4.8 3 2.8 1.4-1.4 2.8 1.4 2.8-2.8 1.4-.8 3-3.1-.4L12 22l-2.2-2.2-3.1.4-.8-3-2.8-1.4 1.4-2.8-1.4-2.8 2.8-1.4.8-3 3.1.4L12 2z" />
      <path d="m9 12 2 2 4-4" />
    </BaseIcon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m9 18 6-6-6-6" />
    </BaseIcon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m15 18-6-6 6-6" />
    </BaseIcon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </BaseIcon>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 5 6v6c0 5 3.5 8.5 7 9 3.5-.5 7-4 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </BaseIcon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 5 6v6c0 5 3.5 8.5 7 9 3.5-.5 7-4 7-9V6l-7-3Z" />
    </BaseIcon>
  );
}

export function TriangleAlertIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M10.3 3.4 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </BaseIcon>
  );
}

export function BrainCircuitIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9.5 3a3.5 3.5 0 0 0-3.5 3.5v1a3 3 0 0 0-2 2.8 3 3 0 0 0 2 2.8v.9A3.5 3.5 0 0 0 9.5 18" />
      <path d="M14.5 3A3.5 3.5 0 0 1 18 6.5v1a3 3 0 0 1 2 2.8 3 3 0 0 1-2 2.8v.9a3.5 3.5 0 0 1-3.5 3.5" />
      <path d="M12 6v12" />
      <path d="M9 8c.8 0 1.6.4 2 1" />
      <path d="M15 8c-.8 0-1.6.4-2 1" />
      <path d="M9 14c.8 0 1.6.4 2 1" />
      <path d="M15 14c-.8 0-1.6.4-2 1" />
    </BaseIcon>
  );
}

export function PuzzleIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M19 6h-3a2 2 0 1 0-4 0H9a2 2 0 0 0-2 2v3a2 2 0 1 1 0 4v3a2 2 0 0 0 2 2h3a2 2 0 1 0 4 0h3a2 2 0 0 0 2-2v-3a2 2 0 1 1 0-4V8a2 2 0 0 0-2-2Z" />
    </BaseIcon>
  );
}

export function Link2Icon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M10 13a5 5 0 0 0 7.1 0l2.8-2.8a5 5 0 0 0-7.1-7.1L11 5" />
      <path d="M14 11a5 5 0 0 0-7.1 0L4 13.9a5 5 0 1 0 7.1 7.1L13 19" />
    </BaseIcon>
  );
}

export function BarChart3Icon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </BaseIcon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </BaseIcon>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 5h16" />
      <path d="M7 12h10" />
      <path d="M10 19h4" />
    </BaseIcon>
  );
}

export function SortIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m8 6-3 3-3-3" />
      <path d="M5 9V3" />
      <path d="m16 18 3-3 3 3" />
      <path d="M19 15v6" />
    </BaseIcon>
  );
}

export function DatabaseIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v8c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
      <path d="M5 9c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </BaseIcon>
  );
}

export function NetworkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M12 7v5" />
      <path d="m12 12-5 5" />
      <path d="m12 12 5 5" />
    </BaseIcon>
  );
}

export function SourceIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 19h16" />
      <path d="M6 19V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
    </BaseIcon>
  );
}

export function BotIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="6" y="8" width="12" height="10" rx="2" />
      <path d="M12 5v3" />
      <circle cx="10" cy="12" r="1" />
      <circle cx="14" cy="12" r="1" />
      <path d="M8 16h8" />
    </BaseIcon>
  );
}

export function HelpCircleIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.9 2.1c-.9.6-1.4 1.1-1.4 2.1" />
      <path d="M12 17h.01" />
    </BaseIcon>
  );
}
