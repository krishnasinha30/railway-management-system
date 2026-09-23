import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrains } from '../features/trains/trainSlice';
import { fetchAnnouncements } from '../features/announcements/announcementSlice';
import { Portal } from './TrainSearchPage';
import useSocket from '../hooks/useSocket';

export default function StationBoardPage() {
  const dispatch = useDispatch();
  const { trains } = useSelector((s) => s.trains);
  const { items } = useSelector((s) => s.announcements);

  useEffect(() => {
    dispatch(fetchTrains());
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const refreshTrains = useCallback(() => dispatch(fetchTrains()), [dispatch]);
  const refreshAnnouncements = useCallback(() => dispatch(fetchAnnouncements()), [dispatch]);

  // Socket.io listener for the station board: when a train or announcement is updated
  // in MongoDB, the server emits a named event and this page refreshes instantly.
  useSocket({ onTrainUpdated: refreshTrains, onAnnouncementCreated: refreshAnnouncements });

  return (
    <Portal title="Station board" eyebrow="New Delhi · NDLS">
      <div className="mb-5 flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
        Live Demo Update
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_.6fr]">
        <section className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
          <div className="bg-ink px-6 py-5 text-white">
            <p className="font-bold">Upcoming departures</p>
            <p className="mt-1 text-sm text-white/55">Live operational view</p>
          </div>
          <div className="divide-y divide-ink/10">
            {trains.map((t) => (
              <div key={t._id} className="flex items-center justify-between gap-4 px-6 py-5">
                <div>
                  <p className="font-bold">{t.trainNumber} · {t.trainName}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Departure {t.scheduledDeparture || 'TBA'} · Platform {t.platformNumber || 'TBA'}
                  </p>
                </div>
                <span className={t.status === 'Delayed' ? 'text-sm font-bold text-flare' : 'text-sm font-bold text-emerald-600'}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-3xl border border-ink/10 bg-white p-6">
          <p className="font-bold">Announcements</p>
          <div className="mt-5 grid gap-5">
            {items.map((a) => (
              <article key={a._id}>
                <p className="text-sm font-bold">{a.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{a.message}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </Portal>
  );
}
