"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Fixture } from "@/lib/types";

export default function FixtureDetailPage({ params }: { params: { id: string } }) {
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFixture() {
      const { data, error } = await supabase.from("fixtures").select("*").eq("id", params.id).single();
      if (error) setError(error.message);
      else setFixture(data as Fixture);
      setLoading(false);
    }
    loadFixture();
  }, [params.id]);

  return (
    <div className="grid">
      <section className="card">
        {loading ? <p>Loading fixture…</p> : error ? <p>{error}</p> : fixture && (
          <>
            <p className="eyebrow">Fixture</p>
            <h2 className="page-title">vs {fixture.opponent}</h2>
            <p className="subtle">{fixture.match_date} {fixture.venue ? `• ${fixture.venue}` : ""}</p>
            {fixture.notes && <p className="helper">{fixture.notes}</p>}
            <div className="row" style={{ marginTop: 12 }}>
              <Link href={`/fixtures/${fixture.id}/availability`} className="button">Availability</Link>
              <Link href={`/fixtures/${fixture.id}/plan`} className="button-secondary">Generate plan</Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
