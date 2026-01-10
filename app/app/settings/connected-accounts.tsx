"use client";

import { useState } from "react";
import { disconnectAccount } from "./actions";
import { Github, Chrome, Gitlab } from "lucide-react";

interface Account {
  id: string;
  provider: string;
  providerAccountId: string;
}

interface ConnectedAccountsProps {
  accounts: Account[];
}

const providerConfig = {
  google: {
    icon: Chrome,
    name: "Google",
    color: "text-blue-600",
  },
  github: {
    icon: Github,
    name: "GitHub",
    color: "text-gray-900",
  },
  gitlab: {
    icon: Gitlab,
    name: "GitLab",
    color: "text-orange-600",
  },
};

export function ConnectedAccounts({ accounts }: ConnectedAccountsProps) {
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localAccounts, setLocalAccounts] = useState(accounts);

  async function handleDisconnect(accountId: string) {
    if (!confirm("Are you sure you want to disconnect this account?")) {
      return;
    }

    setDisconnecting(accountId);
    setError(null);

    const result = await disconnectAccount(accountId);

    setDisconnecting(null);

    if (result.success) {
      setLocalAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
    } else {
      setError(result.error || "Failed to disconnect account");
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {localAccounts.length === 0 ? (
        <div className="text-center py-8 text-text/60">
          No connected accounts
        </div>
      ) : (
        <div className="space-y-3">
          {localAccounts.map((account) => {
            const config =
              providerConfig[account.provider as keyof typeof providerConfig];
            const Icon = config?.icon || Chrome;

            return (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border border-text/10 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`${config?.color || "text-gray-600"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-text">
                      {config?.name || account.provider}
                    </p>
                    <p className="text-xs text-text/60 mt-0.5">
                      Account ID: {account.providerAccountId.slice(0, 20)}...
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDisconnect(account.id)}
                  disabled={
                    disconnecting === account.id || localAccounts.length === 1
                  }
                  className="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    localAccounts.length === 1
                      ? "Cannot disconnect your only authentication method"
                      : "Disconnect account"
                  }
                >
                  {disconnecting === account.id
                    ? "Disconnecting..."
                    : "Disconnect"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-4 border-t border-text/10">
        <p className="text-xs text-text/60">
          You can connect additional authentication providers by logging in with
          them. All accounts with the same email address will be automatically
          linked.
        </p>
      </div>
    </div>
  );
}
