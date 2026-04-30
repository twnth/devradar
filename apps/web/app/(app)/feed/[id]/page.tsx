"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, ExternalLink, LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { FeedCard } from "@/components/feed/feed-card";
import { useFeedBriefing, useFeedItem, useFeedItems } from "@/lib/hooks";
import { Card, ErrorState, SectionHeader, SourceBadge, TagPill } from "@devradar/ui";

function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}

function trimText(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

function getPreviewText(rawPayload: Record<string, unknown>) {
  const candidates = [
    rawPayload.body,
    rawPayload.text,
    rawPayload.summary,
    rawPayload.description
  ];

  const firstText = candidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0
  );

  return typeof firstText === "string" ? trimText(firstText.trim(), 900) : null;
}

function getSourceHost(rawUrl: string) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return rawUrl;
  }
}

function getSourceContext(rawPayload: Record<string, unknown>) {
  if (typeof rawPayload.tag_name === "string") {
    return {
      label: "Release context",
      lines: [
        `릴리즈 태그: ${rawPayload.tag_name}`,
        `프리릴리즈: ${rawPayload.prerelease ? "예" : "아니오"}`,
        `릴리즈 작성자: ${
          typeof rawPayload.author === "object" && rawPayload.author && "login" in rawPayload.author
            ? String(rawPayload.author.login)
            : "확인 불가"
        }`
      ]
    };
  }

  if (typeof rawPayload.score === "number" || typeof rawPayload.descendants === "number") {
    return {
      label: "Community context",
      lines: [
        `Hacker News 점수: ${typeof rawPayload.score === "number" ? rawPayload.score : "-"}`,
        `댓글 수: ${typeof rawPayload.descendants === "number" ? rawPayload.descendants : "-"}`,
        `제출자: ${typeof rawPayload.by === "string" ? rawPayload.by : "확인 불가"}`
      ]
    };
  }
}

export default function FeedDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useFeedItem(params.id);
  const briefingQuery = useFeedBriefing(params.id);
  const relatedFeedQuery = useFeedItems({ limit: 18 });

  const previewText = useMemo(
    () => (data ? getPreviewText(data.rawPayload) : null),
    [data]
  );

  const sourceContext = useMemo(
    () => (data ? getSourceContext(data.rawPayload) : null),
    [data]
  );

  const relatedItems = useMemo(() => {
    if (!data) {
      return [];
    }

    return (relatedFeedQuery.data ?? [])
      .filter((item) => item.id !== data.id)
      .map((item) => ({
        item,
        overlap: item.tags.filter((tag) => data.tags.includes(tag)).length
      }))
      .filter(({ item, overlap }) => overlap > 0 || item.category === data.category)
      .sort((left, right) => {
        if (right.overlap !== left.overlap) {
          return right.overlap - left.overlap;
        }
        return new Date(right.item.publishedAt).getTime() - new Date(left.item.publishedAt).getTime();
      })
      .slice(0, 3)
      .map(({ item }) => item);
  }, [data, relatedFeedQuery.data]);

  if (isLoading) {
    return null;
  }

  if (!data) {
    return <ErrorState title="피드 항목을 찾지 못했습니다." />;
  }

  return (
    <div className="space-y-6">
      <Link href="/feed" className="inline-flex items-center gap-2 text-sm text-muted">
        <ArrowLeft className="size-4" />
        피드로 돌아가기
      </Link>

      <Card className="max-w-full overflow-hidden p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <TagPill label={data.category.toUpperCase()} />
          <SourceBadge label={data.sourceName} />
          <TagPill label={data.actionLabel} />
        </div>
        <div className="mt-5 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 max-w-4xl">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{data.title}</h1>
            <p className="mt-5 text-base leading-8 text-muted">{data.summaryKo}</p>
            <a
              href={data.url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl3 border border-line bg-elevated px-4 py-3 text-sm text-accent"
            >
              원문 열기
              <ExternalLink className="size-4" />
            </a>
          </div>
          <div className="w-full rounded-xl3 border border-line bg-elevated p-5 xl:min-w-[220px] xl:w-auto">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Source snapshot</p>
            <p className="mt-3 text-sm text-muted">{data.sourceName}</p>
            <p className="mt-2 text-sm text-muted">{formatDate(data.publishedAt)}</p>
            <p className="mt-4 text-sm leading-7 text-muted">{data.whyItMattersKo}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="max-w-full overflow-hidden p-6 sm:p-8">
          <SectionHeader
            title={briefingQuery.data?.title ?? "GPT 요약"}
            description="원문과 메타데이터를 바탕으로 핵심만 짧게 정리했습니다."
          />
          {briefingQuery.isFetching && !briefingQuery.data ? (
            <div className="mt-6 rounded-xl3 border border-line bg-elevated p-5">
              <div className="flex items-center gap-3 text-sm text-muted">
                <LoaderCircle className="size-4 animate-spin text-accent" />
                <span>GPT 브리핑을 생성하는 중입니다.</span>
              </div>
            </div>
          ) : null}
          {briefingQuery.data ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl3 border border-line bg-elevated p-5">
                <p className="text-sm leading-7 text-foreground">{briefingQuery.data.summary}</p>
              </div>
              {briefingQuery.data.keyPoints.map((bullet) => (
                <div key={bullet} className="rounded-xl3 border border-line bg-elevated p-5">
                  <p className="text-sm leading-7 text-foreground">{bullet}</p>
                </div>
              ))}
            </div>
          ) : null}

          {!briefingQuery.data ? (
            <div className="mt-8 rounded-xl3 border border-line bg-elevated p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">기본 요약</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                <p>{data.summaryKo}</p>
                <p>{data.whyItMattersKo}</p>
              </div>
            </div>
          ) : null}

          {previewText ? (
            <div className="mt-8 rounded-xl3 border border-line bg-elevated p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">원문 미리보기</p>
              <pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-muted">{previewText}</pre>
            </div>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card className="max-w-full overflow-hidden p-6">
            <SectionHeader title={sourceContext?.label ?? "Metadata"} description="소스 성격과 원문 메타데이터입니다." />
            <div className="mt-6 space-y-3 text-sm text-muted">
              <p>Source: {data.sourceName}</p>
              <p>Author: {data.author ?? "확인 불가"}</p>
              <p>Published: {formatDate(data.publishedAt)}</p>
              <p>Fetched: {formatDate(data.fetchedAt)}</p>
              {sourceContext?.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <div className="flex flex-wrap gap-2 pt-2">
                {data.tags.map((tag) => (
                  <TagPill key={tag} label={tag} />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-8">
        <SectionHeader
          title="관련 피드"
          description="같은 태그나 카테고리로 연결되는 항목들입니다."
        />
        <div className="mt-6 space-y-4">
          {relatedItems.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
          {relatedItems.length === 0 ? (
            <div className="rounded-xl3 border border-dashed border-line bg-elevated p-5 text-sm text-muted">
              아직 연결할 관련 피드가 충분하지 않습니다.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
