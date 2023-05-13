import Modal from '@mui/joy/Modal';
import React from 'react';

import UsageLimitCard from './UsageLimitCard';

type Props = {
  title?: string;
  isOpen: boolean;
  description?: string;
  handleClose: () => any;
};

function UsageLimitModal({ isOpen, title, description, handleClose }: Props) {
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <UsageLimitCard title={title} description={description} />
    </Modal>
  );
}

export default UsageLimitModal;
