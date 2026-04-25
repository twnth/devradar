"use client";

import { Github, ShieldAlert, Newspaper } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
      <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-xl3 border border-line bg-panel/95 p-10 shadow-panel">
          <p className="metric-chip">DevRadar MVP</p>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight">
            개발 뉴스는 빠르게, 보안 패치는 더 빠르게.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
            AI, Web, App, Backend 최신 흐름과 긴급 업그레이드 알림을 한 화면에서
            보는 개발자용 대시보드입니다.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-line bg-elevated p-5">
              <Newspaper className="text-accent" />
              <h2 className="mt-4 text-lg font-semibold">실시간 피드</h2>
              <p className="mt-2 text-sm text-muted">읽을 가치가 있는 변화만 빠르게 압축합니다.</p>
            </div>
            <div className="rounded-2xl border border-line bg-elevated p-5">
              <ShieldAlert className="text-critical" />
              <h2 className="mt-4 text-lg font-semibold">긴급 패치 레이더</h2>
              <p className="mt-2 text-sm text-muted">CVE, GHSA, OSV를 패키지 관점에서 바로 해석합니다.</p>
            </div>
            <div className="rounded-2xl border border-line bg-elevated p-5">
              <Github className="text-foreground" />
              <h2 className="mt-4 text-lg font-semibold">GitHub 로그인</h2>
              <p className="mt-2 text-sm text-muted">MVP에서는 GitHub 계정으로 바로 진입합니다.</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl3 border border-line bg-[#0f1320] p-10 shadow-panel">
          <p className="text-sm uppercase tracking-[0.22em] text-muted">Welcome back</p>
          <h2 className="mt-4 text-3xl font-semibold">DevRadar 시작하기</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            워치리스트를 먼저 등록하면 보안 사고가 실제로 나와 관련 있는지 더 빨리 판단할 수 있습니다.
          </p>
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent px-5 py-4 font-medium text-white transition hover:brightness-110"
          >
            <Github className="size-5" />
            GitHub로 로그인
          </button>
          <div className="mt-8 rounded-2xl border border-critical/30 bg-critical/10 p-5">
            <p className="text-sm font-medium text-critical">긴급 알림은 별도 레인으로 분리됩니다.</p>
            <p className="mt-2 text-sm leading-7 text-muted">
              DevRadar는 일반 뉴스와 보안 사고를 섞지 않습니다. 먼저 패치가 필요한지부터 보여줍니다.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
