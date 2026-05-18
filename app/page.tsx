"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* =========================
   TYPES
========================= */

type TransactionType = "expense" | "income";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Expense = {
  id: string;
  description: string;
  amount: number;
  category_id: string | null;
  date: string;
  type: TransactionType;
};

type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
  icon: string;
  color: string;
  date: string | null;
};

/* =========================
   DATA
========================= */

const CATS: Category[] = [
  { id: "1", name: "Alimentation", icon: "🛒", color: "#88f50b" },
  { id: "2", name: "Transport", icon: "🚗", color: "#f67d3b" },
  { id: "3", name: "Logement", icon: "🏠", color: "#354bec" },
  { id: "4", name: "Loisirs", icon: "🎮", color: "#8c48ec" },
  { id: "5", name: "Santé", icon: "💊", color: "#10b981" },
  { id: "6", name: "Restaurants", icon: "🍕", color: "#f91616" },
];

const INIT_EXP: Expense[] = [];

const MONTHLY = [
  { m: "Déc", d: 1820, r: 3100 },
  { m: "Jan", d: 2140, r: 3200 },
  { m: "Fév", d: 1650, r: 3200 },
  { m: "Mar", d: 2380, r: 3400 },
  { m: "Avr", d: 1990, r: 3200 },
  { m: "Mai", d: 1387, r: 3200 },
];

const GOALS: Goal[] = [];

/* =========================
   HELPERS
========================= */

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);

const pct = (v: number, t: number) =>
  t === 0 ? 0 : Math.min(100, Math.round((v / t) * 100));

/* =========================
   COMPONENTS
========================= */

function PBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        height: 8,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 99,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          background: color,
          borderRadius: 99,
          transition: "width .6s ease",
        }}
      />
    </div>
  );
}

function TooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        padding: 12,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          marginBottom: 8,
          color: "#fff",
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 4,
            color: "#d1d5db",
          }}
        >
          <span>{p.name}</span>
          <span style={{ marginLeft: "auto", color: "#fff" }}>
            {fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Modal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (e: Expense) => void;
}) {
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category_id: "",
    date: new Date().toISOString().slice(0, 10),
    type: "expense" as TransactionType,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.amount || !form.description) return;

    onAdd({
      id: "e" + Date.now(),
      amount: parseFloat(form.amount),
      description: form.description,
      category_id: form.category_id || null,
      date: form.date,
      type: form.type,
    });

    onClose();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #1f2937",
    background: "#0f172a",
    color: "#fff",
    outline: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,.7)",
        backdropFilter: "blur(6px)",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#0b1220",
          border: "1px solid #1f2937",
          borderRadius: 24,
          padding: 24,
        }}
      >
        <h2
          style={{
            marginBottom: 18,
            color: "#fff",
            fontSize: 24,
          }}
        >
          Nouvelle transaction
        </h2>

        <div style={{ marginBottom: 12 }}>
          <input
            type="number"
            placeholder="Montant"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <select
            value={form.category_id}
            onChange={(e) =>
              setForm({
                ...form,
                category_id: e.target.value,
              })
            }
            style={inputStyle}
          >
            <option value="">Sans catégorie</option>

            {CATS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 18 }}>
          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #374151",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Annuler
          </button>

          <button
            type="submit"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              border: "none",
              background:
                "linear-gradient(#354bec,#354bec,#354bec)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Ajouter
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================
   APP
========================= */

export default function App() {
  const [page, setPage] = useState("Accueil");
  const [modal, setModal] = useState(false);

  const [expenses, setExpenses] =
    useState<Expense[]>(INIT_EXP);

  const spent = useMemo(
    () =>
      expenses
        .filter((e) => e.type === "expense")
        .reduce((s, e) => s + e.amount, 0),
    [expenses]
  );

  const income = useMemo(
    () =>
      expenses
        .filter((e) => e.type === "income")
        .reduce((s, e) => s + e.amount, 0),
    [expenses]
  );

  const stats = CATS.map((c) => ({
    ...c,
    spent: expenses
      .filter(
        (e) =>
          e.category_id === c.id &&
          e.type === "expense"
      )
      .reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.spent > 0);

  function deleteExpense(id: string) {
    setExpenses((prev) =>
      prev.filter((e) => e.id !== id)
    );
  }

  return (
    <>
      <style>{`
        *{
          box-sizing:border-box;
          margin:0;
          padding:0;
        }

        body{
          font-family:Inter,sans-serif;
          background:#020617;
        }

        button{
          transition:.2s;
        }

        button:hover{
          transform:translateY(-1px);
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg,#020617,#0f172a)",
          color: "#fff",
          display: "flex",
        }}
      >
        {/* SIDEBAR */}

        <aside
          style={{
            width: 240,
            borderRight: "1px solid #1e293b",
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 28,
            }}
          >
            Spend
            <span style={{ color: "#354bec" }}>
              za
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[
              "Accueil",
              "Dépenses",
              "Catégories",
              "Projets",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setPage(item)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  background:
                    page === item
                      ? "rgba(139,92,246,.15)"
                      : "transparent",
                  color:
                    page === item
                      ? "#354bec"
                      : "#94a3b8",
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        {/* CONTENT */}

        <main
          style={{
            flex: 1,
            padding: 36,
          }}
        >
          {/* ACCUEIL */}

          {page === "Accueil" && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 28,
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: 34,
                      fontWeight: 800,
                      marginBottom: 8,
                    }}
                  >
                    Accueil
                  </h1>

                  <div style={{ color: "#94a3b8" }}>
                    Vue générale de vos finances
                  </div>
                </div>

                <button
                  onClick={() => setModal(true)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: 14,
                    border: "none",
                    cursor: "pointer",
                    background:
                      "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  + Ajouter
                </button>
              </div>

              {/* CARDS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(220px,1fr))",
                  gap: 18,
                  marginBottom: 24,
                }}
              >
                {[
                  {
                    label: "Revenus",
                    value: income,
                    color: "#10b981",
                  },
                  {
                    label: "Dépenses",
                    value: spent,
                    color: "#f59e0b",
                  },
                  {
                    label: "Solde",
                    value: income - spent,
                    color: "#354bec",
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    style={{
                      background:
                        "rgba(255,255,255,0.04)",
                      border:
                        "1px solid rgba(255,255,255,.06)",
                      padding: 24,
                      borderRadius: 20,
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 10,
                        color: "#94a3b8",
                      }}
                    >
                      {card.label}
                    </div>

                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 800,
                        color: card.color,
                      }}
                    >
                      {fmt(card.value)}
                    </div>
                  </div>
                ))}
              </div>

              {/* CHARTS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr",
                  gap: 20,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    background:
                      "rgba(255,255,255,0.04)",
                    border:
                      "1px solid rgba(255,255,255,.06)",
                    borderRadius: 20,
                    padding: 20,
                  }}
                >
                  <h3
                    style={{
                      marginBottom: 20,
                    }}
                  >
                    Évolution mensuelle
                  </h3>

                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <AreaChart data={MONTHLY}>
                      <defs>
                        <linearGradient
                          id="grad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#354bec"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#354bec"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,.05)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="m"
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
  content={({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div
        style={{
          background:"#111",
          border:"1px solid #333",
          padding:10,
          borderRadius:10,
          color:"#fff"
        }}
      >
        {payload[0].name}: {payload[0].value}€
      </div>
    );
  }}
/>

                      <Area
                        type="monotone"
                        dataKey="d"
                        stroke="#354bec"
                        fill="url(#grad)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div
                  style={{
                    background:
                      "rgba(255,255,255,0.04)",
                    border:
                      "1px solid rgba(255,255,255,.06)",
                    borderRadius: 20,
                    padding: 20,
                  }}
                >
                  <h3
                    style={{
                      marginBottom: 20,
                    }}
                  >
                    Catégories
                  </h3>

                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <PieChart>
                      <Pie
                        data={stats}
                        dataKey="spent"
                        innerRadius={60}
                        outerRadius={90}
                      >
                        {stats.map((c) => (
                          <Cell
                            key={c.id}
                            fill={c.color}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;

                          return (
                            <div
                              style={{
                                background:"#111",
                                border:"1px solid #333",
                                padding:10,
                                borderRadius:10,
                                color:"#fff"
                              }}
                            >
                              {payload[0].name}: {payload[0].value}€
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* DÉPENSES */}

          {page === "Dépenses" && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: 24,
                }}
              >
                <h1
                  style={{
                    fontSize: 34,
                    fontWeight: 800,
                  }}
                >
                  Transactions
                </h1>

                <button
                  onClick={() => setModal(true)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: 14,
                    border: "none",
                    cursor: "pointer",
                    background:
                      "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  + Ajouter
                </button>
              </div>

              <div
                style={{
                  background:
                    "rgba(255,255,255,0.04)",
                  border:
                    "1px solid rgba(255,255,255,.06)",
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                {expenses.map((e, i) => {
                  const cat = CATS.find(
                    (c) => c.id === e.category_id
                  );

                  return (
                    <div
                      key={e.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: 18,
                        borderBottom:
                          i !== expenses.length - 1
                            ? "1px solid rgba(255,255,255,.05)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 14,
                          background:
                            cat?.color + "22",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                        }}
                      >
                        {cat?.icon || "💸"}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,
                          }}
                        >
                          {e.description}
                        </div>

                        <div
                          style={{
                            color: "#94a3b8",
                            fontSize: 13,
                          }}
                        >
                          {e.date}
                        </div>
                      </div>

                      <div
                        style={{
                          fontWeight: 800,
                          color:
                            e.type === "income"
                              ? "#10b981"
                              : "#fff",
                        }}
                      >
                        {e.type === "income"
                          ? "+"
                          : "-"}
                        {fmt(e.amount)}
                      </div>

                      <button
                        onClick={() =>
                          deleteExpense(e.id)
                        }
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          border: "none",
                          cursor: "pointer",
                          background:
                            "rgba(239,68,68,.15)",
                          color: "#f87171",
                          fontSize: 18,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* CATÉGORIES */}

          {page === "Catégories" && (
            <>
              <h1
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  marginBottom: 24,
                }}
              >
                Catégories
              </h1>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(220px,1fr))",
                  gap: 18,
                }}
              >
                {stats.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background:
                        "rgba(255,255,255,0.04)",
                      border:
                        "1px solid rgba(255,255,255,.06)",
                      borderRadius: 20,
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 34,
                        marginBottom: 10,
                      }}
                    >
                      {c.icon}
                    </div>

                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {c.name}
                    </div>

                    <div
                      style={{
                        color: c.color,
                        fontWeight: 800,
                        marginBottom: 12,
                      }}
                    >
                      {fmt(c.spent)}
                    </div>

                    <PBar
                      value={pct(c.spent, spent)}
                      color={c.color}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* PROJETS */}

          {page === "Projets" && (
            <>
              <h1
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  marginBottom: 24,
                }}
              >
                Objectifs d'épargne
              </h1>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                {GOALS.map((g) => {
                  const p = pct(
                    g.current,
                    g.target
                  );

                  return (
                    <div
                      key={g.id}
                      style={{
                        background:
                          "rgba(255,255,255,0.04)",
                        border:
                          "1px solid rgba(255,255,255,.06)",
                        borderRadius: 20,
                        padding: 24,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          marginBottom: 16,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 22,
                              marginBottom: 4,
                            }}
                          >
                            {g.icon}
                          </div>

                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 18,
                            }}
                          >
                            {g.name}
                          </div>
                        </div>

                        <div
                          style={{
                            textAlign: "right",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 26,
                              color: g.color,
                            }}
                          >
                            {p}%
                          </div>

                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: 13,
                            }}
                          >
                            {fmt(g.current)} /{" "}
                            {fmt(g.target)}
                          </div>
                        </div>
                      </div>

                      <PBar
                        value={p}
                        color={g.color}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>

      {modal && (
        <Modal
          onClose={() => setModal(false)}
          onAdd={(e) =>
            setExpenses((prev) => [
              e,
              ...prev,
            ])
          }
        />
      )}
    </>  );
}