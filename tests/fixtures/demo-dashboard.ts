// =============================================================================
// Synthetic dashboard payload for visual testing (tools/demo-dashboard.ts).
//
// Every ticker, price, statistic and sentence here is invented. None of it comes
// from a market-data feed, so it is safe to commit and to show in public pull
// requests, unlike the real payload. Typed against site/src/lib/types.ts, so
// `npm run typecheck` fails when the payload shape changes and this falls behind.
// =============================================================================
import type { Candidate, Day, DashboardIndex, Ledger, LedgerStats, Pick as LedgerPick } from "../../site/src/lib/types.ts";

export const LATEST = "2026-11-13";
export const PREVIOUS = "2026-11-12";

const candidate = (c: Partial<Candidate> & Pick<Candidate, "ticker" | "name" | "sector" | "setup" | "conviction">): Candidate => ({
  thesis: "Synthetic demo thesis. A tight base under a prior high resolved upward on rising volume while the group leads the tape.",
  catalysts: [{ date: "2026-11-20", text: "Synthetic product event", source_url: null }],
  risks: ["Synthetic risk: the group is extended versus its 50-day average.", "Synthetic risk: a report lands inside the hold."],
  invalidation: "A close back inside the base, below the stop.",
  earnings: { date: "2027-01-28", hour: "amc", sessions_away: 50, estimated: true },
  reports_in_hold: 1,
  earnings_plan: "Hold through the report only if the position is at least 1R in profit.",
  upside_case: "A measured move from the base height reaches the +20% reference.",
  chart_checks: ["Close above the prior 20-bar high", "Volume at least 1.5x the 20-day average"],
  features: {
    adv20_usd_m: 412, atr_pct: 2.4, bars_since_squeeze: 3, dist_52wh_atr: 0.4, ext_ema21_atr: 1.1,
    pct_off_52wh: -1.2, ret_21d_pct: 8.4, ret_63d_pct: 21.7, ret_126d_pct: 34.2, rs_rank: 92,
    rs_rising: true, tags: ["squeeze", "trend_stack"], trend_stack: true, vol_ratio: 1.8,
  },
  levels: {
    atr: 2.9, entry_max: 124.6, ref_close: 121.7, stop: 112.9, stop_pct: -7.2,
    targets: [146.0], targets_r: [2.8], position_pct: 11.5,
  },
  horizon_sessions: 63,
  max_chase_atr: 1,
  stop_atr: 3,
  news: [{ date: "2026-11-12", headline: "Synthetic headline about the demo company", source: "Demo Wire", url: "https://example.com/demo" }],
  ...c,
});

function day(asOf: string, spyClose: number): Day {
  return {
    as_of: asOf,
    generated_utc: `${asOf}T06:20:00Z`,
    analysis: {
      as_of: asOf,
      regime: {
        label: "risk_on",
        exposure: "Full size on A-grade setups",
        summary: "Synthetic demo data. Breadth is broad and the index trend is stacked; momentum is calm.",
        evidence: ["SPY above a rising 50-day average", "62% of members above their 50-day average", "VIX under 16"],
        disagrees_with_baseline: false,
      },
      candidates: [
        candidate({ ticker: "ACME", name: "Acme Robotics", sector: "Technology", setup: "squeeze", conviction: 4 }),
        candidate({
          ticker: "GLBX", name: "Globex Industrial", sector: "Industrials", setup: "pullback_reclaim", conviction: 3,
          earnings: { date: "2026-11-24", hour: "bmo", sessions_away: 7, conflict: true },
          levels: { atr: 1.6, entry_max: 58.9, ref_close: 57.8, stop: 53.0, stop_pct: -8.3, targets: [69.4], targets_r: [2.4], position_pct: 9.0 },
        }),
      ],
      reviews: [
        { ticker: "INIT", action: "hold", note: "Synthetic: trend intact, well above the stop." },
        { ticker: "UMBR", action: "trim", note: "Synthetic: relative strength faded below the group." },
      ],
      prompt_version: "demo",
      watchlist: [{ ticker: "HOOL", name: "Hooli Systems", close: 88.1, trigger: "Close above 90.5 on volume", note: "Base still forming" }],
      avoid: [{ ticker: "VAND", name: "Vandelay Imports", close: 31.4, reason: "Synthetic: extended 5 ATR above the 21-day average" }],
      market_notes: ["Synthetic note: semiconductors lead; utilities lag."],
      data_issues: [],
    },
    market: {
      baseline_regime: { label: "risk_on", rule: "SPY above a rising EMA50 and breadth above 50%", score: 3 },
      benchmarks: {
        SPY: {
          close: spyClose, above_ema50: true, ema50_rising: true, risk_on_gate: true, atr_pct: 1.1,
          close_vs_sma200_pct: 7.9, drawdown_from_52wh_pct: -0.8, ret_5d_pct: 1.2, ret_21d_pct: 3.4, ret_63d_pct: 6.1,
        },
        RSP: {
          close: 192.3, above_ema50: true, ema50_rising: true, risk_on_gate: true, atr_pct: 1.0,
          close_vs_sma200_pct: 5.2, drawdown_from_52wh_pct: -1.6, ret_5d_pct: 0.9, ret_21d_pct: 2.6, ret_63d_pct: 4.4,
        },
      },
      macro: {
        vix: { series: "VIXCLS", date: asOf, value: 15.2, chg_20obs: -1.8 },
        hy_oas: { series: "BAMLH0A0HYM2", date: asOf, value: 3.1, chg_20obs: -0.1 },
        ust10y: { series: "DGS10", date: asOf, value: 4.2, chg_20obs: 0.1 },
        curve_10y2y: { series: "T10Y2Y", date: asOf, value: 0.4, chg_20obs: 0.05 },
      },
      sectors: [
        { etf: "XLK", sector: "Technology", members: 120, pct_trend_stack: 58, ret_21d_pct: 5.1, ret_63d_pct: 11.2, risk_on_gate: true, rs_63d_vs_spy: 4.8 },
        { etf: "XLI", sector: "Industrials", members: 140, pct_trend_stack: 46, ret_21d_pct: 2.9, ret_63d_pct: 6.8, risk_on_gate: true, rs_63d_vs_spy: 0.6 },
        { etf: "XLU", sector: "Utilities", members: 50, pct_trend_stack: 18, ret_21d_pct: -1.4, ret_63d_pct: -2.2, risk_on_gate: false, rs_63d_vs_spy: -8.1 },
      ],
      tag_counts: { squeeze: 14, breakout: 22, pullback_reclaim: 9, trend_stack: 310 },
      universe: { eligible: 880, scan_members: 900, with_features: 893 },
    },
    momentum: {
      mtum_vs_spy_21d_pct: 1.4, mtum_vs_spy_63d_pct: 3.0, mtum_vs_rsp_21d_pct: 2.1, mtum_vs_rsp_63d_pct: 4.6,
      spread_vol_ann_pct: 11.0, target_vol_ann_pct: 10.0, size_scale: 0.9,
    },
    book: [
      {
        ticker: "INIT", sector: "Technology", as_of: "2026-10-02", status: "open", entry: 74.2, entry_date: "2026-10-05",
        stop: 66.0, close: 83.9, stop_dist_pct: -21.3, position_pct: 10.0, horizon_sessions: 63,
        mark: { date: asOf, sessions: 29, pct: 13.1, spy_pct: 4.0, rsp_pct: 3.1 },
        next_earnings: { date: "2027-02-04", sessions_away: 56, estimated: true }, flags: [],
        review: { ticker: "INIT", action: "hold", note: "Synthetic: trend intact, well above the stop." },
      },
      {
        ticker: "UMBR", sector: "Health Care", as_of: "2026-10-16", status: "open", entry: 40.5, entry_date: "2026-10-19",
        stop: 37.1, close: 38.0, stop_dist_pct: -2.4, position_pct: 8.0, horizon_sessions: 63,
        mark: { date: asOf, sessions: 19, pct: -6.2, spy_pct: 2.2, rsp_pct: 1.8 },
        next_earnings: { date: "2026-11-19", hour: "amc", sessions_away: 4 }, flags: ["near_stop", "rs_faded", "earnings_soon"],
        review: { ticker: "UMBR", action: "trim", note: "Synthetic: relative strength faded below the group." },
      },
    ],
    limits: { max_open: 8, max_per_sector: 2, max_new: 2, risk_per_trade_pct: 1 },
    breadth: [PREVIOUS, asOf].map((date, i) => ({
      date, n: 893, advancers: 480 + 40 * i, decliners: 380 - 40 * i, new_52w_highs: 41 + 6 * i, new_52w_lows: 9,
      pct_above_sma50: 60 + 2 * i, pct_above_sma200: 66,
    })),
  };
}

export const days: Record<string, Day> = { [PREVIOUS]: day(PREVIOUS, 581.2), [LATEST]: day(LATEST, 584.7) };
export const index: DashboardIndex = { days: [PREVIOUS, LATEST], latest: LATEST };

const stats = (picks: number, extra: Partial<LedgerStats> = {}): LedgerStats => ({
  picks, filled: picks - 1, not_filled: 1, stopped: 1, open: 2, low_sample: true,
  avg_mark_pct: 3.4, avg_mark_ex_rsp: 0.9, avg_mfe_r: 1.3,
  n_63: 2, weeks_63: 2, avg_pct_63: 6.5, avg_r_63: 0.8, win_rate_63: 50, avg_ex_rsp_63: 2.4, avg_ex_spy_63: 1.7, beat_rsp_63: 50,
  ...extra,
});

const pick = (p: Partial<LedgerPick> & Pick<LedgerPick, "id" | "ticker" | "as_of" | "status" | "setup">): LedgerPick => ({
  published_utc: `${p.as_of}T06:20:00Z`, sector: "Technology", conviction: 3, tags: ["trend_stack"],
  atr: 2.0, ref_close: 50.0, entry_max: 52.0, stop: 44.0, stop_atr: 3, targets: [60.0], targets_r: [1.6],
  entry: 50.4, entry_date: p.as_of, exit_date: null, exit_r: null, exit_reason: null,
  r: {}, pct: {}, spy_pct: {}, rsp_pct: {}, mark: null, mfe_r: 0.6, mae_r: -0.4, size_scale: 1, position_pct: 10,
  horizon_sessions: 63, rules_version: "demo",
  ...p,
});

export const ledger: Ledger = {
  updated: LATEST,
  picks: [
    pick({ id: "demo-1", ticker: "STRK", as_of: "2026-07-01", status: "complete", setup: "breakout",
      r: { "21": 0.9, "42": 1.4, "63": 1.8 }, pct: { "21": 5.1, "42": 8.0, "63": 10.2 },
      spy_pct: { "21": 1.5, "42": 2.9, "63": 4.0 }, rsp_pct: { "21": 1.1, "42": 2.0, "63": 3.2 }, mfe_r: 2.1 }),
    pick({ id: "demo-2", ticker: "SOYL", as_of: "2026-07-15", status: "stopped", setup: "squeeze",
      exit_date: "2026-08-03", exit_r: -1, exit_pct: -7.9, exit_reason: "stop",
      r: { "21": -1, "42": -1, "63": -1 }, pct: { "21": -7.9, "42": -7.9, "63": -7.9 },
      spy_pct: { "21": 0.4, "42": 1.2, "63": 2.5 }, rsp_pct: { "21": 0.2, "42": 0.8, "63": 1.4 }, mfe_r: 0.2, mae_r: -1 }),
    pick({ id: "demo-3", ticker: "MASS", as_of: "2026-09-10", status: "not_filled", setup: "pullback_reclaim", entry: null, entry_date: null, mfe_r: null, mae_r: null }),
    pick({ id: "demo-4", ticker: "INIT", as_of: "2026-10-02", status: "open", setup: "squeeze", entry: 74.2, entry_date: "2026-10-05", stop: 66.0,
      mark: { date: LATEST, sessions: 29, pct: 13.1, spy_pct: 4.0, rsp_pct: 3.1 } }),
    pick({ id: "demo-5", ticker: "UMBR", as_of: "2026-10-16", status: "open", setup: "pullback_reclaim", sector: "Health Care", entry: 40.5, stop: 37.1,
      entry_date: "2026-10-19", mark: { date: LATEST, sessions: 19, pct: -6.2, spy_pct: 2.2, rsp_pct: 1.8 } }),
    pick({ id: "demo-6", ticker: "ACME", as_of: LATEST, status: "pending", setup: "squeeze", conviction: 4, entry: null, entry_date: null, mfe_r: null, mae_r: null }),
  ],
  stats: {
    version: "demo",
    all: stats(6),
    by_conviction: { "3": stats(5), "4": stats(1, { n_63: 0, avg_ex_rsp_63: null, beat_rsp_63: null }) },
    by_setup: { breakout: stats(1), squeeze: stats(3), pullback_reclaim: stats(2) },
    cost_assumption: "Costs: 0.05% commission and 2 ticks of slippage each way (synthetic demo)",
  },
  control: {
    version: "demo",
    all: stats(40, { avg_ex_rsp_63: 0.6 }),
    picked: stats(6),
    unpicked: stats(34, { avg_ex_rsp_63: 0.2 }),
    by_setup: { "Squeeze, picked": stats(3), "Squeeze, passed on": stats(12, { avg_ex_rsp_63: -0.4 }) },
    rule: "Synthetic control rule: every in-context signal at fixed 3 ATR stops",
  },
};
