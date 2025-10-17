import { AppData } from "../Structure/AppDataTypes.ts";
import { Version } from "../Structure/Versions.ts";
import { convertAppdata } from "../Converters/VersionConversion.ts";

export const parseJSON = (
  jsonStr: string,
  targetVersion: Version
): AppData | undefined => {
  let importedData = JSON.parse(jsonStr);
  let convertedAppData = convertAppdata(importedData, targetVersion);
  return convertedAppData;
};
