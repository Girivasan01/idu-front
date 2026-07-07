import { useMemo } from 'react';
import useLanguage from '@/locale/useLanguage';

import CompanyLogoSettingsModule from '@/modules/SettingModule/CompanyLogoSettingsModule';

export default function AppSettings() {
  const translate = useLanguage();

  // ---- Entity name used by settings system ----
  const entity = 'setting';

  // ---- Labels (with safe fallbacks) ----
  const labels = useMemo(
    () => ({
      PANEL_TITLE: translate('settings') || 'Settings',
      DATATABLE_TITLE: translate('settings_list') || 'Settings List',
      ADD_NEW_ENTITY:
        translate('add_new_settings') || 'Add New Settings',
      ENTITY_NAME: translate('settings') || 'Settings',
      SETTINGS_TITLE:
        translate('General Settings') || 'General Settings',
    }),
    [translate]
  );

  // ---- Configuration object ----
  const configPage = useMemo(
    () => ({
      entity,
      settingsCategory: 'app_settings', // MUST match backend category
      ...labels,
    }),
    [entity, labels]
  );

  return <CompanyLogoSettingsModule config={configPage} />;
}