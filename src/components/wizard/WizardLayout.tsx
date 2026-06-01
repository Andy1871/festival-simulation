import { WizardSidebar }  from './WizardSidebar';
import { BasicStep }      from './steps/basic/BasicStep';
import { SiteStep }       from './steps/site/SiteStep';
import { LineupStep }     from './steps/lineup/LineupStep';
import { TicketingStep }  from './steps/ticketing/TicketingStep';
import { OperationsStep } from './steps/operations/OperationsStep';
import { ReviewStep }     from './steps/review/ReviewStep';
import { CompareStep }    from './steps/compare/CompareStep';
import { ForecastBar }    from '../layout/ForecastBar';
import { calculateStaffing } from '../../calculations/calculateStaffing';
import type { useWizardState } from '../../hooks/useWizardState';
import type { MetricsSnapshot } from '../../calculations/types';

interface WizardLayoutProps {
    wizard:   ReturnType<typeof useWizardState>;
    snapshot: MetricsSnapshot;
}

// Pass down all of the wizard config to each child step for it to use
export function WizardLayout({ wizard, snapshot }: WizardLayoutProps) {
    const {
        config, currentStep, errors, warnings, setStep, resetConfig, loadConfig, updateAfterSave,
        updateBasic, updateSiteArea, addStage, removeStage, updateStageName, addChillZone, removeChillZone, updateChillZone,
        addArtist, removeArtist, updateArtist,
        addTicketTier, removeTicketTier, updateTicketTier,
        addVendor, removeVendor, updateVendor, setStaffOverrides,
        addSponsor, removeSponsor, updateSponsor,
    } = wizard;

    const renderStep = () => {
        switch (currentStep) {
            case 'basic':
                return <BasicStep config={config} updateBasic={updateBasic} warnings={warnings.basic} />;
            case 'site':
                return <SiteStep
                    config={config}
                    updateSiteArea={updateSiteArea}
                    addStage={addStage}
                    removeStage={removeStage}
                    updateStageName={updateStageName}
                    addChillZone={addChillZone}
                    removeChillZone={removeChillZone}
                    updateChillZone={updateChillZone}
                    maxAttendance={snapshot.siteCapacity.maxAttendance}
                    usableAreaSqM={snapshot.siteCapacity.usableAreaSqM}
                />;
            case 'lineup':
                return <LineupStep
                    config={config}
                    addArtist={addArtist}
                    removeArtist={removeArtist}
                    updateArtist={updateArtist}
                    onGoToSite={() => setStep('site')}
                />;
            case 'ticketing':
                return <TicketingStep
                    config={config}
                    addTicketTier={addTicketTier}
                    removeTicketTier={removeTicketTier}
                    updateTicketTier={updateTicketTier}
                    maxAttendance={snapshot.siteCapacity.maxAttendance}
                    overAllocatedWarning={snapshot.ticketRevenue.overAllocatedWarning}
                    onGoToSite={() => setStep('site')}
                />;
            case 'operations':
                return <OperationsStep
                    config={config}
                    updateBasic={updateBasic}
                    addVendor={addVendor}
                    removeVendor={removeVendor}
                    updateVendor={updateVendor}
                    setStaffOverrides={setStaffOverrides}
                    addSponsor={addSponsor}
                    removeSponsor={removeSponsor}
                    updateSponsor={updateSponsor}
                    staffingSnapshot={snapshot.staffing}
                />;
            case 'review':
                return <ReviewStep
                    snapshot={snapshot}
                    config={config}
                    isReady={wizard.isSimulationReady}
                    errors={errors}
                />;
            case 'compare':
                return <CompareStep config={config} snapshot={snapshot} />;
        }
    };

    const { pnl, crowdDensity, energy, ticketRevenue, weatherRisk, artistCosts, staffing } = snapshot;

    const staffingBaseline = calculateStaffing(config.expectedAttendance, config.durationHours, config.stages.length);
    const staffingIsRed = [
        { actual: staffing.securityCount, recommended: staffingBaseline.securityCount },
        { actual: staffing.stewardCount, recommended: staffingBaseline.stewardCount },
        { actual: staffing.medicalTeam.firstAiders, recommended: staffingBaseline.medicalTeam.firstAiders },
        { actual: staffing.welfareStaff, recommended: staffingBaseline.welfareStaff },
        { actual: staffing.barStaff, recommended: staffingBaseline.barStaff },
    ].some(({ actual, recommended }) => actual === 0 || actual < recommended * 0.5);

    const reviewHasRed =
        crowdDensity.safetyStatus === 'danger' ||
        energy.efficiencyWarnings.length > 2 ||
        pnl.marginPct < 10 ||
        artistCosts.overBudgetWarning ||
        weatherRisk.rainRiskLevel === 'high' ||
        config.lineup.length === 0 ||
        ticketRevenue.overAllocatedWarning ||
        config.siteAreaConfig.totalAreaSqM === 0 ||
        snapshot.siteCapacity.overAllocatedWarning ||
        (!config.vendors.some(v => v.type === 'foodAndDrink') && !config.attendeesBringFood) ||
        staffingIsRed;

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <WizardSidebar
                currentStep={currentStep}
                errors={errors}
                warnings={warnings}
                reviewHasRed={reviewHasRed}
                config={config}
                onStepClick={setStep}
                onReset={resetConfig}
                onLoad={loadConfig}
                onAfterSave={updateAfterSave}
            />
            <main className="flex-1 overflow-y-auto pb-28 md:pb-14">
                <div className="px-6 py-8 md:px-10 md:py-10 flex justify-center">
                    {renderStep()}
                </div>
            </main>
            <ForecastBar config={config} snapshot={snapshot} />
        </div>
    );
}
