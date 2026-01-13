"use client";

import { useState } from "react";
import { Copy, ExternalLink, Check } from "lucide-react";

interface PortalLinkGeneratorProps {
  projectId: string;
  portalPublicKey: string | null;
  portalEnabled: boolean;
}

export function PortalLinkGenerator({
  projectId,
  portalPublicKey,
  portalEnabled,
}: PortalLinkGeneratorProps) {
  const [copied, setCopied] = useState(false);

  if (!portalPublicKey || !portalEnabled) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Client Portal Access
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          The client portal is not yet enabled for this project. Portal links allow
          clients to view approved scope versions and sign approval requests.
        </p>
        <p className="text-xs text-gray-500">
          Portal configuration will be available in project settings (coming soon).
        </p>
      </div>
    );
  }

  const portalUrl = `${window.location.origin}/p/${portalPublicKey}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
      <h3 className="text-sm font-medium text-blue-900 mb-2">
        Client Portal Link
      </h3>
      <p className="text-sm text-blue-700 mb-4">
        Share this link with clients to give them access to approved scope versions
        and approval requests.
      </p>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={portalUrl}
          readOnly
          className="flex-1 px-3 py-2 text-sm bg-white border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-100 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open
        </a>
      </div>
    </div>
  );
}
