import { Modal, Group, ScrollArea } from '@mantine/core';
import { ModalWrapperProps } from '@/types';

export const ModalWrapper = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 440,
}: ModalWrapperProps) => {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={title}
      size={maxWidth}
      closeOnClickOutside={false}
      centered
      scrollAreaComponent={ScrollArea.Autosize}
    >
      {children}
      {actions && (
        <Group justify='flex-end' mt='md'>
          {actions}
        </Group>
      )}
    </Modal>
  );
};
