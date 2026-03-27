import {
  CheckCircledIcon,
  ClipboardIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PersonIcon,
  PlusIcon,
} from '@radix-ui/react-icons'

/**
 * Icon wrapper for consistent sizing and styling across the dashboard
 */
export function IconWrapper({ children, className = '', size = 16 }) {
  return (
    <span
      className={`icon-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
    >
      {children}
    </span>
  )
}

/**
 * Icon for creating new activities
 */
export function NewActivityIcon({ size = 16 }) {
  return (
    <IconWrapper size={size}>
      <PlusIcon width={size} height={size} />
    </IconWrapper>
  )
}

/**
 * Icon for correcting/checking activities
 */
export function CheckActivityIcon({ size = 16 }) {
  return (
    <IconWrapper size={size}>
      <CheckCircledIcon width={size} height={size} />
    </IconWrapper>
  )
}

/**
 * Icon for viewing activities list
 */
export function ActivitiesIcon({ size = 16 }) {
  return (
    <IconWrapper size={size}>
      <ClipboardIcon width={size} height={size} />
    </IconWrapper>
  )
}

/**
 * Icon for viewing classes/groups
 */
export function ClassesIcon({ size = 16 }) {
  return (
    <IconWrapper size={size}>
      <PersonIcon width={size} height={size} />
    </IconWrapper>
  )
}

/**
 * Icon for high priority/urgent items
 */
export function UrgentIcon({ size = 16 }) {
  return (
    <IconWrapper size={size}>
      <ExclamationTriangleIcon width={size} height={size} />
    </IconWrapper>
  )
}

/**
 * Icon for time/deadline related items
 */
export function DeadlineIcon({ size = 16 }) {
  return (
    <IconWrapper size={size}>
      <ClockIcon width={size} height={size} />
    </IconWrapper>
  )
}
