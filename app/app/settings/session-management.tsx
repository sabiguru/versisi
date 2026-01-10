"use client";

import { useState } from "react";
import { revokeSession, revokeAllOtherSessions } from "./actions";
import { Monitor, Smartphone, Tablet } from "lucide-react";

interface Session {
  id: string;
  sessionToken: string;
  expires: Date;
}

interface SessionManagementProps {
  sessions: Session[];
  currentSessionToken?: string;
}

export function SessionManagement({
  sessions,
  currentSessionToken,
}: SessionManagementProps) {
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localSessions, setLocalSessions] = useState(sessions);

  async function handleRevokeSession(sessionId: string) {
    if (!confirm("Are you sure you want to revoke this session?")) {
      return;
    }

    setRevoking(sessionId);
    setError(null);

    const result = await revokeSession(sessionId);

    setRevoking(null);

    if (result.success) {
      setLocalSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } else {
      setError(result.error || "Failed to revoke session");
    }
  }

  async function handleRevokeAllOther() {
    if (
      !confirm(
        "Are you sure you want to revoke all other sessions? You will be logged out on all other devices."
      )
    ) {
      return;
    }

    if (!currentSessionToken) {
      setError("Cannot determine current session");
      return;
    }

    setRevokingAll(true);
    setError(null);

    const result = await revokeAllOtherSessions(currentSessionToken);

    setRevokingAll(false);

    if (result.success) {
      setLocalSessions((prev) =>
        prev.filter((s) => s.sessionToken === currentSessionToken)
      );
    } else {
      setError(result.error || "Failed to revoke sessions");
    }
  }

  const currentSession = localSessions.find(
    (s) => s.sessionToken === currentSessionToken
  );
  const otherSessions = localSessions.filter(
    (s) => s.sessionToken !== currentSessionToken
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {localSessions.length === 0 ? (
        <div className="text-center py-8 text-text/60">No active sessions</div>
      ) : (
        <>
          {currentSession && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-text">Current Session</h3>
              <div className="p-4 border-2 border-accent/20 bg-accent/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-medium text-text">This device</p>
                      <p className="text-xs text-text/60 mt-0.5">
                        Expires{" "}
                        {new Date(currentSession.expires).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {otherSessions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text">
                  Other Sessions ({otherSessions.length})
                </h3>
                <button
                  type="button"
                  onClick={handleRevokeAllOther}
                  disabled={revokingAll}
                  className="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {revokingAll ? "Revoking..." : "Revoke All"}
                </button>
              </div>
              <div className="space-y-3">
                {otherSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-text/10 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-text/60" />
                      <div>
                        <p className="font-medium text-text">Other device</p>
                        <p className="text-xs text-text/60 mt-0.5">
                          Expires{" "}
                          {new Date(session.expires).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revoking === session.id}
                      className="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {revoking === session.id ? "Revoking..." : "Revoke"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="pt-4 border-t border-text/10">
        <p className="text-xs text-text/60">
          Sessions allow you to stay logged in on different devices. Revoking a
          session will log you out on that device.
        </p>
      </div>
    </div>
  );
}
