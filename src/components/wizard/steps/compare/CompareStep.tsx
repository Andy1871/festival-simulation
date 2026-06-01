import { useState, useMemo } from 'react';
import { runSimulation } from '../../../../calculations/runSimulation';
import { listSavedConfigs } from '../../../../storage/configs';
import { useAuth } from '../../../../auth/AuthContext';
import type { FestivalConfig } from '../../../../types';
import type { MetricsSnapshot } from '../../../../calculations/types';

interface CompareStepProps {
    config: FestivalConfig;
    snapshot: MetricsSnapshot;
}

function fmt(n: number) { return `£${n.toLocaleString('en-GB')}`; }
function pct(n: number) { return `${n.toFixed(1)}%`; }

type CellStatus = 'better' | 'worse' | 'neutral';

function CompareRow({
    label,
    a,
    b,
    status,
    flip = false,
}: {
    label: string;
    a: string;
    b: string | null;
    status?: CellStatus;
    flip?: boolean;
}) {
    const effectiveStatus = flip && status === 'better' ? 'worse'
        : flip && status === 'worse' ? 'better'
        : status;

    const colorA = !b ? 'text-gray-800' : effectiveStatus === 'better' ? 'text-green-600 font-semibold' : effectiveStatus === 'worse' ? 'text-red-600' : 'text-gray-800';
    const colorB = !b ? 'text-gray-400' : effectiveStatus === 'better' ? 'text-red-600' : effectiveStatus === 'worse' ? 'text-green-600 font-semibold' : 'text-gray-800';

    return (
        <tr className="border-t border-gray-100">
            <td className="py-2.5 px-4 text-xs text-gray-500 font-medium">{label}</td>
            <td className={`py-2.5 px-4 text-sm text-right ${colorA}`}>{a}</td>
            <td className={`py-2.5 px-4 text-sm text-right ${b ? colorB : 'text-gray-300'}`}>{b ?? '—'}</td>
        </tr>
    );
}

function TableGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <>
            <tr className="bg-gray-50">
                <td colSpan={3} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</td>
            </tr>
            {children}
        </>
    );
}

function compareNum(a: number, b: number | null): CellStatus {
    if (b === null) return 'neutral';
    if (a > b) return 'better';
    if (a < b) return 'worse';
    return 'neutral';
}

export function CompareStep({ config, snapshot }: CompareStepProps) {
    const { user } = useAuth();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const saved = useMemo(() => user ? listSavedConfigs(user.id) : [], [user]);
    const otherConfig = useMemo(() => saved.find(s => s.id === selectedId)?.config ?? null, [saved, selectedId]);
    const otherSnap   = useMemo(() => otherConfig ? runSimulation(otherConfig) : null, [otherConfig]);

    const A = snapshot;
    const B = otherSnap;

    const aName = config.name || 'Current';
    const bName = otherConfig?.name || 'Compare';

    return (
        <div className="flex flex-col gap-6 w-full max-w-3xl">
            <div>
                <h2 className="text-2xl font-semibold text-gray-900">Compare Configurations</h2>
                <p className="text-sm text-gray-500 mt-1">Select a saved festival to compare key metrics side by side.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <label className="text-xs font-medium text-gray-700 block mb-2">Load a saved festival to compare</label>
                {saved.length === 0 ? (
                    <p className="text-sm text-gray-400">No saved festivals yet. Save your current configuration first using the Save button in the sidebar.</p>
                ) : (
                    <select
                        value={selectedId ?? ''}
                        onChange={e => setSelectedId(e.target.value || null)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
                    >
                        <option value="">— pick a saved festival —</option>
                        {saved.map(s => (
                            <option key={s.id} value={s.id} disabled={s.id === config.id}>
                                {s.name}{s.id === config.id ? ' (current)' : ''} — saved {new Date(s.savedAt).toLocaleDateString('en-GB')}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">Metric</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-purple-600 uppercase tracking-wider w-1/4 truncate" title={aName}>{aName}</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/4 truncate" title={bName}>{B ? bName : 'No selection'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <TableGroup title="Configuration">
                            <CompareRow label="Attendance" a={config.expectedAttendance.toLocaleString('en-GB')} b={B ? otherConfig!.expectedAttendance.toLocaleString('en-GB') : null} status={compareNum(config.expectedAttendance, B ? otherConfig!.expectedAttendance : null)} />
                            <CompareRow label="Duration (h)" a={String(config.durationHours)} b={B ? String(otherConfig!.durationHours) : null} />
                            <CompareRow label="Stages" a={String(config.stages.length)} b={B ? String(otherConfig!.stages.length) : null} />
                            <CompareRow label="Artists" a={String(config.lineup.length)} b={B ? String(otherConfig!.lineup.length) : null} />
                        </TableGroup>

                        <TableGroup title="Financials">
                            <CompareRow label="Total Revenue" a={fmt(A.pnl.totalRevenue)} b={B ? fmt(B.pnl.totalRevenue) : null} status={compareNum(A.pnl.totalRevenue, B ? B.pnl.totalRevenue : null)} />
                            <CompareRow label="Total Costs" a={fmt(A.pnl.totalCosts)} b={B ? fmt(B.pnl.totalCosts) : null} status={compareNum(A.pnl.totalCosts, B ? B.pnl.totalCosts : null)} flip />
                            <CompareRow label="Net Profit" a={fmt(A.pnl.netProfit)} b={B ? fmt(B.pnl.netProfit) : null} status={compareNum(A.pnl.netProfit, B ? B.pnl.netProfit : null)} />
                            <CompareRow label="Margin" a={pct(A.pnl.marginPct)} b={B ? pct(B.pnl.marginPct) : null} status={compareNum(A.pnl.marginPct, B ? B.pnl.marginPct : null)} />
                            <CompareRow label="Break-even" a={A.pnl.breakEvenAttendance.toLocaleString('en-GB')} b={B ? B.pnl.breakEvenAttendance.toLocaleString('en-GB') : null} status={compareNum(A.pnl.breakEvenAttendance, B ? B.pnl.breakEvenAttendance : null)} flip />
                            <CompareRow label="Revenue / head" a={fmt(A.pnl.revenuePerHead)} b={B ? fmt(B.pnl.revenuePerHead) : null} status={compareNum(A.pnl.revenuePerHead, B ? B.pnl.revenuePerHead : null)} />
                            <CompareRow label="Cost / head" a={fmt(A.pnl.costPerHead)} b={B ? fmt(B.pnl.costPerHead) : null} status={compareNum(A.pnl.costPerHead, B ? B.pnl.costPerHead : null)} flip />
                            <CompareRow label="Viable?" a={A.pnl.isViable ? 'Yes' : 'No'} b={B ? (B.pnl.isViable ? 'Yes' : 'No') : null} />
                        </TableGroup>

                        <TableGroup title="Revenue Streams">
                            <CompareRow label="Ticket revenue" a={fmt(A.ticketRevenue.netRevenueExVat)} b={B ? fmt(B.ticketRevenue.netRevenueExVat) : null} status={compareNum(A.ticketRevenue.netRevenueExVat, B ? B.ticketRevenue.netRevenueExVat : null)} />
                            <CompareRow label="Catering & bar" a={fmt(A.catering.totalCateringRevenue)} b={B ? fmt(B.catering.totalCateringRevenue) : null} status={compareNum(A.catering.totalCateringRevenue, B ? B.catering.totalCateringRevenue : null)} />
                            <CompareRow label="Sponsorship" a={fmt(A.sponsorship.estimatedRevenue)} b={B ? fmt(B.sponsorship.estimatedRevenue) : null} status={compareNum(A.sponsorship.estimatedRevenue, B ? B.sponsorship.estimatedRevenue : null)} />
                        </TableGroup>

                        <TableGroup title="Artist & Staffing Costs">
                            <CompareRow label="Artist fees total" a={fmt(A.artistCosts.grandTotal)} b={B ? fmt(B.artistCosts.grandTotal) : null} status={compareNum(A.artistCosts.grandTotal, B ? B.artistCosts.grandTotal : null)} flip />
                            <CompareRow label="Artist % of revenue" a={pct(A.artistCosts.percentageOfRevenue)} b={B ? pct(B.artistCosts.percentageOfRevenue) : null} status={compareNum(A.artistCosts.percentageOfRevenue, B ? B.artistCosts.percentageOfRevenue : null)} flip />
                            <CompareRow label="Staff headcount" a={String(A.staffing.totalHeadCount)} b={B ? String(B.staffing.totalHeadCount) : null} />
                            <CompareRow label="Staff cost" a={fmt(A.staffing.estimatedStaffCost)} b={B ? fmt(B.staffing.estimatedStaffCost) : null} status={compareNum(A.staffing.estimatedStaffCost, B ? B.staffing.estimatedStaffCost : null)} flip />
                        </TableGroup>

                        <TableGroup title="Site & Crowd Safety">
                            <CompareRow label="Site area (m²)" a={config.siteAreaConfig.totalAreaSqM.toLocaleString('en-GB')} b={B ? otherConfig!.siteAreaConfig.totalAreaSqM.toLocaleString('en-GB') : null} />
                            <CompareRow label="Crowd density (p/m²)" a={A.crowdDensity.density.toFixed(2)} b={B ? B.crowdDensity.density.toFixed(2) : null} status={compareNum(A.crowdDensity.density, B ? B.crowdDensity.density : null)} flip />
                            <CompareRow label="Crowd safety" a={A.crowdDensity.safetyStatus} b={B ? B.crowdDensity.safetyStatus : null} />
                            <CompareRow label="Toilet units" a={String(A.toilets.totalWCs)} b={B ? String(B.toilets.totalWCs) : null} status={compareNum(A.toilets.totalWCs, B ? B.toilets.totalWCs : null)} />
                        </TableGroup>

                        <TableGroup title="Energy & Environment">
                            <CompareRow label="Total kVA" a={A.energy.totalKva.toLocaleString('en-GB')} b={B ? B.energy.totalKva.toLocaleString('en-GB') : null} />
                            <CompareRow label="Fuel cost" a={fmt(A.energy.fuelCostEstimate)} b={B ? fmt(B.energy.fuelCostEstimate) : null} status={compareNum(A.energy.fuelCostEstimate, B ? B.energy.fuelCostEstimate : null)} flip />
                            <CompareRow label="CO₂ estimate (kg)" a={A.energy.co2KgEstimate.toLocaleString('en-GB')} b={B ? B.energy.co2KgEstimate.toLocaleString('en-GB') : null} status={compareNum(A.energy.co2KgEstimate, B ? B.energy.co2KgEstimate : null)} flip />
                        </TableGroup>

                        <TableGroup title="Risk & Score">
                            <CompareRow label="Weather risk" a={A.weatherRisk.rainRiskLevel} b={B ? B.weatherRisk.rainRiskLevel : null} />
                            <CompareRow label="Margin under rain" a={pct(A.weatherRisk.marginUnderRain)} b={B ? pct(B.weatherRisk.marginUnderRain) : null} status={compareNum(A.weatherRisk.marginUnderRain, B ? B.weatherRisk.marginUnderRain : null)} />
                            <CompareRow label="Efficiency score" a={String(A.efficiencyScore.overallScore)} b={B ? String(B.efficiencyScore.overallScore) : null} status={compareNum(A.efficiencyScore.overallScore, B ? B.efficiencyScore.overallScore : null)} />
                        </TableGroup>
                    </tbody>
                </table>
            </div>

            {B && (
                <p className="text-xs text-gray-400 text-center">
                    <span className="text-green-600 font-semibold">Green</span> = current config is better ·
                    {' '}<span className="text-red-600">Red</span> = comparison config is better
                </p>
            )}
        </div>
    );
}
