import {
  ClockIcon,
} from '@radix-ui/react-icons'

function IconWrapper({ children, className = '', size = 16 }) {
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

export function DeadlineIcon({ size = 16 }) {
  return (
    <IconWrapper size={size}>
      <ClockIcon width={size} height={size} />
    </IconWrapper>
  )
}
