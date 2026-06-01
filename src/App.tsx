import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginPage }   from './components/auth/LoginPage';
import { useWizardState } from './hooks/useWizardState';
import { useSimulation }  from './hooks/useSimulation';
import { WizardLayout }   from './components/wizard';

function FestivalApp() {
    const { user } = useAuth();
    const wizard   = useWizardState(user?.id);
    const snapshot = useSimulation(wizard.config);

    if (!user) return <LoginPage />;
    return <WizardLayout wizard={wizard} snapshot={snapshot} />;
}

function App() {
    return (
        <AuthProvider>
            <FestivalApp />
        </AuthProvider>
    );
}

export default App;
