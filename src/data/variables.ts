/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /**
     * Correct answer for cloze input validation.
     * Accepts a single string, pipe-separated alternates (e.g. "first | 1 | 1st"),
     * or an array of accepted answers (e.g. ["first", "1", "1st"]).
     */
    correctAnswer?: string | string[];
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ─────────────────────────────────────────
    // Section: One Row Meets One Column
    // ─────────────────────────────────────────
    rowColumnSelectedRow: {
        defaultValue: 0,
        type: 'number',
        label: 'Selected answer row',
        description: 'Which row of the answer grid the student is building (0 or 1)',
        min: 0,
        max: 1,
        step: 1,
        color: '#62D0AD',
    },
    rowColumnSelectedColumn: {
        defaultValue: 0,
        type: 'number',
        label: 'Selected answer column',
        description: 'Which column of the answer grid the student is building (0 or 1)',
        min: 0,
        max: 1,
        step: 1,
        color: '#8E90F5',
    },
    rowColumnPairsMade: {
        defaultValue: 0,
        type: 'number',
        label: 'Pairs made',
        description: 'How many row-column number pairs the student has joined for the current entry',
        min: 0,
        max: 3,
        step: 1,
        color: '#62D0AD',
    },
    rowColumnFilledCells: {
        defaultValue: [0, 0, 0, 0],
        type: 'array',
        label: 'Filled answer cells',
        description: 'Which of the four answer entries the student has completed',
    },
    rowColumnHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Row / column highlight',
        description: 'Highlights the selected row of the recipe matrix or column of the price matrix',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.2)',
    },
    // ─────────────────────────────────────────
    // Section: Size and Order
    // ─────────────────────────────────────────
    orderPairShape: {
        defaultValue: 'two square matrices',
        type: 'select',
        label: 'Shape of the pair',
        description: 'Which pair of matrices is on the bench',
        options: ['two square matrices', 'a wide and a tall matrix', 'a mismatched pair'],
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.15)',
    },
    orderMatrixA: {
        defaultValue: [1, 2, 3, 4],
        type: 'array',
        label: 'Matrix A entries',
        description: 'Entries of the first matrix, read left to right, row by row',
    },
    orderMatrixB: {
        defaultValue: [2, 0, 1, 5],
        type: 'array',
        label: 'Matrix B entries',
        description: 'Entries of the second matrix, read left to right, row by row',
    },
    orderHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Product highlight',
        description: 'Highlights the A times B answer or the B times A answer',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.2)',
    },
    answerOrderSize: {
        defaultValue: '',
        type: 'text',
        label: 'Answer size',
        description: 'Student answer for the size of a 3 by 4 times 4 by 2 product',
        placeholder: '??? by ???',
        correctAnswer: ['3 by 2', '3x2', '3 x 2', '3×2', '3 × 2', '3 2', '3,2', '3, 2'],
        color: '#8E90F5',
    },
    answerOrderSwap: {
        defaultValue: '',
        type: 'text',
        label: 'Swapped top-left entry',
        description: 'Student answer for the top-left entry of B times A',
        placeholder: '???',
        correctAnswer: '1',
        color: '#8E90F5',
    },
    // ─────────────────────────────────────────
    // Section: The Determinant
    // ─────────────────────────────────────────
    detEntryA: {
        defaultValue: 2,
        type: 'number',
        label: 'Matrix entry a',
        description: 'Across-step of the first column, where the corner (1, 0) lands',
        min: -1,
        max: 3,
        step: 0.5,
        color: '#62D0AD',
    },
    detEntryC: {
        defaultValue: 0,
        type: 'number',
        label: 'Matrix entry c',
        description: 'Up-step of the first column, where the corner (1, 0) lands',
        min: -1,
        max: 3,
        step: 0.5,
        color: '#62D0AD',
    },
    detEntryB: {
        defaultValue: 1,
        type: 'number',
        label: 'Matrix entry b',
        description: 'Across-step of the second column, where the corner (0, 1) lands',
        min: -1,
        max: 3,
        step: 0.5,
        color: '#8E90F5',
    },
    detEntryD: {
        defaultValue: 2,
        type: 'number',
        label: 'Matrix entry d',
        description: 'Up-step of the second column, where the corner (0, 1) lands',
        min: -1,
        max: 3,
        step: 0.5,
        color: '#8E90F5',
    },
    determinantValue: {
        defaultValue: 4,
        type: 'number',
        label: 'Determinant',
        description: 'Read-only determinant of the current two by two matrix',
        min: -12,
        max: 12,
        step: 0.25,
        color: '#AC8BF9',
    },
    determinantHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Determinant highlight',
        description: 'Highlights the leaning parallelogram or the square it started as',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.2)',
    },
    answerDeterminantValue: {
        defaultValue: '',
        type: 'text',
        label: 'Determinant answer',
        description: 'Student answer for the determinant of a fresh two by two matrix',
        placeholder: '???',
        correctAnswer: '7',
        color: '#8E90F5',
    },
    answerDeterminantZero: {
        defaultValue: '',
        type: 'select',
        label: 'Zero determinant answer',
        description: 'Student answer for what a zero determinant does to the square',
        placeholder: '???',
        correctAnswer: 'a line',
        options: ['a line', 'a bigger square', 'a triangle', 'a point'],
        color: '#8E90F5',
    },
    // ─────────────────────────────────────────
    // Section: The Inverse
    // ─────────────────────────────────────────
    inverseTimeline: {
        defaultValue: 0,
        type: 'number',
        label: 'Timeline position',
        description: 'Where the story has reached: 0 is the start, 1 is after the matrix, 2 is after the inverse',
        min: 0,
        max: 2,
        step: 0.02,
        color: '#62D0AD',
    },
    inverseMatrixChoice: {
        defaultValue: 'a shear',
        type: 'select',
        label: 'Matrix on the bench',
        description: 'Which matrix tips the letter F over',
        options: ['a shear', 'a stretch', 'a flattening matrix'],
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.15)',
    },
    inversePlaying: {
        defaultValue: false,
        type: 'boolean',
        label: 'Timeline playing',
        description: 'Whether the there-and-back story is running on its own',
    },
    inverseHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Inverse highlight',
        description: 'Highlights the moving letter F or the faint outline it started from',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.2)',
    },
    answerInverseIdentity: {
        defaultValue: '',
        type: 'select',
        label: 'Matrix times its inverse',
        description: 'Student answer for what a matrix times its inverse gives',
        placeholder: '???',
        correctAnswer: 'the identity matrix',
        options: ['the identity matrix', 'the zero matrix', 'the original matrix', 'the determinant'],
        color: '#8E90F5',
    },
    answerInverseEntry: {
        defaultValue: '',
        type: 'text',
        label: 'Inverse top-left entry',
        description: 'Student answer for the top-left entry of an inverse matrix',
        placeholder: '???',
        correctAnswer: '2',
        color: '#8E90F5',
    },
    // ─────────────────────────────────────────
    // Section: Putting It All Together
    // ─────────────────────────────────────────
    answerPracticeSize: {
        defaultValue: '',
        type: 'text',
        label: 'Practice: size of the product',
        description: 'Student answer for the size of a 2 by 3 times 3 by 4 product',
        placeholder: '??? by ???',
        correctAnswer: ['2 by 4', '2x4', '2 x 4', '2×4', '2 × 4', '2 4', '2,4', '2, 4'],
        color: '#8E90F5',
    },
    answerPracticeEntryAB: {
        defaultValue: '',
        type: 'text',
        label: 'Practice: entry of A times B',
        description: 'Student answer for the row 1, column 2 entry of A times B',
        placeholder: '???',
        correctAnswer: '10',
        color: '#8E90F5',
    },
    answerPracticeEntryBA: {
        defaultValue: '',
        type: 'text',
        label: 'Practice: entry of B times A',
        description: 'Student answer for the row 1, column 2 entry of B times A',
        placeholder: '???',
        correctAnswer: '23',
        color: '#8E90F5',
    },
    answerPracticeDeterminant: {
        defaultValue: '',
        type: 'text',
        label: 'Practice: determinant',
        description: 'Student answer for the determinant of a fresh two by two matrix',
        placeholder: '???',
        correctAnswer: '14',
        color: '#8E90F5',
    },
    answerPracticeArea: {
        defaultValue: '',
        type: 'text',
        label: 'Practice: scaled area',
        description: 'Student answer for the area of a shape after a determinant 3 matrix',
        placeholder: '???',
        correctAnswer: '15',
        color: '#8E90F5',
    },
    answerRowColumnEntry: {
        defaultValue: '',
        type: 'text',
        label: 'Top-left entry answer',
        description: 'Student answer for the top-left entry of a fresh matrix product',
        placeholder: '???',
        correctAnswer: '4',
        color: '#8E90F5',
    },
    answerRowColumnAddress: {
        defaultValue: '',
        type: 'select',
        label: 'Entry address answer',
        description: 'Student answer for which column builds the row 2, column 1 entry',
        placeholder: '???',
        correctAnswer: 'column 1',
        options: ['column 1', 'column 2', 'row 1', 'row 2'],
        color: '#8E90F5',
    },

    // ========================================
    // ADD YOUR VARIABLES HERE
    // ========================================

    // Uncomment and modify these examples for your lesson:

    /*
    // ─────────────────────────────────────────
    // NUMBER - Use with sliders
    // ─────────────────────────────────────────
    myValue: {
        defaultValue: 5,
        type: 'number',
        label: 'My Value',
        description: 'A number that controls something',
        unit: 'm',           // optional unit display
        min: 0,
        max: 10,
        step: 0.5,
    },

    // ─────────────────────────────────────────
    // TEXT - Free text input
    // ─────────────────────────────────────────
    lessonTitle: {
        defaultValue: 'My Lesson',
        type: 'text',
        label: 'Lesson Title',
        description: 'The title of your lesson',
        placeholder: 'Enter a title...',
    },

    // ─────────────────────────────────────────
    // SELECT - Dropdown with options
    // ─────────────────────────────────────────
    difficulty: {
        defaultValue: 'medium',
        type: 'select',
        label: 'Difficulty',
        description: 'The difficulty level of the lesson',
        options: ['easy', 'medium', 'hard', 'expert'],
    },

    // ─────────────────────────────────────────
    // BOOLEAN - Toggle switch
    // ─────────────────────────────────────────
    showHints: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Hints',
        description: 'Toggle to show or hide hints',
    },

    // ─────────────────────────────────────────
    // ARRAY - List of numbers
    // ─────────────────────────────────────────
    dataPoints: {
        defaultValue: [1, 4, 9, 16, 25],
        type: 'array',
        label: 'Data Points',
        description: 'Y-values for plotting a graph',
    },

    // ─────────────────────────────────────────
    // OBJECT - Complex structured data
    // ─────────────────────────────────────────
    graphSettings: {
        defaultValue: { 
            xMin: -10, 
            xMax: 10, 
            showGrid: true 
        },
        type: 'object',
        label: 'Graph Settings',
        description: 'Configuration for the graph display',
        schema: '{ xMin: number, xMax: number, showGrid: boolean }',
    },
    */
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
