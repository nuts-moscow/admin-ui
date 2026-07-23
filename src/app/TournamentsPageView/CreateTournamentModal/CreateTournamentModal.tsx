"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { useForm } from "@/components/Form/useForm";
import { Modal, WithModalProps } from "@/components/Modal/Modal";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { DateTimeStep } from "./DateTimeStep";
import { StructureStep } from "./StructureStep";
import { InfoStep } from "./InfoStep";
import { Form } from "@/components/Form/Form";
import { Typography } from "@/components/Typography/Typography";
import { DateTime } from "luxon";
import { TournamentStructure } from "@/core/states/tournamentStructures/common/TournamentStructure";
import { makeTournament } from "@/core/states/tournaments/requests/makeTournament";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { refetchTournaments } from "@/core/states/tournaments/hooks/useTournaments";
import { toast } from "@/components/Toast/Toast";
import { useRatingTables } from "@/core/states/tournaments/hooks/useRatingTables";

type Step = 1 | 2 | 3;

const STEP_TITLES: Record<Step, string> = {
  1: "Дата и время",
  2: "Структура турнира",
  3: "Информация",
};

export interface CreateTournamentForm {
  readonly name: string;
  readonly date: string;
  readonly time: string;
  /** Целое ≥ 0; пусто — бэкенд подставит 10. */
  readonly ratingGuaranteeBonusPoints: string;
  /** Справочник GET /api/rating-tables; по умолчанию — первая таблица в списке. */
  readonly ratingTableId: number;
  /** Учитывать турнир в рейтинге (иначе спецформат). */
  readonly ratingEnabled: boolean;
  /** Строки полей года/месяца сезона; пусто = null. */
  readonly ratingSeasonYear: string;
  readonly ratingSeasonMonth: string;
  /** Финал месяца: турнир по приглашению, самозапись снимается. */
  readonly monthFinal: boolean;
  readonly structure: TournamentStructure | undefined;
}

export const CreateTournamentModalContent: FC<WithModalProps> = ({ close }) => {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const environment = useEnvironment();
  const { data: ratingTables } = useRatingTables();
  const ratingTableInitRef = useRef(false);

  const [form] = useForm<CreateTournamentForm>({
    controls: {
      name: "",
      date: DateTime.now().toFormat("yyyy-MM-dd"),
      time: DateTime.now().toFormat("HH:mm"),
      ratingGuaranteeBonusPoints: "10",
      ratingTableId: 1,
      ratingEnabled: true,
      ratingSeasonYear: "",
      ratingSeasonMonth: "",
      monthFinal: false,
      structure: undefined,
    },
  });

  useEffect(() => {
    if (
      ratingTables &&
      ratingTables.length > 0 &&
      !ratingTableInitRef.current
    ) {
      ratingTableInitRef.current = true;
      form.setValue({ ratingTableId: ratingTables[0]!.id });
    }
  }, [ratingTables]);

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as Step);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!form.value.structure) {
      return;
    }
    setIsLoading(true);
    try {
      const [year, month, day] = form.value.date.split("-");
      const [hour, minute] = form.value.time.split(":");

      const bonusRaw = form.value.ratingGuaranteeBonusPoints.trim();
      const bonusParsed =
        bonusRaw === "" ? undefined : Number.parseInt(bonusRaw, 10);
      if (
        bonusParsed !== undefined &&
        (!Number.isInteger(bonusParsed) || bonusParsed < 0)
      ) {
        toast({
          type: "error",
          message: "Бонус гарантии: целое число ≥ 0 или оставьте пустым",
        });
        setIsLoading(false);
        return;
      }

      const rtId = form.value.ratingTableId;
      const yStr = form.value.ratingSeasonYear.trim();
      const mStr = form.value.ratingSeasonMonth.trim();
      const hasY = yStr !== "";
      const hasM = mStr !== "";
      if (form.value.ratingEnabled && hasY !== hasM) {
        toast({
          type: "error",
          message:
            "Сезон рейтинга: укажите и год, и месяц (2000–2100 и 1–12), либо оставьте оба поля пустыми",
        });
        setIsLoading(false);
        return;
      }
      let sy: number | undefined;
      let sm: number | undefined;
      if (form.value.ratingEnabled && hasY && hasM) {
        sy = parseInt(yStr, 10);
        sm = parseInt(mStr, 10);
        if (
          !Number.isInteger(sy) ||
          sy < 2000 ||
          sy > 2100 ||
          !Number.isInteger(sm) ||
          sm < 1 ||
          sm > 12
        ) {
          toast({
            type: "error",
            message: "Год сезона 2000–2100, месяц 1–12",
          });
          setIsLoading(false);
          return;
        }
      }
      await makeTournament(environment, {
        name: form.value.name,
        date: Math.floor(
          DateTime.fromObject({
            year: Number(year),
            month: Number(month),
            day: Number(day),
            hour: Number(hour),
            minute: Number(minute),
          }).toSeconds()
        ),
        ...(bonusParsed !== undefined ? { ratingGuaranteeBonusPoints: bonusParsed } : {}),
        ...(Number.isFinite(rtId) && rtId > 0 && Number.isInteger(rtId)
          ? { ratingTableId: Math.floor(rtId) }
          : {}),
        ...(form.value.ratingEnabled === false
          ? {
              ratingEnabled: false,
              ratingSeasonYear: null,
              ratingSeasonMonth: null,
            }
          : sy != null && sm != null
            ? { ratingSeasonYear: sy, ratingSeasonMonth: sm }
            : {}),
        ...(form.value.monthFinal === true ? { monthFinal: true } : {}),
        structure: {
          name: form.value.structure.name,
          playersLimit: form.value.structure.playersLimit,
          stackSize: form.value.structure.stackSize,
          freezeOutEnabled: form.value.structure.freezeOutEnabled,
          entryFreeOnly: form.value.structure.entryFreeOnly === true,
          ...(form.value.structure.maxReentries != null &&
          Number.isFinite(form.value.structure.maxReentries)
            ? { maxReentries: form.value.structure.maxReentries }
            : {}),
          blinds: form.value.structure.blindsStructure,
        },
      });
      close();
      refetchTournaments();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <DateTimeStep />;
      case 2:
        return <StructureStep />;
      case 3:
        return <InfoStep />;
      default:
        return null;
    }
  };

  const isNextAvailable = useMemo(() => {
    switch (step) {
      case 1:
        return form.value.date && form.value.time;
      case 2:
      case 3:
        return (
          form.value.structure &&
          form.value.date &&
          form.value.time &&
          form.value.name
        );
    }
  }, [form.value, step]);

  return (
    <>
      <Modal.Title showCloseButton>
        <Typography.Title type="primary" level={2}>
          {STEP_TITLES[step]}
        </Typography.Title>
      </Modal.Title>
      <Modal.Content
        width={708}
        maxHeight="min(90vh, calc(100dvh - 40px))"
      >
        <Form model={form}>
          <Box flex={{ col: true, gap: 4, width: "100%" }}>
            {renderStepContent()}
            <Box flex={{ justify: "center", width: "100%", gap: 6 }}>
              <Button
                type="outline"
                onClick={handlePrev}
                disabled={step === 1}
                iconLeft={<ArrowLeft size={24} />}
                style={{
                  borderRadius: "50%",
                  height: 32,
                  width: 32,
                  padding: 0,
                  border: "1px solid var(--border-color-grey)",
                }}
              />
              <Button
                type="outline"
                onClick={handleNext}
                disabled={!isNextAvailable}
                loading={isLoading}
                iconLeft={
                  step === 3 ? (
                    <Check color="var(--text-success)" size={24} />
                  ) : (
                    <ArrowRight size={24} />
                  )
                }
                style={{
                  borderRadius: "50%",
                  height: 32,
                  width: 32,
                  padding: 0,
                  border: "1px solid var(--border-color-grey)",
                }}
              />
            </Box>
          </Box>
        </Form>
      </Modal.Content>
    </>
  );
};
