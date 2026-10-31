import { Admin, CustomRoutes, Resource } from 'react-admin';
import { Route } from 'react-router-dom';
import { ForgotPasswordPage, SetPasswordPage } from 'ra-supabase';
import type { ProfileRow } from '@shared/supabase/database.types';
import { authProvider } from './providers/authProvider';
import { dataProvider } from './providers/dataProvider';
import { i18nProvider } from './i18n';
import { theme } from './theme';
import { AdminLayout, icons } from './layout/AdminLayout';
import { Dashboard } from './pages/Home';
import { isDemo } from './demo/flag';
import { demoAuthProvider, demoDataProvider } from './demo/providers';
import { HeroesLoginPage } from './pages/LoginPage';
import { ProfileList } from './resources/profiles/ProfileList';
import { ProfileShow } from './resources/profiles/ProfileShow';
import { ProfileEdit } from './resources/profiles/ProfileEdit';
import { MissionList } from './resources/missions/MissionList';
import { MissionShow } from './resources/missions/MissionShow';
import { ServiceCreate, ServiceEdit, ServiceList } from './resources/services/Services';
import { LegalPageCreate, LegalPageEdit, LegalPageList, VatRateCreate, VatRateEdit, VatRateList } from './resources/catalog/Catalog';
import { DocumentList, NotificationList, PaymentList, ReviewList, SupportEdit, SupportList } from './resources/activity/Activity';
import { fmtDate, fullName, shortId } from './lib/format';

export function App() {
  return (
    <Admin
      title="HEROES Admin"
      dataProvider={isDemo ? demoDataProvider : dataProvider}
      authProvider={isDemo ? demoAuthProvider : authProvider}
      i18nProvider={i18nProvider}
      theme={theme}
      darkTheme={null}
      layout={AdminLayout}
      dashboard={Dashboard}
      loginPage={HeroesLoginPage}
      disableTelemetry
    >
      <CustomRoutes noLayout>
        <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
        <Route path={ForgotPasswordPage.path} element={<ForgotPasswordPage />} />
      </CustomRoutes>

      <Resource
        name="profiles"
        list={ProfileList}
        show={ProfileShow}
        edit={ProfileEdit}
        icon={icons.profiles}
        recordRepresentation={(r: ProfileRow) => fullName(r) || r.email || shortId(r.id)}
      />
      <Resource name="pro_documents" list={DocumentList} icon={icons.documents} />
      <Resource
        name="missions"
        list={MissionList}
        show={MissionShow}
        icon={icons.missions}
        recordRepresentation={(m: { id: string; start_date: string }) => `${fmtDate(m.start_date)} · ${shortId(m.id)}`}
      />
      <Resource name="payments" list={PaymentList} icon={icons.payments} />
      <Resource name="reviews" list={ReviewList} icon={icons.reviews} />
      <Resource name="support_requests" list={SupportList} edit={SupportEdit} icon={icons.support} />
      <Resource name="notifications" list={NotificationList} icon={icons.notifications} />
      <Resource name="services" list={ServiceList} edit={ServiceEdit} create={ServiceCreate} icon={icons.services} recordRepresentation="name" />
      <Resource name="sub_services" recordRepresentation="name" />
      <Resource name="vat_rates" list={VatRateList} edit={VatRateEdit} create={VatRateCreate} icon={icons.vat} recordRepresentation="label" />
      <Resource name="legal_pages" list={LegalPageList} edit={LegalPageEdit} create={LegalPageCreate} icon={icons.legal} recordRepresentation="title" />
      <Resource name="mission_expenses" />
      <Resource name="mission_reschedules" />
      <Resource name="messages" />
      <Resource name="pro_services" />
    </Admin>
  );
}
