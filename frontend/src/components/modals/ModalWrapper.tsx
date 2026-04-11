import { Modal, Group, ScrollArea } from '@mantine/core';
import { ModalWrapperProps } from '@/types';

export const ModalWrapper = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 440,
  padding,
  footerMt = 'md',
  closeOnClickOutside = false,
}: ModalWrapperProps) => {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={title}
      size={maxWidth}
      closeOnClickOutside={closeOnClickOutside}
      centered
      scrollAreaComponent={ScrollArea.Autosize}
      {...(padding !== undefined && { padding })}
    >
      {children}
      {actions && (
        <Group justify='flex-end' mt={footerMt}>
          {actions}
        </Group>
      )}
    </Modal>
  );
};
