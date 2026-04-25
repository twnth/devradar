"use client";

export function SettingsForm({
  settings
}: {
  settings: {
    notifications: { inApp: boolean; email: boolean; webPush: boolean };
    digestHour: string;
    theme: string;
    sourceFilters: string[];
  };
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl3 border border-line bg-panel p-6">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="mt-5 space-y-4 text-sm text-muted">
          <label className="flex items-center justify-between rounded-2xl border border-line bg-elevated px-4 py-3">
            <span>In-app</span>
            <input type="checkbox" defaultChecked={settings.notifications.inApp} />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-line bg-elevated px-4 py-3">
            <span>Email</span>
            <input type="checkbox" defaultChecked={settings.notifications.email} />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-line bg-elevated px-4 py-3">
            <span>Web Push</span>
            <input type="checkbox" defaultChecked={settings.notifications.webPush} />
          </label>
        </div>
      </div>
      <div className="rounded-xl3 border border-line bg-panel p-6">
        <h3 className="text-lg font-semibold">Digest & Sources</h3>
        <div className="mt-5 space-y-4 text-sm text-muted">
          <div className="rounded-2xl border border-line bg-elevated px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em]">Digest hour</div>
            <div className="mt-2 mono">{settings.digestHour}</div>
          </div>
          <div className="rounded-2xl border border-line bg-elevated px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em]">Theme</div>
            <div className="mt-2">{settings.theme}</div>
          </div>
          <div className="rounded-2xl border border-line bg-elevated px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em]">Sources</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {settings.sourceFilters.map((source) => (
                <span key={source} className="rounded-full border border-line px-3 py-1 text-xs">
                  {source}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
