import { type ReactElement } from "react";

// Initialize variables and their colors from this file's variable definitions
import { useVariableStore, initializeVariableColors } from "@/stores";
import { getDefaultValues, variableDefinitions } from "./variables";
useVariableStore.getState().initialize(getDefaultValues());
initializeVariableColors(variableDefinitions);

import { matricesIntroBlocks } from "./sections/matricesIntro";
import { matricesRowMeetsColumnBlocks } from "./sections/matricesRowMeetsColumn";
import { matricesSizeAndOrderBlocks } from "./sections/matricesSizeAndOrder";
import { matricesDeterminantBlocks } from "./sections/matricesDeterminant";
import { matricesInverseBlocks } from "./sections/matricesInverse";
import { matricesPracticeBlocks } from "./sections/matricesPractice";
import { matricesConclusionBlocks } from "./sections/matricesConclusion";

export const blocks: ReactElement[] = [
    ...matricesIntroBlocks,
    ...matricesRowMeetsColumnBlocks,
    ...matricesSizeAndOrderBlocks,
    ...matricesDeterminantBlocks,
    ...matricesInverseBlocks,
    ...matricesPracticeBlocks,
    ...matricesConclusionBlocks,
];
