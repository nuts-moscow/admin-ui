"use client";

import { FC } from "react";
import { Button } from "@/components/Button/Button";
import { Modal, WithModalProps, useModal } from "@/components/Modal/Modal";

const AddPlayerModalContent: FC<WithModalProps> = () => {
  return (
    <>
      <Modal.Title showCloseButton>Добавить игрока</Modal.Title>
      <Modal.Content minWidth={420} />
    </>
  );
};

export const AddPlayerButton: FC = () => {
  const [AddPlayerModal, openAddPlayerModal] = useModal(AddPlayerModalContent);

  return (
    <>
      <AddPlayerModal />
      <Button type="secondary" size="xxSmall" onClick={() => openAddPlayerModal()}>
        Добавить игрока
      </Button>
    </>
  );
};
