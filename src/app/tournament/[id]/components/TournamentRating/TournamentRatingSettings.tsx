"use client";

import { FC, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Input } from "@/components/Input/Input";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import { toast } from "@/components/Toast/Toast";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { patchTournamentRatingSettings } from "@/core/states/tournaments/requests/patchTournamentRatingSettings";
import { refetchTournament } from "@/core/states/tournaments/hooks/useTournament";

export interface TournamentRatingSettingsProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentRatingSettings: FC<TournamentRatingSettingsProps> = ({
  tournament,
}) => {
  const environment = useEnvironment();

  const [guaranteeEnabled, setGuaranteeEnabled] = useState(
    tournament.ratingGuaranteeEnabled ?? false,
  );
  const [pointsCoef, setPointsCoef] = useState(
    String(tournament.ratingPointsCoefficient ?? 1),
  );
  const [bountyCoef, setBountyCoef] = useState(
    String(tournament.ratingBountyCoefficient ?? 1),
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsedPoints = parseFloat(pointsCoef);
    const parsedBounty = parseFloat(bountyCoef);
    if (!Number.isFinite(parsedPoints) || parsedPoints < 0) {
      toast({ type: "error", message: "Коэффициент баллов должен быть ≥ 0" });
      return;
    }
    if (!Number.isFinite(parsedBounty) || parsedBounty < 0) {
      toast({ type: "error", message: "Коэффициент баунти должен быть ≥ 0" });
      return;
    }

    setSaving(true);
    try {
      await patchTournamentRatingSettings(environment, tournament, {
        ratingGuaranteeEnabled: guaranteeEnabled,
        ratingPointsCoefficient: parsedPoints,
        ratingBountyCoefficient: parsedBounty,
      });
      await refetchTournament();
      toast({ type: "success", message: "Настройки рейтинга сохранены" });
    } catch (error) {
      toast({
        type: "error",
        message: error instanceof Error ? error.message : "Ошибка сохранения",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      flex={{ col: true, gap: 4 }}
      style={{
        backgroundColor: "var(--background-primary)",
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.08)",
        padding: "20px 24px",
      }}
    >
      <Typography.Text bold>Настройки рейтинга</Typography.Text>

      <Box flex={{ align: "center", gap: 3 }}>
        <Checkbox
          size="medium"
          checked={guaranteeEnabled}
          onCheckedChange={(v) => setGuaranteeEnabled(v === true)}
          id="rating-guarantee"
        />
        <label htmlFor="rating-guarantee" style={{ cursor: "pointer" }}>
          <Typography.Text size="small">
            Гарантия топ-10 (+10 к базе для мест 1–10)
          </Typography.Text>
        </label>
      </Box>

      <Box flex={{ gap: 4, align: "flex-end", flexWrap: "wrap" }}>
        <Box style={{ width: 200 }}>
          <Input
            label="Коэффициент баллов"
            value={pointsCoef}
            onChange={(e) => setPointsCoef(e.target.value)}
            type="primary"
            size="medium"
          />
        </Box>
        <Box style={{ width: 200 }}>
          <Input
            label="Коэффициент баунти"
            value={bountyCoef}
            onChange={(e) => setBountyCoef(e.target.value)}
            type="primary"
            size="medium"
          />
        </Box>
      </Box>

      <Box flex={{ align: "center", gap: 3 }}>
        <Typography.Text size="small" type="secondary">
          Итог: (база {guaranteeEnabled ? "+ 10 для топ-10" : ""}) ×{" "}
          {pointsCoef || "1"} + баунти × {bountyCoef || "1"}
        </Typography.Text>
      </Box>

      <Box>
        <Button
          type="success"
          size="medium"
          onClick={handleSave}
          loading={saving}
        >
          Сохранить настройки
        </Button>
      </Box>
    </Box>
  );
};
