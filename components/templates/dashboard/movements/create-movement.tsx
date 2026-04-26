'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import { Modal } from '@/components/atoms/modal'
import { ModalContent } from '@/components/atoms/modal/modal-content'
import { Text } from '@/components/atoms/text'

type CreateMovementProps = {
  translations: {
    newMovement: string
  }
}

export function CreateMovement({ translations }: CreateMovementProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Modal isOpen={isOpen}>
        <ModalContent
          title={translations.newMovement}
          onClose={() => setIsOpen(false)}
        >
          <Text>{translations.newMovement}</Text>
        </ModalContent>
      </Modal>
      <Button type='button' onClick={() => setIsOpen(true)}>
        <FlexBox variant='div' direction='row' alignItems='center' gap={2}>
          <Text typographySize='small' typographyWeight='medium'>
            {translations.newMovement}
          </Text>
          <Plus size={16} />
        </FlexBox>
      </Button>
    </>
  )
}
