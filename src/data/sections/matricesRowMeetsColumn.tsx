import { type ReactElement, useEffect, useRef, useState } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineFormula,
    InlineLinkedHighlight,
    InlineSpotColor,
    InlineTooltip,
    InlineTrigger,
    InteractionHintSequence,
} from "@/components/atoms";
import { FormulaBlock, Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import {
    getVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
    spotColorPropsFromDefinition,
} from "../variables";
import { clamp } from "@/lib/motion";

// ─────────────────────────────────────────────────────────────
// The smoothie bar numbers
// ─────────────────────────────────────────────────────────────
/** Scoops of fruit, yoghurt and honey in each of two drinks (2 x 3) */
const RECIPES = [
    [2, 1, 1],
    [3, 1, 2],
];
/** Price of each ingredient at two shops (3 x 2) */
const PRICES = [
    [3, 4],
    [5, 3],
    [2, 1],
];

const INK = "#334155";
const INK_SOFT = "#64748B";
const ROW_HUE = "#62D0AD";
const COL_HUE = "#8E90F5";

const VIEW_W = 700;
const VIEW_H = 430;
const CELL_W = 44;
const CELL_H = 40;

const A_X = 40;
const A_Y = 74;
const B_X = 250;
const B_Y = 54;
const C_X = 410;
const C_Y = 74;

const SLOT_Y = [245, 290, 335];
const CHIP_HOME_X = 100;
const TARGET_X = 230;

const bracket = (x: number, y: number, w: number, h: number) => ({
    left: `M ${x - 4} ${y - 6} L ${x - 11} ${y - 6} L ${x - 11} ${y + h + 6} L ${x - 4} ${y + h + 6}`,
    right: `M ${x + w + 4} ${y - 6} L ${x + w + 11} ${y - 6} L ${x + w + 11} ${y + h + 6} L ${x + w + 4} ${y + h + 6}`,
});

function RowColumnDrawing() {
    const setVar = useSetVar();
    const selectedRow = useVar<number>("rowColumnSelectedRow", 0);
    const selectedColumn = useVar<number>("rowColumnSelectedColumn", 0);
    const pairsMade = useVar<number>("rowColumnPairsMade", 0);
    const filledCells = useVar<number[]>("rowColumnFilledCells", [0, 0, 0, 0]);
    const highlight = useVar<string>("rowColumnHighlight", "");

    const [pairedSlots, setPairedSlots] = useState<boolean[]>([false, false, false]);
    const [dragSlot, setDragSlot] = useState<number | null>(null);
    const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // A fresh entry starts empty whenever the student picks a different square.
    useEffect(() => {
        setPairedSlots([false, false, false]);
        setVar("rowColumnPairsMade", 0);
    }, [selectedRow, selectedColumn, setVar]);

    const rowValues = RECIPES[selectedRow];
    const columnValues = PRICES.map((priceRow) => priceRow[selectedColumn]);
    const products = rowValues.map((value, index) => value * columnValues[index]);
    const total = products.reduce((sum, value) => sum + value, 0);

    const dim = (id: string) => (highlight && highlight !== id ? 0.38 : 1);
    const glowWidth = (id: string) => (highlight === id ? 3.5 : 2);
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("rowColumnHighlight", id),
        onPointerLeave: () => setVar("rowColumnHighlight", ""),
    });

    const toViewBox = (clientX: number, clientY: number) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: ((clientX - rect.left) / rect.width) * VIEW_W,
            y: ((clientY - rect.top) / rect.height) * VIEW_H,
        };
    };

    const releaseChip = (slot: number) => {
        const point = dragPoint;
        setDragSlot(null);
        setDragPoint(null);
        if (!point) return;
        const distance = Math.hypot(point.x - TARGET_X, point.y - SLOT_Y[slot]);
        if (distance > 46) return;

        const nextPaired = pairedSlots.map((done, index) => (index === slot ? true : done));
        setPairedSlots(nextPaired);
        const madeCount = nextPaired.filter(Boolean).length;
        setVar("rowColumnPairsMade", madeCount);
        if (madeCount === 3) {
            const next = [...filledCells];
            next[selectedRow * 2 + selectedColumn] = 1;
            setVar("rowColumnFilledCells", next);
        }
    };

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full">
            <defs>
                <filter id="row-column-chip-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* ── Recipe matrix (rows live here) ── */}
            <g opacity={dim("row")} style={{ transition: "opacity 150ms ease-out" }}>
                <text x={A_X + 66} y={32} textAnchor="middle" fontSize="12" fill={INK_SOFT}>
                    Scoops per drink
                </text>
                <path d={bracket(A_X, A_Y, 132, 80).left} fill="none" stroke={INK_SOFT} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                <path d={bracket(A_X, A_Y, 132, 80).right} fill="none" stroke={INK_SOFT} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                {highlight === "row" && (
                    <rect x={A_X - 3} y={A_Y + selectedRow * CELL_H - 3} width={138} height={CELL_H + 6}
                        rx="6" fill="none" stroke={ROW_HUE} strokeWidth="9" opacity={0.28} />
                )}
                <rect x={A_X} y={A_Y + selectedRow * CELL_H} width={132} height={CELL_H} rx="4"
                    fill={ROW_HUE} fillOpacity={highlight === "row" ? 0.35 : 0.18}
                    stroke={ROW_HUE} strokeWidth={glowWidth("row")}
                    style={{ transition: "stroke-width 150ms ease-out", cursor: "pointer" }}
                    {...hoverProps("row")} />
                {RECIPES.map((recipeRow, rowIndex) =>
                    recipeRow.map((value, columnIndex) => (
                        <text key={`recipe-${rowIndex}-${columnIndex}`}
                            x={A_X + columnIndex * CELL_W + CELL_W / 2}
                            y={A_Y + rowIndex * CELL_H + CELL_H / 2 + 6}
                            textAnchor="middle" fontSize="17"
                            fontWeight={rowIndex === selectedRow ? 600 : 400}
                            fill={rowIndex === selectedRow ? ROW_HUE : INK}
                            style={{ fontVariantNumeric: "tabular-nums", pointerEvents: "none" }}>
                            {value}
                        </text>
                    )),
                )}
            </g>

            <text x={205} y={120} textAnchor="middle" fontSize="18" fill={INK_SOFT} opacity={dim("none")}>
                ×
            </text>

            {/* ── Price matrix (columns live here) ── */}
            <g opacity={dim("column")} style={{ transition: "opacity 150ms ease-out" }}>
                <text x={B_X + 44} y={32} textAnchor="middle" fontSize="12" fill={INK_SOFT}>
                    Price per scoop
                </text>
                <path d={bracket(B_X, B_Y, 88, 120).left} fill="none" stroke={INK_SOFT} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                <path d={bracket(B_X, B_Y, 88, 120).right} fill="none" stroke={INK_SOFT} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                {highlight === "column" && (
                    <rect x={B_X + selectedColumn * CELL_W - 3} y={B_Y - 3} width={CELL_W + 6} height={126}
                        rx="6" fill="none" stroke={COL_HUE} strokeWidth="9" opacity={0.28} />
                )}
                <rect x={B_X + selectedColumn * CELL_W} y={B_Y} width={CELL_W} height={120} rx="4"
                    fill={COL_HUE} fillOpacity={highlight === "column" ? 0.35 : 0.18}
                    stroke={COL_HUE} strokeWidth={glowWidth("column")}
                    style={{ transition: "stroke-width 150ms ease-out", cursor: "pointer" }}
                    {...hoverProps("column")} />
                {PRICES.map((priceRow, rowIndex) =>
                    priceRow.map((value, columnIndex) => (
                        <text key={`price-${rowIndex}-${columnIndex}`}
                            x={B_X + columnIndex * CELL_W + CELL_W / 2}
                            y={B_Y + rowIndex * CELL_H + CELL_H / 2 + 6}
                            textAnchor="middle" fontSize="17"
                            fontWeight={columnIndex === selectedColumn ? 600 : 400}
                            fill={columnIndex === selectedColumn ? COL_HUE : INK}
                            style={{ fontVariantNumeric: "tabular-nums", pointerEvents: "none" }}>
                            {value}
                        </text>
                    )),
                )}
            </g>

            <text x={374} y={120} textAnchor="middle" fontSize="18" fill={INK_SOFT} opacity={dim("none")}>
                =
            </text>

            {/* ── Answer grid: click a square to choose which entry to build ── */}
            <g opacity={dim("none")} style={{ transition: "opacity 150ms ease-out" }}>
                <text x={C_X + 44} y={32} textAnchor="middle" fontSize="12" fill={INK_SOFT}>
                    Cost per drink
                </text>
                <path d={bracket(C_X, C_Y, 88, 80).left} fill="none" stroke={INK_SOFT} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                <path d={bracket(C_X, C_Y, 88, 80).right} fill="none" stroke={INK_SOFT} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                {[0, 1].map((rowIndex) =>
                    [0, 1].map((columnIndex) => {
                        const isSelected = rowIndex === selectedRow && columnIndex === selectedColumn;
                        const isFilled = filledCells[rowIndex * 2 + columnIndex] === 1;
                        const value = RECIPES[rowIndex].reduce(
                            (sum, scoops, index) => sum + scoops * PRICES[index][columnIndex],
                            0,
                        );
                        return (
                            <g key={`answer-${rowIndex}-${columnIndex}`}>
                                <rect x={C_X + columnIndex * CELL_W} y={C_Y + rowIndex * CELL_H}
                                    width={CELL_W} height={CELL_H} rx="4"
                                    fill={isSelected ? "#F8FAFC" : "#FFFFFF"}
                                    stroke={isSelected ? ROW_HUE : "#CBD5E1"}
                                    strokeWidth={isSelected ? 2.5 : 1.5}
                                    strokeDasharray={isSelected && !isFilled ? "5 4" : undefined}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setVar("rowColumnSelectedRow", rowIndex);
                                        setVar("rowColumnSelectedColumn", columnIndex);
                                    }} />
                                <text x={C_X + columnIndex * CELL_W + CELL_W / 2}
                                    y={C_Y + rowIndex * CELL_H + CELL_H / 2 + 6}
                                    textAnchor="middle" fontSize="17" fontWeight={600}
                                    fill={isFilled ? INK : "#CBD5E1"}
                                    style={{ fontVariantNumeric: "tabular-nums", pointerEvents: "none" }}>
                                    {isFilled ? value : "?"}
                                </text>
                            </g>
                        );
                    }),
                )}
            </g>

            {/* ── The pairing bench ── */}
            <g opacity={dim("none")} style={{ transition: "opacity 150ms ease-out" }}>
                <text x={40} y={205} fontSize="13" fill={INK}>
                    {`Row ${selectedRow + 1} meets column ${selectedColumn + 1}: join each pair, then add`}
                </text>

                {SLOT_Y.map((slotY, slot) => {
                    const isPaired = pairedSlots[slot];
                    if (isPaired) {
                        return (
                            <text key={`slot-${slot}`} x={CHIP_HOME_X - 18} y={slotY + 6} fontSize="17"
                                style={{ fontVariantNumeric: "tabular-nums" }}>
                                <tspan fill={ROW_HUE} fontWeight={600}>{rowValues[slot]}</tspan>
                                <tspan fill={INK_SOFT}> × </tspan>
                                <tspan fill={COL_HUE} fontWeight={600}>{columnValues[slot]}</tspan>
                                <tspan fill={INK_SOFT}> = </tspan>
                                <tspan fill={INK} fontWeight={600}>{products[slot]}</tspan>
                            </text>
                        );
                    }
                    const isDragging = dragSlot === slot;
                    const chipX = isDragging && dragPoint ? dragPoint.x : CHIP_HOME_X;
                    const chipY = isDragging && dragPoint ? dragPoint.y : slotY;
                    return (
                        <g key={`slot-${slot}`}>
                            <circle cx={TARGET_X} cy={slotY} r="21" fill="none" stroke={COL_HUE}
                                strokeWidth="2" strokeDasharray="5 4" opacity={0.7} />
                            <circle cx={TARGET_X} cy={slotY} r="16" fill={COL_HUE} fillOpacity={0.18} />
                            <text x={TARGET_X} y={slotY + 6} textAnchor="middle" fontSize="16"
                                fontWeight={600} fill={COL_HUE}
                                style={{ fontVariantNumeric: "tabular-nums", pointerEvents: "none" }}>
                                {columnValues[slot]}
                            </text>
                            <text x={165} y={slotY + 5} textAnchor="middle" fontSize="15" fill={INK_SOFT}>
                                ×
                            </text>
                            <circle cx={chipX} cy={chipY} r="18" fill={ROW_HUE}
                                filter="url(#row-column-chip-shadow)"
                                style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
                                onPointerDown={(event) => {
                                    event.currentTarget.setPointerCapture(event.pointerId);
                                    setDragSlot(slot);
                                    setDragPoint({ x: CHIP_HOME_X, y: slotY });
                                }}
                                onPointerMove={(event) => {
                                    if (dragSlot !== slot) return;
                                    const point = toViewBox(event.clientX, event.clientY);
                                    setDragPoint({
                                        x: clamp(point.x, 42, VIEW_W - 60),
                                        y: clamp(point.y, 210, VIEW_H - 30),
                                    });
                                }}
                                onPointerUp={() => releaseChip(slot)}
                                onPointerCancel={() => releaseChip(slot)} />
                            <text x={chipX} y={chipY + 6} textAnchor="middle" fontSize="16" fontWeight={600}
                                fill="#FFFFFF"
                                style={{ fontVariantNumeric: "tabular-nums", pointerEvents: "none" }}>
                                {rowValues[slot]}
                            </text>
                        </g>
                    );
                })}

                {pairsMade === 3 && (
                    <text x={40} y={392} fontSize="17" style={{ fontVariantNumeric: "tabular-nums" }}>
                        <tspan fill={INK_SOFT}>{`${products[0]} + ${products[1]} + ${products[2]} = `}</tspan>
                        <tspan fill={INK} fontWeight={700}>{total}</tspan>
                        <tspan fill={INK_SOFT} fontSize="13">
                            {`   one square of the answer, row ${selectedRow + 1}, column ${selectedColumn + 1}`}
                        </tspan>
                    </text>
                )}
            </g>
        </svg>
    );
}

function RowColumnFigure() {
    const setVar = useSetVar();
    const pairsMade = useVar<number>("rowColumnPairsMade", 0);
    return (
        <Figure
            id="row-column-builder"
            caption="Two scoops of fruit at 3p, one of yoghurt at 5p, one of honey at 2p. Drag each teal number onto its indigo partner, and the three products add up to a single square of the answer."
            onReset={() => {
                setVar("rowColumnSelectedRow", 0);
                setVar("rowColumnSelectedColumn", 0);
                setVar("rowColumnPairsMade", 0);
                setVar("rowColumnFilledCells", [0, 0, 0, 0]);
                setVar("rowColumnHighlight", "");
            }}
        >
            <RowColumnDrawing />
            <InteractionHintSequence
                hintKey="row-column-pair-drag"
                currentStep={pairsMade >= 3 ? 1 : 0}
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the teal number onto its indigo partner",
                        position: { x: "16%", y: "57%" },
                        dragPath: { type: "line", startOffset: { x: -18, y: 0 }, endOffset: { x: 42, y: 0 } },
                    },
                    {
                        gesture: "click",
                        label: "Now choose another square of the answer",
                        position: { x: "68%", y: "21%" },
                    },
                ]}
            />
        </Figure>
    );
}

export const matricesRowMeetsColumnBlocks: ReactElement[] = [
    <StackLayout key="layout-row-column-heading" maxWidth="xl">
        <Block id="row-column-heading" padding="md">
            <EditableH2 id="h2-row-column-heading" blockId="row-column-heading">
                The Row-by-Column Product Rule
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-setup" maxWidth="xl">
        <Block id="row-column-setup" padding="sm">
            <EditableParagraph id="para-row-column-setup" blockId="row-column-setup">
                Multiplying matrices is nothing like adding them. Adding pairs up matching positions,
                while multiplying pairs{" "}
                <InlineLinkedHighlight
                    id="highlight-row-column-row"
                    varName="rowColumnHighlight"
                    highlightId="row"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('rowColumnHighlight'))}
                >
                    one whole row
                </InlineLinkedHighlight>
                {" "}with{" "}
                <InlineLinkedHighlight
                    id="highlight-row-column-column"
                    varName="rowColumnHighlight"
                    highlightId="column"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('columnAccent'))}
                >
                    one whole column
                </InlineLinkedHighlight>
: drag each{" "}
                <InlineSpotColor
                    varName="rowAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('rowAccent'))}
                >
                    teal number
                </InlineSpotColor>
                {" "}onto its{" "}
                <InlineSpotColor
                    varName="columnAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('columnAccent'))}
                >
                    indigo partner
                </InlineSpotColor>
                {" "}and watch the three products add into a single square. So a row and a column
                together produce just one entry of the answer.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-rule" maxWidth="xl">
        <Block id="row-column-rule" padding="lg">
            <FormulaBlock
                latex="\begin{bmatrix} \highlight{row}{a} & \highlight{row}{b} \end{bmatrix} \begin{bmatrix} \highlight{column}{p} \\ \highlight{column}{q} \end{bmatrix} = \highlight{row}{a}\highlight{column}{p} + \highlight{row}{b}\highlight{column}{q}"
                linkedHighlights={{
                    row: {
                        varName: 'rowColumnHighlight',
                        color: '#62D0AD',
                        bgColor: 'rgba(98, 208, 173, 0.2)',
                    },
                    column: {
                        varName: 'rowColumnHighlight',
                        color: '#8E90F5',
                        bgColor: 'rgba(142, 144, 245, 0.2)',
                    },
                }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-visual" maxWidth="xl">
        <Block id="row-column-visual" padding="sm" hasVisualization>
            <RowColumnFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-reflect" maxWidth="xl">
        <Block id="row-column-reflect" padding="sm">
            <EditableParagraph id="para-row-column-reflect" blockId="row-column-reflect">
                Fill{" "}
                <InlineTrigger id="trigger-row-column-next-square" varName="rowColumnSelectedColumn" value={1}>
                    the square next door
                </InlineTrigger>
                {" "}and the pattern gives itself away. Each{" "}
                <InlineTooltip
                    id="tooltip-row-column-entry"
                    tooltip="An entry is one single number inside a matrix, named by the row and the column it sits in."
                >
                    entry
                </InlineTooltip>
                {" "}carries its own address, the{" "}
                <InlineSpotColor
                    varName="rowAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('rowAccent'))}
                >
                    row
                </InlineSpotColor>
                {" "}it came from and the{" "}
                <InlineSpotColor
                    varName="columnAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('columnAccent'))}
                >
                    column
                </InlineSpotColor>
                {" "}it came from, and that address decides how big the answer is.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-question-entry" maxWidth="xl">
        <Block id="row-column-question-entry" padding="md">
            <EditableParagraph id="para-row-column-question-entry" blockId="row-column-question-entry">
                Here is a fresh pair, away from the smoothie bar. Pair the top row of{" "}
                <InlineFormula
                    latex="\begin{bmatrix} \clr{row}{1} & \clr{row}{2} \\ 0 & 3 \end{bmatrix}"
                    colorMap={{ row: '#62D0AD' }}
                />
                {" "}with the first column of{" "}
                <InlineFormula
                    latex="\begin{bmatrix} \clr{column}{2} & 1 \\ \clr{column}{1} & 4 \end{bmatrix}"
                    colorMap={{ column: '#8E90F5' }}
                />
                {" "}and the top-left entry of their product is{" "}
                <InlineFeedback
                    varName="answerRowColumnEntry"
                    correctValue="4"
                    position="terminal"
                    successMessage="— exactly, 1 × 2 plus 2 × 1 gives 4, both pairs counted"
                    failureMessage="— not quite."
                    hint="An answer of 2 would mean only the matching positions were multiplied, and the second pair never joined in"
                    visualizationHint={{
                        blockId: "row-column-visual",
                        hintKey: "feedback-row-column-hint",
                        steps: [
                            {
                                gesture: "click",
                                label: "Choose the top-left square of the answer",
                                position: { x: "64%", y: "21%" },
                                completionVar: "rowColumnSelectedColumn",
                                completionValue: 0,
                                completionTolerance: 0.4,
                            },
                            {
                                gesture: "drag-horizontal",
                                label: "Join all three pairs and count how many products it takes",
                                position: { x: "16%", y: "57%" },
                                completionVar: "rowColumnPairsMade",
                                completionValue: 3,
                                completionTolerance: 0.4,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { rowColumnSelectedRow: 0, rowColumnSelectedColumn: 1, rowColumnPairsMade: 0 },
                    }}
                >
                    <InlineClozeInput
                        varName="answerRowColumnEntry"
                        correctAnswer="4"
                        {...clozePropsFromDefinition(getVariableInfo('answerRowColumnEntry'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-question-address" maxWidth="xl">
        <Block id="row-column-question-address" padding="md">
            <EditableParagraph id="para-row-column-question-address" blockId="row-column-question-address">
                In any product, the entry sitting in{" "}
                <InlineSpotColor
                    varName="rowAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('rowAccent'))}
                >
                    row 2
                </InlineSpotColor>
                ,{" "}
                <InlineSpotColor
                    varName="columnAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('columnAccent'))}
                >
                    column 1
                </InlineSpotColor>
                {" "}of a product, written{" "}
                <InlineFormula
                    latex="c_{\clr{row}{2}\clr{column}{1}}"
                    colorMap={{ row: '#62D0AD', column: '#8E90F5' }}
                />
                , is built from row 2 of the first matrix together with{" "}
                <InlineFeedback
                    varName="answerRowColumnAddress"
                    correctValue="column 1"
                    position="terminal"
                    successMessage="— right, the entry takes its row number from the first matrix and its column number from the second"
                    failureMessage="— have another look."
                    hint="Read the address off the answer square itself: row 2, column 1"
                    reviewBlockId="row-column-visual"
                    reviewLabel="Back to the builder"
                >
                    <InlineClozeChoice
                        varName="answerRowColumnAddress"
                        correctAnswer="column 1"
                        options={["column 1", "column 2", "row 1", "row 2"]}
                        {...choicePropsFromDefinition(getVariableInfo('answerRowColumnAddress'))}
                    />
                </InlineFeedback>{" "}
                of the second.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
