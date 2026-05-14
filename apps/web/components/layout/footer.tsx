export function Footer() {
  return (
    <footer className="border-t border-line bg-[#090b12]">
      <div className="mx-auto flex w-full min-w-0 max-w-[1920px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex flex-col gap-2">
          <h2 className="text-lg font-medium tracking-tight text-foreground">DevRadar</h2>
          <p className="max-w-full break-words text-sm text-muted">Developer news and security patch radar</p>
        </div>

        <div className="min-w-0 flex flex-col gap-3 xl:items-end">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
            <span>
              Built by <span className="text-foreground">onigiriman</span>
            </span>
            <span className="hidden text-line sm:inline">|</span>
            <a
              href="https://github.com/twnth"
              target="_blank"
              rel="noreferrer"
              className="break-all transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <span className="hidden text-line sm:inline">|</span>
            <a
              href="mailto:twnthbb@gmail.com"
              className="break-all transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </div>
          <p className="text-xs text-muted">© 2026 DevRadar</p>
        </div>
      </div>
    </footer>
  );
}
