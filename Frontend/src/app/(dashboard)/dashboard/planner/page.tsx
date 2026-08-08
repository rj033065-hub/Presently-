'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Gift
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/spinner';
import {
  getGiftPlans,
  createGiftPlan,
  updateGiftPlan,
  deleteGiftPlan,
  GiftPlan
} from '@/lib/dashboard-api';

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  planning: { label: 'Planning', bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300' },
  gift_selected: { label: 'Gift Selected', bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300' },
  purchased: { label: 'Purchased', bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300' },
  delivered: { label: 'Delivered', bg: 'bg-indigo-100 dark:bg-indigo-950', text: 'text-indigo-700 dark:text-indigo-300' },
  completed: { label: 'Completed ✅', bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300' },
};

export default function GiftPlannerPage() {
  const [plans, setPlans] = useState<GiftPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Form Fields
  const [recipientName, setRecipientName] = useState('');
  const [recipientRelationship, setRecipientRelationship] = useState('');
  const [occasion, setOccasion] = useState('Birthday');
  const [eventDate, setEventDate] = useState('');
  const [plannedBudget, setPlannedBudget] = useState('100');
  const [actualSpending, setActualSpending] = useState('0');
  const [currency, setCurrency] = useState('USD');
  const [status, setStatus] = useState<'planning' | 'gift_selected' | 'purchased' | 'delivered' | 'completed'>('planning');
  const [giftIdea, setGiftIdea] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      const data = await getGiftPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to load gift plans:', err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditingPlanId(null);
    setRecipientName('');
    setRecipientRelationship('');
    setOccasion('Birthday');
    setEventDate('');
    setPlannedBudget('100');
    setActualSpending('0');
    setCurrency('USD');
    setStatus('planning');
    setGiftIdea('');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (plan: GiftPlan) => {
    setEditingPlanId(plan.id);
    setRecipientName(plan.recipient_name);
    setRecipientRelationship(plan.recipient_relationship || '');
    setOccasion(plan.occasion);
    setEventDate(plan.event_date);
    setPlannedBudget(plan.planned_budget.toString());
    setActualSpending(plan.actual_spending.toString());
    setCurrency(plan.currency || 'USD');
    setStatus(plan.status as any);
    setGiftIdea(plan.gift_idea || '');
    setNotes(plan.notes || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !eventDate) return;

    const payload = {
      recipient_name: recipientName,
      recipient_relationship: recipientRelationship,
      occasion,
      event_date: eventDate,
      planned_budget: Math.max(0, parseFloat(plannedBudget) || 0),
      actual_spending: Math.max(0, parseFloat(actualSpending) || 0),
      currency,
      status,
      gift_idea: giftIdea,
      notes,
    };

    try {
      if (editingPlanId) {
        const updated = await updateGiftPlan(editingPlanId, payload);
        setPlans(plans.map((p) => (p.id === editingPlanId ? updated : p)));
      } else {
        const created = await createGiftPlan(payload);
        setPlans([...plans, created]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save gift plan:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gift plan?')) return;
    try {
      await deleteGiftPlan(id);
      setPlans(plans.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete plan:', err);
    }
  };

  // Budget calculations
  const totalPlanned = plans.reduce((acc, p) => acc + Number(p.planned_budget || 0), 0);
  const totalSpent = plans.reduce((acc, p) => acc + Number(p.actual_spending || 0), 0);
  const totalRemaining = Math.max(0, totalPlanned - totalSpent);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Gift Planner & Budget Tracker"
      subtitle="Organize upcoming events chronologically, track planned vs actual spending, and manage preparation timelines."
      actionButton={
        <Button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Gift Plan</span>
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Budget Overview Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 border-l-4 border-l-indigo-500">
            <span className="text-xs font-semibold text-zinc-500">Total Planned Budget</span>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">${totalPlanned.toFixed(2)}</p>
          </Card>
          <Card className="p-5 border-l-4 border-l-amber-500">
            <span className="text-xs font-semibold text-zinc-500">Actual Spending</span>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">${totalSpent.toFixed(2)}</p>
          </Card>
          <Card className="p-5 border-l-4 border-l-emerald-500">
            <span className="text-xs font-semibold text-zinc-500">Remaining Budget</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">${totalRemaining.toFixed(2)}</p>
          </Card>
        </section>

        {/* Gift Plans Timeline */}
        {plans.length > 0 ? (
          <div className="space-y-6">
            {plans.map((plan) => {
              const statusInfo = STATUS_LABELS[plan.status] || STATUS_LABELS.planning;
              const plannedVal = Number(plan.planned_budget || 0);
              const spentVal = Number(plan.actual_spending || 0);
              const budgetPct = plannedVal > 0 ? Math.min(100, Math.round((spentVal / plannedVal) * 100)) : 0;

              return (
                <Card key={plan.id} className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold flex flex-col items-center justify-center border border-indigo-100 dark:border-indigo-900 flex-shrink-0">
                        <span className="text-xs">{plan.days_remaining}d</span>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-400">Left</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                            {plan.recipient_name}'s {plan.occasion}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${statusInfo.bg} ${statusInfo.text}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {new Date(plan.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          {plan.recipient_relationship && ` • ${plan.recipient_relationship}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={() => openEditModal(plan)} variant="outline" className="text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                      <button onClick={() => handleDelete(plan.id)} className="p-2 text-zinc-400 hover:text-rose-600 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Budget & Idea Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">Budget Progress</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">${spentVal} / ${plannedVal}</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            budgetPct > 100 ? 'bg-rose-500' : budgetPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${budgetPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 space-y-1">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Gift Idea & Notes</span>
                      <p className="text-zinc-600 dark:text-zinc-400 truncate">
                        {plan.gift_idea ? `💡 ${plan.gift_idea}` : 'No specific gift idea specified yet.'}
                      </p>
                    </div>
                  </div>

                  {/* Preparation Milestone Timeline Visual */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                      <span>30 Days: Ideas</span>
                      <span>14 Days: Purchase</span>
                      <span>7 Days: Delivery</span>
                      <span>1 Day: Wrap</span>
                      <span>Event Day</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-indigo-500" />
                      <div className={`flex-1 h-1.5 rounded-full ${plan.days_remaining <= 14 ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                      <div className={`flex-1 h-1.5 rounded-full ${plan.days_remaining <= 7 ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                      <div className={`flex-1 h-1.5 rounded-full ${plan.days_remaining <= 1 ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                      <div className={`w-3 h-3 rounded-full border-2 ${plan.days_remaining === 0 ? 'bg-emerald-500 border-emerald-400' : 'bg-zinc-300 dark:bg-zinc-700 border-white'}`} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-zinc-300 dark:border-zinc-800">
            <CalendarCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No gift plans created</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Add upcoming birthdays, anniversaries, or seasonal events to track budgets and gift preparation.</p>
            <Button onClick={openCreateModal} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl">
              Create First Gift Plan
            </Button>
          </Card>
        )}
      </div>

      {/* Plan Creator / Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white dark:bg-zinc-900 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {editingPlanId ? 'Edit Gift Plan' : 'Create Gift Plan'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Recipient Name</label>
                <Input placeholder="e.g. Sarah Miller" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Relationship</label>
                  <Input placeholder="e.g. Sister, Boss" value={recipientRelationship} onChange={(e) => setRecipientRelationship(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Occasion</label>
                  <Input placeholder="e.g. Birthday" value={occasion} onChange={(e) => setOccasion(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Event Date</label>
                <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Planned Budget ($)</label>
                  <Input type="number" min="0" step="10" value={plannedBudget} onChange={(e) => setPlannedBudget(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Actual Spending ($)</label>
                  <Input type="number" min="0" step="5" value={actualSpending} onChange={(e) => setActualSpending(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                >
                  <option value="planning">Planning</option>
                  <option value="gift_selected">Gift Selected</option>
                  <option value="purchased">Purchased</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed ✅</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Gift Idea (Optional)</label>
                <Input placeholder="e.g. Noise canceling headphones" value={giftIdea} onChange={(e) => setGiftIdea(e.target.value)} />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                  {editingPlanId ? 'Save Changes' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
