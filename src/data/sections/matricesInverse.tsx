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
    InlineToggle,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import {
    getVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    togglePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../variables";
import { clamp } from "@/lib/motion";

const INK = "#334155";
const INK_SOFT = "#64748B";
const GRID = "#E2E8F0";
const AXIS = "#CBD5E1";
const ATTEMPT_HUE = "#62D0AD";
const MATRIX_HUE = "#8E90F5";
const GHOST_HUE = "#94A3B8";
const MATCH_HUE = "#22c55e";
const FLAT_HUE = "#ef4444";

const VIEW_W = 760;
const VIEW_H = 430;
const UNIT = 38;
const ORIGIN_X = 170;
const ORIGIN_Y = 300;

const CELL_W = 34;
const CELL_H = 32;
const PANEL_LABEL_X = 400;
const MATRIX_X = 420;
const TARGET_X = 525;

const toScreenX = (worldX: number) => ORIGIN_X + worldX * UNIT;
const toScreenY = (worldY: number) => ORIGIN_Y - worldY * UNIT;

/** Outline of a capital F: it shows turning and flipping, not just stretching. */
const LETTER_F: [number, number][] = [
    [0, 0], [0, 2], [1.3, 2], [1.3, 1.65], [0.42, 1.65],
    [0.42, 1.2], [1.1, 1.2], [1.1, 0.85], [0.42, 0.85], [0.42, 0],
];

const BENCH: Record<string, { matrix: number[]; determinant: number }> = {
    "a shear": { matrix: [1, 1, 0, 1], determinant: 1 },
    "a stretch": { matrix: [2, 0, 1, 1], determinant: 2 },
    "a flattening matrix": { matrix: [1, 0.5, 2, 1], determinant: 0 },
};

const bracketPaths = (x: number, y: number, w: number, h: number) => ({
    left: `M ${x - 4} ${y - 5} L ${x - 10} ${y - 5} L ${x - 10} ${y + h + 5} L ${x - 4} ${y + h + 5}`,
    right: `M ${x + w + 4} ${y - 5} L ${x + w + 10} ${y - 5} L ${x + w + 10} ${y + h + 5} L ${x + w + 4} ${y + h + 5}`,
});

const applyMatrix = (m: number[], [x, y]: [number, number]): [number, number] =>
    [m[0] * x + m[1] * y, m[2] * x + m[3] * y];

const toPolygon = (m: number[]) =>
    LETTER_F.map((point) => {
        const [x, y] = applyMatrix(m, point);
        return `${toScreenX(x)},${toScreenY(y)}`;
    }).join(" ");

function InverseDrawing() {
    const setVar = useSetVar();
    const choice = useVar<string>("inverseMatrixChoice", "a shear");
    const candidateA = useVar<number>("inverseCandidateA", 1);
    const candidateB = useVar<number>("inverseCandidateB", 0);
    const candidateC = useVar<number>("inverseCandidateC", 0);
    const candidateD = useVar<number>("inverseCandidateD", 1);
    const highlight = useVar<string>("inverseHighlight", "");

    const [drag, setDrag] = useState<{ index: number; startY: number; startValue: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const bench = BENCH[choice] ?? BENCH["a shear"];
    const matrix = bench.matrix;
    const candidate = [candidateA, candidateB, candidateC, candidateD];
    const candidateNames = ["inverseCandidateA", "inverseCandidateB", "inverseCandidateC", "inverseCandidateD"];

    // The product of the student's matrix with A: this is what has to become the identity.
    const product = [
        candidate[0] * matrix[0] + candidate[1] * matrix[2],
        candidate[0] * matrix[1] + candidate[1] * matrix[3],
        candidate[2] * matrix[0] + candidate[3] * matrix[2],
        candidate[2] * matrix[1] + candidate[3] * matrix[3],
    ];
    const identity = [1, 0, 0, 1];
    const matches = product.map((value, index) => Math.abs(value - identity[index]) < 0.001);
    const matchCount = matches.filter(Boolean).length;
    const solved = matchCount === 4;

    useEffect(() => {
        setVar("inverseMatchCount", matchCount);
    }, [matchCount, setVar]);

    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);

    const moveDrag = (event: React.PointerEvent<SVGRectElement>) => {
        if (!drag) return;
        const steps = Math.round((drag.startY - event.clientY) / 16) * 0.5;
        setVar(candidateNames[drag.index], clamp(drag.startValue + steps, -2, 2));
    };

    const gridLines: ReactElement[] = [];
    for (let x = -2; x <= 5; x += 1) {
        gridLines.push(
            <line key={`grid-x-${x}`} x1={toScreenX(x)} y1={toScreenY(-2)} x2={toScreenX(x)} y2={toScreenY(4)}
                stroke={x === 0 ? AXIS : GRID} strokeWidth={x === 0 ? 1.5 : 1} />,
        );
    }
    for (let y = -2; y <= 4; y += 1) {
        gridLines.push(
            <line key={`grid-y-${y}`} x1={toScreenX(-2)} y1={toScreenY(y)} x2={toScreenX(5)} y2={toScreenY(y)}
                stroke={y === 0 ? AXIS : GRID} strokeWidth={y === 0 ? 1.5 : 1} />,
        );
    }

    /** A small 2 by 2 matrix in the panel; cells become draggable when `editable`. */
    const panelMatrix = (
        key: string, values: number[], originX: number, originY: number,
        options?: { editable?: boolean; flags?: boolean[]; muted?: boolean },
    ) => {
        const paths = bracketPaths(originX, originY, CELL_W * 2, CELL_H * 2);
        const stroke = options?.muted ? "#CBD5E1" : INK_SOFT;
        return (
            <g key={key}>
                <path d={paths.left} fill="none" stroke={stroke} strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" />
                <path d={paths.right} fill="none" stroke={stroke} strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" />
                {values.map((value, index) => {
                    const cellX = originX + (index % 2) * CELL_W;
                    const cellY = originY + Math.floor(index / 2) * CELL_H;
                    const flagged = options?.flags?.[index];
                    return (
                        <g key={`${key}-${index}`}>
                            {flagged && (
                                <rect x={cellX + 2} y={cellY + 2} width={CELL_W - 4} height={CELL_H - 4}
                                    rx="5" fill={MATCH_HUE} fillOpacity={0.18} />
                            )}
                            <text x={cellX + CELL_W / 2} y={cellY + CELL_H / 2 + 5} textAnchor="middle"
                                fontSize="14" fontWeight={600}
                                fill={options?.muted ? "#94A3B8" : flagged ? MATCH_HUE : INK}
                                style={{ fontVariantNumeric: "tabular-nums", pointerEvents: "none" }}>
                                {value.toFixed(1)}
                            </text>
                            {options?.editable && (
                                <rect x={cellX} y={cellY} width={CELL_W} height={CELL_H} rx="4"
                                    fill={ATTEMPT_HUE}
                                    fillOpacity={drag?.index === index ? 0.32 : 0.12}
                                    stroke={ATTEMPT_HUE} strokeWidth="1.5"
                                    style={{ cursor: "ns-resize", touchAction: "none" }}
                                    onPointerDown={(event) => {
                                        event.currentTarget.setPointerCapture(event.pointerId);
                                        setDrag({ index, startY: event.clientY, startValue: values[index] });
                                    }}
                                    onPointerMove={moveDrag}
                                    onPointerUp={() => setDrag(null)}
                                    onPointerCancel={() => setDrag(null)} />
                            )}
                        </g>
                    );
                })}
            </g>
        );
    };

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full">
            <defs>
                <clipPath id="inverse-grid-clip">
                    <rect x={toScreenX(-2)} y={toScreenY(4)} width={7 * UNIT} height={6 * UNIT} />
                </clipPath>
            </defs>

            <g opacity={highlight ? 0.35 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                {gridLines}
            </g>

            <g clipPath="url(#inverse-grid-clip)">
                {/* Where the matrix leaves the F on its own */}
                <g opacity={highlight ? 0.2 : 0.45} style={{ transition: "opacity 150ms ease-out" }}>
                    <polygon points={toPolygon(matrix)} fill={MATRIX_HUE} fillOpacity={0.18}
                        stroke={MATRIX_HUE} strokeWidth="1.8" strokeDasharray="4 4" strokeLinejoin="round" />
                </g>

                {/* Where the F began */}
                <g opacity={dim("ghost")} style={{ transition: "opacity 150ms ease-out" }}
                    onPointerEnter={() => setVar("inverseHighlight", "ghost")}
                    onPointerLeave={() => setVar("inverseHighlight", "")}>
                    {highlight === "ghost" && (
                        <polygon points={toPolygon(identity)} fill="none" stroke={GHOST_HUE} strokeWidth="9"
                            opacity={0.3} strokeLinejoin="round" />
                    )}
                    <polygon points={toPolygon(identity)} fill="#F8FAFC" stroke={GHOST_HUE}
                        strokeWidth={highlight === "ghost" ? 3 : 1.8} strokeDasharray="5 4"
                        strokeLinejoin="round" style={{ transition: "stroke-width 150ms ease-out" }} />
                </g>

                {/* Where the student's matrix leaves it after the matrix has acted */}
                <g opacity={dim("attempt")} style={{ transition: "opacity 150ms ease-out" }}
                    onPointerEnter={() => setVar("inverseHighlight", "attempt")}
                    onPointerLeave={() => setVar("inverseHighlight", "")}>
                    {highlight === "attempt" && (
                        <polygon points={toPolygon(product)} fill="none" stroke={ATTEMPT_HUE} strokeWidth="10"
                            opacity={0.28} strokeLinejoin="round" />
                    )}
                    <polygon points={toPolygon(product)} fill={ATTEMPT_HUE}
                        fillOpacity={highlight === "attempt" ? 0.35 : 0.22}
                        stroke={solved ? MATCH_HUE : ATTEMPT_HUE}
                        strokeWidth={highlight === "attempt" ? 4 : 2.5}
                        strokeLinejoin="round" strokeLinecap="round"
                        style={{ transition: "stroke-width 150ms ease-out" }} />
                </g>
            </g>

            {/* The algebra, kept beside the grid */}
            <g opacity={highlight ? 0.35 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                <text x={PANEL_LABEL_X} y={66} fontSize="12" fill={MATRIX_HUE}>the matrix A</text>
                {panelMatrix("matrix-a", matrix, MATRIX_X, 76)}
                <text x={560} y={96} fontSize="12" fill={INK_SOFT}>determinant</text>
                <text x={560} y={124} fontSize="20" fontWeight={700}
                    fill={bench.determinant === 0 ? FLAT_HUE : INK}
                    style={{ fontVariantNumeric: "tabular-nums" }}>
                    {bench.determinant.toFixed(1)}
                </text>

                <text x={PANEL_LABEL_X} y={186} fontSize="12" fill={ATTEMPT_HUE}>your matrix</text>
                {panelMatrix("candidate", candidate, MATRIX_X, 196, { editable: true })}
            </g>

            <g opacity={dim("product")} style={{ transition: "opacity 150ms ease-out" }}
                onPointerEnter={() => setVar("inverseHighlight", "product")}
                onPointerLeave={() => setVar("inverseHighlight", "")}>
                {highlight === "product" && (
                    <rect x={MATRIX_X - 22} y={296} width={TARGET_X + CELL_W * 2 + 22 - MATRIX_X} height={80}
                        rx="10" fill={ATTEMPT_HUE} fillOpacity={0.14} stroke={ATTEMPT_HUE} strokeWidth="2.5" />
                )}
                <text x={PANEL_LABEL_X} y={306} fontSize="12" fill={INK}>your matrix × A</text>
                {panelMatrix("product", product, MATRIX_X, 316, { flags: matches })}
                <text x={505} y={352} fontSize="15" fill={INK_SOFT}>=</text>
                {panelMatrix("identity", identity, TARGET_X, 316, { muted: true })}
            </g>

            <text x={PANEL_LABEL_X} y={410} fontSize="13"
                fill={solved ? MATCH_HUE : bench.determinant === 0 ? FLAT_HUE : INK_SOFT}>
                {solved
                    ? "matched: this is the inverse"
                    : bench.determinant === 0
                        ? "determinant 0, so nothing can undo it"
                        : `${matchCount} of the 4 entries match so far`}
            </text>
        </svg>
    );
}

function InverseFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="inverse-build-it"
            caption="The dashed grey F is where the shape started and the pale indigo F is where the matrix left it. Drag the four numbers of your matrix until the product on the right becomes the identity, and the teal F lands back on the outline."
            onReset={() => {
                setVar("inverseMatrixChoice", "a shear");
                setVar("inverseCandidateA", 1);
                setVar("inverseCandidateB", 0);
                setVar("inverseCandidateC", 0);
                setVar("inverseCandidateD", 1);
                setVar("inverseHighlight", "");
            }}
        >
            <InverseDrawing />
            <InteractionHintSequence
                hintKey="inverse-build-drag"
                steps={[
                    {
                        gesture: "drag-vertical",
                        label: "Drag a number of your matrix up or down",
                        position: { x: "60%", y: "49%" },
                        dragPath: { type: "line", startOffset: { x: 0, y: 16 }, endOffset: { x: 0, y: -16 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const matricesInverseBlocks: ReactElement[] = [
    <StackLayout key="layout-inverse-heading" maxWidth="xl">
        <Block id="inverse-heading" padding="md">
            <EditableH2 id="h2-inverse-heading" blockId="inverse-heading">
                The Inverse
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inverse-setup" maxWidth="xl">
        <Block id="inverse-setup" padding="sm">
            <EditableParagraph id="para-inverse-setup" blockId="inverse-setup">
                An inverse is really a demand: find the matrix whose product with A leaves everything
                exactly as it was. Drag the four numbers of your matrix and two things move together,{" "}
                <InlineLinkedHighlight
                    id="highlight-inverse-attempt"
                    varName="inverseHighlight"
                    highlightId="attempt"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('inverseHighlight'))}
                >
                    the teal F
                </InlineLinkedHighlight>
                {" "}sliding towards{" "}
                <InlineLinkedHighlight
                    id="highlight-inverse-ghost"
                    varName="inverseHighlight"
                    highlightId="ghost"
                    color="#64748B"
                    bgColor="rgba(100, 116, 139, 0.18)"
                >
                    the outline it started from
                </InlineLinkedHighlight>
                , and{" "}
                <InlineLinkedHighlight
                    id="highlight-inverse-product"
                    varName="inverseHighlight"
                    highlightId="product"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('inverseHighlight'))}
                >
                    the product on the right
                </InlineLinkedHighlight>
                {" "}creeping towards the identity. The bench starts with{" "}
                <InlineToggle
                    id="toggle-inverse-matrix-choice"
                    varName="inverseMatrixChoice"
                    options={["a shear", "a stretch", "a flattening matrix"]}
                    {...togglePropsFromDefinition(getVariableInfo('inverseMatrixChoice'))}
                />
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inverse-visual" maxWidth="xl">
        <Block id="inverse-visual" padding="sm" hasVisualization>
            <InverseFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inverse-formula" maxWidth="xl">
        <Block id="inverse-formula" padding="lg">
            <FormulaBlock latex="\begin{bmatrix} a & b \\ c & d \end{bmatrix}^{-1} = \frac{1}{ad - bc} \begin{bmatrix} d & -b \\ -c & a \end{bmatrix}" />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inverse-reflect" maxWidth="xl">
        <Block id="inverse-reflect" padding="sm">
            <EditableParagraph id="para-inverse-reflect" blockId="inverse-reflect">
                That is the whole definition, and the formula above simply builds the matrix that meets it.
                Because the formula divides by the determinant, the flattening matrix is beyond rescue: no
                four numbers you try will ever reach the identity, and the F never gets home.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inverse-question-identity" maxWidth="xl">
        <Block id="inverse-question-identity" padding="md">
            <EditableParagraph id="para-inverse-question-identity" blockId="inverse-question-identity">
                A matrix multiplied by its inverse gives{" "}
                <InlineFeedback
                    varName="answerInverseIdentity"
                    correctValue="the identity matrix"
                    position="terminal"
                    successMessage="— exactly, the two moves cancel and every point is left where it began"
                    failureMessage="— not that one."
                    hint="Look at what the product on the right has to become before the F reaches its outline"
                    visualizationHint={{
                        blockId: "inverse-visual",
                        hintKey: "feedback-inverse-identity-hint",
                        steps: [
                            {
                                gesture: "drag-vertical",
                                label: "Drag the numbers until all four entries of the product match",
                                position: { x: "60%", y: "49%" },
                                completionVar: "inverseMatchCount",
                                completionValue: 4,
                                completionTolerance: 0.4,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: {
                            inverseMatrixChoice: "a shear",
                            inverseCandidateA: 1,
                            inverseCandidateB: 0,
                            inverseCandidateC: 0,
                            inverseCandidateD: 1,
                        },
                    }}
                >
                    <InlineClozeChoice
                        varName="answerInverseIdentity"
                        correctAnswer="the identity matrix"
                        options={["the identity matrix", "the zero matrix", "the original matrix", "the determinant"]}
                        {...choicePropsFromDefinition(getVariableInfo('answerInverseIdentity'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inverse-question-entry" maxWidth="xl">
        <Block id="inverse-question-entry" padding="md">
            <EditableParagraph id="para-inverse-question-entry" blockId="inverse-question-entry">
                The matrix{" "}
                <InlineFormula latex="\begin{bmatrix} 3 & 1 \\ 5 & 2 \end{bmatrix}" colorMap={{}} />
                {" "}has determinant 1, so nothing gets divided. Following the formula, the top-left entry
                of its inverse is{" "}
                <InlineFeedback
                    varName="answerInverseEntry"
                    correctValue="2"
                    position="terminal"
                    successMessage="— right, a and d swap places, so the 2 from the bottom right moves up to the top left"
                    failureMessage="— close, but look again."
                    hint="An answer of 3 would mean the entries stayed where they were, and the formula moves d into the top-left corner"
                    reviewBlockId="inverse-formula"
                    reviewLabel="Back to the formula"
                >
                    <InlineClozeInput
                        varName="answerInverseEntry"
                        correctAnswer="2"
                        {...clozePropsFromDefinition(getVariableInfo('answerInverseEntry'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
