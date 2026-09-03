"use client";

import { useEffect, useState, useTransition } from "react";
import {
  removeSubjectMappingAction,
  setSubjectMappingAction,
} from "@/app/actions/subjectMappings";
import type { SubjectChannelMapping } from "@/lib/types";

interface Team {
  id: string;
  displayName: string;
}
interface Channel {
  id: string;
  displayName: string;
}

const FIELD =
  "border-b border-line bg-transparent px-0 py-1.5 text-sm text-text placeholder:text-text-dim focus:border-accent focus:outline-none";

export function SubjectMappingManager({
  mappings,
  connected,
}: {
  mappings: SubjectChannelMapping[];
  connected: boolean;
}) {
  const [subject, setSubject] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [teamId, setTeamId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!connected) return;
    fetch("/api/graph/teams")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setLoadError(data.error);
        else setTeams(data.teams ?? []);
      })
      .catch(() => setLoadError("Teams konnten nicht geladen werden"));
  }, [connected]);

  useEffect(() => {
    if (!teamId) return;
    fetch(`/api/graph/teams/${teamId}/channels`)
      .then((r) => r.json())
      .then((data) => setChannels(data.channels ?? []))
      .catch(() => setLoadError("Kanäle konnten nicht geladen werden"));
  }, [teamId]);

  function handleTeamChange(nextTeamId: string) {
    setTeamId(nextTeamId);
    setChannelId("");
    setChannels([]);
  }

  if (!connected) return null;

  const selectedTeam = teams.find((t) => t.id === teamId);
  const selectedChannel = channels.find((c) => c.id === channelId);

  function handleAdd() {
    if (!subject || !teamId || !channelId) return;
    const formData = new FormData();
    formData.set("subject", subject);
    formData.set("teamId", teamId);
    formData.set("teamName", selectedTeam?.displayName ?? "");
    formData.set("channelId", channelId);
    formData.set("channelName", selectedChannel?.displayName ?? "");
    startTransition(async () => {
      await setSubjectMappingAction(formData);
      setSubject("");
      setTeamId("");
      setChannelId("");
    });
  }

  return (
    <section className="border border-line bg-surface p-5">
      <h2 className="text-sm font-medium text-text">Fach ↔ Teams-Kanal</h2>

      {mappings.length > 0 && (
        <ul className="mt-4 divide-y divide-line">
          {mappings.map((m) => (
            <li key={m.subject} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm text-text">{m.subject}</p>
                <p className="text-xs text-text-dim">
                  {m.teamName ?? m.teamId} / {m.channelName ?? m.channelId}
                </p>
              </div>
              <button
                onClick={() =>
                  startTransition(() => removeSubjectMappingAction(m.subject))
                }
                className="text-xs text-text-dim hover:text-danger"
              >
                Entfernen
              </button>
            </li>
          ))}
        </ul>
      )}

      {loadError && <p className="mt-2 text-xs text-danger">{loadError}</p>}

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Fach, z. B. Mathematik"
          className={`${FIELD} flex-1`}
        />
        <select
          value={teamId}
          onChange={(e) => handleTeamChange(e.target.value)}
          className={FIELD}
        >
          <option value="">Team wählen…</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.displayName}
            </option>
          ))}
        </select>
        <select
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          disabled={!teamId}
          className={`${FIELD} disabled:opacity-50`}
        >
          <option value="">Kanal wählen…</option>
          {channels.map((c) => (
            <option key={c.id} value={c.id}>
              {c.displayName}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={isPending || !subject || !teamId || !channelId}
          className="bg-accent px-3 py-1.5 text-sm text-bg disabled:opacity-40"
        >
          Zuordnen
        </button>
      </div>
    </section>
  );
}
