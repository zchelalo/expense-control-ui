import { X } from 'lucide-react'
import { forwardRef, type HTMLAttributes } from 'react'
import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import styles from '@/components/atoms/modal/modal.module.css'
import { Text } from '@/components/atoms/text'

export interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  onClose: () => void
}

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ title, onClose, className, children, ...props }, ref) => {
    return (
      <FlexBox
        variant='div'
        direction='column'
        alignItems='start'
        justifyContent='center'
        gap={4}
        className={styles.modalContent}
        ref={ref}
        {...props}
      >
        <FlexBox
          variant='div'
          direction='row'
          alignItems='center'
          justifyContent='spaceBetween'
          gap={2}
          className={styles.modalContentTitle}
        >
          <Text typographySize='medium' typographyWeight='bold'>
            {title}
          </Text>
          <Button
            type='button'
            variant='danger'
            className={styles.modalContentCloseButton}
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        </FlexBox>
        {children}
      </FlexBox>
    )
  },
)
