'use client';

import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Box } from '@/components/Box/Box';
import { Typography } from '@/components/Typography/Typography';
import { SimpleList } from '@/components/SimpleList/SimpleList';
import { DateTimeFormatter } from '@/components/Formatter/DateTimeFormatter/DateTimeFormatter';
import { PageLayout } from '@/components/PageLayout/PageLayout';
import { useEnvironment } from '@/core/states/environment/useEnvironment';
import { ShortTournament } from '@/core/states/tournaments/requests/getTournaments';
import { getPublicTournaments } from '@/core/states/tournaments/requests/getPublicTournaments';
import { TournamentStatus, tournamentStatusLabels } from '@/core/states/tournaments/common/TournamentStatus';
import { nextLinkCls } from '@/core/utils/style/nextLink.css';

const STATUS_TEXT_TYPE: Record<TournamentStatus, 'buy' | 'sky' | 'secondary'> = {
  InProgress: 'buy',
  RegistrationOpen: 'sky',
  Completed: 'secondary',
};

export const PublicTournamentsView: FC = () => {
  const environment = useEnvironment();
  const [tournaments, setTournaments] = useState<ShortTournament[] | null>(null);

  useEffect(() => {
    getPublicTournaments(environment.apiUrl).then(setTournaments);
  }, [environment.apiUrl]);

  return (
    <Box
      flex={{ col: true }}
      style={{
        minHeight: 'var(--app-min-page-height)',
        backgroundColor: 'var(--background-primary)',
      }}
    >
      <Box
        padding={[4, 2]}
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <PageLayout>
          <Typography.Title level={3}>Турниры</Typography.Title>
        </PageLayout>
      </Box>

      <PageLayout>
        <Box flex={{ col: true, gap: 4, width: '100%' }} padding={[8, 0]}>
          {tournaments === null ? (
            <Box
              flex={{ align: 'center', justify: 'center' }}
              style={{ minHeight: 200 }}
            >
              <Loader2
                size={32}
                style={{
                  animation: 'spin 1s linear infinite',
                  color: 'var(--text-primary)',
                }}
              />
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </Box>
          ) : tournaments.length === 0 ? (
            <SimpleList.EmptyState>Нет активных турниров</SimpleList.EmptyState>
          ) : (
            tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournament/${tournament.id}/display`}
                className={nextLinkCls({ justify: true })}
              >
                <SimpleList.Card>
                  <SimpleList.Column>
                    <Typography.Text size="small" type="secondary">
                      Дата
                    </Typography.Text>
                    <Typography.Text>
                      <DateTimeFormatter value={tournament.date} type="date" />
                    </Typography.Text>
                  </SimpleList.Column>

                  <SimpleList.Column>
                    <Typography.Text size="small" type="secondary">
                      Время
                    </Typography.Text>
                    <Typography.Text>
                      <DateTimeFormatter value={tournament.date} type="time" />
                    </Typography.Text>
                  </SimpleList.Column>

                  <SimpleList.Column>
                    <Typography.Text size="small" type="secondary">
                      Название турнира
                    </Typography.Text>
                    <Typography.Text bold>{tournament.name}</Typography.Text>
                  </SimpleList.Column>

                  <SimpleList.Column minWidth={140}>
                    <Typography.Text size="small" type="secondary">
                      Статус
                    </Typography.Text>
                    <Typography.Text
                      bold
                      type={STATUS_TEXT_TYPE[tournament.status]}
                    >
                      {tournamentStatusLabels[tournament.status]}
                    </Typography.Text>
                  </SimpleList.Column>
                </SimpleList.Card>
              </Link>
            ))
          )}
        </Box>
      </PageLayout>
    </Box>
  );
};
