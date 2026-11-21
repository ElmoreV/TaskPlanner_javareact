//useTaskFilter.ts
import { useMemo } from "react";
import { adaptFilterData } from "./filterData";
import { filterTasks } from "./taskFilter";
import type { FilterSource } from "./filterData";
import type {
  FilterSettings,
  FilterSettingsSetter,
  TaskFilterController,
} from "./FilterTypes";
import { View } from "../Structure/View";
import { FILTER_CONFIG_BY_VIEW, neutralizeUnsupportedSettings } from "./filterSettings";


export const useTaskFilter = (
  appData: FilterSource,
  view: View,
  filterSettings: FilterSettings | undefined,
  setFilterSettings: FilterSettingsSetter
): TaskFilterController => {
  const viewConfig = FILTER_CONFIG_BY_VIEW[view];
  if (!viewConfig)
    throw new Error("View " + View[view] + " does not define filter features.");
  const normalizedFilterData = useMemo(
    () => adaptFilterData(appData),
    [appData]
  );
  const { filterResult, effectiveSettings } = useMemo(() => {
    const effectiveSettings = neutralizeUnsupportedSettings(
      filterSettings ?? viewConfig.defaults,
      viewConfig.features
    );
    return {
      filterResult: filterTasks(normalizedFilterData, effectiveSettings),
      effectiveSettings,
    };
  }, [normalizedFilterData, filterSettings, viewConfig]);
  return {
    ...filterResult,
    settings: effectiveSettings,
    features: viewConfig.features,
    setFilterSettingsWithDefaults: (updateSettings) =>
      setFilterSettings((previous) =>
        updateSettings(previous ?? viewConfig.defaults)
      ),
    reset: () => setFilterSettings(() => viewConfig.defaults),
  };
};
