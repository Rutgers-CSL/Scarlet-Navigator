'use client';

import { useEffect, useRef } from 'react';

interface ConfirmationModalProps {
  title: string;
  message: string;
  visible: boolean;
  id: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function ConfirmationModal({
  title,
  message,
  visible,
  onConfirm,
  onCancel,
  id,
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!modalRef.current) return;

    if (visible) {
      modalRef.current.showModal();
    } else {
      modalRef.current.close();
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm?.();
    modalRef.current?.close();
  };

  const handleCancel = () => {
    onCancel?.();
    modalRef.current?.close();
  };

  return (
    <dialog ref={modalRef} className='modal' id={id}>
      <div className='modal-box'>
        <h3 className='text-lg font-bold'>{title}</h3>
        <p className='py-4'>{message}</p>
        <div className='modal-action'>
          <button className='btn btn-outline btn-error' onClick={handleConfirm}>
            Continue
          </button>
          <button className='btn btn-neutral' onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
      <form method='dialog' className='modal-backdrop'>
        <button>close</button>
      </form>
    </dialog>
  );
}
