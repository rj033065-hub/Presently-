'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, ArrowRight, Trash2, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/spinner';
import { apiClient } from '@/lib/api-client';

export default function SurveyHistoryPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurveys();
  }, []);

  async function loadSurveys() {
    try {
      setLoading(true);
      const res: any = await apiClient.get('/surveys');
      setSurveys(res || []);
    } catch (err) {
      console.error('Failed to load survey history:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this survey record?')) return;
    try {
      await apiClient.delete(`/surveys/${id}`);
      setSurveys(surveys.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete survey:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  const draftSurveys = surveys.filter((s) => s.status === 'draft');
  const completedSurveys = surveys.filter((s) => s.status === 'submitted');

  return (
    <DashboardLayout
      title="Survey History & Drafts"
      subtitle="Review past recipient survey answers, resume active drafts, or generate fresh AI recommendations."
    >
      <div className="space-y-8">
        {/* Active Drafts Section */}
        {draftSurveys.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Unfinished Survey Drafts ({draftSurveys.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftSurveys.map((survey) => {
                const recipientName = survey.survey_payload?.recipient_name || 'Gift Recipient';
                const step = survey.current_step || 1;
                const progressPct = minMaxPct(step, 12);

                return (
                  <Card key={survey.id} className="p-5 border-amber-200/60 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">
                        <span>Draft</span>
                        <span>Step {step} of 12</span>
                      </div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Gift for {recipientName}</h3>
                      <p className="text-xs text-zinc-500 mt-1">Occasion: {survey.occasion || 'General'}</p>

                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 mt-3 overflow-hidden">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <button onClick={() => handleDelete(survey.id)} className="text-zinc-400 hover:text-rose-600 text-xs">
                        Delete
                      </button>
                      <Link href={`/survey?resumeId=${survey.id}`}>
                        <Button className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <span>Resume Draft</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Completed Surveys Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Completed Gift Surveys ({completedSurveys.length})</span>
          </h2>

          {completedSurveys.length > 0 ? (
            <div className="space-y-3">
              {completedSurveys.map((survey) => {
                const recipientName = survey.survey_payload?.recipient_name || 'Recipient';
                const budgetRange = `$${survey.min_budget} - $${survey.max_budget}`;

                return (
                  <Card key={survey.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                        <ClipboardList className="w-6 h-6" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                            Gift Survey for {recipientName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            Submitted
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Occasion: {survey.occasion} • Budget: {budgetRange} • Date: {new Date(survey.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/recommendations/${survey.id}`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>View Recommendations</span>
                        </Button>
                      </Link>
                      <button onClick={() => handleDelete(survey.id)} className="p-2 text-zinc-400 hover:text-rose-600 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed border-zinc-300 dark:border-zinc-800">
              <ClipboardList className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No completed gift surveys</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Start a survey to profile a friend or family member for gift ideas.</p>
              <Link href="/survey" className="inline-block mt-4">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl">
                  Take New Survey
                </Button>
              </Link>
            </Card>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function minMaxPct(step: number, total: number) {
  return Math.min(100, Math.max(0, Math.round((step / total) * 100)));
}
