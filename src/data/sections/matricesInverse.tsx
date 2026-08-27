import { type ReactElement, useRef, useState } from "react";
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
import { clamp, useRafLoop } from "@/lib/motion";

const INK = "#334155";
const INK_SOFT = "#64748B";
const GRID = "#E2E8F0";
const AXIS = "#CBD5E1";
const SHAPE_HUE = "#62D0AD";
const GHOST_HUE = "#94A3B8";
const FLAT_HUE = "#ef4444";

const VIEW_W = 620;
const VIEW_H = 430;
const UNIT = 42;
const ORIGIN_X = 180;
const ORIGIN_Y = 320;

const TRACK_X1 = 140;
const TRACK_X2 = 390;
const TRACK_Y = 400;

const toScreenX = (worldX: number) => ORIGIN_X + worldX * UNIT;
const toScreenY = (worldY: number) => ORIGIN_Y - worldY * UNIT;

/** Outline of a capital F, drawn once and then pushed around by the matrix. */
const LETTER_F: [number, number][] = [
    [0, 0], [0, 2], [1.3, 2], [1.3, 1.65], [0.42, 1.65],
    [0.42, 1.2], [1.1, 1.2], [1.1, 0.85], [0.42, 0.85], [0.42, 0],
];

type Bench = { matrix: number[]; inverse: number[] | null; determinant: number };

const BENCH: Record<string, Bench> = {
    "a shear": { matrix: [1, 1, 0, 1], inverse: [1, -1, 0, 1], determinant: 1 },
    "a stretch": { matrix: [2, 0, 1, 1], inverse: [0.5, 0, -0.5, 1], determinant: 2 },
    "a flattening matrix": { matrix: [1, 0.5, 2, 1], inverse: null, determinant: 0 },
};

const bracketPaths = (x: number, y: number, w: number, h: number) => ({
    left: `M ${x - 4} ${y - 5} L ${x - 10} ${y - 5} L ${x - 10} ${y + h + 5} L ${x - 4} ${y + h + 5}`,
    right: `M ${x + w + 4} ${y - 5} L ${x + w + 10} ${y - 5} L ${x + w + 10} ${y + h + 5} L ${x + w + 4} ${y + h + 5}`,
});

function InverseDrawing() {
    const setVar = useSetVar();
    const timeline = useVar<number>("inverseTimeline", 0);
    const choice = useVar<string>("inverseMatrixChoice", "a shear");
    const playing = useVar<boolean>("inversePlaying", false);
    const highlight = useVar<string>("inverseHighlight", "");

    const [scrubbing, setScrubbing] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const bench = BENCH[choice] ?? BENCH["a shear"];
    const [m00, m01, m10, m11] = bench.matrix;
    const stuck = bench.inverse === null && timeline > 1;

    // Play runs the story there and back, then holds at the end.
    useRafLoop((deltaSeconds) => {
        const next = timeline + deltaSeconds * 0.4;
        if (next >= 2) {
            setVar("inverseTimeline", 2);
            setVar("inversePlaying", false);
            return;
        }
        setVar("inverseTimeline", Math.round(next * 50) / 50);
    }, { paused: !playing || scrubbing });

    // Out on the way there, back on the way home, frozen when there is no inverse.
    const blend = timeline <= 1 ? timeline : bench.inverse === null ? 1 : 2 - timeline;
    const live = [
        1 + blend * (m00 - 1),
        blend * m01,
        blend * m10,
        1 + blend * (m11 - 1),
    ];

    const mapPoint = ([x, y]: [number, number]) => [
        live[0] * x + live[1] * y,
        live[2] * x + live[3] * y,
    ] as [number, number];

    const ghostPoints = LETTER_F.map(([x, y]) => `${toScreenX(x)},${toScreenY(y)}`).join(" ");
    const livePoints = LETTER_F.map((point) => {
        const [x, y] = mapPoint(point);
        return `${toScreenX(x)},${toScreenY(y)}`;
    }).join(" ");

    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);

    const scrubTo = (clientX: number) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const viewX = ((clientX - rect.left) / rect.width) * VIEW_W;
        const fraction = (viewX - TRACK_X1) / (TRACK_X2 - TRACK_X1);
        setVar("inverseTimeline", Math.round(clamp(fraction * 2, 0, 2) * 50) / 50);
    };

    const gridLines: ReactElement[] = [];
    for (let x = -1; x <= 5; x += 1) {
        gridLines.push(
            <line key={`grid-x-${x}`} x1={toScreenX(x)} y1={toScreenY(-1)} x2={toScreenX(x)} y2={toScreenY(4)}
                stroke={x === 0 ? AXIS : GRID} strokeWidth={x === 0 ? 1.5 : 1} />,
        );
    }
    for (let y = -1; y <= 4; y += 1) {
        gridLines.push(
            <line key={`grid-y-${y}`} x1={toScreenX(-1)} y1={toScreenY(y)} x2={toScreenX(5)} y2={toScreenY(y)}
                stroke={y === 0 ? AXIS : GRID} strokeWidth={y === 0 ? 1.5 : 1} />,
        );
    }

    const smallMatrix = (key: string, values: number[] | null, originY: number) => {
        if (!values) {
            return (
                <g key={key}>
                    <text x={450} y={originY + 26} fontSize="13" fill={FLAT_HUE}>no inverse exists</text>
                    <text x={450} y={originY + 46} fontSize="12" fill={INK_SOFT}>determinant is 0</text>
                </g>
            );
        }
        const paths = bracketPaths(468, originY, 72, 68);
        return (
            <g key={key}>
                <path d={paths.left} fill="none" stroke={INK_SOFT} strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" />
                <path d={paths.right} fill="none" stroke={INK_SOFT} strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" />
                {values.map((value, index) => (
                    <text key={`${key}-${index}`} x={468 + (index % 2) * 36 + 18}
                        y={originY + Math.floor(index / 2) * 34 + 22} textAnchor="middle" fontSize="14"
                        fontWeight={600} fill={INK} style={{ fontVariantNumeric: "tabular-nums" }}>
                        {value.toFixed(1)}
                    </text>
                ))}
            </g>
        );
    };

    const knobX = TRACK_X1 + (timeline / 2) * (TRACK_X2 - TRACK_X1);

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full">
            <defs>
                <filter id="inverse-knob-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            <g opacity={highlight ? 0.35 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                {gridLines}
            </g>

            {/* Where the F started */}
            <g opacity={dim("ghost")} style={{ transition: "opacity 150ms ease-out" }}
                onPointerEnter={() => setVar("inverseHighlight", "ghost")}
                onPointerLeave={() => setVar("inverseHighlight", "")}>
                {highlight === "ghost" && (
                    <polygon points={ghostPoints} fill="none" stroke={GHOST_HUE} strokeWidth="9"
                        opacity={0.3} strokeLinejoin="round" />
                )}
                <polygon points={ghostPoints} fill="#F8FAFC" stroke={GHOST_HUE}
                    strokeWidth={highlight === "ghost" ? 3 : 1.8} strokeDasharray="5 4"
                    strokeLinejoin="round" style={{ transition: "stroke-width 150ms ease-out" }} />
            </g>

            {/* The F as the matrix has left it right now */}
            <g opacity={dim("shape")} style={{ transition: "opacity 150ms ease-out" }}
                onPointerEnter={() => setVar("inverseHighlight", "shape")}
                onPointerLeave={() => setVar("inverseHighlight", "")}>
                {highlight === "shape" && (
                    <polygon points={livePoints} fill="none" stroke={SHAPE_HUE} strokeWidth="10"
                        opacity={0.28} strokeLinejoin="round" />
                )}
                <polygon points={livePoints} fill={SHAPE_HUE}
                    fillOpacity={highlight === "shape" ? 0.35 : 0.2}
                    stroke={stuck ? FLAT_HUE : SHAPE_HUE}
                    strokeWidth={highlight === "shape" ? 4 : 2.5}
                    strokeLinejoin="round" strokeLinecap="round"
                    style={{ transition: "stroke-width 150ms ease-out" }} />
            </g>

            {/* The timeline the student drags */}
            <g opacity={highlight ? 0.35 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                <line x1={TRACK_X1} y1={TRACK_Y} x2={TRACK_X2} y2={TRACK_Y} stroke="#E2E8F0"
                    strokeWidth="6" strokeLinecap="round" />
                <line x1={TRACK_X1} y1={TRACK_Y} x2={knobX} y2={TRACK_Y} stroke={SHAPE_HUE}
                    strokeWidth="6" strokeLinecap="round" />
                {[0, 1, 2].map((tick) => (
                    <circle key={`tick-${tick}`} cx={TRACK_X1 + (tick / 2) * (TRACK_X2 - TRACK_X1)}
                        cy={TRACK_Y} r="3" fill="#94A3B8" />
                ))}
                <text x={TRACK_X1} y={TRACK_Y + 22} textAnchor="middle" fontSize="11" fill={INK_SOFT}>start</text>
                <text x={(TRACK_X1 + TRACK_X2) / 2} y={TRACK_Y + 22} textAnchor="middle" fontSize="11"
                    fill={INK_SOFT}>after the matrix</text>
                <text x={TRACK_X2} y={TRACK_Y + 22} textAnchor="middle" fontSize="11"
                    fill={stuck ? FLAT_HUE : INK_SOFT}>
                    {stuck ? "still stuck" : "after the inverse"}
                </text>
                <circle cx={knobX} cy={TRACK_Y} r="11" fill={SHAPE_HUE} filter="url(#inverse-knob-shadow)" />
                <circle cx={knobX} cy={TRACK_Y} r="22" fill="transparent"
                    style={{ cursor: scrubbing ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        setScrubbing(true);
                        scrubTo(event.clientX);
                    }}
                    onPointerMove={(event) => scrubbing && scrubTo(event.clientX)}
                    onPointerUp={() => setScrubbing(false)}
                    onPointerCancel={() => setScrubbing(false)} />
            </g>

            {/* Readouts, clear of the grid */}
            <g opacity={highlight ? 0.35 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                <text x={450} y={84} fontSize="12" fill={INK_SOFT}>the matrix</text>
                {smallMatrix("matrix", bench.matrix, 96)}
                <text x={450} y={200} fontSize="12" fill={INK_SOFT}>its inverse</text>
                {smallMatrix("inverse", bench.inverse, 212)}
                <text x={450} y={330} fontSize="12" fill={INK_SOFT}>determinant</text>
                <text x={450} y={356} fontSize="20" fontWeight={700}
                    fill={bench.determinant === 0 ? FLAT_HUE : INK}
                    style={{ fontVariantNumeric: "tabular-nums" }}>
                    {bench.determinant.toFixed(1)}
                </text>
            </g>
        </svg>
    );
}

function InverseFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="inverse-there-and-back"
            playable
            playVarName="inversePlaying"
            caption="Drag the marker along the timeline: the first half tips the F over with the matrix, the second half sends it home with the inverse."
            onReset={() => {
                setVar("inverseTimeline", 0);
                setVar("inverseMatrixChoice", "a shear");
                setVar("inversePlaying", false);
                setVar("inverseHighlight", "");
            }}
        >
            <InverseDrawing />
            <InteractionHintSequence
                hintKey="inverse-timeline-scrub"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the marker along the timeline",
                        position: { x: "23%", y: "93%" },
                        dragPath: { type: "line", startOffset: { x: -14, y: 0 }, endOffset: { x: 46, y: 0 } },
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
                Every stretch raises the same question: can you get back? Drag the marker along the
                timeline to tip{" "}
                <InlineLinkedHighlight
                    id="highlight-inverse-shape"
                    varName="inverseHighlight"
                    highlightId="shape"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('inverseHighlight'))}
                >
                    the letter F
                </InlineLinkedHighlight>
                {" "}over with a matrix, then keep going and watch its inverse walk it back onto{" "}
                <InlineLinkedHighlight
                    id="highlight-inverse-ghost"
                    varName="inverseHighlight"
                    highlightId="ghost"
                    color="#64748B"
                    bgColor="rgba(100, 116, 139, 0.18)"
                >
                    the faint outline
                </InlineLinkedHighlight>
                {" "}it started from. The bench holds{" "}
                <InlineToggle
                    id="toggle-inverse-matrix-choice"
                    varName="inverseMatrixChoice"
                    options={["a shear", "a stretch", "a flattening matrix"]}
                    {...togglePropsFromDefinition(getVariableInfo('inverseMatrixChoice'))}
                />
                , and the other two are worth a look.
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
                Notice that the formula divides by the determinant, which is exactly what the flattening
                matrix runs into. A shape crushed onto a line has thrown away where its points came from,
                so a matrix with determinant 0 has no inverse and the F never gets home.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inverse-question-identity" maxWidth="xl">
        <Block id="inverse-question-identity" padding="md">
            <EditableParagraph id="para-inverse-question-identity" blockId="inverse-question-identity">
                Because the second half of the journey undoes the first exactly, a matrix multiplied by
                its inverse gives{" "}
                <InlineFeedback
                    varName="answerInverseIdentity"
                    correctValue="the identity matrix"
                    position="terminal"
                    successMessage="— exactly, the two moves cancel and every point is left where it began"
                    failureMessage="— not that one."
                    hint="Think about where the F ends up at the far end of the timeline, compared with where it started"
                    visualizationHint={{
                        blockId: "inverse-visual",
                        hintKey: "feedback-inverse-identity-hint",
                        steps: [
                            {
                                gesture: "drag-horizontal",
                                label: "Drag the marker to the far right and compare the F with the faint outline",
                                position: { x: "23%", y: "93%" },
                                completionVar: "inverseTimeline",
                                completionValue: 2,
                                completionTolerance: 0.12,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { inverseTimeline: 0, inverseMatrixChoice: "a shear" },
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
