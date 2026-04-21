/**
 * Boss Layout — Protected admin route
 * Access via /boss — prompts for BOSS_SECRET_KEY
 */

export default function BossLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  );
}
