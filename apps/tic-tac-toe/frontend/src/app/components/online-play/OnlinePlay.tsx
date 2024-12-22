'use client';

import React, { ReactNode, useState } from 'react';

import { useOverlayTrigger } from 'react-aria';

import { type OverlayTriggerState } from 'react-stately';

import { m, AnimatePresence, type Variants } from 'framer-motion';

import type { CopyErrorType, JoinLobbyFormData } from '../../utils/types';
import { joinLobbyValidator } from '../../utils/validators';

// Zod
import { zodResolver } from '@hookform/resolvers/zod';

// React form
import { useForm } from 'react-hook-form';

// SVG
import { ReactComponent as OnlinePlaySvg } from '../../../assets/online-play.svg';

// Components
import {
  Modal,
  Dialog,
  BaseButton,
  RippleLoader,
  BaseTextField,
  CopyGameLinkButton,
} from '../';

const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, transition: { duration: 0.6, delay: 0.25 } },
};

const onlineDialogVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.45, delay: 0.15 },
  },
};

const onlineModalContentVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.45, delay: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

interface IOnlinePlay {
  lobbyId: string | null;
  isJoiningLobby: boolean;
  isCreatingLobby: boolean;
  onModalOpenPress: () => void;
  isOnlineModalDisabled: boolean;
  modalState: OverlayTriggerState;
  onJoinLobby: (data: JoinLobbyFormData) => void;
}

const OnlinePlay: React.FC<IOnlinePlay> = (props) => {
  const { triggerProps, overlayProps } = useOverlayTrigger(
    { type: 'dialog' },
    props.modalState,
  );

  return (
    <div>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.9 } }}
        exit={{ opacity: 0, transition: { delay: 0.3, duration: 0.3 } }}
        className="online-btn"
      >
        <BaseButton
          {...triggerProps}
          pressClasses="bg-stone-700"
          focusClasses="border-stone-500"
          onPress={props.onModalOpenPress}
          isDisabled={props.isOnlineModalDisabled}
          buttonClasses="bg-stone-900 px-4 py-2 rounded-lg data-hovered:bg-stone-800 transition-colors border border-transparent"
        >
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 1.2 } }}
            exit={{ scale: 0, transition: { duration: 0.3 } }}
            className="online-btn-icon relative z-10 aspect-square h-6 text-stone-500"
          >
            {props.isCreatingLobby ? <RippleLoader /> : <OnlinePlaySvg />}
          </m.div>
        </BaseButton>
      </m.div>
      <AnimatePresence>
        {props.modalState.isOpen ? (
          <m.div exit="exit" initial="initial" animate="animate">
            <Modal
              state={props.modalState}
              backdropVariants={backdropVariants}
              dialogVariants={onlineDialogVariants}
            >
              <Dialog
                {...overlayProps}
                titleClass="text-xs"
                title="Play with a friend"
                onClose={props.modalState.close}
                containerClass="md:max-w-sm mx-auto"
                titleContainerClass="px-4 uppercase py-2"
                contentVariants={onlineModalContentVariants}
              >
                <div className="grid grid-cols-1 gap-4 px-4 pb-4 pt-2">
                  <JoinLobby
                    lobbyId={props.lobbyId}
                    onJoinLobby={props.onJoinLobby}
                    isJoiningLobby={props.isJoiningLobby}
                  />
                  <Separator />
                  <InviteToLobby lobbyId={props.lobbyId} />
                </div>
              </Dialog>
            </Modal>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const Separator: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-stone-600">
      <div className="h-[1px] w-full rounded-lg bg-stone-600" />
      <div>OR</div>
      <div className="h-[1px] w-full rounded-lg bg-stone-600" />
    </div>
  );
};

interface ICard {
  title: string;
  description: string;
  children?: ReactNode;
}

const Card: React.FC<ICard> = (props) => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-stone-700 bg-stone-800 p-2">
      {/* Title */}
      <h3 className="pb-3 text-xs font-semibold">{props.title}</h3>
      <p className="pb-4 text-[0.7rem]">{props.description}</p>
      {props.children}
    </div>
  );
};

const InviteToLobby: React.FC<Pick<IOnlinePlay, 'lobbyId'>> = (props) => {
  const [showError, setShowError] = useState(false);

  const handleError = (isError: boolean, type?: CopyErrorType) =>
    setShowError(isError && type === 'copy');

  return (
    <Card
      title="Invite a friend!"
      description="Copy the link below and share it with your friend to start playing together."
    >
      <m.div layout>
        <BaseTextField
          isReadOnly
          name="lobby-id"
          value={props.lobbyId ?? ''}
          label="My Lobby Identifier"
          focusClasses="border-stone-300"
          containerClasses="flex-grow pb-4"
          aria-describedby="Lobby identifier"
          labelClasses="uppercase text-[0.7rem]"
          inputClasses="tracking-widest placeholder:tracking-normal"
        />
        <CopyGameLinkButton onError={handleError} lobbyId={props.lobbyId} />
        <div>
          <AnimatePresence>
            {showError && (
              <m.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                  transition: {
                    height: { duration: 0.25 },
                    opacity: { duration: 0.15 + 0.25, delay: 0.25 },
                    ease: 'easeIn',
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.25 + 0.15, delay: 0.15 },
                    opacity: { duration: 0.15 },
                    ease: 'easeOut',
                  },
                }}
                className="text-[0.7rem] text-red-500"
              >
                <div className="pl-2 pt-2">
                  Could not copy lobby identifiers!. You can copy the
                  identifiers manually by using the input fields above.
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </m.div>
    </Card>
  );
};

const JoinLobby: React.FC<
  Pick<IOnlinePlay, 'lobbyId' | 'isJoiningLobby' | 'onJoinLobby'>
> = (props) => {
  const {
    register,
    setValue,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinLobbyFormData>({
    resolver: zodResolver(joinLobbyValidator),
  });

  const onSubmit = (data: JoinLobbyFormData) => {
    if (data.id === props.lobbyId) {
      setError('id', { message: 'You are already part of this game!' });
      return;
    }
    props.onJoinLobby(data);
  };

  return (
    <Card
      title="Join a friend!"
      description="Enter the game code your friend shared with you in the input field below to start playing together."
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <BaseTextField
          isRequired
          maxLength={6}
          label="Lobby Identifier"
          placeholder="Lobby Identifier to join"
          focusClasses="border-stone-300"
          containerClasses="flex-grow pb-4"
          isDisabled={props.isJoiningLobby}
          errorMessage={errors.id?.message}
          labelClasses="text-[0.7rem] uppercase"
          inputClasses="tracking-widest placeholder:tracking-normal uppercase"
          {...(register('id'),
          {
            onChange: (value: string) => {
              setValue('id', value);
            },
          })}
        />
        <BaseButton
          type="submit"
          pressClasses="bg-stone-500"
          focusClasses="border-stone-500"
          isDisabled={props.isJoiningLobby}
          buttonClasses="bg-stone-700 data-hovered:bg-stone-600 flex-grow-0 w-full h-fit text-[0.7rem] uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors border-transparent border-2"
        >
          <div className="relative z-10">
            {props.isJoiningLobby && (
              <div className="absolute flex h-full w-full items-center justify-center pt-1">
                <div className="aspect-square w-5">
                  <RippleLoader />
                </div>
              </div>
            )}
            <span className={props.isJoiningLobby ? 'opacity-0' : 'opacity-1'}>
              Join Lobby
            </span>
          </div>
        </BaseButton>
      </form>
    </Card>
  );
};

export default OnlinePlay;
