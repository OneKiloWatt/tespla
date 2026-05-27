/**
 * テスプラ - SVGアイコン集
 * すべて currentColor で塗るので親から `text-accent` 等で色指定
 */
import * as React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export function IconBack({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
export function IconArrowRight({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
export function IconPlus({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function IconCheck({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12L10 17L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
export function IconMenu({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="6" cy="12" r="1.6" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.6" fill="currentColor"/>
      <circle cx="18" cy="12" r="1.6" fill="currentColor"/>
    </svg>
  );
}
export function IconHome({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 11L12 4L20 11V20H14V14H10V20H4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}
export function IconEdit({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M14 4L20 10L9 21H3V15L14 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}
export function IconHistory({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 12 a8 8 0 1 0 2.3 -5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M3 3V8H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8V12L15 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
export function IconBulb({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 18H15M10 21H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M7 10 a5 5 0 0 1 10 0 c0 2-1.2 3.5-2 4.5 -0.6 0.8 -1 1.5 -1 2.5 H10 c0-1 -0.4-1.7 -1-2.5 C8.2 13.5 7 12 7 10 Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M12 3V5M19 6.5L17.5 7.5M5 6.5L6.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
export function IconPencil({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20L4 16L15 5L19 9L8 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M13 7L17 11" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}
export function IconWarning({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3L22 20H2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M12 10V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
    </svg>
  );
}
export function IconLock({ size = 36, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <rect x="8" y="18" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12"/>
      <path d="M13 18 V13 a7 7 0 0 1 14 0 V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="26" r="2" fill="currentColor"/>
      <path d="M20 28V31" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function IconRobot({ size = 28, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="6" y="10" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15"/>
      <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
      <circle cx="20" cy="18" r="1.5" fill="currentColor"/>
      <path d="M16 6V10M14 5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 16V20M29 16V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function IconTrophy({ size = 42, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M14 8H34V20 a10 10 0 0 1 -20 0Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/>
      <path d="M14 10H8V14 a5 5 0 0 0 6 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>
      <path d="M34 10H40V14 a5 5 0 0 1 -6 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>
      <path d="M19 30H29L31 40H17Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/>
      <path d="M24 24V30" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
export function IconChevronLeft({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
export function IconChevronRight({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
export function IconSpinner({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className ?? ''}`}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25"/>
      <path d="M12 3 a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}
export function IconUser({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2"/>
      <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
