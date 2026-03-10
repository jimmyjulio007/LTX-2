"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import Image from "next/image";
import { Camera, Save, Loader2, Trash2, Mail, Shield } from "lucide-react";
import {
  updateUser,
  changeEmail,
  deleteUser,
  useSession,
  getInitials,
  getDisplayName,
  type User,
} from "@/shared/lib/auth-client";
import { useToast } from "@/shared/ui/toast";

export default function ProfileContent({ user: initialUser }: { user: User }) {
  const t = useTranslations("Profile");
  const tToast = useTranslations("Toast");
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { data: session } = useSession();
  const user = session?.user ?? initialUser;

  const [name, setName] = useState(user.name || "");
  const [saving, setSaving] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      await updateUser({ name });
      success(t("profileUpdated"));
      router.refresh();
    } catch {
      showError(tToast("genericError"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    setChangingEmail(true);
    try {
      await changeEmail({ newEmail });
      success(t("emailSent"));
      setNewEmail("");
    } catch {
      showError(tToast("genericError"));
    } finally {
      setChangingEmail(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteUser();
      router.push("/");
    } catch {
      showError(tToast("genericError"));
      setDeleting(false);
    }
  };

  const inputClass =
    "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-[#eab308]/50 focus:border-[#eab308]/30 transition-all outline-none";

  return (
    <div className="p-8 max-w-2xl mx-auto w-full space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-5">
        <div className="relative group">
          {user.image ? (
            <Image
              src={user.image}
              alt={displayName}
              width={80}
              height={80}
              className="w-20 h-20 rounded-2xl object-cover border border-white/[0.08] shadow-[0_0_40px_rgba(234,179,8,0.15)]"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#eab308] to-[#ca8a04] flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.15)]">
              <span className="text-2xl font-black text-black">{initials}</span>
            </div>
          )}
          <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">{t("title")}</h1>
          <p className="text-slate-500 text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Shield className="w-3 h-3 text-[#eab308]" />
            <span className="text-xs text-[#eab308] font-semibold uppercase tracking-wider">
              {user.role || "USER"}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Name */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">{t("personalInfo")}</h2>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            {t("fullName")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("fullNamePlaceholder")}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            {t("emailLabel")}
          </label>
          <input type="email" value={user.email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
        </div>

        <button
          onClick={handleUpdateProfile}
          disabled={saving || name === (user.name || "")}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#eab308] to-[#ca8a04] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t("saveChanges")}
        </button>
      </section>

      {/* Change Email */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#eab308]" />
          <h2 className="text-lg font-semibold text-white">{t("changeEmail")}</h2>
        </div>
        <p className="text-xs text-slate-500">{t("changeEmailDesc")}</p>

        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder={t("newEmailPlaceholder")}
          className={inputClass}
        />

        <button
          onClick={handleChangeEmail}
          disabled={changingEmail || !newEmail}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-white/[0.08] bg-white/[0.04] text-white font-semibold text-sm hover:bg-white/[0.08] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {changingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {t("sendConfirmation")}
        </button>
      </section>

      {/* Danger Zone */}
      <section className="glass-card p-6 space-y-4 border-red-500/20">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-red-400">{t("dangerZone")}</h2>
        </div>
        <p className="text-xs text-slate-500">{t("deleteAccountDesc")}</p>

        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="px-6 py-3 rounded-lg border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/10 transition-colors"
          >
            {t("deleteAccount")}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-500/30 transition-colors disabled:opacity-40"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("confirmDelete")}
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              className="px-6 py-3 rounded-lg border border-white/[0.08] text-slate-400 font-semibold text-sm hover:bg-white/[0.04] transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
