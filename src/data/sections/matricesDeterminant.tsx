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
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import {
    getVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
    scrubVarsFromDefinitions,
} from "../variables";
import { clamp } from "@/lib/motion";

const INK = "#334155";
const INK_SOFT = "#64748B";
const GRID = "#E2E8F0";
const AXIS = "#CBD5E1";
const COL_ONE_HUE = "#62D0AD";
const COL_TWO_HUE = "#8E90F5";
const SHAPE_HUE = "#AC8BF9";
const FLAT_HUE = "#ef4444";

const VIEW_W = 620;
const VIEW_H = 420;
const UNIT = 42;
const ORIGIN_X = 190;
const ORIGIN_Y = 320;
const MIN_ENTRY = -1;
const MAX_ENTRY = 3;

const toScreenX = (worldX: number) => ORIGIN_X + worldX * UNIT;
const toScreenY = (worldY: number) => ORIGIN_Y - worldY * UNIT;
const snap = (value: number) => clamp(Math.round(value * 2) / 2, MIN_ENTRY, MAX_ENTRY);

function DeterminantDrawing() {
    const setVar = useSetVar();
    const a = useVar<number>("detEntryA", 2);
    const c = useVar<number>("detEntryC", 0);
    const b = useVar<number>("detEntryB", 1);
    const d = useVar<number>("detEntryD", 2);
    const highlight = useVar<string>("determinantHighlight", "");

    const [dragging, setDragging] = useState<"first" | "second" | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const determinant = a * d - b * c;
    const isFlat = Math.abs(determinant) < 0.05;

    // The formula below the figure reads this back out.
    useEffect(() => {
        setVar("determinantValue", Math.round(determinant * 100) / 100);
    }, [determinant, setVar]);

    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);

    const pointerToWorld = (clientX: number, clientY: number) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        const viewX = ((clientX - rect.left) / rect.width) * VIEW_W;
        const viewY = ((clientY - rect.top) / rect.height) * VIEW_H;
        return { x: (viewX - ORIGIN_X) / UNIT, y: (ORIGIN_Y - viewY) / UNIT };
    };

    const handleMove = (which: "first" | "second") => (event: React.PointerEvent<SVGCircleElement>) => {
        if (dragging !== which) return;
        const world = pointerToWorld(event.clientX, event.clientY);
        if (which === "first") {
            setVar("detEntryA", snap(world.x));
            setVar("detEntryC", snap(world.y));
        } else {
            setVar("detEntryB", snap(world.x));
            setVar("detEntryD", snap(world.y));
        }
    };

    const corners: [number, number][] = [[0, 0], [a, c], [a + b, c + d], [b, d]];
    const shapePoints = corners.map(([x, y]) => `${toScreenX(x)},${toScreenY(y)}`).join(" ");
    const centreX = toScreenX((a + b) / 2);
    const centreY = toScreenY((c + d) / 2);

    const gridLines: ReactElement[] = [];
    for (let x = -2; x <= 6; x += 1) {
        gridLines.push(
            <line key={`grid-x-${x}`} x1={toScreenX(x)} y1={toScreenY(-2)} x2={toScreenX(x)} y2={toScreenY(6)}
                stroke={x === 0 ? AXIS : GRID} strokeWidth={x === 0 ? 1.5 : 1} />,
        );
    }
    for (let y = -2; y <= 6; y += 1) {
        gridLines.push(
            <line key={`grid-y-${y}`} x1={toScreenX(-2)} y1={toScreenY(y)} x2={toScreenX(6)} y2={toScreenY(y)}
                stroke={y === 0 ? AXIS : GRID} strokeWidth={y === 0 ? 1.5 : 1} />,
        );
    }

    const handle = (which: "first" | "second", x: number, y: number, hue: string) => (
        <g key={which}>
            {highlight === "shape" && (
                <circle cx={toScreenX(x)} cy={toScreenY(y)} r="20" fill={hue} opacity={0.25} />
            )}
            <circle cx={toScreenX(x)} cy={toScreenY(y)} r="13" fill={hue}
                filter="url(#determinant-handle-shadow)" />
            <circle cx={toScreenX(x)} cy={toScreenY(y)} r="24" fill="transparent"
                style={{ cursor: dragging === which ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDragging(which);
                }}
                onPointerMove={handleMove(which)}
                onPointerUp={() => setDragging(null)}
                onPointerCancel={() => setDragging(null)} />
        </g>
    );

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full">
            <defs>
                <filter id="determinant-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            <g opacity={highlight ? 0.35 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                {gridLines}
            </g>

            {/* Where the shape started: the faint unit square */}
            <g opacity={dim("ghost")} style={{ transition: "opacity 150ms ease-out" }}
                onPointerEnter={() => setVar("determinantHighlight", "ghost")}
                onPointerLeave={() => setVar("determinantHighlight", "")}>
                {highlight === "ghost" && (
                    <rect x={toScreenX(0)} y={toScreenY(1)} width={UNIT} height={UNIT}
                        fill="none" stroke={INK_SOFT} strokeWidth="9" opacity={0.28} />
                )}
                <rect x={toScreenX(0)} y={toScreenY(1)} width={UNIT} height={UNIT}
                    fill="#F8FAFC" stroke={INK_SOFT} strokeWidth={highlight === "ghost" ? 3 : 1.8}
                    strokeDasharray="5 4" style={{ transition: "stroke-width 150ms ease-out" }} />
                <text x={toScreenX(0.5)} y={toScreenY(0.5) + 5} textAnchor="middle" fontSize="12"
                    fill={INK_SOFT} style={{ pointerEvents: "none" }}>
                    1
                </text>
            </g>

            {/* The parallelogram the square became */}
            <g opacity={dim("shape")} style={{ transition: "opacity 150ms ease-out" }}
                onPointerEnter={() => setVar("determinantHighlight", "shape")}
                onPointerLeave={() => setVar("determinantHighlight", "")}>
                {highlight === "shape" && !isFlat && (
                    <polygon points={shapePoints} fill="none" stroke={SHAPE_HUE} strokeWidth="10"
                        opacity={0.28} strokeLinejoin="round" />
                )}
                <polygon points={shapePoints}
                    fill={isFlat ? "none" : SHAPE_HUE}
                    fillOpacity={highlight === "shape" ? 0.35 : 0.16}
                    stroke={isFlat ? FLAT_HUE : SHAPE_HUE}
                    strokeWidth={isFlat ? 4 : highlight === "shape" ? 4 : 2.5}
                    strokeLinejoin="round" strokeLinecap="round"
                    style={{ transition: "stroke-width 150ms ease-out" }} />
                {!isFlat && Math.abs(determinant) >= 0.4 && (
                    <text x={centreX} y={centreY + 6} textAnchor="middle" fontSize="17" fontWeight={700}
                        fill={INK} style={{ fontVariantNumeric: "tabular-nums", pointerEvents: "none" }}>
                        {Math.abs(determinant).toFixed(2)}
                    </text>
                )}
            </g>

            {/* The two columns, drawn as the corners they send (1, 0) and (0, 1) to */}
            <g opacity={highlight === "ghost" ? 0.35 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                <line x1={toScreenX(0)} y1={toScreenY(0)} x2={toScreenX(a)} y2={toScreenY(c)}
                    stroke={COL_ONE_HUE} strokeWidth="3.5" strokeLinecap="round" />
                <line x1={toScreenX(0)} y1={toScreenY(0)} x2={toScreenX(b)} y2={toScreenY(d)}
                    stroke={COL_TWO_HUE} strokeWidth="3.5" strokeLinecap="round" />
                {handle("first", a, c, COL_ONE_HUE)}
                {handle("second", b, d, COL_TWO_HUE)}
            </g>

            {/* Readouts, clear of the grid */}
            <g opacity={highlight ? 0.35 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                <text x={470} y={104} fontSize="12" fill={COL_ONE_HUE}>first column</text>
                <text x={470} y={126} fontSize="15" fontWeight={600} fill={COL_ONE_HUE}
                    style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`(${a.toFixed(1)}, ${c.toFixed(1)})`}
                </text>
                <text x={470} y={166} fontSize="12" fill={COL_TWO_HUE}>second column</text>
                <text x={470} y={188} fontSize="15" fontWeight={600} fill={COL_TWO_HUE}
                    style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`(${b.toFixed(1)}, ${d.toFixed(1)})`}
                </text>
                <text x={470} y={236} fontSize="12" fill={INK_SOFT}>determinant</text>
                <text x={470} y={268} fontSize="24" fontWeight={700}
                    fill={isFlat ? FLAT_HUE : SHAPE_HUE}
                    style={{ fontVariantNumeric: "tabular-nums" }}>
                    {determinant.toFixed(2)}
                </text>
                <text x={470} y={294} fontSize="12" fill={isFlat ? FLAT_HUE : INK_SOFT}>
                    {isFlat ? "squashed flat" : determinant < 0 ? "flipped over" : "times the area"}
                </text>
            </g>
        </svg>
    );
}

function DeterminantFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="determinant-area"
            caption="The dashed square is where the shape started. Drag the teal or indigo corner to stretch it, and the determinant counts the area the square has grown into."
            onReset={() => {
                setVar("detEntryA", 2);
                setVar("detEntryC", 0);
                setVar("detEntryB", 1);
                setVar("detEntryD", 2);
                setVar("determinantHighlight", "");
            }}
        >
            <DeterminantDrawing />
            <InteractionHintSequence
                hintKey="determinant-drag-corner"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the teal corner",
                        position: { x: "44%", y: "76%" },
                        dragPath: { type: "line", startOffset: { x: -6, y: 14 }, endOffset: { x: 22, y: -18 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const matricesDeterminantBlocks: ReactElement[] = [
    <StackLayout key="layout-determinant-heading" maxWidth="xl">
        <Block id="determinant-heading" padding="md">
            <EditableH2 id="h2-determinant-heading" blockId="determinant-heading">
                The Determinant
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-setup" maxWidth="xl">
        <Block id="determinant-setup" padding="sm">
            <EditableParagraph id="para-determinant-setup" blockId="determinant-setup">
                A two by two matrix has a job to do: it takes the corners of{" "}
                <InlineLinkedHighlight
                    id="highlight-determinant-ghost"
                    varName="determinantHighlight"
                    highlightId="ghost"
                    color="#64748B"
                    bgColor="rgba(100, 116, 139, 0.18)"
                >
                    a small square
                </InlineLinkedHighlight>
                {" "}and moves them, leaving{" "}
                <InlineLinkedHighlight
                    id="highlight-determinant-shape"
                    varName="determinantHighlight"
                    highlightId="shape"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('determinantHighlight'))}
                >
                    a leaning parallelogram
                </InlineLinkedHighlight>
                {" "}behind. Drag either coloured corner and the shape follows, while the number inside it
                counts the area now covered. Then pull both corners onto the same line and watch that area
                disappear.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-visual" maxWidth="xl">
        <Block id="determinant-visual" padding="sm" hasVisualization>
            <DeterminantFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-formula" maxWidth="xl">
        <Block id="determinant-formula" padding="lg">
            <FormulaBlock
                latex="\det \begin{bmatrix} \scrub{detEntryA} & \scrub{detEntryB} \\ \scrub{detEntryC} & \scrub{detEntryD} \end{bmatrix} = ad - bc = \val{determinantValue}"
                variables={{
                    ...scrubVarsFromDefinitions(['detEntryA', 'detEntryB', 'detEntryC', 'detEntryD']),
                    determinantValue: { color: '#AC8BF9', formatValue: (value: number) => value.toFixed(2) },
                }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-reflect" maxWidth="xl">
        <Block id="determinant-reflect" padding="sm">
            <EditableParagraph id="para-determinant-reflect" blockId="determinant-reflect">
                A determinant of 2 means areas double, and a negative one means the shape was flipped over
                as well as stretched. When it reaches 0 the parallelogram has flattened into a line and
                every scrap of area is gone, which turns out to matter enormously for what comes next.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-question-value" maxWidth="xl">
        <Block id="determinant-question-value" padding="md">
            <EditableParagraph id="para-determinant-question-value" blockId="determinant-question-value">
                Try one on paper. For{" "}
                <InlineFormula latex="\begin{bmatrix} 3 & 1 \\ 2 & 3 \end{bmatrix}" colorMap={{}} />
                {" "}the determinant is{" "}
                <InlineFeedback
                    varName="answerDeterminantValue"
                    correctValue="7"
                    position="terminal"
                    successMessage="— exactly, 3 × 3 minus 1 × 2 leaves 7, so this matrix makes areas seven times bigger"
                    failureMessage="— not quite."
                    hint="Multiply the two numbers on the leading diagonal, then take away the product of the other two"
                    visualizationHint={{
                        blockId: "determinant-visual",
                        hintKey: "feedback-determinant-value-hint",
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag the teal corner to 3 across and 2 up",
                                position: { x: "44%", y: "76%" },
                                completionVar: "detEntryC",
                                completionValue: 2,
                                completionTolerance: 0.3,
                            },
                            {
                                gesture: "drag",
                                label: "Now drag the indigo corner to 1 across and 3 up, then read the area",
                                position: { x: "37%", y: "56%" },
                                completionVar: "detEntryD",
                                completionValue: 3,
                                completionTolerance: 0.3,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { detEntryA: 2, detEntryC: 0, detEntryB: 1, detEntryD: 2 },
                    }}
                >
                    <InlineClozeInput
                        varName="answerDeterminantValue"
                        correctAnswer="7"
                        {...clozePropsFromDefinition(getVariableInfo('answerDeterminantValue'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-question-zero" maxWidth="xl">
        <Block id="determinant-question-zero" padding="md">
            <EditableParagraph id="para-determinant-question-zero" blockId="determinant-question-zero">
                A matrix whose determinant works out to 0 has squashed the whole square down into{" "}
                <InlineFeedback
                    varName="answerDeterminantZero"
                    correctValue="a line"
                    position="terminal"
                    successMessage="— right, both corners end up pointing the same way, so the shape has length but no width left"
                    failureMessage="— take another look."
                    hint="Zero area does not mean the shape has gone, only that it has no width"
                    reviewBlockId="determinant-visual"
                    reviewLabel="Back to the shape"
                >
                    <InlineClozeChoice
                        varName="answerDeterminantZero"
                        correctAnswer="a line"
                        options={["a line", "a bigger square", "a triangle", "a point"]}
                        {...choicePropsFromDefinition(getVariableInfo('answerDeterminantZero'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
