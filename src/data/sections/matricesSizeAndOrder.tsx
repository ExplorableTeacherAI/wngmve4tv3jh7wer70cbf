import { type ReactElement, useEffect, useRef, useState } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeInput,
    InlineFeedback,
    InlineFormula,
    InlineLinkedHighlight,
    InlineSpotColor,
    InlineToggle,
    InlineTooltip,
    InlineTrigger,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import {
    getVariableInfo,
    clozePropsFromDefinition,
    togglePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
    spotColorPropsFromDefinition,
} from "../variables";
import { clamp } from "@/lib/motion";

const INK = "#334155";
const INK_SOFT = "#64748B";
const A_HUE = "#62D0AD";
const B_HUE = "#8E90F5";
const MATCH_HUE = "#F7B23B";
const CLASH_HUE = "#ef4444";

const VIEW_W = 700;
const VIEW_H = 450;
const CELL_W = 40;
const CELL_H = 38;

const SOURCE_CY = 108;
const RESULT_TOP = 272;
const LEFT_CX = 200;
const RIGHT_CX = 500;

type Shape = { aRows: number; aCols: number; bRows: number; bCols: number; a: number[]; b: number[] };

const SHAPES: Record<string, Shape> = {
    "two square matrices": {
        aRows: 2, aCols: 2, bRows: 2, bCols: 2,
        a: [1, 2, 3, 4], b: [2, 0, 1, 5],
    },
    "a wide and a tall matrix": {
        aRows: 2, aCols: 3, bRows: 3, bCols: 2,
        a: [1, 2, 0, 3, 1, 2], b: [2, 1, 0, 3, 4, 1],
    },
    "a mismatched pair": {
        aRows: 2, aCols: 3, bRows: 2, bCols: 2,
        a: [1, 2, 0, 3, 1, 2], b: [2, 1, 0, 3],
    },
};

/** Multiply two flat matrices; returns null when the inner sizes do not meet. */
const multiply = (
    left: number[], leftRows: number, leftCols: number,
    right: number[], rightRows: number, rightCols: number,
): number[] | null => {
    if (leftCols !== rightRows) return null;
    const out: number[] = [];
    for (let row = 0; row < leftRows; row += 1) {
        for (let column = 0; column < rightCols; column += 1) {
            let sum = 0;
            for (let k = 0; k < leftCols; k += 1) {
                sum += left[row * leftCols + k] * right[k * rightCols + column];
            }
            out.push(sum);
        }
    }
    return out;
};

const bracketPaths = (x: number, y: number, w: number, h: number) => ({
    left: `M ${x - 4} ${y - 6} L ${x - 11} ${y - 6} L ${x - 11} ${y + h + 6} L ${x - 4} ${y + h + 6}`,
    right: `M ${x + w + 4} ${y - 6} L ${x + w + 11} ${y - 6} L ${x + w + 11} ${y + h + 6} L ${x + w + 4} ${y + h + 6}`,
});

function SizeOrderDrawing() {
    const setVar = useSetVar();
    const shapeName = useVar<string>("orderPairShape", "two square matrices");
    const valuesA = useVar<number[]>("orderMatrixA", SHAPES["two square matrices"].a);
    const valuesB = useVar<number[]>("orderMatrixB", SHAPES["two square matrices"].b);
    const highlight = useVar<string>("orderHighlight", "");

    const [drag, setDrag] = useState<{ matrix: "a" | "b"; index: number; startY: number; startValue: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const shape = SHAPES[shapeName] ?? SHAPES["two square matrices"];

    // A different pair means a different set of numbers on the bench.
    useEffect(() => {
        const preset = SHAPES[shapeName] ?? SHAPES["two square matrices"];
        setVar("orderMatrixA", [...preset.a]);
        setVar("orderMatrixB", [...preset.b]);
    }, [shapeName, setVar]);

    const a = valuesA.length === shape.aRows * shape.aCols ? valuesA : shape.a;
    const b = valuesB.length === shape.bRows * shape.bCols ? valuesB : shape.b;

    const productAB = multiply(a, shape.aRows, shape.aCols, b, shape.bRows, shape.bCols);
    const productBA = multiply(b, shape.bRows, shape.bCols, a, shape.aRows, shape.aCols);
    // The two answers can only be compared square by square when they match in size.
    const sameShape =
        productAB !== null && productBA !== null &&
        shape.aRows === shape.bRows && shape.bCols === shape.aCols;

    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);

    const startDrag = (matrix: "a" | "b", index: number) => (event: React.PointerEvent<SVGRectElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        const current = matrix === "a" ? a[index] : b[index];
        setDrag({ matrix, index, startY: event.clientY, startValue: current });
    };

    const moveDrag = (event: React.PointerEvent<SVGRectElement>) => {
        if (!drag) return;
        const steps = Math.round((drag.startY - event.clientY) / 14);
        const next = clamp(drag.startValue + steps, 0, 9);
        const source = drag.matrix === "a" ? a : b;
        if (source[drag.index] === next) return;
        const updated = [...source];
        updated[drag.index] = next;
        setVar(drag.matrix === "a" ? "orderMatrixA" : "orderMatrixB", updated);
    };

    /** One matrix: brackets, draggable cells, and a size caption underneath. */
    const renderMatrix = (
        key: string, values: number[], rows: number, cols: number,
        centerX: number, topY: number, hue: string,
        options?: { matrix?: "a" | "b"; label?: string; circleAgainst?: number[] | null; hideSize?: boolean },
    ) => {
        const width = cols * CELL_W;
        const height = rows * CELL_H;
        const originX = centerX - width / 2;
        const paths = bracketPaths(originX, topY, width, height);
        return (
            <g key={key}>
                {options?.label && (
                    <text x={originX - 26} y={topY + height / 2 + 6} textAnchor="middle" fontSize="16"
                        fontWeight={600} fill={hue}>
                        {options.label}
                    </text>
                )}
                <path d={paths.left} fill="none" stroke={INK_SOFT} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                <path d={paths.right} fill="none" stroke={INK_SOFT} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                {values.map((value, index) => {
                    const row = Math.floor(index / cols);
                    const column = index % cols;
                    const cellX = originX + column * CELL_W;
                    const cellY = topY + row * CELL_H;
                    const disagrees = options?.circleAgainst != null && options.circleAgainst[index] !== value;
                    return (
                        <g key={`${key}-${index}`}>
                            {disagrees && (
                                <rect x={cellX + 3} y={cellY + 3} width={CELL_W - 6} height={CELL_H - 6}
                                    rx="14" fill="none" stroke={MATCH_HUE} strokeWidth="2.5" />
                            )}
                            <text x={cellX + CELL_W / 2} y={cellY + CELL_H / 2 + 6} textAnchor="middle"
                                fontSize="16" fontWeight={600} fill={disagrees ? MATCH_HUE : INK}
                                style={{ fontVariantNumeric: "tabular-nums", pointerEvents: "none" }}>
                                {value}
                            </text>
                            {options?.matrix && (
                                <rect x={cellX} y={cellY} width={CELL_W} height={CELL_H} rx="4"
                                    fill={hue} fillOpacity={drag?.matrix === options.matrix && drag.index === index ? 0.3 : 0.1}
                                    stroke={hue} strokeWidth="1.5"
                                    style={{ cursor: "ns-resize", touchAction: "none" }}
                                    onPointerDown={startDrag(options.matrix, index)}
                                    onPointerMove={moveDrag}
                                    onPointerUp={() => setDrag(null)}
                                    onPointerCancel={() => setDrag(null)} />
                            )}
                        </g>
                    );
                })}
                {!options?.hideSize && (
                    <text x={centerX} y={topY + height + 26} textAnchor="middle" fontSize="12" fill={INK_SOFT}>
                        {`${rows} × ${cols}`}
                    </text>
                )}
            </g>
        );
    };

    /** One answer panel: the product, or a note saying the sizes never meet. */
    const renderProduct = (
        key: string, id: string, header: string, product: number[] | null,
        rows: number, cols: number, innerLeft: number, innerRight: number,
        centerX: number, compareWith: number[] | null,
    ) => (
        <g key={key} opacity={dim(id)} style={{ transition: "opacity 150ms ease-out" }}
            onPointerEnter={() => setVar("orderHighlight", id)}
            onPointerLeave={() => setVar("orderHighlight", "")}>
            {highlight === id && (
                <rect x={centerX - (product ? (cols * CELL_W) / 2 : 92) - 14} y={RESULT_TOP - 14}
                    width={(product ? cols * CELL_W : 184) + 28}
                    height={(product ? rows * CELL_H : CELL_H * 2) + 28} rx="10"
                    fill={A_HUE} fillOpacity={0.14} stroke={A_HUE} strokeWidth="2.5" />
            )}
            <text x={centerX} y={RESULT_TOP - 26} textAnchor="middle" fontSize="15" fontWeight={600} fill={INK}>
                {header}
            </text>
            {product
                ? renderMatrix(`${key}-values`, product, rows, cols, centerX, RESULT_TOP, INK,
                    { circleAgainst: compareWith, hideSize: true })
                : (
                    <>
                        <rect x={centerX - 92} y={RESULT_TOP} width={184} height={CELL_H * 2} rx="8"
                            fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 5" />
                        <text x={centerX} y={RESULT_TOP + CELL_H + 6} textAnchor="middle" fontSize="14"
                            fill={CLASH_HUE}>
                            no product at all
                        </text>
                    </>
                )}
            <rect x={centerX - 100} y={RESULT_TOP - 44} width={200}
                height={(product ? rows * CELL_H : CELL_H * 2) + 90} fill="transparent" />
            <text x={centerX} y={RESULT_TOP + (product ? rows * CELL_H : CELL_H * 2) + 34}
                textAnchor="middle" fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                <tspan fill={INK_SOFT}>{`${header.slice(0, 1) === "A" ? shape.aRows : shape.bRows} × `}</tspan>
                <tspan fill={product ? MATCH_HUE : CLASH_HUE} fontWeight={700}>{innerLeft}</tspan>
                <tspan fill={INK_SOFT}>{"  and  "}</tspan>
                <tspan fill={product ? MATCH_HUE : CLASH_HUE} fontWeight={700}>{innerRight}</tspan>
                <tspan fill={INK_SOFT}>{` × ${cols}`}</tspan>
                <tspan fill={INK_SOFT}>{product ? `  gives  ${rows} × ${cols}` : "  never meet"}</tspan>
            </text>
        </g>
    );

    const aTop = SOURCE_CY - (shape.aRows * CELL_H) / 2;
    const bTop = SOURCE_CY - (shape.bRows * CELL_H) / 2;

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full">
            <g opacity={highlight ? 0.35 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                <text x={LEFT_CX} y={34} textAnchor="middle" fontSize="12" fill={INK_SOFT}>
                    Drag any number up or down
                </text>
                {renderMatrix("source-a", a, shape.aRows, shape.aCols, LEFT_CX, aTop, A_HUE,
                    { matrix: "a", label: "A" })}
                {renderMatrix("source-b", b, shape.bRows, shape.bCols, RIGHT_CX, bTop, B_HUE,
                    { matrix: "b", label: "B" })}
            </g>

            {renderProduct("product-ab", "productAB", "A × B", productAB,
                shape.aRows, shape.bCols, shape.aCols, shape.bRows, LEFT_CX,
                sameShape ? productBA : null)}
            {renderProduct("product-ba", "productBA", "B × A", productBA,
                shape.bRows, shape.aCols, shape.bCols, shape.aRows, RIGHT_CX,
                sameShape ? productAB : null)}
        </svg>
    );
}

function SizeOrderFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="size-and-order"
            caption="The same two matrices, multiplied both ways round. Amber rings mark every square where the two answers disagree."
            onReset={() => {
                setVar("orderPairShape", "two square matrices");
                setVar("orderMatrixA", [...SHAPES["two square matrices"].a]);
                setVar("orderMatrixB", [...SHAPES["two square matrices"].b]);
                setVar("orderHighlight", "");
            }}
        >
            <SizeOrderDrawing />
            <InteractionHintSequence
                hintKey="size-order-drag-number"
                steps={[
                    {
                        gesture: "drag-vertical",
                        label: "Drag a number in A up or down",
                        position: { x: "26%", y: "19%" },
                        dragPath: { type: "line", startOffset: { x: 0, y: 16 }, endOffset: { x: 0, y: -16 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const matricesSizeAndOrderBlocks: ReactElement[] = [
    <StackLayout key="layout-size-order-heading" maxWidth="xl">
        <Block id="size-order-heading" padding="md">
            <EditableH2 id="h2-size-order-heading" blockId="size-order-heading">
                Size and Order
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-size-order-setup" maxWidth="xl">
        <Block id="size-order-setup" padding="sm">
            <EditableParagraph id="para-size-order-setup" blockId="size-order-setup">
                Not every pair of matrices can be multiplied at all, because{" "}
                <InlineSpotColor
                    varName="rowAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('rowAccent'))}
                >
                    the row you take
                </InlineSpotColor>
                {" "}and{" "}
                <InlineSpotColor
                    varName="columnAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('columnAccent'))}
                >
                    the column it meets
                </InlineSpotColor>
                {" "}must hold{" "}
                <InlineSpotColor
                    varName="innerAccent"
                    {...spotColorPropsFromDefinition(getVariableInfo('innerAccent'))}
                >
                    the same number of entries
                </InlineSpotColor>
                . On the bench sit{" "}
                <InlineToggle
                    id="toggle-order-pair-shape"
                    varName="orderPairShape"
                    options={["two square matrices", "a wide and a tall matrix", "a mismatched pair"]}
                    {...togglePropsFromDefinition(getVariableInfo('orderPairShape'))}
                />
                , and dragging any of their numbers up or down sends both orders an answer at once.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-size-order-visual" maxWidth="xl">
        <Block id="size-order-visual" padding="sm" hasVisualization>
            <SizeOrderFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-size-order-reflect" maxWidth="xl">
        <Block id="size-order-reflect" padding="sm">
            <EditableParagraph id="para-size-order-reflect" blockId="size-order-reflect">
                With ordinary numbers 3 times 7 and 7 times 3 agree, but{" "}
                <InlineLinkedHighlight
                    id="highlight-order-product-ab"
                    varName="orderHighlight"
                    highlightId="productAB"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('orderHighlight'))}
                >
                    A times B
                </InlineLinkedHighlight>
                {" "}and{" "}
                <InlineLinkedHighlight
                    id="highlight-order-product-ba"
                    varName="orderHighlight"
                    highlightId="productBA"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('orderHighlight'))}
                >
                    B times A
                </InlineLinkedHighlight>
                {" "}disagree in almost every square. Swap to{" "}
                <InlineTrigger id="trigger-order-mismatched-pair" varName="orderPairShape" value="a mismatched pair">
                    a mismatched pair
                </InlineTrigger>
                {" "}and it gets stranger still: the two answers can come out different sizes, and
                sometimes only one order exists at all.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-size-order-rule" maxWidth="xl">
        <Block id="size-order-rule" padding="lg">
            <FormulaBlock
                latex="(\clr{first}{m} \times \clr{inner}{n}) \; (\clr{inner}{n} \times \clr{second}{p}) \;\Rightarrow\; \choice{answerSizeRuleShape}"
                colorMap={{ first: '#62D0AD', inner: '#F7B23B', second: '#8E90F5' }}
                clozeChoices={{
                    answerSizeRuleShape: {
                        correctAnswer: 'm × p',
                        options: ['m × n', 'n × p', 'm × p', 'n × n'],
                        placeholder: '???',
                        color: '#F7B23B',
                        bgColor: 'rgba(247, 178, 59, 0.18)',
                    },
                }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-size-order-question-size" maxWidth="xl">
        <Block id="size-order-question-size" padding="md">
            <EditableParagraph id="para-size-order-question-size" blockId="size-order-question-size">
                A 3 by 4 matrix is multiplied by a 4 by 2 matrix. The{" "}
                <InlineTooltip
                    id="tooltip-order-inner-numbers"
                    tooltip="The inner numbers are the columns of the first matrix and the rows of the second. They must be equal for a product to exist."
                >
                    inner numbers
                </InlineTooltip>
                {" "}meet, so the product exists, and its size is{" "}
                <InlineFeedback
                    varName="answerOrderSize"
                    correctValue={["3 by 2", "3x2", "3 x 2", "3×2", "3 × 2", "3 2", "3,2", "3, 2"]}
                    position="terminal"
                    successMessage="— exactly, the outer numbers survive: 3 rows from the first, 2 columns from the second"
                    failureMessage="— not that one."
                    hint="The inner 4s cancel each other out in the pairing, leaving only the outer numbers"
                    visualizationHint={{
                        blockId: "size-order-visual",
                        hintKey: "feedback-order-size-hint",
                        steps: [
                            {
                                gesture: "drag-vertical",
                                label: "Drag a number and read the size line under each answer",
                                position: { x: "26%", y: "19%" },
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { orderPairShape: "a wide and a tall matrix" },
                    }}
                >
                    <InlineClozeInput
                        varName="answerOrderSize"
                        correctAnswer={["3 by 2", "3x2", "3 x 2", "3×2", "3 × 2", "3 2", "3,2", "3, 2"]}
                        {...clozePropsFromDefinition(getVariableInfo('answerOrderSize'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-size-order-question-swap" maxWidth="xl">
        <Block id="size-order-question-swap" padding="md">
            <EditableParagraph id="para-size-order-question-swap" blockId="size-order-question-swap">
                Take{" "}
                <InlineFormula
                    latex="\clr{matrixA}{A} = \begin{bmatrix} 1 & 2 \\ 0 & 1 \end{bmatrix}"
                    colorMap={{ matrixA: '#62D0AD' }}
                />
                {" "}and{" "}
                <InlineFormula
                    latex="\clr{matrixB}{B} = \begin{bmatrix} 1 & 0 \\ 3 & 1 \end{bmatrix}"
                    colorMap={{ matrixB: '#8E90F5' }}
                />
                . The top-left entry of A times B is 7, so the top-left entry of B times A is{" "}
                <InlineFeedback
                    varName="answerOrderSwap"
                    correctValue="1"
                    position="terminal"
                    successMessage="— right, row 1 of B is 1 and 0, so only the first pair counts and the answer is 1, nothing like 7"
                    failureMessage="— have another go."
                    hint="An answer of 7 would mean the order made no difference, but row 1 of B is a different row from row 1 of A"
                    visualizationHint={{
                        blockId: "size-order-visual",
                        hintKey: "feedback-order-swap-hint",
                        steps: [
                            {
                                gesture: "drag-vertical",
                                label: "Drag a number in A and compare the two top-left squares",
                                position: { x: "26%", y: "19%" },
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { orderPairShape: "two square matrices" },
                    }}
                >
                    <InlineClozeInput
                        varName="answerOrderSwap"
                        correctAnswer="1"
                        {...clozePropsFromDefinition(getVariableInfo('answerOrderSwap'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
