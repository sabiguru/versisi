"use client";

import { useState } from "react";
import { User, Mail, Calendar } from "lucide-react";
import { EditProfileForm } from "./edit-profile-form";

interface ProfileSectionProps {
  email: string;
  name: string | null;
  createdAt: Date;
}

export function ProfileSection({ email, name, createdAt }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  function handleSuccess() {
    setIsEditing(false);
    // Refresh the page to show updated data
    window.location.reload();
  }

  return (
    <section id="profile" className="bg-white rounded-lg border border-text/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-semibold text-text">
          Profile Information
        </h2>
      </div>

      {isEditing ? (
        <EditProfileForm
          currentName={name}
          onCancel={() => setIsEditing(false)}
          onSuccess={handleSuccess}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg border border-text/10">
                <p className="text-text">{email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Display Name
              </label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg border border-text/10">
                <p className="text-text">{name || "Not set"}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text/70 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Member Since
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg border border-text/10">
              <p className="text-text">
                {new Date(createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-text/10">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
