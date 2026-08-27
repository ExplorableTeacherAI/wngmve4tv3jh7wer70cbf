import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineFormula,
    InlineToggle,
} from "@/components/atoms";
import { useVar } from "@/stores";
import {
    getVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    togglePropsFromDefinition,
} from "../variables";

const MATRIX_A = "A = \\begin{bmatrix} 2 & 3 \\\\ 1 & 4 \\end{bmatrix}";
const MATRIX_B = "B = \\begin{bmatrix} 1 & 5 \\\\ 2 & 0 \\end{bmatrix}";

/**
 * The four squares of C times D. Switching the toggle swaps in the question for
 * that square, each with its own answer and its own explanation.
 */
const GRID_ENTRIES: Record<string, { varName: string; answer: string; pairing: string; success: string }> = {
    "row 1, column 1": {
        varName: "answerPracticeGridTopLeft",
        answer: "8",
        pairing: "row 1 of C is 1 and 2; column 1 of D is 4 and 2, read downwards",
        success: "— exactly, 1 × 4 plus 2 × 2 gives 8",
    },
    "row 1, column 2": {
        varName: "answerPracticeGridTopRight",
        answer: "11",
        pairing: "row 1 of C is 1 and 2; column 2 of D is 1 and 5, read downwards",
        success: "— right, 1 × 1 plus 2 × 5 gives 11",
    },
    "row 2, column 1": {
        varName: "answerPracticeGridBottomLeft",
        answer: "12",
        pairing: "row 2 of C is 3 and 0, so the second pair contributes nothing",
        success: "— exactly, 3 × 4 plus 0 × 2 gives 12",
    },
    "row 2, column 2": {
        varName: "answerPracticeGridBottomRight",
        answer: "3",
        pairing: "row 2 of C is 3 and 0, so only the first pair counts",
        success: "— right, 3 × 1 plus 0 × 5 gives 3",
    },
};

/** Shows the question belonging to whichever square the toggle is pointing at. */
function GridEntryQuestion() {
    const position = useVar<string>("practiceEntryPosition", "row 1, column 1");
    const entry = GRID_ENTRIES[position] ?? GRID_ENTRIES["row 1, column 1"];
    return (
        <InlineFeedback
            key={entry.varName}
            varName={entry.varName}
            correctValue={entry.answer}
            position="terminal"
            successMessage={entry.success}
            failureMessage="— not that one."
            hint={entry.pairing}
            visualizationHint={{
                blockId: "row-column-visual",
                hintKey: "practice-grid-entry-hint",
                steps: [
                    {
                        gesture: "click",
                        label: "Choose a square of the answer grid",
                        position: { x: "68%", y: "21%" },
                    },
                    {
                        gesture: "drag-horizontal",
                        label: "Join every pair and watch the products add up",
                        position: { x: "16%", y: "57%" },
                        completionVar: "rowColumnPairsMade",
                        completionValue: 3,
                        completionTolerance: 0.4,
                    },
                ],
                label: "Build one on the grid",
                resetVars: { rowColumnSelectedRow: 0, rowColumnSelectedColumn: 0, rowColumnPairsMade: 0 },
            }}
        >
            <InlineClozeChoice
                varName={entry.varName}
                correctAnswer={entry.answer}
                options={["3", "8", "11", "12"]}
                {...choicePropsFromDefinition(getVariableInfo(entry.varName))}
            />
        </InlineFeedback>
    );
}

export const matricesPracticeBlocks: ReactElement[] = [
    <StackLayout key="layout-practice-heading" maxWidth="xl">
        <Block id="practice-heading" padding="md">
            <EditableH2 id="h2-practice-heading" blockId="practice-heading">
                Putting It All Together
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-practice-intro" maxWidth="xl">
        <Block id="practice-intro" padding="sm">
            <EditableParagraph id="para-practice-intro" blockId="practice-intro">
                Five questions, one for each idea you have built. Nothing new appears here, so if one of
                them sticks, the visual it came from is waiting a scroll away.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-practice-question-size" maxWidth="xl">
        <Block id="practice-question-size" padding="md">
            <EditableParagraph id="para-practice-question-size" blockId="practice-question-size">
                1. A 2 by 3 matrix is multiplied by a 3 by 4 matrix. The product exists, and its size is{" "}
                <InlineFeedback
                    varName="answerPracticeSize"
                    correctValue={["2 by 4", "2x4", "2 x 4", "2×4", "2 × 4", "2 4", "2,4", "2, 4"]}
                    position="terminal"
                    successMessage="— exactly, the inner 3s pair off and the outer numbers survive"
                    failureMessage="— not that one."
                    hint="Rows come from the first matrix, columns from the second"
                    visualizationHint={{
                        blockId: "size-order-visual",
                        hintKey: "practice-size-hint",
                        steps: [
                            {
                                gesture: "drag-vertical",
                                label: "Drag a number and read the size line under each answer",
                                position: { x: "26%", y: "19%" },
                            },
                        ],
                        label: "Check it on the bench",
                        resetVars: { orderPairShape: "a wide and a tall matrix" },
                    }}
                >
                    <InlineClozeInput
                        varName="answerPracticeSize"
                        correctAnswer={["2 by 4", "2x4", "2 x 4", "2×4", "2 × 4", "2 4", "2,4", "2, 4"]}
                        {...clozePropsFromDefinition(getVariableInfo('answerPracticeSize'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-practice-pair" maxWidth="xl">
        <Block id="practice-pair" padding="sm">
            <EditableParagraph id="para-practice-pair" blockId="practice-pair">
                The next two questions both use{" "}
                <InlineFormula latex={MATRIX_A} colorMap={{}} />
                {" "}and{" "}
                <InlineFormula latex={MATRIX_B} colorMap={{}} />.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-practice-question-entry-ab" maxWidth="xl">
        <Block id="practice-question-entry-ab" padding="md">
            <EditableParagraph id="para-practice-question-entry-ab" blockId="practice-question-entry-ab">
                2. Pair row 1 of A with column 2 of B. The entry in row 1, column 2 of A times B is{" "}
                <InlineFeedback
                    varName="answerPracticeEntryAB"
                    correctValue="10"
                    position="terminal"
                    successMessage="— right, 2 × 5 plus 3 × 0 leaves 10"
                    failureMessage="— not quite."
                    hint="Row 1 of A is 2 and 3; column 2 of B is 5 and 0, read downwards"
                    visualizationHint={{
                        blockId: "row-column-visual",
                        hintKey: "practice-entry-ab-hint",
                        steps: [
                            {
                                gesture: "click",
                                label: "Choose the row 1, column 2 square",
                                position: { x: "71%", y: "21%" },
                                completionVar: "rowColumnSelectedColumn",
                                completionValue: 1,
                                completionTolerance: 0.4,
                            },
                            {
                                gesture: "drag-horizontal",
                                label: "Join every pair and watch how the products add up",
                                position: { x: "16%", y: "57%" },
                                completionVar: "rowColumnPairsMade",
                                completionValue: 3,
                                completionTolerance: 0.4,
                            },
                        ],
                        label: "Build one on the grid",
                        resetVars: { rowColumnSelectedRow: 0, rowColumnSelectedColumn: 0, rowColumnPairsMade: 0 },
                    }}
                >
                    <InlineClozeInput
                        varName="answerPracticeEntryAB"
                        correctAnswer="10"
                        {...clozePropsFromDefinition(getVariableInfo('answerPracticeEntryAB'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-practice-question-entry-ba" maxWidth="xl">
        <Block id="practice-question-entry-ba" padding="md">
            <EditableParagraph id="para-practice-question-entry-ba" blockId="practice-question-entry-ba">
                3. Now swap the order. In B times A, the entry in row 1, column 2 is{" "}
                <InlineFeedback
                    varName="answerPracticeEntryBA"
                    correctValue="23"
                    position="terminal"
                    successMessage="— exactly, 1 × 3 plus 5 × 4 gives 23, nowhere near the 10 from before"
                    failureMessage="— have another go."
                    hint="This time row 1 comes from B, so the pair is 1 and 5 against column 2 of A"
                    visualizationHint={{
                        blockId: "size-order-visual",
                        hintKey: "practice-entry-ba-hint",
                        steps: [
                            {
                                gesture: "drag-vertical",
                                label: "Drag a number and compare the same square in both answers",
                                position: { x: "26%", y: "19%" },
                            },
                        ],
                        label: "Compare both orders",
                        resetVars: { orderPairShape: "two square matrices" },
                    }}
                >
                    <InlineClozeInput
                        varName="answerPracticeEntryBA"
                        correctAnswer="23"
                        {...clozePropsFromDefinition(getVariableInfo('answerPracticeEntryBA'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-practice-question-determinant" maxWidth="xl">
        <Block id="practice-question-determinant" padding="md">
            <EditableParagraph id="para-practice-question-determinant" blockId="practice-question-determinant">
                4. The matrix{" "}
                <InlineFormula latex="\begin{bmatrix} 4 & 2 \\ 3 & 5 \end{bmatrix}" colorMap={{}} />
                {" "}has determinant{" "}
                <InlineFeedback
                    varName="answerPracticeDeterminant"
                    correctValue="14"
                    position="terminal"
                    successMessage="— right, 4 × 5 minus 2 × 3 leaves 14, so it makes areas fourteen times bigger"
                    failureMessage="— not quite."
                    hint="Multiply the leading diagonal first, then take away the product of the other pair"
                    reviewBlockId="determinant-formula"
                    reviewLabel="Back to the formula"
                >
                    <InlineClozeInput
                        varName="answerPracticeDeterminant"
                        correctAnswer="14"
                        {...clozePropsFromDefinition(getVariableInfo('answerPracticeDeterminant'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-practice-question-area" maxWidth="xl">
        <Block id="practice-question-area" padding="md">
            <EditableParagraph id="para-practice-question-area" blockId="practice-question-area">
                5. A triangle of area 5 is put through a matrix whose determinant is 3. Its new area is{" "}
                <InlineFeedback
                    varName="answerPracticeArea"
                    correctValue="15"
                    position="terminal"
                    successMessage="— exactly, the determinant multiplies every area it touches, so 5 becomes 15"
                    failureMessage="— close, think again."
                    hint="The determinant does not add area, it scales it"
                    visualizationHint={{
                        blockId: "determinant-visual",
                        hintKey: "practice-area-hint",
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag a corner until the determinant reads 3, then look at the area",
                                position: { x: "44%", y: "76%" },
                                completionVar: "determinantValue",
                                completionValue: 3,
                                completionTolerance: 0.3,
                            },
                        ],
                        label: "See it on the square",
                        resetVars: { detEntryA: 2, detEntryC: 0, detEntryB: 1, detEntryD: 2 },
                    }}
                >
                    <InlineClozeInput
                        varName="answerPracticeArea"
                        correctAnswer="15"
                        {...clozePropsFromDefinition(getVariableInfo('answerPracticeArea'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-practice-question-grid" maxWidth="xl">
        <Block id="practice-question-grid" padding="md">
            <EditableParagraph id="para-practice-question-grid" blockId="practice-question-grid">
                6. One last product, built a square at a time. With{" "}
                <InlineFormula latex="C = \begin{bmatrix} 1 & 2 \\ 3 & 0 \end{bmatrix}" colorMap={{}} />
                {" "}and{" "}
                <InlineFormula latex="D = \begin{bmatrix} 4 & 1 \\ 2 & 5 \end{bmatrix}" colorMap={{}} />
                , the entry in{" "}
                <InlineToggle
                    id="toggle-practice-entry-position"
                    varName="practiceEntryPosition"
                    options={["row 1, column 1", "row 1, column 2", "row 2, column 1", "row 2, column 2"]}
                    {...togglePropsFromDefinition(getVariableInfo('practiceEntryPosition'))}
                />
                {" "}of C times D is <GridEntryQuestion />, and each of the four squares has its own answer waiting.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
