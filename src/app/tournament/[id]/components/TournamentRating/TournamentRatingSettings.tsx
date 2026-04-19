"use client";

import { FC, useEffect, useRef, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { Input } from "@/components/Input/Input";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import { toast } from "@/components/Toast/Toast";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  getTournament,
  TournamentInfoResponse,
} from "@/core/states/tournaments/requests/getTournament";
import { patchTournamentRatingSettings } from "@/core/states/tournaments/requests/patchTournamentRatingSettings";
import { refetchTournament } from "@/core/states/tournaments/hooks/useTournament";
import { useRatingTables } from "@/core/states/tournaments/hooks/useRatingTables";
import { getRatingTableDisplayName } from "@/core/states/tournaments/common/ratingTableDisplayName";
import { seasonSelectMonthOptions } from "@/core/states/tournaments/common/seasonFormatting";

export interface TournamentRatingSettingsProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentRatingSettings: FC<TournamentRatingSettingsProps> = ({
  tournament,
}) => {
  const environment = useEnvironment();
  const { data: ratingTables = [], loading: ratingTablesLoading } =
    useRatingTables();

  const [guaranteeEnabled, setGuaranteeEnabled] = useState(
    tournament.ratingGuaranteeEnabled ?? false,
  );
  const [pointsCoef, setPointsCoef] = useState(
    String(tournament.ratingPointsCoefficient ?? 1),
  );
  const [bountyCoef, setBountyCoef] = useState(
    String(tournament.ratingBountyCoefficient ?? 1),
  );
  const [guaranteeBonusPoints, setGuaranteeBonusPoints] = useState(
    String(tournament.ratingGuaranteeBonusPoints ?? 10),
  );
  const [ratingTableId, setRatingTableId] = useState(
    () => tournament.ratingTableId ?? 1,
  );
  const [ratingEnabled, setRatingEnabled] = useState(
    () => tournament.ratingEnabled ?? true,
  );
  const [ratingSeasonYear, setRatingSeasonYear] = useState(
    () =>
      tournament.ratingSeasonYear != null
        ? String(tournament.ratingSeasonYear)
        : "",
  );
  const [ratingSeasonMonth, setRatingSeasonMonth] = useState(
    () =>
      tournament.ratingSeasonMonth != null
        ? String(tournament.ratingSeasonMonth)
        : "",
  );
  const [saving, setSaving] = useState(false);
  const ratingTableHydratedRef = useRef(false);

  useEffect(() => {
    setGuaranteeEnabled(tournament.ratingGuaranteeEnabled ?? false);
    setPointsCoef(String(tournament.ratingPointsCoefficient ?? 1));
    setBountyCoef(String(tournament.ratingBountyCoefficient ?? 1));
    setGuaranteeBonusPoints(String(tournament.ratingGuaranteeBonusPoints ?? 10));
    setRatingEnabled(tournament.ratingEnabled ?? true);
    setRatingSeasonYear(
      tournament.ratingSeasonYear != null
        ? String(tournament.ratingSeasonYear)
        : "",
    );
    setRatingSeasonMonth(
      tournament.ratingSeasonMonth != null
        ? String(tournament.ratingSeasonMonth)
        : "",
    );
  }, [
    tournament.id,
    tournament.ratingGuaranteeEnabled,
    tournament.ratingGuaranteeBonusPoints,
    tournament.ratingPointsCoefficient,
    tournament.ratingBountyCoefficient,
    tournament.ratingEnabled,
    tournament.ratingSeasonYear,
    tournament.ratingSeasonMonth,
  ]);

  useEffect(() => {
    setRatingTableId(tournament.ratingTableId ?? 1);
  }, [tournament.id]);

  useEffect(() => {
    ratingTableHydratedRef.current = false;
  }, [tournament.id]);

  useEffect(() => {
    if (
      !ratingTableHydratedRef.current &&
      tournament.ratingTableId != null &&
      Number.isFinite(tournament.ratingTableId)
    ) {
      ratingTableHydratedRef.current = true;
      setRatingTableId(Math.trunc(tournament.ratingTableId));
    }
  }, [tournament.ratingTableId]);

  const handleSave = async () => {
    const parsedPoints = parseFloat(pointsCoef);
    const parsedBounty = parseFloat(bountyCoef);
    const parsedBonus = Number.parseInt(guaranteeBonusPoints.trim(), 10);
    if (!Number.isFinite(parsedPoints) || parsedPoints < 0) {
      toast({ type: "error", message: "Коэффициент баллов должен быть ≥ 0" });
      return;
    }
    if (!Number.isFinite(parsedBounty) || parsedBounty < 0) {
      toast({ type: "error", message: "Коэффициент баунти должен быть ≥ 0" });
      return;
    }
    if (!Number.isFinite(parsedBonus) || parsedBonus < 0) {
      toast({
        type: "error",
        message: "Бонус гарантии должен быть целым числом ≥ 0",
      });
      return;
    }

    const yStr = ratingSeasonYear.trim();
    const mStr = ratingSeasonMonth.trim();
    const hasY = yStr !== "";
    const hasM = mStr !== "";
    if (ratingEnabled && hasY !== hasM) {
      toast({
        type: "error",
        message:
          "Сезон: укажите и год, и месяц (2000–2100 и 1–12), либо оставьте оба поля пустыми",
      });
      return;
    }
    let nextSeasonYear: number | null = null;
    let nextSeasonMonth: number | null = null;
    if (ratingEnabled && hasY && hasM) {
      const yi = Number.parseInt(yStr, 10);
      const mi = Number.parseInt(mStr, 10);
      if (
        !Number.isInteger(yi) ||
        yi < 2000 ||
        yi > 2100 ||
        !Number.isInteger(mi) ||
        mi < 1 ||
        mi > 12
      ) {
        toast({
          type: "error",
          message: "Год сезона: 2000–2100, месяц: 1–12",
        });
        return;
      }
      nextSeasonYear = yi;
      nextSeasonMonth = mi;
    }

    const prevY = tournament.ratingSeasonYear ?? null;
    const prevM = tournament.ratingSeasonMonth ?? null;
    const newY = ratingEnabled ? nextSeasonYear : null;
    const newM = ratingEnabled ? nextSeasonMonth : null;
    const seasonChanged =
      prevY !== newY || prevM !== newM;
    if (
      tournament.status === "Completed" &&
      seasonChanged &&
      typeof window !== "undefined" &&
      !window.confirm(
        "Очки в сезонном рейтинге будут учитываться в выбранном месяце/годе",
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const rtResolved = Math.max(
        1,
        Math.floor(
          Number.isFinite(ratingTableId)
            ? ratingTableId
            : tournament.ratingTableId ?? 1,
        ),
      );
      await patchTournamentRatingSettings(environment, tournament, {
        ratingGuaranteeEnabled: guaranteeEnabled,
        ratingGuaranteeBonusPoints: parsedBonus,
        ratingPointsCoefficient: parsedPoints,
        ratingBountyCoefficient: parsedBounty,
        ratingTableId: rtResolved,
        ...(ratingEnabled === false
          ? {
              ratingEnabled: false,
              ratingSeasonYear: null,
              ratingSeasonMonth: null,
            }
          : {
              ratingEnabled: true,
              ratingSeasonYear: newY,
              ratingSeasonMonth: newM,
            }),
      });
      const fresh = await getTournament(environment, String(tournament.id));
      if (fresh?.ratingTableId != null && Number.isFinite(fresh.ratingTableId)) {
        setRatingTableId(Math.trunc(fresh.ratingTableId));
      } else {
        setRatingTableId(rtResolved);
      }
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
          checked={ratingEnabled}
          onCheckedChange={(v) => setRatingEnabled(v === true)}
          id="rating-enabled-main"
        />
        <label htmlFor="rating-enabled-main" style={{ cursor: "pointer" }}>
          <Typography.Text size="small">Учитывать в рейтинге</Typography.Text>
        </label>
      </Box>

      {ratingEnabled ? (
        <Box flex={{ col: true, gap: 2 }} style={{ maxWidth: 420 }}>
          <Typography.Text size="xSmall" type="secondary">
            Сезон для сезонного рейтинга (необязательно): год и месяц вместе или
            оба пусто.
          </Typography.Text>
          <Box flex={{ gap: 3, align: "flex-end", flexWrap: "wrap" }}>
            <Box style={{ width: 140 }}>
              <Input
                label="Год сезона"
                value={ratingSeasonYear}
                onChange={(e) => setRatingSeasonYear(e.target.value)}
                placeholder="2026"
                type="primary"
                size="medium"
              />
            </Box>
            <Box style={{ minWidth: 180 }}>
              <Typography.Text
                size="small"
                type="secondary"
                style={{ display: "block", marginBottom: 6 }}
              >
                Месяц сезона
              </Typography.Text>
              <select
                value={ratingSeasonMonth}
                onChange={(e) => setRatingSeasonMonth(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.12)",
                  backgroundColor: "var(--background-primary)",
                  fontSize: 14,
                }}
              >
                <option value="">—</option>
                {seasonSelectMonthOptions().map((opt) => (
                  <option key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography.Text size="small" type="secondary">
          Рейтинг отключён: очки не начисляются (спецформат). Сезон не
          применяется.
        </Typography.Text>
      )}

      <Box flex={{ col: true, gap: 1 }} style={{ maxWidth: 420 }}>
        <Typography.Text size="small" type="secondary">
          Таблица рейтинга
        </Typography.Text>
        <select
          value={ratingTableId}
          onChange={(e) => setRatingTableId(Number(e.target.value))}
          disabled={ratingTablesLoading || ratingTables.length === 0}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.12)",
            backgroundColor: "var(--background-primary)",
            fontSize: 14,
          }}
        >
          {ratingTables.map((t) => (
            <option key={t.id} value={t.id}>
              {getRatingTableDisplayName(t)}
            </option>
          ))}
        </select>
        <Typography.Text size="xSmall" type="secondary">
          Сохраняется вместе с настройками ниже; на вкладке «Турнир» можно
          сменить таблицу отдельно.
        </Typography.Text>
      </Box>

      <Box flex={{ align: "center", gap: 3 }}>
        <Checkbox
          size="medium"
          checked={guaranteeEnabled}
          onCheckedChange={(v) => setGuaranteeEnabled(v === true)}
          id="rating-guarantee"
        />
        <label htmlFor="rating-guarantee" style={{ cursor: "pointer" }}>
          <Typography.Text size="small">
            Гарантия рейтинга (бонус к базе для мест 1–10)
          </Typography.Text>
        </label>
      </Box>

      <Box style={{ maxWidth: 420 }}>
        <Input
          label="Бонус гарантии (места 1–10)"
          value={guaranteeBonusPoints}
          onChange={(e) => setGuaranteeBonusPoints(e.target.value)}
          type="primary"
          size="medium"
          disabled={!guaranteeEnabled}
          title={
            !guaranteeEnabled
              ? "Включите гарантию рейтинга — иначе значение не используется при расчёте"
              : undefined
          }
        />
        <Typography.Text
          size="xSmall"
          type="secondary"
          style={{ display: "block", marginTop: 6 }}
        >
          Сколько баллов добавляется к базе при включённой гарантии для топ‑10;
          по умолчанию 10
        </Typography.Text>
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
          Итог: (база
          {guaranteeEnabled
            ? ` + ${guaranteeBonusPoints.trim() || "10"} для топ-10`
            : ""}
          ) × {pointsCoef || "1"} + баунти × {bountyCoef || "1"}
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
