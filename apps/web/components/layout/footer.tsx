export function Footer() {
  return (
    <footer className="border-t border-line bg-[#090b12]">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-6 px-6 py-8 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium tracking-tight text-foreground">DevRadar</h2>
          <p className="text-sm text-muted">Developer news and security patch radar, 사랑합니다 여러분</p>
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            <span>
              Built by <span className="text-foreground">onigiriman</span>
            </span>
            <span className="text-line">|</span>
            <a
              href="https://github.com/twnth"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <span className="text-line">|</span>
            <a
              href="mailto:twnthbb@gmail.com"
              className="transition-colors hover:text-foreground"
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
