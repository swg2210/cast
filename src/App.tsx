import { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/**
 * MVP Homepage + Market Detail
 * - Routing: /, /markets, /markets/:id
 * - PickDock: 하단 고정 2버튼 CTA
 * - PickBottomSheet: 픽하기 바텀시트
 * - OddsHistoryChart: recharts (mock history) + range tabs hook-up
 *
 * API 연동 시 주요 엔드포인트:
 * - GET /api/markets - 마켓 목록
 * - GET /api/markets/:id - 마켓 상세
 * - GET /api/odds/history/:id?range=1d - 확률 히스토리
 * - POST /api/picks - 픽 생성
 */

// ------------------------------
// Constants / Mock Data
// ------------------------------

const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "economy", label: "경제" },
  { key: "society", label: "사회" },
  { key: "it", label: "IT" },
  { key: "ent", label: "연예" },
  { key: "sports", label: "스포츠" },
  { key: "intl", label: "국제" },
  { key: "etc", label: "기타" },
];

const TIME_RANGES = [
  { key: "1d", label: "1일", points: 24, stepMinutes: 60 },
  { key: "1w", label: "1주일", points: 7 * 24, stepMinutes: 60 },
  { key: "1m", label: "1개월", points: 30, stepMinutes: 24 * 60 },
  { key: "3m", label: "3개월", points: 90, stepMinutes: 24 * 60 },
  { key: "6m", label: "6개월", points: 180, stepMinutes: 24 * 60 },
  { key: "1y", label: "1년", points: 365, stepMinutes: 24 * 60 },
];

type Market = {
  id: string;
  category: string;
  title: string;
  closeAt: string;
  closeIn: string;
  volume: string;
  tags: string[];
  evidence: { label: string; url: string }[];
  resolutionSummary: string;
  outcomes: { id: string; label: string; prob: number }[];
};

// API 연동 시: GET /api/markets
const mockMarkets: Market[] = [
  {
    id: "mkt-001",
    category: "economy",
    title: "오늘 원/달러 환율, 1,350원 넘을까?",
    closeAt: "2026-01-31 18:00",
    closeIn: "23시간 12분",
    volume: "₩ 18,420,000",
    tags: ["HIGH", "자동발행"],
    evidence: [
      { label: "공식 데이터(예시)", url: "https://example.com/evidence/1" },
      { label: "주요 언론(예시)", url: "https://example.com/evidence/2" },
    ],
    resolutionSummary:
      "2026-01-31 18:00(KST) 종가 기준 1,350원 이상이면 '넘는다'. 공식 데이터 제공처를 1순위로 사용. 확인 불가 시 VOID.",
    outcomes: [
      { id: "o1", label: "넘는다", prob: 0.46 },
      { id: "o2", label: "안 넘는다", prob: 0.54 },
    ],
  },
  {
    id: "mkt-002",
    category: "it",
    title: "이번 주, 주요 AI 규제안 발표될까?",
    closeAt: "2026-02-01 12:00",
    closeIn: "18시간 05분",
    volume: "₩ 7,930,000",
    tags: ["MID"],
    evidence: [
      { label: "기관 발표(예시)", url: "https://example.com/evidence/3" },
      { label: "주요 언론(예시)", url: "https://example.com/evidence/4" },
    ],
    resolutionSummary:
      "2026-02-01 12:00(KST)까지 공식 채널 게시 시 '발표된다'. 미게시 시 '발표되지 않는다'. 확인 불가 시 VOID.",
    outcomes: [
      { id: "o1", label: "발표된다", prob: 0.38 },
      { id: "o2", label: "발표되지 않는다", prob: 0.62 },
    ],
  },
  {
    id: "mkt-003",
    category: "sports",
    title: "오늘 경기, 홈팀이 2점 차 이상 승리할까?",
    closeAt: "2026-01-31 21:00",
    closeIn: "6시간 41분",
    volume: "₩ 3,210,000",
    tags: ["LIVE"],
    evidence: [
      { label: "주최측 결과(예시)", url: "https://example.com/evidence/5" },
      { label: "주요 언론(예시)", url: "https://example.com/evidence/6" },
    ],
    resolutionSummary:
      "경기 종료 후 주최측 공식 결과 기준. 홈팀이 2점 차 이상 승리하면 '승리'. 경기 취소 시 VOID.",
    outcomes: [
      { id: "o1", label: "승리", prob: 0.57 },
      { id: "o2", label: "그 외", prob: 0.43 },
    ],
  },
  {
    id: "mkt-004",
    category: "intl",
    title: "내일 새벽, 주요 중앙은행 금리 동결할까?",
    closeAt: "2026-02-01 04:00",
    closeIn: "1일 02시간",
    volume: "₩ 12,060,000",
    tags: ["HIGH"],
    evidence: [
      { label: "공식 발표(예시)", url: "https://example.com/evidence/7" },
      { label: "주요 언론(예시)", url: "https://example.com/evidence/8" },
    ],
    resolutionSummary:
      "공식 발표문 기준 금리 동결이면 '동결'. 인상/인하면 '변경'. 발표 취소/연기 시 VOID.",
    outcomes: [
      { id: "o1", label: "동결", prob: 0.71 },
      { id: "o2", label: "변경", prob: 0.29 },
    ],
  },
];

function formatPct(x: number) {
  const v = Math.round(x * 100);
  return `${v}%`;
}

// function toDecimalOdds(p: number) {
//   const clamped = Math.max(0.0001, Math.min(0.9999, p));
//   const odds = 1 / clamped;
//   return odds.toFixed(2);
// }

function formatTimeLabel(ts: number, rangeKey: string) {
  const d = new Date(ts);
  if (rangeKey === "1d" || rangeKey === "1w") {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${day}`;
}

// ------------------------------
// Odds History (mock) + Chart
// ------------------------------

type OddsPoint = {
  ts: number;
  label: string;
  [k: string]: number | string;
};

function seededRand(seed: number) {
  // xorshift32
  let x = seed || 123456789;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// API 연동 시: GET /api/odds/history/:marketId?range=1d
function generateOddsHistory(market: Market, rangeKey: string): OddsPoint[] {
  const range = TIME_RANGES.find((r) => r.key === rangeKey) ?? TIME_RANGES[0];
  const rnd = seededRand(hashString(market.id + "|" + rangeKey));

  const now = Date.now();
  const step = range.stepMinutes * 60 * 1000;
  const points = range.points;
  const start = now - step * (points - 1);

  const base = market.outcomes.map((o) => o.prob);
  const out: OddsPoint[] = [];
  let current = [...base];

  for (let i = 0; i < points; i++) {
    const drift = (rnd() - 0.5) * 0.02;
    const meanPull = 0.12;

    const target0 = base[0] ?? 0.5;
    let p0 = (current[0] ?? 0.5) + drift - meanPull * ((current[0] ?? 0.5) - target0);
    p0 = Math.max(0.05, Math.min(0.95, p0));

    const probs = [p0, 1 - p0];
    current = probs;

    const ts = start + step * i;
    const row: OddsPoint = {
      ts,
      label: formatTimeLabel(ts, rangeKey),
    };
    market.outcomes.forEach((o, idx) => {
      row[o.id] = probs[idx] ?? 0;
    });
    out.push(row);
  }

  return out;
}

function ChartTooltip({
  active,
  payload,
  label,
  outcomeLabels,
}: {
  active?: boolean;
  payload?: readonly any[];
  label?: string | number;
  outcomeLabels: Record<string, string>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-2xl border bg-background px-3 py-2 text-xs shadow-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="mt-1 space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6">
            <span className="font-medium">{outcomeLabels[p.dataKey] ?? p.dataKey}</span>
            <span className="tabular-nums">{formatPct(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OddsHistoryChart({ market, rangeKey }: { market: Market; rangeKey: string }) {
  const data = useMemo(() => generateOddsHistory(market, rangeKey), [market.id, rangeKey]);
  const labels = useMemo(() => {
    const m: Record<string, string> = {};
    market.outcomes.forEach((o) => (m[o.id] = o.label));
    return m;
  }, [market.id]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis
          domain={[0, 1]}
          tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <Tooltip content={(props) => <ChartTooltip {...props} outcomeLabels={labels} />} />
        {market.outcomes.slice(0, 2).map((o, idx) => (
          <Line
            key={o.id}
            type="monotone"
            dataKey={o.id}
            dot={false}
            strokeWidth={2}
            stroke={idx === 0 ? "#111827" : "#6B7280"}
            opacity={idx === 0 ? 0.95 : 0.55}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ------------------------------
// UI helpers
// ------------------------------

function SegmentedTabs({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: { key: string; label: string }[];
}) {
  return (
    <div className="inline-flex items-center rounded-2xl border bg-background p-1">
      {items.map((it) => {
        const active = it.key === value;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={
              "px-3 py-1.5 text-xs font-medium rounded-2xl transition " +
              (active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")
            }
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}


// ------------------------------
// Pick Dock & Bottom Sheet
// ------------------------------

function PickDock({ market }: { market: Market }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState("");

  const handlePickClick = (outcomeId: string) => {
    setSelectedOutcomeId(outcomeId);
    setIsOpen(true);
  };

  return (
    <>
      {/* 하단 고정 영역 */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-3 z-30">
        <div className="mx-auto max-w-3xl grid grid-cols-2 gap-3">
          {market.outcomes.map((o) => (
            <button
              key={o.id}
              onClick={() => handlePickClick(o.id)}
              className="flex flex-col items-center justify-center rounded-2xl border-2 bg-background px-4 py-3 transition hover:bg-muted/40 active:scale-95"
            >
              <div className="text-sm font-semibold">{o.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{formatPct(o.prob)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* PickBottomSheet */}
      <PickBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        market={market}
        selectedOutcomeId={selectedOutcomeId}
      />
    </>
  );
}

function PickBottomSheet({
  isOpen,
  onClose,
  market,
  selectedOutcomeId,
}: {
  isOpen: boolean;
  onClose: () => void;
  market: Market;
  selectedOutcomeId: string;
}) {
  const [points, setPoints] = useState("1000");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedOutcome = market.outcomes.find((o) => o.id === selectedOutcomeId);
  const pointsNum = Math.max(0, Number(points) || 0);

  // Mock quote calculation
  const feeRate = 0.02;
  const fee = Math.round(pointsNum * feeRate);
  const netPoints = pointsNum - fee;

  const handleSubmit = () => {
    // Mock submission
    console.log("픽 완료:", { marketId: market.id, outcomeId: selectedOutcomeId, points: pointsNum });

    // Toast notification (임시로 alert 사용)
    alert(`픽 완료!\n현재 여론: ${formatPct(market.outcomes[0].prob)} / ${formatPct(market.outcomes[1].prob)}\n\n픽은 확률에 소폭 반영될 수 있어요.`);

    onClose();
  };

  if (!isOpen || !selectedOutcome) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-3xl bg-background rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">픽하기</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내 픽 */}
        <div className="mb-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">내 픽</div>
          <div className="rounded-2xl border bg-muted/20 p-3">
            <div className="text-sm font-semibold">{selectedOutcome.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">현재 {formatPct(selectedOutcome.prob)}</div>
          </div>
        </div>

        {/* 사용 포인트 */}
        <div className="mb-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">사용 포인트</div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setPoints("100")}>
              100P
            </Button>
            <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setPoints("500")}>
              500P
            </Button>
            <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setPoints("1000")}>
              1,000P
            </Button>
          </div>
          <Input
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="직접 입력"
            className="rounded-2xl"
          />
          <div className="mt-2 text-xs text-muted-foreground">
            픽하면 사용 포인트에서 차감돼요.
          </div>
        </div>

        {/* 고급 정보 (접힘) */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-sm text-muted-foreground mb-4"
        >
          <span>자세히</span>
          <svg
            className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="mb-4 rounded-2xl border bg-muted/20 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">수수료 ({Math.round(feeRate * 100)}%)</span>
              <span>{fee}P</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">순 포인트</span>
              <span className="font-semibold">{netPoints}P</span>
            </div>
            <Separator />
            <div className="text-muted-foreground">
              확률은 픽 참여에 따라 실시간 변동됩니다. (LMSR 방식)
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          className="w-full rounded-2xl"
          size="lg"
          disabled={pointsNum <= 0}
          onClick={handleSubmit}
        >
          픽 완료
        </Button>
      </div>
    </div>
  );
}

// ------------------------------
// Quote Panel (mock) - DEPRECATED, use PickBottomSheet
// ------------------------------

// type Quote = {
//   fee: number;
//   netStake: number;
//   sharesPreview: number;
//   slippagePct: number;
//   executedProbPreview: number;
// };

// // API 연동 시: POST /api/quote (시뮬레이션)
// function mockLmsrQuote({
//   stake,
//   prob,
//   feeRate,
//   liquidityB,
// }: {
//   stake: number;
//   prob: number;
//   feeRate: number;
//   liquidityB: number;
// }): Quote {
//   const fee = Math.max(0, stake * feeRate);
//   const netStake = Math.max(0, stake - fee);

//   const price = Math.max(0.05, Math.min(0.95, prob));
//   const sharesPreview = netStake * (1 / (price * 100)); // UI scaling

//   const slippagePct = Math.min(15, (netStake / Math.max(1, liquidityB)) * 2);

//   const executedProbPreview = Math.max(
//     0.01,
//     Math.min(0.99, price + (1 - price) * (slippagePct / 100) * 0.35)
//   );

//   return { fee, netStake, sharesPreview, slippagePct, executedProbPreview };
// }


// ------------------------------
// Layout
// ------------------------------

function TopNav() {
  return (
    <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-foreground text-background grid place-items-center font-bold">
            P
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">예측거래소</div>
            <div className="text-xs text-muted-foreground">이슈를 확률로 읽다</div>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" className="rounded-2xl" asChild>
            <Link to="/">홈</Link>
          </Button>
          <Button variant="ghost" className="rounded-2xl" asChild>
            <Link to="/markets">마켓</Link>
          </Button>
          <Button variant="ghost" className="rounded-2xl">
            피드
          </Button>
          <Button variant="ghost" className="rounded-2xl">
            내 계좌
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-2xl hidden sm:inline-flex">
            로그인
          </Button>
          <Button className="rounded-2xl">시작하기</Button>
        </div>
      </div>
    </div>
  );
}

// Featured Pick Section (토스증권 "3일 뒤 이벤트" 스타일)
function FeaturedPick() {
  const featured = mockMarkets[0]; // 첫 번째 마켓을 featured로

  return (
    <div className="mx-auto max-w-6xl px-4 pb-4">
      <div className="text-xs font-medium text-muted-foreground mb-2">오늘의 픽</div>
      <Link to={`/markets/${featured.id}`}>
        <Card className="rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {CATEGORIES.find((c) => c.key === featured.category)?.label ?? "기타"}
                  </Badge>
                  {featured.tags.includes("HIGH") && (
                    <Badge className="rounded-full text-xs">HOT</Badge>
                  )}
                </div>
                <div className="mt-2 text-sm font-semibold leading-snug">{featured.title}</div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{featured.closeIn}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{featured.volume}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function MarketSection({ showHeading = true }: { showHeading?: boolean }) {
  const [cat, setCat] = useState("all");

  const filtered = useMemo(() => {
    return mockMarkets.filter((m) => {
      const inCat = cat === "all" ? true : m.category === cat;
      return inCat;
    });
  }, [cat]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      {showHeading && (
        <div className="mb-3">
          <h2 className="text-lg font-semibold tracking-tight">실시간 픽</h2>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={
              "flex-shrink-0 px-4 py-2 text-sm font-medium rounded-2xl transition " +
              (cat === c.key
                ? "bg-foreground text-background"
                : "bg-muted/40 text-muted-foreground hover:bg-muted")
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {filtered.map((m) => (
          <Link key={m.id} to={`/markets/${m.id}`}>
            <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {CATEGORIES.find((c) => c.key === m.category)?.label ?? "기타"}
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold leading-snug line-clamp-1">{m.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {m.outcomes[0]?.label} vs {m.outcomes[1]?.label}
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{m.closeIn}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{m.volume}</span>
                      </div>
                    </div>

                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/70"
                        style={{ width: `${Math.round((m.outcomes[0]?.prob ?? 0) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <div className="text-sm font-semibold">예측거래소</div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              AI 이슈 수집과 LMSR 기반 확률로, 참여가 곧 정보가 되는 픽 플랫폼을 만듭니다.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold">제품</div>
            <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
              <li>픽 둘러보기</li>
              <li>포인트 충전</li>
              <li>내 픽 내역</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold">정책</div>
            <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
              <li>정산 기준</li>
              <li>정치 픽 제한</li>
              <li>수수료 안내</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold">고객지원</div>
            <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
              <li>문의하기</li>
              <li>공지사항</li>
              <li>유의사항</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Prediction Exchange. All rights reserved.</span>
          <span>본 서비스는 정책 기준을 준수합니다.</span>
        </div>
      </div>
    </div>
  );
}

// ------------------------------
// Pages
// ------------------------------

function HomePage() {
  return (
    <div className="pt-4">
      <FeaturedPick />
      <MarketSection />
    </div>
  );
}

function MarketsPage() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <h1 className="text-2xl font-semibold tracking-tight">마켓</h1>
        <p className="mt-1 text-sm text-muted-foreground">지금 진행 중인 픽을 확인하고 참여해보세요.</p>
      </div>
      <MarketSection showHeading={false} />
    </div>
  );
}

function MarketDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const market = useMemo(() => mockMarkets.find((m) => m.id === id), [id]);
  const [range, setRange] = useState("1d");

  if (!market) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Button variant="outline" className="rounded-2xl" onClick={() => nav(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로
        </Button>
        <div className="mt-6 text-sm text-muted-foreground">마켓을 찾을 수 없어요.</div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* 상단 요약 */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Button variant="ghost" size="sm" className="rounded-2xl -ml-2" onClick={() => nav(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로
        </Button>

        {/* 메타 라인 */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full text-xs">
            {CATEGORIES.find((c) => c.key === market.category)?.label ?? "기타"}
          </Badge>
          {market.tags.includes("HIGH") && (
            <Badge variant="destructive" className="rounded-full text-xs">난이도 높음</Badge>
          )}
          {market.tags.includes("MID") && (
            <Badge variant="secondary" className="rounded-full text-xs">난이도 보통</Badge>
          )}
          {market.tags.includes("자동발행") && (
            <Badge variant="outline" className="rounded-full text-xs">자동발행</Badge>
          )}
        </div>

        {/* 타이틀 */}
        <h1 className="mt-3 text-xl font-bold leading-tight">{market.title}</h1>

        {/* 상태 라인 */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>마감 {market.closeIn}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span>거래 {market.volume}</span>
          </div>
        </div>

        {/* 현재 여론 (확률 강조) */}
        <div className="mt-6">
          <div className="text-xs font-medium text-muted-foreground mb-3">현재 여론</div>
          <div className="grid grid-cols-2 gap-3">
            {market.outcomes.map((o) => (
              <div key={o.id} className="rounded-2xl border bg-background p-4">
                <div className="text-sm font-semibold">{o.label}</div>
                <div className="mt-2 text-2xl font-bold">{formatPct(o.prob)}</div>
              </div>
            ))}
          </div>
          {/* 프로그레스 바 */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground/70 transition-all"
              style={{ width: `${Math.round((market.outcomes[0]?.prob ?? 0) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 본문 스크롤 */}
      <div className="mx-auto max-w-3xl px-4 space-y-6">
        {/* 확률 흐름 (컴팩트) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">확률 흐름</div>
            <SegmentedTabs value={range} onChange={setRange} items={TIME_RANGES.slice(0, 4)} />
          </div>
          <div className="rounded-3xl border bg-card p-4">
            <div className="h-[180px]">
              <OddsHistoryChart market={market} rangeKey={range} />
            </div>
          </div>
        </div>

        {/* 정산 기준 (라벨-값 행) */}
        <div>
          <div className="text-sm font-semibold mb-3">정산 기준</div>
          <div className="rounded-3xl border bg-card p-4">
            <div className="text-sm leading-relaxed text-muted-foreground">
              {market.resolutionSummary}
            </div>
          </div>
        </div>

        {/* 근거 링크 (리스트) */}
        <div>
          <div className="text-sm font-semibold mb-3">근거 링크</div>
          <div className="space-y-2">
            {market.evidence.map((e) => (
              <a
                key={e.url}
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border bg-card p-3 hover:bg-muted/40 transition"
              >
                <div className="text-sm">{e.label}</div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* 유의사항 */}
        <div>
          <div className="text-sm font-semibold mb-3">유의사항</div>
          <div className="rounded-3xl border bg-card p-4">
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• 픽은 확정 시점의 여론(확률)이 적용됩니다.</li>
              <li>• 정산은 정산 기준과 근거 소스 우선순위에 따라 처리됩니다.</li>
              <li>• 정치 카테고리는 정책상 자동 게시되지 않습니다.</li>
            </ul>
          </div>
        </div>

        {/* 추천 마켓 (리스트) */}
        <div>
          <div className="text-sm font-semibold mb-3">다른 픽 둘러보기</div>
          <div className="space-y-2">
            {mockMarkets
              .filter((m) => m.id !== market.id)
              .slice(0, 3)
              .map((m) => (
                <Link key={m.id} to={`/markets/${m.id}`}>
                  <div className="flex items-start gap-3 rounded-2xl border bg-card p-3 hover:bg-muted/40 transition">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">{m.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">마감 {m.closeIn}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* 하단 고정 CTA - PickDock (P0-2에서 구현) */}
      <PickDock market={market} />
    </div>
  );
}

// ------------------------------
// App Shell
// ------------------------------

function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/markets/:id" element={<MarketDetailPage />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default function PredictionExchangeApp() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
