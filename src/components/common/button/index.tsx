import { ReactNode, FC } from 'react'

import styles from './button.module.css'

type ButtonProps = {
  children: ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
  className?: string
}

export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  variant,
  className,
}) => {
  return (
    <button
      className={`${className} ${styles.btn} ${styles[`btn-${variant}`]}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
