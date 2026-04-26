'use client'

import clsx from 'clsx'
import { forwardRef, type HTMLAttributes, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FlexBox } from '@/components/atoms/flex-box'
import styles from '@/components/atoms/modal/modal.module.css'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, children, isOpen = false, ...props }, ref) => {
    const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null)

    useEffect(() => {
      setModalRoot(document.getElementById('modal'))
    }, [])

    const modalClassnames = clsx(
      styles['modal-modalBackground'],
      isOpen ? styles['modal-open'] : styles['modal-closed'],
      className,
    )

    if (!modalRoot) return null

    return createPortal(
      <FlexBox
        ref={ref}
        variant='div'
        direction='column'
        alignItems='center'
        justifyContent='center'
        className={modalClassnames}
        {...props}
      >
        {children}
      </FlexBox>,
      modalRoot,
    )
  },
)

Modal.displayName = 'Modal'
